import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "Welcome <welcome@resend.dev>",
      to: [email],
      subject: "Welcome to Our Newsletter! 🎉",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome ${name}!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for joining our community</p>
          </div>
          
          <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
            <h2 style="color: #333; margin-top: 0;">What to Expect</h2>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #667eea; margin-bottom: 10px;">🚀 Exclusive Offers</h3>
              <p>Be the first to know about special discounts, promotions, and exclusive deals available only to our subscribers.</p>
            </div>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #667eea; margin-bottom: 10px;">📦 New Product Updates</h3>
              <p>Get notified when we launch new products and services that could benefit your business.</p>
            </div>
            
            <div style="margin: 30px 0;">
              <h3 style="color: #667eea; margin-bottom: 10px;">💡 Industry Insights</h3>
              <p>Receive valuable tips, trends, and insights to help you stay ahead in your industry.</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <h3 style="color: #333; margin-top: 0;">Special Welcome Offer!</h3>
              <p style="margin: 15px 0;">Use code <strong style="background: #667eea; color: white; padding: 5px 10px; border-radius: 4px;">WELCOME10</strong> for 10% off your first order</p>
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || '#'}/products" 
                 style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">
                Shop Now
              </a>
            </div>
            
            <div style="border-top: 1px solid #e1e1e1; padding-top: 30px; margin-top: 40px; text-align: center;">
              <p style="margin: 0; color: #666;">
                Need help? <a href="mailto:support@yourcompany.com" style="color: #667eea;">Contact our support team</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
                You can <a href="#" style="color: #667eea;">unsubscribe</a> at any time.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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