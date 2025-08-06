import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackingEmailRequest {
  orderId: string;
  trackingNumber: string;
  carrierName?: string;
  trackingUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, trackingNumber, carrierName, trackingUrl }: TrackingEmailRequest = await req.json();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Update order with tracking number
    await supabase
      .from('orders')
      .update({ 
        tracking_number: trackingNumber,
        status: 'shipped'
      })
      .eq('id', orderId);

    const emailResponse = await resend.emails.send({
      from: "Shipping <shipping@resend.dev>",
      to: [order.email],
      subject: `Your Order is On Its Way! - ${order.order_number}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Package Shipped! 📦</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your order is on its way to you</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 15px;">Hi ${order.customer_name}!</h2>
              <p>Great news! Your order has been shipped and is on its way to you.</p>
            </div>

            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">Tracking Information</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.order_number}</p>
              <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
              ${carrierName ? `<p style="margin: 5px 0;"><strong>Carrier:</strong> ${carrierName}</p>` : ''}
              
              ${trackingUrl ? `
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${trackingUrl}" 
                     style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Track Your Package
                  </a>
                </div>
              ` : ''}
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">Delivery Information</h3>
              <p><strong>Expected Delivery:</strong> 3-5 business days</p>
              ${order.customer_address ? `
              <p style="margin-top: 15px;"><strong>Delivery Address:</strong><br>
                ${order.customer_name}<br>
                ${order.customer_address}<br>
                ${order.customer_city}, ${order.customer_country}
              </p>
              ` : ''}
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #059669; margin-top: 0;">Delivery Tips</h3>
              <ul style="margin: 10px 0; padding-left: 20px; color: #374151;">
                <li>Someone should be available to receive the package</li>
                <li>Check your tracking number regularly for updates</li>
                <li>Contact us immediately if there are any delivery issues</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #e1e1e1; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="margin: 0; color: #666;">
                Questions about your delivery? <a href="mailto:support@yourcompany.com" style="color: #f59e0b;">Contact our support team</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #666;">
                Track your package: <strong>${trackingNumber}</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    // Log the email
    await supabase
      .from('email_logs')
      .insert({
        email: order.email,
        email_type: 'tracking',
        subject: `Your Order is On Its Way! - ${order.order_number}`,
        order_id: orderId,
        status: 'sent'
      });

    console.log("Tracking email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tracking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);