"use client"

import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

interface OrgRow {
  id: string
  name: string
  website: string | null
  location: string | null
  company_size: string | null
  domain: string
  approval_status: "pending" | "approved" | "rejected"
  status: "active" | "suspended" | "deleted"
  created_by: string | null
  created_at: string
}

export function PlatformApprovalsView() {
  const { toast } = useToast()
  const [orgs, setOrgs] = useState<OrgRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending")

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const res = await fetch("/api/platform/approvals")
      if (res.ok) {
        const data = await res.json()
        setOrgs(data.organizations || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  async function handleAction(orgId: string, action: "approve" | "reject" | "suspend") {
    const res = await fetch("/api/platform/approvals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, action }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast({ title: "Action failed", description: data.error, variant: "destructive" })
      return
    }

    toast({
      title: `Organization ${action}d`,
      description: action === "approve" ? "Org is now active." : action === "reject" ? "Org has been rejected." : "Org has been suspended.",
    })

    // Reload list
    load()
  }

  const filtered = filter === "all"
    ? orgs
    : orgs.filter((o) => o.approval_status === filter)

  const counts = {
    pending: orgs.filter((o) => o.approval_status === "pending").length,
    approved: orgs.filter((o) => o.approval_status === "approved").length,
    rejected: orgs.filter((o) => o.approval_status === "rejected").length,
    all: orgs.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review and approve organization signups on the platform.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {([
          { v: "pending" as const, l: "Pending", count: counts.pending },
          { v: "approved" as const, l: "Approved", count: counts.approved },
          { v: "rejected" as const, l: "Rejected", count: counts.rejected },
          { v: "all" as const, l: "All", count: counts.all },
        ]).map((t) => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={cn("h-8 px-3 text-xs rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
              filter === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
            {t.l}
            <span className={cn("text-[10px] tabular-nums px-1.5 py-0.5 rounded",
              filter === t.v ? "bg-background/15" : "bg-secondary text-muted-foreground")}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.check className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">
            {filter === "pending" ? "No pending approvals" : `No ${filter} organizations`}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {filter === "pending" ? "All caught up. New org signups will appear here." : "Try a different filter."}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((org) => (
            <Card key={org.id} className="p-5 shadow-card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Org info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Avatar className="size-10 rounded-md shrink-0">
                    <AvatarFallback className="rounded-md bg-secondary text-xs font-semibold">
                      {org.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold">{org.name}</h3>
                      <Badge className={cn("h-5 text-[10px]",
                        org.approval_status === "approved" ? "bg-emerald-500 hover:bg-emerald-500 text-white" :
                        org.approval_status === "pending" ? "bg-amber-500 hover:bg-amber-500 text-white" :
                        "bg-rose-500 hover:bg-rose-500 text-white"
                      )}>
                        {org.approval_status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Icons.building className="size-3" />
                        {org.domain}
                        {org.website && <span>· <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-foreground hover:underline">{org.website}</a></span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {org.location && <span className="flex items-center gap-1"><Icons.mapPin className="size-3" />{org.location}</span>}
                        {org.company_size && <span className="flex items-center gap-1"><Icons.users className="size-3" />{org.company_size}</span>}
                        <span className="flex items-center gap-1"><Icons.calendar className="size-3" />{new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {org.approval_status === "pending" && (
                    <>
                      <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => handleAction(org.id, "approve")}>
                        <Icons.check2 className="size-3.5" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleAction(org.id, "reject")}>
                        <Icons.x className="size-3.5" />
                        Reject
                      </Button>
                    </>
                  )}
                  {org.approval_status === "approved" && (
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-amber-600 hover:bg-amber-50" onClick={() => handleAction(org.id, "suspend")}>
                      <Icons.x className="size-3.5" />
                      Suspend
                    </Button>
                  )}
                  {org.approval_status === "rejected" && (
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => handleAction(org.id, "approve")}>
                      <Icons.check2 className="size-3.5" />
                      Reinstate
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
