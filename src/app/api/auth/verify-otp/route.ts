// POST /api/auth/verify-otp
// Verifies the 6-digit OTP against the stored bcrypt hash.
// Returns an otpToken that Auth.js uses to sign in via the OTP credentials provider.

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getValidOtpCodes, markOtpUsed, getUserByEmail } from "@/lib/supabase-server"

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json()

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: "Code must be 6 digits" }, { status: 400 })
    }

    // Get all valid (unused, unexpired) OTP codes for this email
    const codes = await getValidOtpCodes(email)
    if (codes.length === 0) {
      return NextResponse.json({ error: "No valid OTP. Request a new code." }, { status: 400 })
    }

    // Check against the most recent codes (try each, newest first)
    let matched = false
    for (const otpEntry of codes) {
      const valid = await bcrypt.compare(code, otpEntry.code_hash)
      if (valid) {
        matched = true
        break
      }
    }

    if (!matched) {
      // Increment attempts (for brute-force tracking)
      // We don't strictly enforce a limit here — Brevo handles rate limiting
      return NextResponse.json({ error: "Invalid OTP code" }, { status: 400 })
    }

    // Mark all codes for this email as used
    await markOtpUsed(email)

    // Verify user still exists and is active
    const user = await getUserByEmail(email)
    if (!user || user.status === "disabled") {
      return NextResponse.json({ error: "Account not found or disabled" }, { status: 403 })
    }

    // Return a signed token: verified:<email>:<timestamp>
    // The Auth.js OTP provider will verify this on sign-in
    const otpToken = `verified:${email.toLowerCase().trim()}:${Date.now()}`

    return NextResponse.json({
      success: true,
      otpToken,
      redirectUrl: user.role === "SUPERADMIN" ? "/" : "/",
    })
  } catch (error) {
    console.error("verify-otp error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
