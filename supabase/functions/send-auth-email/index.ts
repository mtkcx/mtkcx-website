import React from 'npm:react@18.3.1'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { Resend } from 'npm:resend@4.0.0'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { VerificationEmail } from './_templates/verification-email.tsx'

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  try {
    console.log('🔐 Processing auth email request...')
    
    const body = await req.json()
    console.log('📧 Email data received:', { 
      type: body.type, 
      email: body.user?.email,
      action_type: body.email_action_type 
    })

    const {
      user,
      email_data: { 
        token, 
        token_hash, 
        redirect_to, 
        email_action_type,
        site_url 
      },
    } = body

    if (!user?.email) {
      throw new Error('User email is required')
    }

    // Only handle email confirmations for now (can be extended for other types)
    if (email_action_type === 'signup') {
      console.log('✅ Rendering MTKCx verification email template...')
      
      const html = await renderAsync(
        React.createElement(VerificationEmail, {
          supabase_url: site_url || Deno.env.get('SUPABASE_URL') || '',
          token,
          token_hash,
          redirect_to: redirect_to || 'https://lovely-salamander-a3df8b.netlify.app/',
          email_action_type,
          user_email: user.email,
        })
      )

      console.log('📤 Sending branded verification email...')
      
      const { data, error } = await resend.emails.send({
        from: 'MTKCx Team <noreply@mtkcx.com>',
        to: [user.email],
        subject: 'Welcome to MTKCx - Confirm Your Email Address',
        html,
      })

      if (error) {
        console.error('❌ Resend error:', error)
        throw error
      }

      console.log('✅ Verification email sent successfully:', data?.id)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Branded verification email sent',
          email_id: data?.id 
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          },
        }
      )
    } else {
      // For other email types, let Supabase handle them normally
      console.log(`⏭️ Skipping email type: ${email_action_type}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email type not handled by custom function' 
        }),
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          },
        }
      )
    }

  } catch (error: any) {
    console.error('🚨 Error in send-auth-email function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    )
  }
})