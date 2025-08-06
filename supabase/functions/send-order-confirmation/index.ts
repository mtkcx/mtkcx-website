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

interface OrderConfirmationRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: OrderConfirmationRequest = await req.json();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Format order items for email
    const orderItemsHtml = order.order_items.map((item: any) => `
      <tr style="border-bottom: 1px solid #e1e1e1;">
        <td style="padding: 12px; text-align: left;">${item.product_name}</td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">₪${item.unit_price}</td>
        <td style="padding: 12px; text-align: right;">₪${item.total_price}</td>
      </tr>
    `).join('');

    const emailResponse = await resend.emails.send({
      from: "Orders <orders@resend.dev>",
      to: [order.email],
      subject: `Order Confirmation - ${order.order_number}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Order Confirmed! ✅</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order ${order.customer_name}</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
            <div style="margin-bottom: 30px;">
              <h2 style="color: #333; margin-bottom: 15px;">Order Details</h2>
              <p><strong>Order Number:</strong> ${order.order_number}</p>
              <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
              <p><strong>Total Amount:</strong> ₪${order.amount}</p>
              <p><strong>Payment Method:</strong> ${order.payment_gateway}</p>
            </div>

            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">Items Ordered</h3>
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #e1e1e1;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e1e1e1;">Product</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 1px solid #e1e1e1;">Qty</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e1e1e1;">Price</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 1px solid #e1e1e1;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                  <tr style="background: #f8f9fa; font-weight: bold;">
                    <td colspan="3" style="padding: 12px; text-align: right;">Total:</td>
                    <td style="padding: 12px; text-align: right;">₪${order.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            ${order.customer_address ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #333; margin-bottom: 15px;">Delivery Address</h3>
              <p style="margin: 0;">
                ${order.customer_name}<br>
                ${order.customer_address}<br>
                ${order.customer_city}, ${order.customer_country}
              </p>
            </div>
            ` : ''}

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #0ea5e9; margin-top: 0;">What's Next?</h3>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>We'll prepare your order and send you tracking information</li>
                <li>You'll receive updates via email as your order progresses</li>
                <li>Expected delivery: 3-5 business days</li>
              </ul>
            </div>
            
            <div style="border-top: 1px solid #e1e1e1; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="margin: 0; color: #666;">
                Questions about your order? <a href="mailto:support@yourcompany.com" style="color: #10b981;">Contact our support team</a>
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
        email_type: 'order_confirmation',
        subject: `Order Confirmation - ${order.order_number}`,
        order_id: orderId,
        status: 'sent'
      });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
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