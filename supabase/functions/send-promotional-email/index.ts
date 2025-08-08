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

interface PromotionalEmailRequest {
  campaignId: string;
  testEmail?: string; // If provided, only send to this email for testing
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, testEmail }: PromotionalEmailRequest = await req.json();

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Get subscriber list (or use test email)
    let subscribers;
    if (testEmail) {
      subscribers = [{ email: testEmail, name: 'Test User' }];
    } else {
      const { data, error } = await supabase
        .from('newsletter_subscriptions')
        .select('email, name')
        .eq('is_active', true);
      
      if (error) throw error;
      subscribers = data;
    }

    console.log(`Sending campaign "${campaign.name}" to ${subscribers.length} subscribers`);

    // Send emails in batches to avoid rate limits
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const emailPromises = batch.map(async (subscriber: any) => {
        try {
          const personalizedContent = campaign.content
            .replace(/\[NAME\]/g, subscriber.name || 'Valued Customer')
            .replace(/\[EMAIL\]/g, subscriber.email);

          // Discount codes removed - no special offers for now
          let discountSection = '';

          const emailResponse = await resend.emails.send({
            from: "Promotions <promotions@resend.dev>",
            to: [subscriber.email],
            subject: campaign.subject,
            html: `
              <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">${campaign.name}</h1>
                  <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Exclusive offer for our valued customers</p>
                </div>
                
                <div style="background: white; padding: 40px 20px; border-radius: 0 0 10px 10px; border: 1px solid #e1e1e1;">
                  <h2 style="color: #333; margin-top: 0;">Hello ${subscriber.name || 'Valued Customer'}!</h2>
                  
                  <div style="margin: 30px 0;">
                    ${personalizedContent}
                  </div>

                  ${discountSection}
                  
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <h3 style="color: #334155; margin-top: 0;">Why Choose Us?</h3>
                    <ul style="margin: 10px 0; padding-left: 20px; color: #64748b;">
                      <li>High-quality products with competitive prices</li>
                      <li>Fast and reliable delivery across Israel</li>
                      <li>Professional customer service</li>
                      <li>30-day return policy</li>
                    </ul>
                  </div>
                  
                  <div style="border-top: 1px solid #e1e1e1; padding-top: 30px; margin-top: 40px; text-align: center;">
                    <p style="margin: 0; color: #666;">
                      Questions? <a href="mailto:support@yourcompany.com" style="color: #8b5cf6;">Contact our support team</a>
                    </p>
                    <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
                      You can <a href="#" style="color: #8b5cf6;">unsubscribe</a> at any time.
                    </p>
                  </div>
                </div>
              </div>
            `,
          });

          // Log successful email
          await supabase
            .from('email_logs')
            .insert({
              email: subscriber.email,
              email_type: 'promotional',
              subject: campaign.subject,
              campaign_id: campaignId,
              status: 'sent'
            });

          successCount++;
          return { success: true, email: subscriber.email };
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
          errorCount++;
          return { success: false, email: subscriber.email, error: error.message };
        }
      });

      await Promise.allSettled(emailPromises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign status
    await supabase
      .from('email_campaigns')
      .update({ status: 'completed' })
      .eq('id', campaignId);

    console.log(`Campaign completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(JSON.stringify({ 
      success: true, 
      sent: successCount, 
      failed: errorCount,
      total: subscribers.length 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-promotional-email function:", error);
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