"use client"
import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Stats { totalEnvelopes: number; completed: number; inProgress: number; completionRate: number; avgTimeToSignHours: number | null }
const EMPTY: Stats = { totalEnvelopes: 0, completed: 0, inProgress: 0, completionRate: 0, avgTimeToSignHours: null }

export function AnalyticsView() {
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/dashboard/stats").then(r => r.json()).then(d => setStats(d.stats || EMPTY)).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  const kpis = [
    { label: "Completion rate", value: `${stats.completionRate}%`, sub: `${stats.completed} of ${stats.totalEnvelopes}` },
    { label: "Total envelopes", value: stats.totalEnvelopes.toLocaleString(), sub: "all-time" },
    { label: "Completed", value: stats.completed.toLocaleString(), sub: "signed" },
    { label: "Avg time to sign", value: stats.avgTimeToSignHours ? `${stats.avgTimeToSignHours}h` : "—", sub: "first signature" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Analytics</h1><p className="text-sm text-muted-foreground mt-1">Completion rates and signing performance.</p></div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5"><Icons.download className="size-3.5" />Export</Button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => <Card key={k.label} className="p-4 shadow-card"><span className="text-xs text-muted-foreground">{k.label}</span><div className="mt-2 text-2xl font-semibold tabular-nums">{k.value}</div><div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div></Card>)}
      </div>
      {stats.totalEnvelopes === 0 ? (
        <Card className="p-12 text-center shadow-card"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.analytics className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">No analytics yet</div><div className="text-xs text-muted-foreground mt-1">Analytics appear once you have signed documents.</div></Card>
      ) : (
        <Card className="p-5 shadow-card">
          <h2 className="text-sm font-semibold mb-4">Signing funnel</h2>
          <div className="space-y-2.5">
            {[{ stage: "Sent", value: stats.totalEnvelopes, pct: 100, color: "bg-foreground" }, { stage: "Completed", value: stats.completed, pct: stats.completionRate, color: "bg-emerald-500" }, { stage: "In progress", value: stats.inProgress, pct: stats.totalEnvelopes > 0 ? Math.round((stats.inProgress / stats.totalEnvelopes) * 100) : 0, color: "bg-amber-500" }].map(s => (
              <div key={s.stage}><div className="flex items-center justify-between text-xs mb-1"><span className="font-medium">{s.stage}</span><span className="text-muted-foreground tabular-nums">{s.value} · {s.pct}%</span></div><div className="h-7 rounded-md bg-muted overflow-hidden"><div className={cn("h-full flex items-center px-2", s.color)} style={{ width: `${s.pct}%` }}><span className="text-[10px] font-medium text-background tabular-nums">{s.pct}%</span></div></div></div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
