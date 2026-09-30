"use client"
import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface Org { id: string; name: string; domain: string; plan: string; seats: number; used: number; envelopes: number; status: string; approval_status: string; created_at: string; mrr: number }

export function PlatformOrganizationsView() {
  const [orgs, setOrgs] = useState<Org[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => { fetch("/api/platform/approvals").then(r => r.json()).then(d => setOrgs(d.organizations || [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Organizations</h1><p className="text-sm text-muted-foreground mt-1">All organizations on the VaultSign platform.</p></div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Invite org", description: "Send a signup link." })}><Icons.plus className="size-3.5" />Invite org</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{ l: "Total orgs", v: orgs.length, s: "registered" }, { l: "Active", v: orgs.filter(o => o.status === "active").length, s: "currently active" }, { l: "Pending", v: orgs.filter(o => o.approval_status === "pending").length, s: "awaiting approval" }, { l: "Suspended", v: orgs.filter(o => o.status === "suspended").length, s: "temporarily blocked" }].map(k => <Card key={k.l} className="p-4 shadow-card"><div className="text-2xl font-semibold tabular-nums">{k.v}</div><div className="text-xs text-muted-foreground mt-0.5">{k.l}</div><div className="text-[10px] text-muted-foreground/70">{k.s}</div></Card>)}
      </div>
      {orgs.length === 0 ? (
        <Card className="p-12 text-center shadow-card"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.building className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">No organizations yet</div><div className="text-xs text-muted-foreground mt-1">When customers sign up, their orgs will appear here.</div></Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/40"><th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Organization</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Domain</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Created</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th></tr></thead>
            <tbody>{orgs.map(o => <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar className="size-9 rounded-md"><AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{o.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar><div><div className="font-medium">{o.name}</div><div className="text-[11px] text-muted-foreground">{o.domain}</div></div></div></td><td className="px-3 py-3 text-xs">{o.domain}</td><td className="px-3 py-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td><td className="px-3 py-3"><span className={cn("inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium", o.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}><span className={cn("size-1 rounded-full", o.status === "active" ? "bg-emerald-500" : "bg-rose-500")} />{o.status}</span></td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
