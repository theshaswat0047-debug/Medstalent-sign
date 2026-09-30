// POST /api/auth/send-otp
// Generates a 6-digit OTP, stores a bcrypt hash in otp_codes table,
// and sends the code via Brevo.
// Server-side only — Brevo API key never exposed to client.

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, createOtpCode } from "@/lib/supabase-server"
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
      return NextResponse.json({ success: true, message: "If an account exists, an OTP has been sent." })
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "Account is disabled" }, { status: 403 })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Hash the code before storing
    const codeHash = await bcrypt.hash(code, 10)

    // Store the hash in otp_codes (expires in 5 min)
    const stored = await createOtpCode(email, codeHash)
    if (!stored) {
      return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
    }

    // Send via Brevo
    const result = await sendOtpEmail(email, code)
    if (!result.success) {
      return NextResponse.json({ error: "Failed to send OTP email" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "OTP sent via email" })
  } catch (error) {
    console.error("send-otp error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
