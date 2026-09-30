// Brevo email sender — SERVER-SIDE ONLY.
// Never import this in client components.
// Sends transactional emails (OTP codes, signing invitations, etc.)

interface BrevoEmailParams {
  to: string
  subject: string
  htmlContent: string
  textContent?: string
}

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"

export async function sendEmailViaBrevo(params: BrevoEmailParams): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || "VaultSign"

  // If Brevo isn't configured, log the email (for dev) and return success
  // so the app doesn't crash — the OTP code will be visible in server logs
  if (!apiKey || !senderEmail) {
    console.warn(
      "⚠️  Brevo not configured. Email not sent. Set BREVO_API_KEY and BREVO_SENDER_EMAIL."
    )
    console.warn(`   To: ${params.to}`)
    console.warn(`   Subject: ${params.subject}`)
    // Extract OTP code from HTML for dev logging
    const codeMatch = params.htmlContent.match(/\b(\d{6})\b/)
    if (codeMatch) {
      console.warn(`   🔑 OTP CODE (dev only): ${codeMatch[1]}`)
    }
    return { success: true }
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: params.to }],
        subject: params.subject,
        htmlContent: params.htmlContent,
        textContent: params.textContent,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Brevo API error:", response.status, errorBody)
      return { success: false, error: `Brevo API error: ${response.status}` }
    }

    return { success: true }
  } catch (error) {
    console.error("Brevo send error:", error)
    return { success: false, error: "Failed to send email" }
  }
}

// Send OTP email
export async function sendOtpEmail(to: string, code: string): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#F2EDE4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2EDE4;padding:40px 20px;">
        <tr>
          <td align="center">
            <table width="480" cellpadding="0" cellspacing="0" style="background-color:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05);">
              <!-- Header -->
              <tr>
                <td style="background-color:#1A1A1A;padding:24px 32px;text-align:center;">
                  <h1 style="margin:0;color:#FFFFFF;font-size:18px;font-weight:600;letter-spacing:-0.01em;">
                    Vault<span style="background:linear-gradient(90deg,#3B82F6,#A855F7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Sign</span>
                  </h1>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding:40px 32px;">
                  <h2 style="margin:0 0 8px 0;color:#1A1A1A;font-size:20px;font-weight:600;">
                    Your verification code
                  </h2>
                  <p style="margin:0 0 32px 0;color:#6B6B6B;font-size:14px;line-height:1.6;">
                    Enter this code to complete your sign-in. This code expires in 5 minutes.
                  </p>
                  <!-- OTP Code -->
                  <div style="text-align:center;margin:32px 0;">
                    <div style="display:inline-block;background-color:#F2EDE4;border-radius:8px;padding:20px 40px;">
                      <span style="font-size:36px;font-weight:700;letter-spacing:0.5em;color:#1A1A1A;font-family:monospace;">
                        ${code}
                      </span>
                    </div>
                  </div>
                  <p style="margin:24px 0 0 0;color:#999;font-size:12px;line-height:1.5;">
                    If you didn't request this code, you can safely ignore this email.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #E5E5E0;">
                  <p style="margin:0;color:#999;font-size:11px;text-align:center;">
                    © 2026 VaultSign, Inc. · Secure. Sign. Done.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const textContent = `Your VaultSign verification code is: ${code}

This code expires in 5 minutes. If you didn't request this code, you can safely ignore this email.

© 2026 VaultSign, Inc.`

  return sendEmailViaBrevo({
    to,
    subject: "Your VaultSign verification code",
    htmlContent,
    textContent,
  })
}
