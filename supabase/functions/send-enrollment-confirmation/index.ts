import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EnrollmentEmailRequest {
  name: string;
  email: string;
  phone: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone }: EnrollmentEmailRequest = await req.json();

    console.log('Processing enrollment confirmation for:', { name, email, phone });

    const emailResponse = await resend.emails.send({
      from: "MT Wraps <onboarding@resend.dev>",
      to: [email],
      subject: "Koch Chemie Professional Detailing Course - Enrollment Received",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0; font-size: 28px;">MT Wraps Training Center</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Koch Chemie Professional Partner</p>
            </div>
            
            <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Enrollment Confirmation</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear <strong>${name}</strong>,</p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #374151;">
              Thank you for your interest in our <strong>Koch Chemie Professional Detailing & Polishing Certification</strong> course!
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1f2937; margin-top: 0;">Your Information:</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="margin: 5px 0;"><strong>Name:</strong> ${name}</li>
                <li style="margin: 5px 0;"><strong>Email:</strong> ${email}</li>
                <li style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</li>
                <li style="margin: 5px 0;"><strong>Course:</strong> Koch Chemie Professional Detailing & Polishing</li>
              </ul>
            </div>
            
            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">What's Next?</h3>
              <p style="margin: 0; color: #1e40af;">
                Our team will contact you within <strong>24 hours</strong> to discuss:
              </p>
              <ul style="color: #1e40af; margin: 10px 0 0 20px;">
                <li>Course schedule and availability</li>
                <li>Training program details</li>
                <li>Certification requirements</li>
                <li>Pricing and payment options</li>
              </ul>
            </div>
            
            <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin-top: 0;">About Our Course</h3>
              <p style="margin: 0; color: #0369a1;">
                This comprehensive certification program covers professional automotive detailing techniques using Koch Chemie products - the gold standard in automotive care since 1968.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0;">
                Best regards,<br>
                <strong style="color: #374151;">MT Wraps Training Team</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 10px 0 0 0;">
                Official Koch Chemie Partner & Training Center
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Enrollment confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-enrollment-confirmation function:", error);
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