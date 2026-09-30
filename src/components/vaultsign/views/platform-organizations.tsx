"use client"

import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

// Sample organizations registered on the platform
const ORGANIZATIONS = [
  { id: "o1", name: "Acme Holdings Pvt. Ltd.", slug: "acme-holdings", plan: "Enterprise", seats: 25, used: 12, envelopes: 1284, status: "Active", domain: "sign.acme-holdings.io", createdAt: "Jan 12, 2026", mrr: 2400 },
  { id: "o2", name: "Northpeak Studios", slug: "northpeak", plan: "Business", seats: 10, used: 8, envelopes: 412, status: "Active", domain: "—", createdAt: "Mar 04, 2026", mrr: 800 },
  { id: "o3", name: "Globex Corporation", slug: "globex", plan: "Enterprise", seats: 50, used: 47, envelopes: 3421, status: "Active", domain: "sign.globex.example", createdAt: "Nov 22, 2025", mrr: 4800 },
  { id: "o4", name: "Initech LLC", slug: "initech", plan: "Starter", seats: 3, used: 3, envelopes: 89, status: "Trial", domain: "—", createdAt: "Sep 18, 2026", mrr: 0 },
  { id: "o5", name: "Hooli Technologies", slug: "hooli", plan: "Business", seats: 15, used: 9, envelopes: 287, status: "Active", domain: "—", createdAt: "Jul 09, 2026", mrr: 1200 },
  { id: "o6", name: "Pied Piper", slug: "pied-piper", plan: "Starter", seats: 5, used: 2, envelopes: 34, status: "Suspended", domain: "—", createdAt: "Aug 14, 2026", mrr: 0 },
]

const PLANS = [
  { name: "Starter", price: 0, orgs: 2, seats: "3 seats", envelopes: "50/mo", features: ["Email support", "Basic templates", "1 user"] },
  { name: "Business", price: 80, orgs: 8, seats: "15 seats", envelopes: "Unlimited", features: ["Email integration", "SSO/SAML", "API access", "Priority support"] },
  { name: "Enterprise", price: 2400, orgs: 3, seats: "25+ seats", envelopes: "Unlimited", features: ["Custom branding", "Dedicated CSM", "White-label", "Audit exports", "99.9% SLA"] },
]

export function PlatformOrganizationsView() {
  const { toast } = useToast()
  const totalMrr = ORGANIZATIONS.reduce((s, o) => s + o.mrr, 0)
  const totalEnvelopes = ORGANIZATIONS.reduce((s, o) => s + o.envelopes, 0)
  const activeOrgs = ORGANIZATIONS.filter((o) => o.status === "Active").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">All tenants registered on the VaultSign platform.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.download className="size-3.5" /> Export
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Invite organization", description: "Send a signup link to onboard a new tenant." })}>
            <Icons.plus className="size-4" /> Invite org
          </Button>
        </div>
      </div>

      {/* Platform KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total organizations", v: ORGANIZATIONS.length.toString(), s: `${activeOrgs} active` },
          { l: "Monthly recurring revenue", v: `$${(totalMrr / 1000).toFixed(1)}k`, s: "across all plans" },
          { l: "Total envelopes", v: totalEnvelopes.toLocaleString(), s: "all-time" },
          { l: "Platform uptime", v: "99.97%", s: "last 30 days" },
        ].map((k) => (
          <Card key={k.l} className="p-4 shadow-card">
            <div className="text-2xl font-semibold tabular-nums tracking-tight">{k.v}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{k.l}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.s}</div>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input placeholder="Search organizations..." className="h-9 pl-9 bg-card" />
      </div>

      {/* Orgs table */}
      <Card className="shadow-card overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40">
                <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Organization</th>
                <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Plan</th>
                <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Seats</th>
                <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Envelopes</th>
                <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">MRR</th>
                <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {ORGANIZATIONS.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors cursor-pointer"
                  onClick={() => toast({ title: o.name, description: `Open ${o.slug} workspace dashboard` })}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-9 rounded-md shrink-0">
                        <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">
                          {o.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{o.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">{o.slug} · since {o.createdAt}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><Badge variant="outline" className="h-5 text-[10px]">{o.plan}</Badge></td>
                  <td className="px-3 py-3 text-xs tabular-nums">{o.used} / {o.seats}</td>
                  <td className="px-3 py-3 text-xs tabular-nums">{o.envelopes.toLocaleString()}</td>
                  <td className="px-3 py-3 text-xs font-medium tabular-nums">{o.mrr ? `$${o.mrr.toLocaleString()}` : "—"}</td>
                  <td className="px-3 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium",
                      o.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                      o.status === "Trial" ? "bg-amber-50 text-amber-700" :
                      "bg-rose-50 text-rose-700"
                    )}>
                      <span className={cn("size-1 rounded-full",
                        o.status === "Active" ? "bg-emerald-500" :
                        o.status === "Trial" ? "bg-amber-500" : "bg-rose-500"
                      )} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Button size="icon" variant="ghost" className="size-7" onClick={(e) => e.stopPropagation()}>
                      <Icons.more className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border">
          {ORGANIZATIONS.map((o) => (
            <div key={o.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="h-5 text-[10px]">{o.plan}</Badge>
                <span className={cn(
                  "inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium",
                  o.status === "Active" ? "bg-emerald-50 text-emerald-700" :
                  o.status === "Trial" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                )}>{o.status}</span>
              </div>
              <div className="font-medium text-sm">{o.name}</div>
              <div className="text-[11px] text-muted-foreground">{o.envelopes} envelopes · {o.used}/{o.seats} seats · {o.mrr ? `$${o.mrr}/mo` : "trial"}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Plans */}
      <Card className="p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Subscription plans</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Pricing tiers available to organizations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PLANS.map((p) => (
            <div key={p.name} className="p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{p.name}</div>
                {p.name === "Enterprise" && <Badge className="h-5 text-[10px] bg-foreground text-background">Popular</Badge>}
              </div>
              <div className="mt-2">
                <span className="text-2xl font-semibold tabular-nums">${p.price}</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <div className="text-[11px] text-muted-foreground mt-1">{p.seats} · {p.envelopes} envelopes</div>
              <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-1.5 text-[11px]">
                    <Icons.check2 className="size-3 text-emerald-600 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[10px] text-muted-foreground">
                {ORGANIZATIONS.filter((o) => o.plan === p.name).length} orgs on this plan
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
