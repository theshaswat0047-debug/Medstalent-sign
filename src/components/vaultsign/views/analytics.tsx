"use client"

import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Stats {
  totalEnvelopes: number
  completed: number
  inProgress: number
  avgTimeToSignHours: number | null
  completionRate: number
}

const EMPTY: Stats = { totalEnvelopes: 0, completed: 0, inProgress: 0, avgTimeToSignHours: null, completionRate: 0 }

export function AnalyticsView() {
  const [stats, setStats] = useState<Stats>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats || EMPTY)
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const isEmpty = stats.totalEnvelopes === 0

  const kpis = [
    { label: "Completion rate", value: `${stats.completionRate}%`, sub: `${stats.completed} of ${stats.totalEnvelopes}` },
    { label: "Total envelopes", value: stats.totalEnvelopes.toLocaleString(), sub: "all-time" },
    { label: "Completed", value: stats.completed.toLocaleString(), sub: "signed" },
    { label: "Avg time to sign", value: stats.avgTimeToSignHours ? `${stats.avgTimeToSignHours}h` : "—", sub: "first signature" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Completion rates, time-to-sign, and team performance.</p>
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
        {kpis.map((k) => (
          <Card key={k.label} className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{k.label}</span>
            </div>
            <div className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">{k.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.analytics className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No analytics yet</div>
          <div className="text-xs text-muted-foreground mt-1">
            Analytics will appear here once you have signed documents. Send your first envelope to get started.
          </div>
        </Card>
      ) : (
        <Card className="p-5 shadow-card">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Signing funnel</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Drop-off per stage</p>
          </div>
          <div className="space-y-2.5">
            {[
              { stage: "Sent", value: stats.totalEnvelopes, pct: 100, color: "bg-foreground" },
              { stage: "Completed", value: stats.completed, pct: stats.completionRate, color: "bg-emerald-500" },
              { stage: "In progress", value: stats.inProgress, pct: stats.totalEnvelopes > 0 ? Math.round((stats.inProgress / stats.totalEnvelopes) * 100) : 0, color: "bg-amber-500" },
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
      )}
    </div>
  )
}
