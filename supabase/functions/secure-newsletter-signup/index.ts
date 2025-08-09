import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignupRequest {
  email: string;
  name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: SignupRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ success: false, message: 'Email is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email) || email.length > 254) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid email format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Server-side rate limiting using client IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    const { data: rateLimitResult, error: rateLimitError } = await supabase
      .rpc('check_rate_limit', {
        p_identifier: clientIP,
        p_action_type: 'newsletter_signup',
        p_max_attempts: 3,
        p_window_minutes: 60
      });

    if (rateLimitError || !rateLimitResult) {
      console.log('Rate limit check failed or limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Too many signup attempts. Please try again later.' 
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Check if already subscribed
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscriptions')
      .select('verified, is_active')
      .eq('email', email)
      .single();

    if (existingSubscription) {
      if (existingSubscription.verified && existingSubscription.is_active) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'This email is already subscribed to our newsletter' 
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          }
        );
      }
    }

    // Generate secure verification token
    const { data: tokenResult, error: tokenError } = await supabase
      .rpc('generate_secure_token');

    if (tokenError || !tokenResult) {
      console.error('Failed to generate token:', tokenError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to process signup' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Store verification token
    const { error: tokenInsertError } = await supabase
      .from('newsletter_verification_tokens')
      .insert({
        email,
        name: name || null,
        token: tokenResult,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });

    if (tokenInsertError) {
      console.error('Failed to store verification token:', tokenInsertError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to process signup' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Send verification email
    const { error: emailError } = await supabase.functions.invoke('send-newsletter-verification', {
      body: {
        email,
        name: name || 'Subscriber',
        verificationToken: tokenResult
      }
    });

    if (emailError) {
      console.error('Failed to send verification email:', emailError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to send verification email' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Newsletter signup initiated for:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please check your email to verify your subscription' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in secure-newsletter-signup function:', error);
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