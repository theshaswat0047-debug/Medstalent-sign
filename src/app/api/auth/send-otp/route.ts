// POST /api/auth/send-otp
// Generates a 6-digit OTP, stores a bcrypt hash in otp_codes table,
// and sends the code via Brevo.
// Server-side only — Brevo API key never exposed to client.

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, createOtpCode, getBrevoConfig } from "@/lib/supabase-server"
import { sendOtpEmail } from "@/lib/brevo"

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Check if user exists — only send OTP to known users
    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal whether email exists — return success anyway
      console.warn(`[send-otp] User not found: ${email}`)
      return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." })
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    console.log(`[send-otp] Generated OTP for ${email}: ${code}`)

    // Hash the code before storing
    const codeHash = await bcrypt.hash(code, 10)

    // Store the hash in otp_codes (expires in 5 min)
    const stored = await createOtpCode(email, codeHash)
    if (!stored) {
      console.error(`[send-otp] Failed to store OTP code in DB for ${email}`)
      return NextResponse.json({ error: "Failed to generate OTP. Check that the otp_codes table exists in Supabase." }, { status: 500 })
    }

    // Check if Brevo is configured BEFORE trying to send
    const brevoConfig = await getBrevoConfig()
    if (!brevoConfig.apiKey || !brevoConfig.senderEmail) {
      console.warn(`[send-otp] Brevo NOT configured. OTP code for ${email}: ${code}`)
      return NextResponse.json({
        success: true,
        message: "OTP generated but email NOT sent — Brevo not configured.",
        warning: "Brevo API key or sender email is not set. The OTP code is in the Vercel function logs. Add BREVO_API_KEY and BREVO_SENDER_EMAIL to Vercel env vars, or configure in Platform Settings.",
      })
    }

    // Send via Brevo
    const result = await sendOtpEmail(email, code)
    if (!result.success) {
      console.error(`[send-otp] Brevo send failed for ${email}:`, result.error)
      return NextResponse.json({
        error: `Failed to send OTP email. ${result.error || "Check that Brevo API key and sender email are configured in Platform Settings."}`
      }, { status: 500 })
    }

    console.log(`[send-otp] OTP sent successfully to ${email}`)
    return NextResponse.json({ success: true, message: "OTP sent via email" })
  } catch (error) {
    console.error("[send-otp] Unhandled error:", error)
    return NextResponse.json({ error: "Internal server error: " + (error instanceof Error ? error.message : "unknown") }, { status: 500 })
  }
}
