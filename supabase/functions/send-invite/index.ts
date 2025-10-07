import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, firstName, lastName, role, inviteCode, appUrl } = await req.json()

    if (!email || !role || !inviteCode || !appUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const inviteUrl = `${appUrl}/signup?invite=${inviteCode}`
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}`
      : firstName || email

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #e63946; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #e63946; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>You're Invited!</h1>
            </div>
            <div class="content">
              <h2>Hello ${displayName},</h2>
              <p>You've been invited to join the areeba Pricing Simulator as a <strong>${role}</strong>.</p>
              <p>Click the button below to create your account:</p>
              <div style="text-align: center;">
                <a href="${inviteUrl}" class="button">Accept Invitation</a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy and paste this link:<br>
                <code style="background: #e9ecef; padding: 8px; display: inline-block; margin-top: 10px; word-break: break-all;">
                  ${inviteUrl}
                </code>
              </p>
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                This invitation expires in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} areeba. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email using Resend API (you'll need to set RESEND_API_KEY in Supabase secrets)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [email],
        subject: `You've been invited to areeba Pricing Simulator`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const error = await res.text()
      console.error('Resend API error:', { 
        status: res.status, 
        statusText: res.statusText,
        error: error,
        headers: Object.fromEntries(res.headers.entries())
      })
      throw new Error(`Email send failed (${res.status}): ${error}`)
    }

    const data = await res.json()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invite email sent successfully',
        email: email,
        emailId: data.id
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Send invite error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})