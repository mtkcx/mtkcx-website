import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyRequest = await req.json();

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, message: 'Token is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key for full access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if token exists and is valid
    const { data: tokenData, error: tokenError } = await supabase
      .from('newsletter_verification_tokens')
      .select('*')
      .eq('token', token)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.log('Token lookup error:', tokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired verification token' 
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Mark token as used
    const { error: updateTokenError } = await supabase
      .from('newsletter_verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to process verification' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Update or insert newsletter subscription
    const { error: subscriptionError } = await supabase
      .from('newsletter_subscriptions')
      .upsert({
        email: tokenData.email,
        name: tokenData.name,
        verified: true,
        verified_at: new Date().toISOString(),
        is_active: true,
        source: 'popup'
      }, {
        onConflict: 'email'
      });

    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to activate subscription' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send welcome email
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: tokenData.email,
          name: tokenData.name || 'Subscriber'
        }
      });
    } catch (emailError) {
      console.warn('Welcome email failed to send:', emailError);
      // Don't fail the verification if email fails
    }

    console.log('Newsletter subscription verified successfully for:', tokenData.email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Your newsletter subscription has been verified successfully!' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in verify-newsletter-subscription function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'An unexpected error occurred' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);