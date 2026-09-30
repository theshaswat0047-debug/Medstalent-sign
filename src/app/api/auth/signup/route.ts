// POST /api/auth/signup
// Creates a new user in the `users` table with a bcrypt-hashed password.
// For org accounts, also creates the organization and links it.

import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { getUserByEmail, createUser, supabaseAdmin } from "@/lib/supabase-server"
import { isWorkEmail, getEmailDomain } from "@/lib/signup-helpers"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      accountType, // "ORG" | "PERSONAL"
      name,
      phone,
      email,
      password,
      location,
      // Org-specific
      companyName,
      website,
      companySize,
      // Personal-specific
      purpose,
    } = body

    // Validate required fields
    if (!name || !email || !password || !phone || !location) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Org accounts require work email
    if (accountType === "ORG" && !isWorkEmail(email)) {
      return NextResponse.json({ error: "Organization accounts require a work email (not gmail, yahoo, etc.)" }, { status: 400 })
    }

    // Check if email already exists
    const existing = await getUserByEmail(email)
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    let orgId: string | null = null

    // If org account, create the organization first
    if (accountType === "ORG") {
      if (!companyName) {
        return NextResponse.json({ error: "Company name is required for org accounts" }, { status: 400 })
      }

      const domain = getEmailDomain(email)
      const { data: orgData, error: orgError } = await supabaseAdmin
        .from("organizations")
        .insert({
          name: companyName,
          website: website || null,
          location: location || null,
          company_size: companySize || null,
          domain,
          status: "active",
          approval_status: "pending", // active immediately but flagged for HQ review
        })
        .select()
        .single()

      if (orgError) {
        console.error("Org creation error:", orgError.message)
        return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
      }

      orgId = orgData.id
    }

    // Create the user
    const user = await createUser({
      email,
      password_hash: passwordHash,
      full_name: name,
      phone,
      role: "ORG",
      account_type: accountType || "PERSONAL",
      org_id: orgId,
      purpose: purpose || null,
      location,
    })

    if (!user) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: accountType === "ORG"
        ? "Organization account created. You're the admin."
        : "Personal account created.",
    })
  } catch (error) {
    console.error("signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
