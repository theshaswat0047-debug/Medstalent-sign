// GET /api/team — returns org members (filtered by org_id)
// ORG_OWNER sees all members, ORG_MEMBER sees all members (read-only)

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import { isCustomerRole } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  if (!session?.user || !isCustomerRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const orgId = session.user.orgId
  if (!orgId) {
    return NextResponse.json({ members: [] })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, email, full_name, avatar, role, status, created_at")
      .eq("org_id", orgId)
      .order("created_at", { ascending: true })

    if (error) {
      console.warn("[team] query error:", error.message)
      return NextResponse.json({ members: [] })
    }

    const members = (data || []).map((m: any) => ({
      id: m.id,
      name: m.full_name,
      email: m.email,
      avatar: m.avatar || m.full_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "??",
      role: m.role,
      status: m.status,
      lastActive: "Recently",
    }))

    return NextResponse.json({ members })
  } catch (error) {
    console.error("[team] error:", error)
    return NextResponse.json({ members: [] })
  }
}
