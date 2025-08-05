import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🚀 Stripe payment function started");

    // Initialize Stripe with secret key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

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
    const totalAmount = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    console.log("💰 Total amount:", totalAmount, currency);

    // Determine order type
    const orderType = service_details ? "service" : "product";

    // Get or create Stripe customer
    const customers = await stripe.customers.list({ 
      email: customer_details.email, 
      limit: 1 
    });
    
    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("👤 Found existing customer:", customerId);
    } else {
      const customer = await stripe.customers.create({
        email: customer_details.email,
        name: customer_details.name,
        phone: customer_details.phone,
        address: customer_details.address ? {
          line1: customer_details.address,
          city: customer_details.city || "Jerusalem",
          country: customer_details.country || "IL",
        } : undefined,
      });
      customerId = customer.id;
      console.log("🆕 Created new customer:", customerId);
    }

    // Prepare line items for Stripe checkout
    const lineItems = items.map(item => ({
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: `${item.product_name}${item.variant_size ? ` (${item.variant_size})` : ''}`,
        },
        unit_amount: Math.round(item.unit_price * 100), // Convert to cents/agorot
      },
      quantity: item.quantity,
    }));

    // Add service fee if it's a service order
    if (service_details) {
      lineItems.push({
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: `${service_details.service_type} Service`,
            description: service_details.service_description,
          },
          unit_amount: 0, // Service pricing will be added to items
        },
        quantity: 1,
      });
    }

    console.log("🛒 Line items for Stripe:", JSON.stringify(lineItems, null, 2));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/payment-cancelled`,
      payment_method_types: ["card"],
      billing_address_collection: "required",
      shipping_address_collection: orderType === "product" ? {
        allowed_countries: ["IL", "PS"], // Israel and Palestine
      } : undefined,
      metadata: {
        order_type: orderType,
        customer_email: customer_details.email,
      },
    });

    console.log("✅ Stripe checkout session created:", session.id);

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
      payment_gateway: "stripe",
      payment_session_id: session.id,
      amount: totalAmount,
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

    // Return checkout session URL
    return new Response(JSON.stringify({ 
      url: session.url,
      order_id: order.id,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Stripe payment error:", error);
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