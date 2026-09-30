"use client"

import { useState } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const FIELD_TYPES = [
  { key: "signature", label: "Signature", icon: "sign" as const },
  { key: "initials", label: "Initials", icon: "edit" as const },
  { key: "date", label: "Date", icon: "calendar" as const },
  { key: "text", label: "Text", icon: "edit3" as const },
  { key: "checkbox", label: "Checkbox", icon: "check2" as const },
  { key: "dropdown", label: "Dropdown", icon: "chevronDown" as const },
  { key: "stamp", label: "Company seal", icon: "shield" as const },
]

const TOOLBAR_GROUPS = [
  {
    items: [
      { icon: "edit3" as const, label: "Bold", shortcut: "⌘B" },
      { icon: "edit3" as const, label: "Italic", shortcut: "⌘I" },
      { icon: "edit3" as const, label: "Underline", shortcut: "⌘U" },
      { icon: "edit3" as const, label: "Strikethrough" },
    ],
  },
  {
    items: [
      { icon: "chevronDown" as const, label: "Heading 1" },
      { icon: "chevronDown" as const, label: "Paragraph" },
      { icon: "chevronDown" as const, label: "Font: Inter" },
      { icon: "chevronDown" as const, label: "12pt" },
    ],
  },
  {
    items: [
      { icon: "chevronRight" as const, label: "Align left" },
      { icon: "chevronRight" as const, label: "Align center" },
      { icon: "chevronRight" as const, label: "Align right" },
    ],
  },
  {
    items: [
      { icon: "plus" as const, label: "Insert table" },
      { icon: "plus" as const, label: "Insert image" },
      { icon: "plus" as const, label: "Insert link" },
      { icon: "plus" as const, label: "Page break" },
    ],
  },
]

