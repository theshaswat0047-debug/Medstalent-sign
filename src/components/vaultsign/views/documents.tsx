"use client"

import { useState, useEffect, useMemo } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "./status-badge"

type Filter = "all" | "in_progress" | "completed" | "declined"
interface Doc { id: string; name: string; template_name?: string; status: string; owner_name?: string; owner_avatar?: string; page_count?: number; progress?: number; updated_at: string }

export function DocumentsView({ onOpenTracking }: { onOpenTracking: () => void }) {
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch("/api/documents").then(r => r.json()).then(d => setDocs(d.documents || [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  const tabs = [
    { v: "all" as const, l: "All", count: docs.length },
    { v: "in_progress" as const, l: "In progress", count: docs.filter(d => ["SENT","DELIVERED","VIEWED","SIGNED","DRAFT"].includes(d.status)).length },
    { v: "completed" as const, l: "Completed", count: docs.filter(d => d.status === "COMPLETED").length },
    { v: "declined" as const, l: "Declined", count: docs.filter(d => d.status === "DECLINED").length },
  ]

  const filtered = useMemo(() => {
    let list = docs
    if (filter === "in_progress") list = list.filter(d => ["SENT","DELIVERED","VIEWED","SIGNED","DRAFT"].includes(d.status))
    else if (filter === "completed") list = list.filter(d => d.status === "COMPLETED")
    else if (filter === "declined") list = list.filter(d => d.status === "DECLINED")
    if (query.trim()) { const q = query.toLowerCase(); list = list.filter(d => d.name.toLowerCase().includes(q)) }
    return list
  }, [docs, filter, query])

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Documents</h1><p className="text-sm text-muted-foreground mt-1">Send, track, and manage every envelope.</p></div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-9 gap-1.5"><Icons.upload className="size-3.5" />Upload</Button><Button size="sm" className="h-9 gap-1.5" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "templates" }))}><Icons.plus className="size-4" />Send new</Button></div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {tabs.map(t => <button key={t.v} onClick={() => setFilter(t.v)} className={cn("h-8 px-3 text-xs rounded-md font-medium whitespace-nowrap flex items-center gap-1.5 transition-colors", filter === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60")}>{t.l}<span className={cn("text-[10px] px-1.5 py-0.5 rounded", filter === t.v ? "bg-background/15" : "bg-secondary")}>{t.count}</span></button>)}
      </div>

      <div className="relative max-w-md"><Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search documents..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9 bg-card" /></div>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.documents className="size-5 text-muted-foreground" /></div>
          <div className="mt-3 text-sm font-medium">{docs.length === 0 ? "No documents yet" : "No documents match this filter"}</div>
          <div className="text-xs text-muted-foreground mt-1">{docs.length === 0 ? "Send your first envelope to get started." : "Try a different filter."}</div>
          {docs.length === 0 && <Button size="sm" className="mt-4 h-9 gap-1.5" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "templates" }))}><Icons.plus className="size-4" />Send new document</Button>}
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/40"><th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Document</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Owner</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Progress</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Updated</th></tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="border-b border-border last:border-0 hover:bg-accent/30 cursor-pointer transition-colors" onClick={onOpenTracking}>
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><div className="size-8 rounded-md bg-secondary flex items-center justify-center shrink-0"><Icons.documents className="size-3.5 text-muted-foreground" /></div><div className="min-w-0"><div className="font-medium truncate">{d.name}</div><div className="text-[11px] text-muted-foreground truncate">{d.template_name || "Custom"} · {d.page_count}p</div></div></div></td>
                  <td className="px-3 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-3 py-3 text-xs">{d.owner_name || "You"}</td>
                  <td className="px-3 py-3"><div className="flex items-center gap-2"><div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden"><div className={cn("h-full", d.progress === 100 ? "bg-emerald-500" : "bg-foreground")} style={{ width: `${d.progress || 0}%` }} /></div><span className="text-[11px] text-muted-foreground tabular-nums">{d.progress || 0}%</span></div></td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">{new Date(d.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
