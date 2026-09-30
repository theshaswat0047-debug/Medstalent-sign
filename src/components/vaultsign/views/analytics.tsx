"use client"

import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ANALYTICS } from "@/lib/mock-data"

export function AnalyticsView() {
  const a = ANALYTICS
  const maxVol = Math.max(...a.volumeTrend)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Completion rates, time-to-sign, and team performance across the org.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.calendar className="size-3.5" />
            Last 14 days
            <Icons.chevronDown className="size-3" />
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Completion rate", value: `${a.completionRate}%`, delta: "+3.2%", trend: "up", sub: "1,043 of 1,284" },
          { label: "Delivery rate", value: `${a.deliveryRate}%`, delta: "+0.4%", trend: "up", sub: "via email" },
          { label: "Email open rate", value: `${a.openRate}%`, delta: "+1.8%", trend: "up", sub: "987 of 1,284" },
          { label: "Avg time to sign", value: `${a.avgTimeToSignHours}h`, delta: "-0.8h", trend: "down", sub: "faster than last period" },
        ].map((k) => (
          <Card key={k.label} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded",
                k.trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50")}>
                {k.delta}
              </span>
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{k.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Volume chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Envelope volume — 14 days</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Total envelopes sent per day</p>
            </div>
          </div>
          <div className="h-56 flex items-end justify-between gap-1">
            {a.volumeTrend.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={cn("w-full rounded-t group-hover:bg-foreground transition-colors", i === a.volumeTrend.length - 1 ? "bg-foreground" : "bg-foreground/30")}
                    style={{ height: `${(v / maxVol) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
            <span>Sep 17</span>
            <span>Sep 23</span>
            <span>Sep 30</span>
          </div>
        </Card>

        {/* Funnel */}
        <Card className="p-5 shadow-card">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Signing funnel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drop-off per stage</p>
          </div>
          <div className="space-y-2.5">
            {[
              { stage: "Sent", value: 1284, pct: 100, color: "bg-foreground" },
              { stage: "Delivered", value: 1277, pct: 99.4, color: "bg-foreground/80" },
              { stage: "Opened", value: 987, pct: 76.8, color: "bg-foreground/65" },
              { stage: "Viewed", value: 914, pct: 71.2, color: "bg-foreground/50" },
              { stage: "Signed", value: 1043, pct: 81.2, color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.stage}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium">{s.stage}</span>
                  <span className="text-muted-foreground tabular-nums">{s.value} · {s.pct}%</span>
                </div>
                <div className="h-7 rounded-md bg-muted overflow-hidden">
                  <div className={cn("h-full rounded-md flex items-center px-2", s.color)} style={{ width: `${s.pct}%` }}>
                    <span className="text-[10px] font-medium text-background tabular-nums">{s.pct}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Team leaderboard + category split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team leaderboard */}
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Team performance</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Top senders by completion rate</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs">View all</Button>
          </div>
          <div className="space-y-1">
            {a.teamPerformance.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/40 transition-colors">
                <div className={cn("size-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0",
                  i === 0 ? "bg-foreground text-background" : "bg-secondary text-muted-foreground")}>
                  {i + 1}
                </div>
                <Avatar className="size-8 rounded-md">
                  <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold">{m.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground">{m.sent} sent · avg {m.avgHours}h to sign</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums">{m.completionRate}%</div>
                  <div className="text-[10px] text-muted-foreground">completion</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Category split */}
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Envelopes by category</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Distribution across template types</p>
            </div>
          </div>
          {/* Donut + legend */}
          <div className="flex items-center gap-6">
            <div className="relative size-32 shrink-0">
              <DonutChart data={a.byCategory} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold tabular-nums">{a.totalEnvelopes}</span>
                <span className="text-[10px] text-muted-foreground">total</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {a.byCategory.map((c, i) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className="size-2 rounded-sm" style={{ background: donutColors[i % donutColors.length] }} />
                  <span className="font-medium">{c.label}</span>
                  <span className="ml-auto text-muted-foreground tabular-nums">{c.value}</span>
                  <span className="text-muted-foreground tabular-nums w-10 text-right">{Math.round((c.value / a.totalEnvelopes) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Decline reasons */}
      <Card className="p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Decline reasons — last 30 days</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Why recipients declined to sign</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { reason: "Line item discrepancy", count: 12, pct: 31 },
            { reason: "Terms need clarification", count: 9, pct: 23 },
            { reason: "Wrong recipient", count: 7, pct: 18 },
            { reason: "Pricing disagreement", count: 5, pct: 13 },
            { reason: "Legal review required", count: 4, pct: 10 },
            { reason: "Other", count: 2, pct: 5 },
          ].map((r) => (
            <div key={r.reason} className="p-3 rounded-lg bg-secondary/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium">{r.reason}</span>
                <Badge variant="secondary" className="h-5 text-[10px]">{r.count}</Badge>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: `${r.pct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{r.pct}% of declines</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

const donutColors = ["#1A1A1A", "#4A4A4A", "#6B6B6B", "#8A8A8A", "#A8A8A8", "#C0C0C0", "#D8D8D8", "#E8E8E8"]

function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  // Precompute cumulative offsets purely (no mutation during render)
  const cumulative = data.reduce<number[]>((acc, d, i) => {
    const prev = i === 0 ? 0 : acc[i - 1]
    return [...acc, prev + d.value / total]
  }, [])
  const segments = data.map((d, i) => ({
    dash: (d.value / total) * circumference,
    offset: -(i === 0 ? 0 : cumulative[i - 1]) * circumference,
    color: donutColors[i % donutColors.length],
  }))

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#EAEAEA" strokeWidth="12" />
      {segments.map((s, i) => (
        <circle
          key={i}
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={s.color}
          strokeWidth="12"
          strokeDasharray={`${s.dash} ${circumference - s.dash}`}
          strokeDashoffset={s.offset}
        />
      ))}
    </svg>
  )
}
