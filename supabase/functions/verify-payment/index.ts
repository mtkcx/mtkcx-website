import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔍 Payment verification function started");

    const { session_id, gateway } = await req.json();
    
    if (!session_id || !gateway) {
      throw new Error("Missing session_id or gateway parameter");
    }

    console.log(`🔍 Verifying ${gateway} payment:`, session_id);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let paymentStatus = "pending";
    let paymentDetails: any = {};

    if (gateway === "stripe") {
      // Verify Stripe payment
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
      }

      const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
      const session = await stripe.checkout.sessions.retrieve(session_id);
      
      console.log("💳 Stripe session status:", session.payment_status);
      
      if (session.payment_status === "paid") {
        paymentStatus = "paid";
        paymentDetails = {
          payment_intent_id: session.payment_intent,
          customer_email: session.customer_details?.email,
          amount_total: session.amount_total,
          currency: session.currency,
        };
      } else if (session.payment_status === "unpaid") {
        paymentStatus = "failed";
      }

    } else if (gateway === "paypal") {
      // Verify PayPal payment
      const accessToken = await getPayPalAccessToken();
      
      const response = await fetch(`https://api-m.paypal.com/v2/checkout/orders/${session_id}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to verify PayPal payment: ${response.status}`);
      }

      const paypalOrder = await response.json();
      console.log("🅿️ PayPal order status:", paypalOrder.status);

      if (paypalOrder.status === "COMPLETED") {
        paymentStatus = "paid";
        paymentDetails = {
          payment_intent_id: paypalOrder.id,
          customer_email: paypalOrder.payment_source?.paypal?.email_address,
          amount_total: parseFloat(paypalOrder.purchase_units[0].amount.value) * 100, // Convert to cents
          currency: paypalOrder.purchase_units[0].amount.currency_code,
        };
      } else if (paypalOrder.status === "APPROVED") {
        paymentStatus = "pending";
      } else {
        paymentStatus = "failed";
      }
    }

    // Update order status in database
    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: paymentStatus,
        payment_intent_id: paymentDetails.payment_intent_id,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_session_id", session_id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating order:", updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log("✅ Order updated successfully:", updatedOrder.id, "Status:", paymentStatus);

    return new Response(JSON.stringify({
      success: true,
      order_id: updatedOrder.id,
      payment_status: paymentStatus,
      order: updatedOrder,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Payment verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});