"use client"

import { useState, useRef, useCallback } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const FIELDS = [
  { key: "signature", label: "Signature", icon: "sign" as const },
  { key: "initials", label: "Initials", icon: "edit" as const },
  { key: "date", label: "Date", icon: "calendar" as const },
  { key: "text", label: "Text", icon: "edit3" as const },
  { key: "checkbox", label: "Checkbox", icon: "check2" as const },
  { key: "stamp", label: "Company seal", icon: "shield" as const },
]

export function EditorView() {
  const [selectedRecipient, setSelectedRecipient] = useState(0)
  const [placedFields, setPlacedFields] = useState<{ id: string; type: string }[]>([])
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const recipients = [
    { name: "Rahul Verma", email: "rahul.verma@acme.example", color: "bg-blue-500" },
    { name: "Sarah Mitchell", email: "sarah.m@acme.example", color: "bg-amber-500" },
  ]

  const exec = useCallback((command: string, value?: string) => { document.execCommand(command, false, value); bodyRef.current?.focus() }, [])
  const addField = (type: string) => setPlacedFields(prev => [...prev, { id: `f${Date.now()}`, type }])
  const removeField = (id: string) => setPlacedFields(prev => prev.filter(f => f.id !== id))

  const insertTable = () => { exec("insertHTML", '<table style="border-collapse:collapse;width:100%;margin:8px 0;"><thead><tr><th style="border:1px solid #E5E5E0;padding:6px 10px;background:#F2EDE4;text-align:left;">Column 1</th><th style="border:1px solid #E5E5E0;padding:6px 10px;background:#F2EDE4;text-align:left;">Column 2</th></tr></thead><tbody><tr><td style="border:1px solid #E5E5E0;padding:6px 10px;">&nbsp;</td><td style="border:1px solid #E5E5E0;padding:6px 10px;">&nbsp;</td></tr><tr><td style="border:1px solid #E5E5E0;padding:6px 10px;">&nbsp;</td><td style="border:1px solid #E5E5E0;padding:6px 10px;">&nbsp;</td></tr></tbody></table><p></p>'); setActiveMenu(null) }
  const insertImage = () => { const url = prompt("Image URL:"); if (url) exec("insertImage", url); setActiveMenu(null) }
  const insertLink = () => { const url = prompt("Link URL:"); if (url) exec("createLink", url); setActiveMenu(null) }
  const insertMerge = (field: string) => { exec("insertHTML", `<span style="background:#F2EDE4;padding:2px 8px;border-radius:4px;font-family:monospace;font-size:11px;border:1px solid #E5E5E0;">${field}</span> &nbsp;`); setActiveMenu(null) }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "documents" }))}><Icons.arrowLeft className="size-4" /></Button>
          <div><div className="flex items-center gap-2"><h1 className="text-base font-semibold">Document Editor</h1><Badge variant="secondary" className="h-5 text-[10px]">Draft</Badge></div><div className="text-xs text-muted-foreground mt-0.5">Auto-saved · Untitled</div></div>
        </div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-9 gap-1.5"><Icons.eye className="size-3.5" />Preview</Button><Button size="sm" className="h-9 gap-1.5"><Icons.send className="size-4" />Send</Button></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-3">
        {/* Left — recipients + fields */}
        <div className="space-y-3 order-2 lg:order-1">
          <Card className="p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Signers</div>
            <div className="space-y-1">
              {recipients.map((r, i) => (
                <button key={i} onClick={() => setSelectedRecipient(i)} className={cn("w-full flex items-center gap-2 p-1.5 rounded-md text-left transition-colors", selectedRecipient === i ? "bg-foreground text-background" : "hover:bg-accent/60")}>
                  <span className={cn("size-2 rounded-full", selectedRecipient === i ? "bg-background" : r.color)} />
                  <div className="flex-1 min-w-0"><div className="text-[11px] font-medium truncate">{r.name}</div><div className={cn("text-[9px] truncate", selectedRecipient === i ? "text-background/70" : "text-muted-foreground")}>{r.email}</div></div>
                </button>
              ))}
            </div>
          </Card>
          <Card className="p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Fields</div>
            <div className="grid grid-cols-2 gap-1">
              {FIELDS.map(f => { const Icon = Icons[f.icon]; return <button key={f.key} onClick={() => addField(f.key)} className="flex flex-col items-center gap-0.5 p-2 rounded-md border border-border bg-card hover:bg-accent/60 hover:border-foreground/30 transition-all"><Icon className="size-3.5 text-foreground" /><span className="text-[9px] font-medium">{f.label}</span></button> })}
            </div>
          </Card>
        </div>

        {/* Center — editor */}
        <div className="order-1 lg:order-2 min-w-0">
          <Card className="mb-2 p-0 shadow-card overflow-hidden">
            <div className="flex items-center gap-0 px-2 h-9 bg-secondary/60 border-b border-border text-xs">
              {["File", "Edit", "View", "Insert", "Format", "Tools"].map(m => <button key={m} onClick={() => setActiveMenu(activeMenu === m ? null : m)} className={cn("px-2.5 h-7 rounded font-medium transition-colors", activeMenu === m ? "bg-foreground text-background" : "hover:bg-accent/60")}>{m}</button>)}
            </div>
            {activeMenu === "Insert" && <div className="border-b border-border bg-card py-1 px-2 flex gap-1"><ToolbarBtn onClick={insertTable} icon="plus" label="Table" /><ToolbarBtn onClick={insertImage} icon="upload" label="Image" /><ToolbarBtn onClick={insertLink} icon="external" label="Link" /><Separator orientation="vertical" className="h-5 mx-1" /><ToolbarBtn onClick={() => insertMerge("{{name}}")} label="{{name}}" text /><ToolbarBtn onClick={() => insertMerge("{{date}}")} label="{{date}}" text /></div>}
            {activeMenu === "Format" && <div className="border-b border-border bg-card py-1 px-2 flex gap-1 flex-wrap"><ToolbarBtn onClick={() => exec("bold")} label="Bold" text /><ToolbarBtn onClick={() => exec("italic")} label="Italic" text /><ToolbarBtn onClick={() => exec("underline")} label="Underline" text /><Separator orientation="vertical" className="h-5 mx-1" /><ToolbarBtn onClick={() => exec("formatBlock", "<h1>")} label="H1" text /><ToolbarBtn onClick={() => exec("formatBlock", "<h2>")} label="H2" text /><ToolbarBtn onClick={() => exec("formatBlock", "<p>")} label="Body" text /><Separator orientation="vertical" className="h-5 mx-1" /><ToolbarBtn onClick={() => exec("insertUnorderedList")} icon="chevronRight" label="Bullets" /><ToolbarBtn onClick={() => exec("insertOrderedList")} icon="chevronRight" label="Numbered" /><Separator orientation="vertical" className="h-5 mx-1" /><ToolbarBtn onClick={() => exec("justifyLeft")} icon="chevronRight" label="Left" /><ToolbarBtn onClick={() => exec("justifyCenter")} icon="chevronRight" label="Center" /><ToolbarBtn onClick={() => exec("justifyRight")} icon="chevronRight" label="Right" /></div>}
            <div className="flex items-center gap-0.5 px-2 h-11 bg-card border-b border-border">
              <ToolbarBtn onClick={() => exec("undo")} icon="arrowLeft" label="↶" text /><ToolbarBtn onClick={() => exec("redo")} icon="arrowRight" label="↷" text /><Separator orientation="vertical" className="h-6 mx-1.5" />
              <select onChange={e => exec("fontSize", e.target.value)} className="h-7 text-xs border border-border rounded px-1.5 bg-card mr-1"><option value="2">12pt</option><option value="3">14pt</option><option value="4">16pt</option><option value="5">18pt</option><option value="6">24pt</option></select>
              <ToolbarBtn onClick={() => exec("bold")} label="B" text /><ToolbarBtn onClick={() => exec("italic")} label="I" text /><ToolbarBtn onClick={() => exec("underline")} label="U" text /><Separator orientation="vertical" className="h-6 mx-1.5" />
              <ToolbarBtn onClick={() => exec("formatBlock", "<h1>")} label="H1" text /><ToolbarBtn onClick={() => exec("formatBlock", "<h2>")} label="H2" text /><ToolbarBtn onClick={() => exec("formatBlock", "<h3>")} label="H3" text /><Separator orientation="vertical" className="h-6 mx-1.5" />
              <ToolbarBtn onClick={() => exec("insertUnorderedList")} icon="chevronRight" label="•" text /><ToolbarBtn onClick={() => exec("insertOrderedList")} icon="chevronRight" label="1." text /><Separator orientation="vertical" className="h-6 mx-1.5" />
              <ToolbarBtn onClick={insertTable} icon="plus" label="Table" /><ToolbarBtn onClick={insertImage} icon="upload" label="Image" /><ToolbarBtn onClick={insertLink} icon="external" label="Link" /><Separator orientation="vertical" className="h-6 mx-1.5" />
              <ToolbarBtn onClick={() => exec("removeFormat")} icon="x" label="Clear" />
            </div>
          </Card>

          <div className="bg-secondary/40 rounded-lg p-4 lg:p-8 flex justify-center overflow-y-auto max-h-[65vh]">
            <div className="bg-card shadow-xl rounded-sm w-full max-w-[640px] min-h-[700px]">
              <div contentEditable suppressContentEditableWarning className="px-12 pt-8 pb-4 text-[10px] text-muted-foreground border-b border-dashed border-border/60 min-h-[40px] focus:outline-none focus:bg-accent/20" dangerouslySetInnerHTML={{ __html: "Double-click to edit header" }} />
              <div ref={bodyRef} contentEditable suppressContentEditableWarning className="px-12 py-8 min-h-[500px] focus:outline-none" style={{ fontFamily: "'Times New Roman', Georgia, serif", fontSize: "14px", lineHeight: "1.6", color: "#1A1A1A" }} dangerouslySetInnerHTML={{ __html: `<h1 style="font-size:22px;font-weight:700;margin:0 0 4px;text-align:center;font-family:Georgia,serif;">MASTER SERVICE AGREEMENT</h1><p style="text-align:center;font-size:11px;color:#6B6B6B;margin:0 0 24px;font-style:italic;">VaultSign, Inc. · Effective Date: September 30, 2026</p><p style="margin:0 0 12px;">This Agreement is entered into between <strong>Party A</strong> and <strong>Party B</strong>.</p><h2 style="font-size:15px;font-weight:600;margin:20px 0 6px;font-family:Georgia,serif;">1. Services</h2><p style="margin:0 0 12px;">Service Provider shall provide the services described in one or more SOWs.</p><h2 style="font-size:15px;font-weight:600;margin:20px 0 6px;font-family:Georgia,serif;">2. Signatures</h2><p style="margin:0 0 16px;">IN WITNESS WHEREOF, the parties have executed this agreement.</p><table style="border-collapse:collapse;width:100%;"><tbody><tr><td style="border:1px solid #E5E5E0;padding:8px 12px;background:#F2EDE4;font-weight:600;width:50%;">Party A:</td><td style="border:1px solid #E5E5E0;padding:8px 12px;background:#F2EDE4;font-weight:600;">Party B:</td></tr><tr><td style="border:1px solid #E5E5E0;padding:24px 12px;height:60px;"></td><td style="border:1px solid #E5E5E0;padding:24px 12px;height:60px;"></td></tr></tbody></table>` }} />
              <div contentEditable suppressContentEditableWarning className="px-12 pt-4 pb-8 text-[10px] text-muted-foreground border-t border-dashed border-border/60 min-h-[40px] focus:outline-none focus:bg-accent/20" dangerouslySetInnerHTML={{ __html: "Page 1 of 1 · VaultSign Confidential" }} />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground px-2"><span>Page 1 of 1 · ~247 words</span><span className="flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-emerald-500" />Auto-saved</span></div>
        </div>

        {/* Right — properties */}
        <div className="order-3 space-y-3">
          {placedFields.length > 0 && (
            <Card className="p-3 shadow-card">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Placed fields ({placedFields.length})</div>
              <div className="space-y-1">{placedFields.map(f => <div key={f.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-card"><span className={cn("size-1.5 rounded-full", recipients[selectedRecipient]?.color)} /><span className="capitalize text-[11px]">{f.type}</span><button onClick={() => removeField(f.id)} className="ml-auto hover:bg-accent/60 rounded p-0.5"><Icons.x className="size-3" /></button></div>)}</div>
            </Card>
          )}
          <Card className="p-3 shadow-card">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Settings</div>
            <div className="space-y-1.5"><div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Signing order</span><Badge variant="secondary" className="h-4 text-[9px]">Sequential</Badge></div><div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Authentication</span><Badge variant="secondary" className="h-4 text-[9px]">Email OTP</Badge></div><div className="flex items-center justify-between"><span className="text-[11px] text-muted-foreground">Watermark</span><Badge variant="secondary" className="h-4 text-[9px]">On</Badge></div></div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ onClick, icon, label, text }: { onClick: () => void; icon?: string; label: string; text?: boolean }) {
  const Icon = icon ? Icons[icon] : null
  return <button onClick={onClick} className="flex items-center gap-1 h-7 px-2 rounded text-[11px] font-medium hover:bg-accent/60 transition-colors shrink-0">{text ? <span className={label.length <= 2 ? "font-bold" : ""}>{label}</span> : Icon ? <><Icon className="size-3.5" /><span>{label}</span></> : null}</button>
}
