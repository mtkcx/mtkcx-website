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

// Input validation functions
const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/vbscript:/gi, '')
    .slice(0, 1000);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

const validateName = (name: string): boolean => {
  // More lenient validation - just check length and basic character safety
  return name.length >= 2 && name.length <= 100;
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

    // Validate required fields
    if (!name || !email || !phone) {
      return new Response(
        JSON.stringify({ 
          error: 'All fields are required',
          details: 'Name, email, and phone are mandatory fields'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedPhone = sanitizeInput(phone);

    // Validate inputs with friendly guidance
    if (!validateName(sanitizedName)) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Please provide your full name',
          details: 'Enter your complete name (2-100 characters) for better service'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!validateEmail(sanitizedEmail)) {
      await logEnrollmentAttempt(supabase, sanitizedEmail, false, 'Invalid email format');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid email',
          details: 'Please provide a valid email address'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!validatePhone(sanitizedPhone)) {
      await logEnrollmentAttempt(supabase, sanitizedEmail, false, 'Invalid phone format');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid phone',
          details: 'Please provide a valid phone number'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Enhanced security validation using new database function
    const { data: securityCheck, error: securityError } = await supabase
      .rpc('validate_edge_function_security', {
        operation_type: 'enrollment'
      });

    if (securityError || !securityCheck) {
      console.log('Security validation failed for enrollment request');
      await logEnrollmentAttempt(supabase, sanitizedEmail, false, 'Security validation failed');
      return new Response(
        JSON.stringify({ 
          error: 'Security validation failed',
          details: 'Request blocked for security reasons'
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for duplicate enrollment
    const { data: existingEnrollment } = await supabase
      .from('enrollment_requests')
      .select('id')
      .eq('email', sanitizedEmail)
      .eq('status', 'pending')
      .single();

    if (existingEnrollment) {
      await logEnrollmentAttempt(supabase, sanitizedEmail, false, 'Duplicate enrollment attempt');
      return new Response(
        JSON.stringify({ 
          error: 'Enrollment already exists',
          details: 'An enrollment request with this email is already pending'
        }),
        { 
          status: 409, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set enhanced security context for RLS policy validation
    await supabase.rpc('set_config', {
      setting_name: 'app.enrollment_context',
      setting_value: 'secure_enrollment_creation',
      is_local: true
    });

    // Set security validation context for RLS policies
    await supabase.rpc('set_security_validation_context');

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
      await logEnrollmentAttempt(supabase, sanitizedEmail, false, `Database error: ${insertError.message}`);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create enrollment',
          details: 'Please try again later'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Log successful enrollment
    await logEnrollmentAttempt(supabase, sanitizedEmail, true);

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
        message: 'Enrollment request submitted successfully',
        enrollment_id: enrollment.id
      }),
      { 
        status: 201, 
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