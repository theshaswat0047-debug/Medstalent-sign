"use client"
import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Org { id: string; name: string; domain: string; website: string | null; location: string | null; company_size: string | null; approval_status: string; status: string; created_at: string }

export function PlatformApprovalsView() {
  const { toast } = useToast()
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending")

  useEffect(() => { load() }, [])
  async function load() { try { const res = await fetch("/api/platform/approvals"); if (res.ok) { const d = await res.json(); setOrgs(d.organizations || []) } } catch {} finally { setLoading(false) } }

  async function handleAction(orgId: string, action: "approve" | "reject" | "suspend") {
    const res = await fetch("/api/platform/approvals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgId, action }) })
    if (res.ok) { toast({ title: `Organization ${action}d`, description: action === "approve" ? "Org is now active." : action === "reject" ? "Org rejected." : "Org suspended." }); load() }
    else toast({ title: "Action failed", variant: "destructive" })
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  const filtered = filter === "all" ? orgs : orgs.filter(o => o.approval_status === filter)
  const counts = { pending: orgs.filter(o => o.approval_status === "pending").length, approved: orgs.filter(o => o.approval_status === "approved").length, rejected: orgs.filter(o => o.approval_status === "rejected").length, all: orgs.length }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Approvals</h1><p className="text-sm text-muted-foreground mt-1">Review and approve organization signups.</p></div>
      <div className="flex items-center gap-1 overflow-x-auto pb-1">{[["pending","Pending",counts.pending],["approved","Approved",counts.approved],["rejected","Rejected",counts.rejected],["all","All",counts.all]].map(([v,l,c]) => <button key={v} onClick={() => setFilter(v as any)} className={cn("h-8 px-3 text-xs rounded-md font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors", filter === v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60")}>{l}<span className={cn("text-[10px] px-1.5 py-0.5 rounded", filter === v ? "bg-background/15" : "bg-secondary")}>{c}</span></button>)}</div>
      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.check className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">{filter === "pending" ? "No pending approvals" : `No ${filter} organizations`}</div><div className="text-xs text-muted-foreground mt-1">{filter === "pending" ? "All caught up." : "Try a different filter."}</div></Card>
      ) : (
        <div className="space-y-3">{filtered.map(o => (
          <Card key={o.id} className="p-5 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0"><div className="flex items-center gap-2 flex-wrap"><h3 className="text-sm font-semibold">{o.name}</h3><Badge className={cn("h-5 text-[10px]", o.approval_status === "approved" ? "bg-emerald-500 text-white" : o.approval_status === "pending" ? "bg-amber-500 text-white" : "bg-rose-500 text-white")}>{o.approval_status}</Badge></div><div className="text-xs text-muted-foreground mt-1 space-y-0.5"><div className="flex items-center gap-1.5"><Icons.building className="size-3" />{o.domain}{o.website && <span>· {o.website}</span>}</div><div className="flex items-center gap-3">{o.location && <span className="flex items-center gap-1"><Icons.mapPin className="size-3" />{o.location}</span>}{o.company_size && <span className="flex items-center gap-1"><Icons.users className="size-3" />{o.company_size}</span>}<span className="flex items-center gap-1"><Icons.calendar className="size-3" />{new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></div></div></div>
              <div className="flex items-center gap-2 shrink-0">
                {o.approval_status === "pending" && <><Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => handleAction(o.id, "approve")}><Icons.check2 className="size-3.5" />Approve</Button><Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleAction(o.id, "reject")}><Icons.x className="size-3.5" />Reject</Button></>}
                {o.approval_status === "approved" && <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs text-amber-600 hover:bg-amber-50" onClick={() => handleAction(o.id, "suspend")}><Icons.x className="size-3.5" />Suspend</Button>}
                {o.approval_status === "rejected" && <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => handleAction(o.id, "approve")}><Icons.check2 className="size-3.5" />Reinstate</Button>}
              </div>
            </div>
          </Card>
        ))}</div>
      )}
    </div>
  )
}
