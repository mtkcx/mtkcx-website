import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name?: string;
  verification_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📧 Processing MTKCx welcome email request...');
    
    const { email, name, verification_url }: WelcomeEmailRequest = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log(`✉️ Sending MTKCx welcome email to: ${email}`);

    const emailResponse = await resend.emails.send({
      from: "MTKCx Team <noreply@resend.dev>",
      to: [email],
      subject: "Welcome to MTKCx - Your Account is Ready!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to MTKCx</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header -->
            <div style="background-color: #1a365d; padding: 32px 40px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 8px; line-height: 1.2;">MTKCx</h1>
              <p style="color: #e2e8f0; font-size: 16px; margin: 0; font-weight: 400;">Professional Car Detailing & Koch-Chemie Products</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 32px 40px;">
              <h2 style="color: #1a365d; font-size: 24px; font-weight: bold; margin: 0 0 16px;">Welcome to MTKCx${name ? ', ' + name : ''}!</h2>
              
              <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 16px;">
                Thank you for joining the MTKCx community! Your account has been successfully created and you can now start exploring our professional car detailing products and services.
              </p>

              <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 24px;">
                You can now access your account and start shopping immediately. No email verification is required - your account is ready to use!
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="https://lovely-salamander-a3df8b.netlify.app/" style="background-color: #3182ce; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  Start Shopping Now
                </a>
              </div>

              <div style="margin: 24px 0;">
                <h3 style="color: #1a365d; font-size: 20px; font-weight: bold; margin: 0 0 12px;">What's Available?</h3>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px;">With your MTKCx account, you can:</p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px; padding-left: 16px;">• Browse our complete Koch-Chemie product catalog</p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px; padding-left: 16px;">• Enroll in professional detailing courses</p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px; padding-left: 16px;">• Access exclusive member pricing</p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px; padding-left: 16px;">• Track your orders and course progress</p>
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5; margin: 0 0 8px; padding-left: 16px;">• Get professional car wrapping services</p>
              </div>

              <div style="background-color: #f0f7ff; border-left: 4px solid #3182ce; padding: 16px; margin: 24px 0;">
                <h4 style="color: #1a365d; font-size: 16px; font-weight: bold; margin: 0 0 8px;">🚗 Professional Training Available</h4>
                <p style="color: #4a5568; font-size: 14px; line-height: 1.5; margin: 0;">
                  Interested in learning professional car detailing? Check out our hands-on training courses starting September 5, 2025!
                </p>
              </div>
            </div>

            <!-- Contact Info -->
            <div style="background-color: #f7fafc; padding: 24px 40px;">
              <h3 style="color: #1a365d; font-size: 18px; font-weight: bold; margin: 0 0 12px;">Need Help?</h3>
              <p style="color: #718096; font-size: 14px; line-height: 1.4; margin: 0 0 4px;">📞 Phone: 052-5701073</p>
              <p style="color: #718096; font-size: 14px; line-height: 1.4; margin: 0 0 4px;">📧 Email: info@mtkcx.com</p>
              <p style="color: #718096; font-size: 14px; line-height: 1.4; margin: 0;">📍 Location: Atarot, Jerusalem</p>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 40px; text-align: center;">
              <p style="color: #a0aec0; font-size: 12px; line-height: 1.4; margin: 0 0 8px;">
                This email was sent to ${email}. If you didn't create an account with MTKCx, you can safely ignore this email.
              </p>
              <p style="color: #a0aec0; font-size: 12px; line-height: 1.4; margin: 0;">
                © 2024 MTKCx - Your Trusted Partner for Professional Car Detailing
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ MTKCx welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-welcome-email function:", error);
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