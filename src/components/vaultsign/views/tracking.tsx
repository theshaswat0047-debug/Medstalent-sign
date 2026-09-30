"use client"

import { useState } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAppStore } from "@/lib/store"
import type { DocumentItem } from "@/lib/mock-data"
import { StatusBadge } from "./dashboard"

export function TrackingView() {
  const envelopes = useAppStore((s) => s.envelopes)
  const selectedEnvelopeId = useAppStore((s) => s.selectedEnvelopeId)
  const selectEnvelope = useAppStore((s) => s.selectEnvelope)
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null)

  // Derive the effective selected id: prefer local click, then store, then first.
  // No effect needed — this is pure derivation during render.
  const effectiveId =
    localSelectedId && envelopes.some((d) => d.id === localSelectedId)
      ? localSelectedId
      : selectedEnvelopeId && envelopes.some((d) => d.id === selectedEnvelopeId)
        ? selectedEnvelopeId
        : envelopes[0]?.id ?? null

  const handleSelect = (id: string) => {
    setLocalSelectedId(id)
    selectEnvelope(id)
  }

  const selected = envelopes.find((d) => d.id === effectiveId) ?? envelopes[0]

  // Empty-state guard
  if (!selected) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracking & Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time envelope tracking real-time email tracking — delivery, opens, views, and signatures.
          </p>
        </div>
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.tracking className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No envelopes yet</div>
          <div className="text-xs text-muted-foreground mt-1">Send your first document to start tracking.</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tracking & Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time envelope tracking real-time email tracking — delivery, opens, views, and signatures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 h-9 rounded-lg bg-emerald-50 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-xs font-medium text-emerald-700">Email tracking live</span>
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.download className="size-3.5" />
            Export audit
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: "Delivery rate", value: "99.4%", sub: "1,277 / 1,284", icon: "mail" as const, color: "text-emerald-600" },
          { label: "Open rate", value: "76.8%", sub: "987 / 1,284", icon: "eye" as const, color: "text-blue-600" },
          { label: "View rate", value: "71.2%", sub: "914 / 1,284", icon: "documents" as const, color: "text-amber-600" },
          { label: "Sign rate", value: "81.2%", sub: "1,043 / 1,284", icon: "check" as const, color: "text-emerald-600" },
          { label: "Avg time", value: "6.4h", sub: "to first signature", icon: "clock3" as const, color: "text-foreground" },
        ].map((k) => {
          const Icon = Icons[k.icon]
          return (
            <Card key={k.label} className="p-3.5 shadow-card">
              <div className="flex items-center justify-between">
                <Icon className={cn("size-4", k.color)} />
                <span className="text-[10px] text-muted-foreground tabular-nums">{k.sub}</span>
              </div>
              <div className="mt-2 text-xl font-semibold tracking-tight tabular-nums">{k.value}</div>
              <div className="text-[11px] text-muted-foreground">{k.label}</div>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4">
        {/* Left — document list */}
        <Card className="shadow-card overflow-hidden flex flex-col max-h-[800px]">
          <div className="p-3 border-b border-border">
            <div className="text-xs font-medium text-muted-foreground">Envelopes with tracking</div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {envelopes.filter((d) => d.status !== "DRAFT").map((d) => (
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
                    <AvatarFallback className="rounded-md bg-secondary text-[10px] font-semibold">{d.ownerAvatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{d.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{d.templateName}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <StatusBadge status={d.status} />
                      <span className="text-[10px] text-muted-foreground">{d.recipients.length} recipients</span>
                    </div>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full", d.progress === 100 ? "bg-emerald-500" : "bg-foreground")} style={{ width: `${d.progress}%` }} />
                  </div>
                  <span className="text-[9px] text-muted-foreground tabular-nums">{d.progress}%</span>
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

function TrackingDetail({ doc }: { doc: DocumentItem }) {
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
            <div className="text-xs text-muted-foreground">{doc.templateName} · {doc.pageCount} pages · created {new Date(doc.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
            {doc.messageId && (
              <div className="flex items-center gap-1.5 mt-2">
                <Icons.mail className="size-3 text-muted-foreground" />
                <span className="text-[11px] font-mono text-muted-foreground">{doc.messageId}</span>
                <Badge variant="outline" className="h-4 text-[9px] gap-1">
                  <span className={cn("size-1 rounded-full", deliveryDotColor(doc.deliveryStatus))} />
                  Email: {doc.deliveryStatus}
                </Badge>
              </div>
            )}
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

      {/* Recipients status */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Recipient status</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Per-recipient delivery and signing progress</p>
          </div>
          <Badge variant="secondary" className="h-5 text-[10px]">{doc.recipients.length} recipients</Badge>
        </div>
        <div className="space-y-2.5">
          {doc.recipients.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-4">No recipients yet — add some in the editor.</div>
          )}
          {doc.recipients.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40">
              <Avatar className="size-9 rounded-md">
                <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">
                  {r.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{r.name}</span>
                  <Badge variant="outline" className="h-4 text-[9px]">{r.role}</Badge>
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{r.email}</div>
                {r.geolocation && (
                  <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Icons.mapPin className="size-2.5" />{r.geolocation}</span>
                    <span className="flex items-center gap-1"><Icons.smartphone className="size-2.5" />{r.device}</span>
                    <span className="font-mono">{r.ipAddress}</span>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <RecipientStatusBadge status={r.status} />
              </div>
              <div className="shrink-0 text-right text-[10px] text-muted-foreground hidden sm:block">
                {r.signedAt && <div>Signed {new Date(r.signedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>}
                {r.viewedAt && !r.signedAt && <div>Viewed {new Date(r.viewedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</div>}
                {!r.viewedAt && <div>—</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Event timeline */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold">Event timeline & audit trail</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Tamper-evident SHA-256 hash chain · all events timestamped UTC</p>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] gap-1">
            <Icons.shield className="size-2.5" />
            Verified
          </Badge>
        </div>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-1">
            {doc.events.map((ev, i) => {
              const Icon = eventIcon(ev.type)
              return (
                <div key={ev.id} className="relative flex gap-3 p-2 hover:bg-accent/40 rounded-lg transition-colors">
                  <div className={cn("relative z-10 size-8 rounded-full flex items-center justify-center shrink-0 border-2 border-card", eventBg(ev.type))}>
                    <Icon className={cn("size-3.5", eventColor(ev.type))} />
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium">{ev.label}</span>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{ev.actor}</span>
                      {ev.type.startsWith("EMAIL_") && (
                        <Badge variant="secondary" className="h-4 text-[9px] gap-0.5">
                          <Icons.mail className="size-2" />
                          Email
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{ev.description}</div>
                    {ev.meta && Object.keys(ev.meta).length > 0 && (
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {Object.entries(ev.meta).map(([k, v]) => (
                          <span key={k} className="text-[10px] font-mono text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">
                            {k}: <span className="text-foreground">{v}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(ev.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="text-[10px] font-mono text-muted-foreground/60">#{String(i + 1).padStart(3, "0")}</span>
                  </div>
                </div>
              )
            })}
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
          <div className="flex justify-between"><span className="text-muted-foreground">Envelope ID:</span><span>{doc.id.toUpperCase()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status:</span><span>{doc.status}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Recipients:</span><span>{doc.recipients.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Events logged:</span><span>{doc.events.length}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Created:</span><span>{new Date(doc.createdAt).toISOString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Last update:</span><span>{new Date(doc.updatedAt).toISOString()}</span></div>
          <Separator className="my-2" />
          <div className="flex justify-between"><span className="text-muted-foreground">Chain root hash:</span><span className="truncate ml-2">9f2a...c1b7 (SHA-256)</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Compliance:</span><span>ESIGN · UETA · eIDAS</span></div>
        </div>
      </Card>
    </div>
  )
}

function RecipientStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING:   { label: "Pending",   cls: "bg-secondary text-muted-foreground" },
    SENT:      { label: "Sent",      cls: "bg-blue-50 text-blue-700" },
    DELIVERED: { label: "Delivered", cls: "bg-blue-50 text-blue-700" },
    VIEWED:    { label: "Viewed",    cls: "bg-amber-50 text-amber-700" },
    SIGNED:    { label: "Signed",    cls: "bg-emerald-50 text-emerald-700" },
    DECLINED:  { label: "Declined",  cls: "bg-rose-50 text-rose-700" },
    BOUNCED:   { label: "Bounced",   cls: "bg-rose-50 text-rose-700" },
  }
  const s = map[status] ?? { label: status, cls: "bg-secondary" }
  return <Badge variant="secondary" className={cn("h-5 px-1.5 text-[10px] font-medium", s.cls)}>{s.label}</Badge>
}

function eventIcon(type: string) {
  switch (type) {
    case "EMAIL_QUEUED": return Icons.clock
    case "EMAIL_SENT": return Icons.send
    case "EMAIL_DELIVERED": return Icons.mail
    case "EMAIL_OPENED": return Icons.eye
    case "EMAIL_CLICKED": return Icons.arrowUpRight
    case "EMAIL_BOUNCED": return Icons.alert
    case "DOC_VIEWED": return Icons.eye
    case "PAGE_VIEWED": return Icons.documents
    case "FIELD_FILLED": return Icons.edit
    case "SIGNED": return Icons.check
    case "DECLINED": return Icons.xCircle
    case "COMPLETED": return Icons.fileCheck
    case "VOIDED": return Icons.x
    case "REMINDER_SENT": return Icons.bell
    default: return Icons.dot
  }
}
function eventBg(type: string) {
  if (type.startsWith("EMAIL_")) return "bg-secondary"
  switch (type) {
    case "SIGNED":
    case "COMPLETED": return "bg-emerald-50"
    case "DECLINED":
    case "VOIDED": return "bg-rose-50"
    default: return "bg-secondary"
  }
}
function eventColor(type: string) {
  if (type.startsWith("EMAIL_")) return "text-foreground"
  switch (type) {
    case "SIGNED":
    case "COMPLETED": return "text-emerald-600"
    case "DECLINED":
    case "VOIDED": return "text-rose-600"
    case "DOC_VIEWED": return "text-blue-600"
    default: return "text-foreground"
  }
}

function deliveryDotColor(status?: string) {
  switch (status) {
    case "delivered": return "bg-blue-500"
    case "opened": return "bg-emerald-500"
    case "clicked": return "bg-emerald-600"
    case "bounced":
    case "blocked": return "bg-rose-500"
    default: return "bg-muted-foreground"
  }
}
