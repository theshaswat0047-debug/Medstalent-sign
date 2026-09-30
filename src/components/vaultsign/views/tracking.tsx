"use client"

import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import { StatusBadge } from "./status-badge"

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

export function TrackingView() {
  const [docs, setDocs] = useState<DocRow[]>([])
  const [loading, setLoading] = useState(true)
  const selectedEnvelopeId = useAppStore((s) => s.selectedEnvelopeId)
  const selectEnvelope = useAppStore((s) => s.selectEnvelope)
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null)

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

  const effectiveId =
    localSelectedId && docs.some((d) => d.id === localSelectedId)
      ? localSelectedId
      : selectedEnvelopeId && docs.some((d) => d.id === selectedEnvelopeId)
        ? selectedEnvelopeId
        : docs[0]?.id ?? null

  const handleSelect = (id: string) => {
    setLocalSelectedId(id)
    selectEnvelope(id)
  }

  const selected = docs.find((d) => d.id === effectiveId) ?? null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (docs.length === 0 || !selected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracking & Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time envelope tracking — delivery, opens, views, and signatures.
          </p>
        </div>
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.tracking className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No envelopes to track</div>
          <div className="text-xs text-muted-foreground mt-1">
            Send your first document to start tracking delivery, opens, and signatures.
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracking & Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time envelope tracking — delivery, opens, views, and signatures.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-1.5">
          <Icons.download className="size-3.5" />
          Export audit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left — document list */}
        <Card className="shadow-card overflow-hidden flex flex-col max-h-[800px]">
          <div className="p-3 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground">Envelopes with tracking</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => handleSelect(d.id)}
                className={cn(
                  "w-full text-left p-3 hover:bg-accent/40 transition-colors",
                  effectiveId === d.id && "bg-accent/60 border-l-2 border-foreground"
                )}
              >
                <div className="flex items-start gap-2.5">
                  <Avatar className="size-8 rounded-md shrink-0">
                    <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold">{d.owner_avatar || "??"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{d.template_name || "Custom"}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={d.status} />
                      <span className="text-[10px] text-muted-foreground">{d.page_count || 1}p</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", d.progress === 100 ? "bg-emerald-500" : "bg-foreground")} style={{ width: `${d.progress || 0}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{d.progress || 0}%</span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Right — detail view */}
        <TrackingDetail doc={selected} />
      </div>
    </div>
  )
}

function TrackingDetail({ doc }: { doc: DocRow }) {
  return (
    <div className="space-y-4">
      {/* Document header */}
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold truncate">{doc.name}</h2>
              <StatusBadge status={doc.status} />
            </div>
            <div className="text-xs text-muted-foreground">
              {doc.template_name || "Custom document"} · {doc.page_count || 1} pages · created {new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Icons.refresh className="size-3" />
              Resend
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <Icons.download className="size-3" />
              Certificate
            </Button>
          </div>
        </div>
      </Card>

      {/* Event timeline */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Event timeline</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tracking events appear here as they happen</p>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] gap-1">
            <Icons.shield className="size-2.5" /> Verified
          </Badge>
        </div>
        <div className="text-center py-12">
          <div className="size-10 mx-auto rounded-lg bg-secondary flex items-center justify-center">
            <Icons.clock className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No events yet</div>
          <div className="text-xs text-muted-foreground mt-1">
            Once this document is sent, delivery and signature events will appear here in real time.
          </div>
        </div>
      </Card>

      {/* Audit certificate preview */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">Audit certificate</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tamper-evident document of record</p>
          </div>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            <Icons.download className="size-3" />
            Download PDF
          </Button>
        </div>
        <div className="bg-secondary/40 rounded-lg p-4 font-mono text-[11px] space-y-1">
          <div className="flex justify-between"><span className="text-muted-foreground">Envelope ID:</span><span>{doc.id.slice(0, 8).toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span>{doc.status}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span>{new Date(doc.created_at).toISOString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Last update:</span><span>{new Date(doc.updated_at).toISOString()}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between"><span className="text-muted-foreground">Compliance:</span><span>ESIGN · UETA · eIDAS</span></div>
        </div>
      </Card>
    </div>
  )
}
