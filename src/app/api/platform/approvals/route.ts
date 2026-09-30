// GET /api/platform/approvals — list orgs pending approval (platform staff only)
// PATCH /api/platform/approvals — approve/reject an org (platform staff only)

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import { isPlatformRole } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || !isPlatformRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("id, name, website, location, company_size, domain, approval_status, status, created_by, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.warn("[approvals] query error:", error.message)
      return NextResponse.json({ organizations: [] })
    }

    return NextResponse.json({ organizations: data || [] })
  } catch (error) {
    console.error("[approvals] error:", error)
    return NextResponse.json({ organizations: [] })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !isPlatformRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const { orgId, action } = await req.json()
    // action: "approve" | "reject" | "suspend"

    if (!orgId || !["approve", "reject", "suspend"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const newStatus = action === "approve" ? "approved"
      : action === "reject" ? "rejected"
      : action === "suspend" ? "rejected" : "pending"

    const orgStatus = action === "approve" ? "active"
      : action === "reject" ? "suspended"
      : action === "suspend" ? "suspended" : "active"

    const { error } = await supabaseAdmin
      .from("organizations")
      .update({
        approval_status: newStatus,
        status: orgStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgId)

    if (error) {
      return NextResponse.json({ error: "Failed to update organization" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: `Organization ${action}d` })
  } catch (error) {
    console.error("[approvals PATCH] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
