"use client"

import { useState, useEffect, useMemo } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"
import { StatusBadge } from "./status-badge"

type Filter = "all" | "in_progress" | "waiting_on_others" | "completed" | "declined" | "expired"

interface DocRow {
  id: string
  name: string
  template_name?: string
  status: string
  owner_name?: string
  owner_avatar?: string
  page_count?: number
  progress?: number
  created_at: string
  updated_at: string
}

export function DocumentsView({ onOpenTracking }: { onOpenTracking: () => void }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const openSendModal = useAppStore((s) => s.openSendModal)
  const selectEnvelope = useAppStore((s) => s.selectEnvelope)
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/documents")
        if (res.ok) {
          const data = await res.json()
          setDocs(data.documents || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const tabs: { v: Filter; l: string; count: number }[] = [
    { v: "all", l: "All documents", count: docs.length },
    { v: "in_progress", l: "In progress", count: docs.filter((d) => ["SENT", "DELIVERED", "VIEWED", "SIGNED", "DRAFT"].includes(d.status)).length },
    { v: "waiting_on_others", l: "Waiting on others", count: docs.filter((d) => ["SENT", "DELIVERED", "VIEWED"].includes(d.status)).length },
    { v: "completed", l: "Completed", count: docs.filter((d) => d.status === "COMPLETED").length },
    { v: "declined", l: "Declined", count: docs.filter((d) => d.status === "DECLINED").length },
    { v: "expired", l: "Expired", count: docs.filter((d) => d.status === "EXPIRED").length },
  ]

  const filtered = useMemo(() => {
    let list = docs
    if (filter === "in_progress") list = list.filter((d) => ["SENT", "DELIVERED", "VIEWED", "SIGNED", "DRAFT"].includes(d.status))
    else if (filter === "waiting_on_others") list = list.filter((d) => ["SENT", "DELIVERED", "VIEWED"].includes(d.status))
    else if (filter === "completed") list = list.filter((d) => d.status === "COMPLETED")
    else if (filter === "declined") list = list.filter((d) => d.status === "DECLINED")
    else if (filter === "expired") list = list.filter((d) => d.status === "EXPIRED")
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((d) => d.name.toLowerCase().includes(q) || (d.template_name || "").toLowerCase().includes(q) || (d.owner_name || "").toLowerCase().includes(q))
    }
    return list
  }, [docs, filter, query])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">Send, track, and manage every envelope.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5"
            onClick={() => toast({ title: "Upload & sign", description: "Drag a PDF/DOCX here to self-sign without sending." })}>
            <Icons.upload className="size-3.5" />
            Upload & sign
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => openSendModal()}>
            <Icons.plus className="size-4" />
            Send new
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((t) => (
          <button key={t.v} onClick={() => setFilter(t.v)}
            className={cn("h-8 px-3 text-xs rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
              filter === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
            {t.l}
            <span className={cn("text-[10px] tabular-nums px-1.5 py-0.5 rounded",
              filter === t.v ? "bg-background/15" : "bg-secondary text-muted-foreground")}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search documents..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9 bg-card" />
        </div>
      </div>

      {/* Documents table or empty state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Icons.loader className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.documents className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No documents here</div>
          <div className="text-xs text-muted-foreground mt-1">
            {docs.length === 0 ? "Send your first envelope to get started." : "No documents match this filter."}
          </div>
          {docs.length === 0 && (
            <Button size="sm" className="mt-4 h-9 gap-1.5" onClick={() => openSendModal()}>
              <Icons.plus className="size-4" />
              Send new document
            </Button>
          )}
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Document</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Owner</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Progress</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Updated</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors"
                    onClick={() => { selectEnvelope(d.id); onOpenTracking() }}>
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0">
                          <Icons.documents className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate max-w-[280px]">{d.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{d.template_name || "Custom"} · {d.page_count || 1}p</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <Avatar className="size-6 rounded-md">
                          <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold">{d.owner_avatar || "??"}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs">{(d.owner_name || "Unknown").split(" ")[0]}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full", d.progress === 100 ? "bg-emerald-500" : "bg-foreground")} style={{ width: `${d.progress || 0}%` }} />
                        </div>
                        <span className="text-[11px] text-muted-foreground tabular-nums">{d.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatRelative(d.updated_at)}</td>
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
            {filtered.map((d) => (
              <button key={d.id} onClick={() => { selectEnvelope(d.id); onOpenTracking() }}
                className="w-full text-left p-4 hover:bg-accent/30 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-md bg-secondary flex items-center justify-center shrink-0">
                    <Icons.documents className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm truncate">{d.name}</div>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5 truncate">{d.template_name || "Custom"} · {d.page_count || 1}p · {d.owner_name || "Unknown"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function formatRelative(iso: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
