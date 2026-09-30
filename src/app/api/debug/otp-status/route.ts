// GET /api/debug/otp-status — diagnostic endpoint (SuperAdmin only)
// Checks if Brevo is configured and if the requesting user exists in DB.
// Helps debug "code sent but email not received" issues.

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getBrevoConfig, getUserByEmail } from "@/lib/supabase-server"


export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user || !session.user.role === "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized — platform staff only" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")

  const config = await getBrevoConfig()

  const result: Record<string, unknown> = {
    brevo_configured: Boolean(config.apiKey && config.senderEmail),
    brevo_api_key_set: Boolean(config.apiKey),
    brevo_api_key_preview: config.apiKey
      ? `${config.apiKey.slice(0, 8)}••••${config.apiKey.slice(-4)}`
      : "NOT SET",
    brevo_sender_email: config.senderEmail || "NOT SET",
    brevo_sender_name: config.senderName,
    brevo_source: config.apiKey ? "DB or env var" : "NOT CONFIGURED",
  }

  if (email) {
    const user = await getUserByEmail(email)
    result.email_check = {
      email,
      user_exists: Boolean(user),
      user_role: user?.role ?? null,
      user_status: user?.status ?? null,
      user_name: user?.full_name ?? null,
    }
  }

  result.debug_hint = !result.brevo_configured
    ? "Brevo is NOT configured. OTP codes are logged to the server console only (Vercel function logs). Set BREVO_API_KEY + BREVO_SENDER_EMAIL in Vercel env vars, or configure in Platform Settings."
    : "Brevo IS configured. If email isn't arriving, check: (1) spam folder, (2) sender email is verified in Brevo, (3) Vercel function logs for errors."

  return NextResponse.json(result, { status: 200 })
}
