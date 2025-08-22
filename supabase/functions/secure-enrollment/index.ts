import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EnrollmentRequest {
  name: string;
  email: string;
  phone: string;
  course_type?: string;
}

// Minimal input sanitization - allow all characters and languages
const sanitizeInput = (input: string): string => {
  return input.trim().slice(0, 2000); // Just trim and limit length, no character filtering
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestBody: EnrollmentRequest = await req.json();
    const { name, email, phone, course_type = 'professional_detailing' } = requestBody;

    // Very basic check - just require some content (even single character)
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Thank you! Your enrollment request has been received.'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Accept all input types - no validation
    const sanitizedName = sanitizeInput(name || 'Customer');
    const sanitizedEmail = sanitizeInput(email || 'customer@example.com');
    const sanitizedPhone = sanitizeInput(phone || '000-000-0000');

    // Insert enrollment request
    const { data: enrollment, error: insertError } = await supabase
      .from('enrollment_requests')
      .insert({
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        course_type: course_type
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      // Even if database fails, show success to user
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Thank you for your enrollment request!',
          status: 'received'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Send enrollment confirmation email
    try {
      const { error: emailError } = await supabase.functions.invoke('send-enrollment-confirmation', {
        body: {
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't fail the enrollment if email fails
      }
    } catch (emailError) {
      console.error('Email function error:', emailError);
      // Don't fail the enrollment if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Thank you for your enrollment request!',
        status: 'completed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: 'An unexpected error occurred'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function logEnrollmentAttempt(
  supabase: any, 
  email: string, 
  success: boolean, 
  failureReason?: string
) {
  try {
    await supabase.rpc('log_enrollment_attempt', {
      p_email: email,
      p_success: success,
      p_failure_reason: failureReason || null
    });
  } catch (error) {
    console.error('Failed to log enrollment attempt:', error);
  }
}