export function EditorView() {
  const [selectedRecipient, setSelectedRecipient] = useState(0)
  const [placedFields, setPlacedFields] = useState<{ id: string; type: string; recipientIdx: number; x: number; y: number }[]>([
    { id: "f1", type: "signature", recipientIdx: 0, x: 70, y: 72 },
    { id: "f2", type: "date", recipientIdx: 0, x: 70, y: 80 },
  ])

  const recipients = [
    { name: "Rahul Verma", email: "rahul.verma@acme.example", color: "bg-blue-500" },
    { name: "Sarah Mitchell", email: "sarah.m@acme.example", color: "bg-amber-500" },
    { name: "Vaultsign Legal", email: "legal@vaultsign.io", color: "bg-emerald-500" },
  ]

  const addField = (type: string) => {
    const newField = {
      id: `f${Date.now()}`,
      type,
      recipientIdx: selectedRecipient,
      x: 50 + Math.random() * 30,
      y: 50 + Math.random() * 30,
    }
    setPlacedFields((prev) => [...prev, newField])
  }

  const removeField = (id: string) => {
    setPlacedFields((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8">
            <Icons.arrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold">Master Service Agreement</h1>
              <Badge variant="secondary" className="h-5 text-[10px]">Draft</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">12 pages · Last saved 2 min ago · Auto-saved</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.eye className="size-3.5" />
            Preview
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5">
            <Icons.upload className="size-3.5" />
            Save template
          </Button>
          <Button size="sm" className="h-9 gap-1.5">
            <Icons.send className="size-4" />
            Send for signature
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4">
        {/* Left panel — recipient picker + field palette */}
        <div className="space-y-4 order-2 lg:order-1">
          <Card className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2.5">Signers</div>
            <div className="space-y-1">
              {recipients.map((r, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedRecipient(i)}
                  className={cn(
                    "w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left",
                    selectedRecipient === i ? "bg-foreground text-background" : "hover:bg-accent/60"
                  )}
                >
                  <span className={cn("size-2 rounded-full shrink-0", selectedRecipient === i ? "bg-background" : r.color)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{r.name}</div>
                    <div className={cn("text-[10px] truncate", selectedRecipient === i ? "text-background/70" : "text-muted-foreground")}>{r.email}</div>
                  </div>
                  {selectedRecipient === i && <Icons.check2 className="size-3.5" />}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full h-8 mt-3 text-xs gap-1">
              <Icons.plus className="size-3.5" />
              Add recipient
            </Button>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2.5">Field palette</div>
            <div className="text-[11px] text-muted-foreground mb-2">
              Drag onto the document — assigns to <span className="font-medium text-foreground">{recipients[selectedRecipient]?.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FIELD_TYPES.map((f) => {
                const Icon = Icons[f.icon]
                return (
                  <button
                    key={f.key}
                    onClick={() => addField(f.key)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/60 hover:border-foreground/30 transition-all cursor-grab active:cursor-grabbing"
                  >
                    <Icon className="size-4 text-foreground" />
                    <span className="text-[10px] font-medium">{f.label}</span>
                  </button>
                )
              })}
            </div>
            <Separator className="my-3" />
            <div className="text-[11px] text-muted-foreground mb-2">Merge fields</div>
            <div className="flex flex-wrap gap-1">
              {["{{recipient.name}}", "{{company}}", "{{date}}", "{{email}}"].map((m) => (
                <Badge key={m} variant="outline" className="text-[10px] font-mono cursor-pointer hover:bg-accent/60">{m}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Center — document canvas */}
        <div className="order-1 lg:order-2 min-w-0">
          {/* Toolbar */}
          <Card className="mb-3 p-1.5 shadow-card">
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-0.5 overflow-x-auto">
                {TOOLBAR_GROUPS.map((group, gi) => (
                  <div key={gi} className="flex items-center gap-0.5">
                    {gi > 0 && <Separator orientation="vertical" className="mx-1 h-5" />}
                    {group.items.map((item, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-7">
                            <item.icon className="size-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {item.label}{item.shortcut && <span className="ml-2 text-muted-foreground">{item.shortcut}</span>}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <Button variant="ghost" size="icon" className="size-7"><Icons.refresh className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7"><Icons.download className="size-3.5" /></Button>
                </div>
              </div>
            </TooltipProvider>
          </Card>

          {/* Document */}
          <div className="bg-secondary/40 p-4 lg:p-8 rounded-xl min-h-[600px] flex justify-center">
            <div className="bg-card shadow-card rounded-sm w-full max-w-[640px] aspect-[1/1.414] relative">
              {/* Document content */}
              <div className="p-10 lg:p-12 text-[10px] leading-relaxed">
                <div className="text-center mb-6">
                  <div className="text-base font-bold tracking-tight">MASTER SERVICE AGREEMENT</div>
                  <div className="text-[9px] text-muted-foreground mt-1">Vaultsign, Inc. · Effective Date: September 30, 2026</div>
                </div>

                <div className="space-y-3 text-[9px]">
                  <p>
                    This Master Service Agreement ("<span className="font-semibold">Agreement</span>") is entered into as of the Effective Date by and between
                    <span className="bg-amber-100/60"> Acme Corporation</span> ("<span className="font-semibold">Client</span>") and
                    <span className="bg-amber-100/60"> Vaultsign, Inc.</span> ("<span className="font-semibold">Service Provider</span>").
                  </p>

                  <div className="font-semibold mt-4">1. SERVICES</div>
                  <p>
                    Service Provider shall provide the services described in one or more mutually executed Statements of Work (each, a "<span className="font-semibold">SOW</span>"). Each SOW shall incorporate by reference the terms and conditions of this Agreement. In the event of a conflict between this Agreement and a SOW, the SOW shall control with respect to the specific services described therein.
                  </p>

                  <div className="font-semibold mt-4">2. TERM & TERMINATION</div>
                  <p>
                    This Agreement commences on the Effective Date and continues until terminated by either Party upon thirty (30) days written notice. Either Party may terminate this Agreement immediately upon written notice in the event of a material breach by the other Party that remains uncured for fifteen (15) days following written notice.
                  </p>

                  <div className="font-semibold mt-4">3. CONFIDENTIALITY</div>
                  <p>
                    Each Party agrees to maintain the confidentiality of the other Party's Confidential Information with the same degree of care it uses for its own, and not less than a reasonable standard of care. Confidential Information shall not be disclosed to third parties without prior written consent, except to employees and contractors with a need to know.
                  </p>

                  <div className="font-semibold mt-4">4. SIGNATURES</div>
                  <p className="mb-8">
                    IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date first written above.
                  </p>
                </div>

                {/* Signature lines */}
                <div className="grid grid-cols-2 gap-6 mt-8 relative">
                  <div>
                    <div className="text-[8px] text-muted-foreground mb-8">CLIENT:</div>
                    <div className="border-b border-foreground/40 mb-1 h-4"></div>
                    <div className="text-[7px] text-muted-foreground">Name / Title</div>
                  </div>
                  <div>
                    <div className="text-[8px] text-muted-foreground mb-8">SERVICE PROVIDER:</div>
                    <div className="border-b border-foreground/40 mb-1 h-4"></div>
                    <div className="text-[7px] text-muted-foreground">Name / Title</div>
                  </div>
                </div>
              </div>

              {/* Placed signature fields overlay */}
              {placedFields.map((f) => {
                const r = recipients[f.recipientIdx]
                return (
                  <div
                    key={f.id}
                    className="absolute group"
                    style={{ left: `${f.x}%`, top: `${f.y}%`, width: "120px", height: "32px" }}
                  >
                    <div className={cn(
                      "w-full h-full rounded-md border-2 border-dashed flex items-center justify-center gap-1.5 text-[10px] font-medium cursor-move transition-all",
                      f.recipientIdx === selectedRecipient ? "border-foreground bg-foreground/5" : "border-muted-foreground/40 bg-card/80"
                    )}>
                      <span className={cn("size-1.5 rounded-full", r?.color)} />
                      {f.type === "signature" && <Icons.sign className="size-3" />}
                      {f.type === "initials" && <Icons.edit className="size-3" />}
                      {f.type === "date" && <Icons.calendar className="size-3" />}
                      {f.type === "text" && <Icons.edit3 className="size-3" />}
                      {f.type === "checkbox" && <Icons.check2 className="size-3" />}
                      {f.type === "dropdown" && <Icons.chevronDown className="size-3" />}
                      {f.type === "stamp" && <Icons.shield className="size-3" />}
                      <span className="capitalize">{f.type}</span>
                      <button
                        onClick={() => removeField(f.id)}
                        className="opacity-0 group-hover:opacity-100 ml-1 size-4 rounded-full bg-rose-500 text-white flex items-center justify-center transition-opacity"
                      >
                        <Icons.x className="size-2.5" />
                      </button>
                    </div>
                    <div className="text-[8px] text-muted-foreground mt-0.5 truncate">{r?.name.split(" ")[0]}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Page navigator */}
          <div className="flex items-center justify-between mt-3">
            <div className="text-xs text-muted-foreground">Page 1 of 12</div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="size-7"><Icons.arrowLeft className="size-3.5" /></Button>
              <Button variant="outline" size="icon" className="size-7"><Icons.arrowRight className="size-3.5" /></Button>
            </div>
          </div>
        </div>

        {/* Right — properties */}
        <div className="order-3 space-y-4">
          <Card className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2.5">Selected field</div>
            <div className="space-y-2.5">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <div className="text-sm font-medium">Signature</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Assigned to</div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/60">
                  <span className="size-2 rounded-full bg-blue-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">Rahul Verma</div>
                    <div className="text-[10px] text-muted-foreground truncate">rahul.verma@acme.example</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Required</div>
                <div className="flex items-center gap-2">
                  <div className="size-4 rounded border-2 border-foreground bg-foreground flex items-center justify-center">
                    <Icons.check2 className="size-2.5 text-background" />
                  </div>
                  <span className="text-xs">Must be completed</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Position</div>
                <div className="text-xs font-mono">Page 1 · (70%, 72%)</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2.5">Envelope settings</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Signing order</span>
                <Badge variant="secondary" className="h-5 text-[10px]">Sequential</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Authentication</span>
                <Badge variant="secondary" className="h-5 text-[10px]">Email OTP</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Watermark</span>
                <Badge variant="secondary" className="h-5 text-[10px]">On</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reminders</span>
                <span className="text-xs">Every 3 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Expires</span>
                <span className="text-xs">Oct 12, 2026</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 shadow-card">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2.5">Audit preview</div>
            <div className="space-y-1.5">
              {[
                { l: "Created", v: "Sep 28, 09:14" },
                { l: "Edited by", v: "Priya Nair" },
                { l: "IP hash", v: "a3f9...b2c1" },
              ].map((x) => (
                <div key={x.l} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{x.l}</span>
                  <span className="font-medium truncate ml-2">{x.v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
