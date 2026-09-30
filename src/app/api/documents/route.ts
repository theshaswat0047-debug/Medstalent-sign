// GET /api/documents — returns real documents from Supabase
// Filtered by org_id (or all for superadmin)

import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const isSuperadmin = session.user.role === "SUPERADMIN"
  const orgId = session.user.orgId ?? null

  // Personal accounts with no org — no documents yet
  if (!isSuperadmin && !orgId) {
    return NextResponse.json({ documents: [] })
  }

  try {
    let query = supabaseAdmin
      .from("documents")
      .select("*")
      .order("updated_at", { ascending: false })

    if (!isSuperadmin && orgId) {
      query = query.eq("org_id", orgId)
    }

    const { data, error } = await query

    if (error) {
      console.warn("[documents] query error:", error.message)
      return NextResponse.json({ documents: [] })
    }

    return NextResponse.json({ documents: data || [] })
  } catch (error) {
    console.error("[documents] error:", error)
    return NextResponse.json({ documents: [] })
  }
}
