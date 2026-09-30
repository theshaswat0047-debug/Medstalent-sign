"use client"

import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSession } from "next-auth/react"
import { StatusBadge } from "./status-badge"
import type { ViewKey } from "../shell"

interface Stats {
  totalEnvelopes: number
  completed: number
  inProgress: number
  avgTimeToSignHours: number | null
  completionRate: number
}

interface DocRow {
  id: string
  name: string
  template_name: string
  status: string
  owner_name: string
  owner_avatar: string
  page_count: number
}

const EMPTY_STATS: Stats = {
  totalEnvelopes: 0,
  completed: 0,
  inProgress: 0,
  avgTimeToSignHours: null,
  completionRate: 0,
}

export function DashboardView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>(EMPTY_STATS)
  const [recentDocs, setRecentDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/dashboard/stats")
        if (res.ok) {
          const data = await res.json()
          setStats(data.stats || EMPTY_STATS)
          setRecentDocs(data.recentDocs || [])
        }
      } catch {
        // ignore — show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const userName = session?.user?.name?.split(" ")[0] ?? "there"
  const isEmpty = stats.totalEnvelopes === 0 && recentDocs.length === 0

  const kpis = [
    { label: "Total envelopes", value: stats.totalEnvelopes.toLocaleString(), sub: "all-time", icon: "sign" as const },
    { label: "Completed", value: stats.completed.toLocaleString(), sub: `${stats.completionRate}% rate`, icon: "check" as const },
    { label: "In progress", value: stats.inProgress.toString(), sub: "awaiting signature", icon: "clock" as const },
    { label: "Avg time to sign", value: stats.avgTimeToSignHours ? `${stats.avgTimeToSignHours}h` : "—", sub: "first signature", icon: "clock3" as const },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {userName}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's a snapshot of your signing activity.
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
              </div>
              <div className="mt-3">
                <div className="text-2xl font-semibold tracking-tight tabular-nums">{k.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{k.label}</div>
                <div className="text-[10px] text-muted-foreground/70 mt-0.5">{k.sub}</div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-14 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.filePlus className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No envelopes yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Send your first document for signature. Choose from 100+ templates or upload your own.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <Button size="sm" className="h-9 gap-1.5" onClick={() => onNavigate("templates")}>
              <Icons.documents className="size-4" />
              Browse templates
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => onNavigate("documents")}>
              <Icons.plus className="size-4" />
              Upload document
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold">Recent documents</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Latest envelopes</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={() => onNavigate("documents")}>
              View all
              <Icons.arrowRight className="size-3" />
            </Button>
          </div>
          <div className="divide-y divide-border">
            {recentDocs.map((d) => (
              <button
                key={d.id}
                onClick={() => onNavigate("tracking")}
                className="w-full flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-accent/40 -mx-2 px-2 rounded-lg transition-colors text-left"
              >
                <Avatar className="size-9 rounded-md shrink-0">
                  <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{d.owner_avatar || "??"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{d.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{d.template_name} · {d.page_count}p · {d.owner_name}</div>
                </div>
                <StatusBadge status={d.status} />
                <Icons.chevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
