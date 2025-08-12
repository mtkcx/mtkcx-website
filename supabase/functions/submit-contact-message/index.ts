import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { name, email, phone, company, subject, message, serviceInterest } = await req.json()

    console.log('Contact message submission attempt:', { email, subject })

    // Basic validation
    if (!name || !email || !subject || !message) {
      console.log('Validation failed: Missing required fields')
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Set security context for RLS
    await supabase.rpc('set_config', {
      setting_name: 'app.contact_context',
      setting_value: 'secure_contact_creation',
      is_local: true
    })

    await supabase.rpc('set_config', {
      setting_name: 'app.security_validated', 
      setting_value: 'true',
      is_local: true
    })

    // Insert contact message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        company: company || null,
        subject,
        message,
        service_interest: serviceInterest || null,
        status: 'unread'
      })
      .select()

    if (error) {
      console.error('Error inserting contact message:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact message' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Contact message submitted successfully:', data[0]?.id)

    return new Response(
      JSON.stringify({ success: true, id: data[0]?.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Contact submission error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})