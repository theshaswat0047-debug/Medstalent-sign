// GET /api/dashboard/stats — returns real envelope stats from Supabase
// Filtered by the current user's org (or platform-wide for superadmin).

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

  // For personal accounts (no org), return zeros — they'll have docs filtered by owner_id later
  if (!isSuperadmin && !orgId) {
    return NextResponse.json({ stats: emptyStats(), recentDocs: [] })
  }

  try {
    // Fetch documents
    let docsQuery = supabaseAdmin
      .from("documents")
      .select("id, name, template_name, status, owner_name, owner_avatar, page_count, created_at, updated_at, org_id")
      .order("updated_at", { ascending: false })
      .limit(10)

    if (!isSuperadmin && orgId) {
      docsQuery = docsQuery.eq("org_id", orgId)
    }

    const { data: docs, error: docsError } = await docsQuery

    if (docsError) {
      // Table might not exist yet — return empty state
      console.warn("[dashboard stats] documents query error:", docsError.message)
      return NextResponse.json({ stats: emptyStats(), recentDocs: [] })
    }

    const allDocs = docs || []
    const total = allDocs.length
    const completed = allDocs.filter((d: any) => d.status === "COMPLETED").length
    const inProgress = allDocs.filter((d: any) => ["SENT", "DELIVERED", "VIEWED", "SIGNED", "DRAFT"].includes(d.status)).length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    const stats = {
      totalEnvelopes: total,
      completed,
      inProgress,
      avgTimeToSignHours: null as number | null, // TODO: compute from events when we have real data
      completionRate,
    }

    const recentDocs = allDocs.slice(0, 5).map((d: any) => ({
      id: d.id,
      name: d.name,
      template_name: d.template_name || "Custom document",
      status: d.status,
      owner_name: d.owner_name || "Unknown",
      owner_avatar: d.owner_avatar || "??",
      page_count: d.page_count || 1,
    }))

    return NextResponse.json({ stats, recentDocs })
  } catch (error) {
    console.error("[dashboard stats] error:", error)
    return NextResponse.json({ stats: emptyStats(), recentDocs: [] })
  }
}

function emptyStats() {
  return {
    totalEnvelopes: 0,
    completed: 0,
    inProgress: 0,
    avgTimeToSignHours: null,
    completionRate: 0,
  }
}
