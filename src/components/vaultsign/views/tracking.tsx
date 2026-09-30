"use client"
import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "./status-badge"

interface Doc { id: string; name: string; template_name?: string; status: string; owner_name?: string; owner_avatar?: string; page_count?: number; progress?: number; created_at: string; updated_at: string }

export function TrackingView() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => { fetch("/api/documents").then(r => r.json()).then(d => { setDocs(d.documents || []); setSelectedId(d.documents?.[0]?.id ?? null) }).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>
  if (docs.length === 0) return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Tracking</h1><p className="text-sm text-muted-foreground mt-1">Real-time delivery tracking and audit trail.</p></div>
      <Card className="p-12 text-center shadow-card"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.tracking className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">No envelopes to track</div><div className="text-xs text-muted-foreground mt-1">Send your first document to start tracking.</div></Card>
    </div>
  )

  const selected = docs.find(d => d.id === selectedId) ?? docs[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Tracking</h1><p className="text-sm text-muted-foreground mt-1">Real-time delivery tracking and audit trail.</p></div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5"><Icons.download className="size-3.5" />Export audit</Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <Card className="shadow-card overflow-hidden flex flex-col max-h-[700px]">
          <div className="p-3 border-b border-border"><div className="text-xs font-medium text-muted-foreground">Envelopes</div></div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {docs.map(d => (
              <button key={d.id} onClick={() => setSelectedId(d.id)} className={cn("w-full text-left p-3 hover:bg-accent/40 transition-colors", selectedId === d.id && "bg-accent/60 border-l-2 border-foreground")}>
                <div className="text-xs font-medium truncate">{d.name}</div>
                <div className="text-[10px] text-muted-foreground truncate">{d.template_name}</div>
                <div className="flex items-center gap-2 mt-1.5"><StatusBadge status={d.status} /><span className="text-[10px] text-muted-foreground">{d.page_count}p</span></div>
                <div className="mt-2 flex items-center gap-1.5"><div className="flex-1 h-1 rounded-full bg-muted overflow-hidden"><div className={cn("h-full", d.progress === 100 ? "bg-emerald-500" : "bg-foreground")} style={{ width: `${d.progress || 0}%` }} /></div><span className="text-[9px] text-muted-foreground tabular-nums">{d.progress || 0}%</span></div>
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><div className="flex items-center gap-2 mb-1"><h2 className="text-base font-semibold truncate">{selected.name}</h2><StatusBadge status={selected.status} /></div><div className="text-xs text-muted-foreground">{selected.template_name} · {selected.page_count}p · {new Date(selected.created_at).toLocaleDateString()}</div></div>
              <div className="flex items-center gap-1 shrink-0"><Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Icons.refresh className="size-3" />Resend</Button><Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Icons.download className="size-3" />Certificate</Button></div>
            </div>
          </Card>
          <Card className="p-5 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Event timeline</h3>
            <div className="text-center py-12"><div className="size-10 mx-auto rounded-lg bg-secondary flex items-center justify-center"><Icons.clock className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">No events yet</div><div className="text-xs text-muted-foreground mt-1">Events appear here as they happen in real time.</div></div>
          </Card>
        </div>
      </div>
    </div>
  )
}
