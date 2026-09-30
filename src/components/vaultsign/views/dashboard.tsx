"use client"

import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ANALYTICS, RECENT_ACTIVITY } from "@/lib/mock-data"
import { useAppStore } from "@/lib/store"
import type { Role } from "../shell"
import type { ViewKey } from "../shell"

export function DashboardView({ role, onNavigate }: { role: Role; onNavigate: (v: ViewKey) => void }) {
  const a = ANALYTICS
  const envelopes = useAppStore((s) => s.envelopes)
  const selectEnvelope = useAppStore((s) => s.selectEnvelope)

  const kpis = [
    { label: "Total envelopes", value: a.totalEnvelopes.toLocaleString(), delta: "+12.4%", trend: "up", icon: "sign" as const },
    { label: "Completed", value: a.completed.toLocaleString(), delta: "+8.1%", trend: "up", icon: "check" as const },
    { label: "In progress", value: a.inProgress.toString(), delta: "+5", trend: "up", icon: "clock" as const },
    { label: "Avg time to sign", value: `${a.avgTimeToSignHours}h`, delta: "-0.8h", trend: "down", icon: "clock3" as const },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {role === "SUPERADMIN" ? "Maya" : role === "ORG_ADMIN" ? "Aisha" : role === "MANAGER" ? "Priya" : "Vikram"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {role === "SUPERADMIN"
              ? "Platform-wide overview across all organizations and tenants."
              : role === "ORG_ADMIN"
                ? "Here's what's happening across your organization today."
                : "Here's a snapshot of your team's signing activity."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.calendar className="size-3.5" />
            Last 14 days
            <Icons.chevronDown className="size-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((k) => {
          const Icon = Icons[k.icon]
          return (
            <Card key={k.label} className="p-4 shadow-card hover:shadow-card-hover transition-shadow">
              <div className="flex items-start justify-between">
                <div className="size-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="size-4 text-foreground" />
                </div>
                <span className={cn(
                  "text-xs font-medium px-1.5 py-0.5 rounded",
                  k.trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                )}>
                  {k.delta}
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-semibold tracking-tight tabular-nums">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Volume chart */}
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Envelope volume — last 14 days</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Daily envelope sends across the organization</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="size-2 rounded-full bg-foreground" />
              <span className="text-muted-foreground">Sent</span>
            </div>
          </div>
          <VolumeChart data={a.volumeTrend} />
        </Card>

        {/* Category breakdown */}
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">By category</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Envelope distribution</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {a.byCategory.map((c) => {
              const max = Math.max(...a.byCategory.map((x) => x.value))
              return (
                <div key={c.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium">{c.label}</span>
                    <span className="text-muted-foreground tabular-nums">{c.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: `${(c.value / max) * 100}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Recent activity + Recent documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent documents */}
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Recent documents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest envelopes across the team</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => onNavigate("documents")}>
              View all
              <Icons.arrowRight className="size-3" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {envelopes.slice(0, 5).map((d) => (
              <button
                key={d.id}
                onClick={() => { selectEnvelope(d.id); onNavigate("tracking") }}
                className="w-full flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-accent/40 -mx-2 px-2 rounded-lg transition-colors text-left"
              >
                <Avatar className="size-9 rounded-md shrink-0">
                  <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{d.ownerAvatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.templateName} · {d.pageCount}p · {d.owner}</div>
                </div>
                <StatusBadge status={d.status} />
                <Icons.chevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </Card>

        {/* Activity feed */}
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Live activity</h2>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              Real-time
            </span>
          </div>
          <div className="space-y-3">
            {RECENT_ACTIVITY.map((ev) => {
              const Icon = activityIcon(ev.type)
              return (
                <div key={ev.id} className="flex gap-2.5">
                  <div className={cn("size-7 rounded-full flex items-center justify-center shrink-0", activityBg(ev.type))}>
                    <Icon className={cn("size-3.5", activityColor(ev.type))} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs leading-snug">
                      <span className="font-medium">{ev.actor}</span>
                      <span className="text-muted-foreground"> {ev.action} </span>
                      <span className="font-medium">{ev.target}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{ev.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}

function activityIcon(type: string) {
  switch (type) {
    case "signed": return Icons.check
    case "viewed": return Icons.eye
    case "delivered": return Icons.mail
    case "declined": return Icons.xCircle
    case "sent": return Icons.send
    default: return Icons.dot
  }
}
function activityBg(type: string) {
  switch (type) {
    case "signed": return "bg-emerald-50"
    case "viewed": return "bg-blue-50"
    case "delivered": return "bg-secondary"
    case "declined": return "bg-rose-50"
    case "sent": return "bg-secondary"
    default: return "bg-secondary"
  }
}
function activityColor(type: string) {
  switch (type) {
    case "signed": return "text-emerald-600"
    case "viewed": return "text-blue-600"
    case "delivered": return "text-foreground"
    case "declined": return "text-rose-600"
    case "sent": return "text-foreground"
    default: return "text-muted-foreground"
  }
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT:     { label: "Draft",     cls: "bg-secondary text-secondary-foreground" },
    SENT:      { label: "Sent",      cls: "bg-blue-50 text-blue-700" },
    DELIVERED: { label: "Delivered", cls: "bg-blue-50 text-blue-700" },
    VIEWED:    { label: "Viewed",    cls: "bg-amber-50 text-amber-700" },
    SIGNED:    { label: "Signed",    cls: "bg-emerald-50 text-emerald-700" },
    COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
    DECLINED:  { label: "Declined",  cls: "bg-rose-50 text-rose-700" },
    EXPIRED:   { label: "Expired",   cls: "bg-secondary text-muted-foreground" },
    VOIDED:    { label: "Voided",    cls: "bg-secondary text-muted-foreground" },
  }
  const s = map[status] ?? { label: status, cls: "bg-secondary text-secondary-foreground" }
  return (
    <Badge variant="secondary" className={cn("h-5 px-1.5 text-[10px] font-medium rounded", s.cls)}>
      {s.label}
    </Badge>
  )
}

// Simple bar chart — pure SVG, matches monochrome aesthetic
function VolumeChart({ data }: { data: number[] }) {
  const max = Math.max(...data)
  const w = 100 / data.length
  return (
    <div className="relative h-44 w-full">
      <svg viewBox="0 0 100 44" preserveAspectRatio="none" className="w-full h-full">
        {/* Grid lines */}
        {[0, 11, 22, 33, 44].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.1" className="text-border" />
        ))}
        {/* Bars */}
        {data.map((v, i) => {
          const h = (v / max) * 40
          const x = i * w + w * 0.18
          const bw = w * 0.64
          return (
            <rect
              key={i}
              x={x} y={44 - h}
              width={bw} height={h}
              rx="0.5"
              className={i === data.length - 1 ? "fill-foreground" : "fill-muted-foreground/40"}
            />
          )
        })}
      </svg>
      {/* X-axis labels */}
      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
        <span>14 days ago</span>
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  )
}
