import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  items: Array<{
    product_id?: string;
    variant_id?: string;
    product_name: string;
    variant_size?: string;
    quantity: number;
    unit_price: number;
  }>;
  service_details?: {
    service_type: string;
    service_description: string;
    preferred_date?: string;
  };
  customer_details: {
    email: string;
    name: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
  currency?: string;
  notes?: string;
}

// Get PayPal access token
async function getPayPalAccessToken() {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
  
  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get PayPal access token");
  }

  const data = await response.json();
  return data.access_token;
}

// Convert ILS to USD for PayPal (PayPal works better with USD)
function convertILSToUSD(amountILS: number): number {
  // Simple conversion rate - in production, you'd want to use a real-time rate
  const USD_TO_ILS_RATE = 3.7; // Approximate rate
  return Math.round((amountILS / USD_TO_ILS_RATE) * 100) / 100;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 PayPal payment function started");

    // Create Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const requestData: PaymentRequest = await req.json();
    console.log("📝 Payment request data:", JSON.stringify(requestData, null, 2));

    const { items, service_details, customer_details, currency = "ILS", notes } = requestData;

    // Calculate total amount
    const totalAmountILS = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const totalAmountUSD = convertILSToUSD(totalAmountILS);
    console.log("💰 Total amount:", totalAmountILS, "ILS =", totalAmountUSD, "USD");

    // Determine order type
    const orderType = service_details ? "service" : "product";

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    console.log("🔑 PayPal access token obtained");

    // Prepare PayPal order items
    const paypalItems = items.map(item => ({
      name: `${item.product_name}${item.variant_size ? ` (${item.variant_size})` : ''}`,
      quantity: item.quantity.toString(),
      unit_amount: {
        currency_code: "USD",
        value: convertILSToUSD(item.unit_price).toFixed(2),
      },
    }));

    // Add service item if applicable
    if (service_details) {
      paypalItems.push({
        name: `${service_details.service_type} Service`,
        quantity: "1",
        unit_amount: {
          currency_code: "USD",
          value: "0.00", // Service pricing included in items
        },
      });
    }

    // Create PayPal order
    const paypalOrderData = {
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: totalAmountUSD.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: totalAmountUSD.toFixed(2),
            },
          },
        },
        items: paypalItems,
        description: orderType === "service" 
          ? `${service_details?.service_type} Service for ${customer_details.name}`
          : `Product order for ${customer_details.name}`,
      }],
      application_context: {
        return_url: `${req.headers.get("origin")}/payment-success`,
        cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
        brand_name: "MT Wraps - Koch-Chemie Israel",
        locale: "en-US",
        landing_page: "BILLING",
        shipping_preference: orderType === "product" ? "GET_FROM_FILE" : "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    };

    console.log("🛒 PayPal order data:", JSON.stringify(paypalOrderData, null, 2));

    // Create PayPal order
    const paypalResponse = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify(paypalOrderData),
    });

    if (!paypalResponse.ok) {
      const errorText = await paypalResponse.text();
      console.error("❌ PayPal order creation failed:", errorText);
      throw new Error(`PayPal order creation failed: ${paypalResponse.status}`);
    }

    const paypalOrder = await paypalResponse.json();
    console.log("✅ PayPal order created:", paypalOrder.id);

    // Get approval URL
    const approvalUrl = paypalOrder.links.find((link: any) => link.rel === "approve")?.href;
    if (!approvalUrl) {
      throw new Error("No approval URL found in PayPal response");
    }

    // Get user ID if authenticated (optional for guest checkout)
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data: userData } = await supabase.auth.getUser(token);
        userId = userData.user?.id || null;
        console.log("👤 Authenticated user ID:", userId);
      }
    } catch (error) {
      console.log("⚠️ No authentication provided - proceeding with guest checkout");
    }

    // Create order record in database
    const orderData = {
      user_id: userId,
      email: customer_details.email,
      payment_gateway: "paypal",
      payment_session_id: paypalOrder.id,
      amount: totalAmountILS, // Store in original currency
      currency: currency,
      status: "pending",
      order_type: orderType,
      items: items,
      customer_name: customer_details.name,
      customer_phone: customer_details.phone,
      customer_address: customer_details.address,
      customer_city: customer_details.city,
      customer_country: customer_details.country || "Israel",
      service_type: service_details?.service_type,
      service_description: service_details?.service_description,
      preferred_date: service_details?.preferred_date ? new Date(service_details.preferred_date) : null,
      notes: notes,
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("❌ Error creating order:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("📦 Order created successfully:", order.id);

    // Create order items if it's a product order
    if (orderType === "product" && items.length > 0) {
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        product_name: item.product_name,
        variant_size: item.variant_size,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.unit_price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("❌ Error creating order items:", itemsError);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      console.log("📝 Order items created successfully");
    }

    // Return approval URL
    return new Response(JSON.stringify({ 
      url: approvalUrl,
      order_id: order.id,
      paypal_order_id: paypalOrder.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ PayPal payment error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: "Please check your payment details and try again."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});