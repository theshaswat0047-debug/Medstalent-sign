"use client"

import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { Underline } from "@tiptap/extension-underline"
import { TextAlign } from "@tiptap/extension-text-align"
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table"
import { Image as TiptapImage } from "@tiptap/extension-image"
import { Link } from "@tiptap/extension-link"
import { Placeholder } from "@tiptap/extension-placeholder"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/hooks/use-toast"

const FIELD_TYPES = [
  { key: "signature", label: "Signature", icon: "sign" as const },
  { key: "initials", label: "Initials", icon: "edit" as const },
  { key: "date", label: "Date", icon: "calendar" as const },
  { key: "text", label: "Text", icon: "edit3" as const },
  { key: "checkbox", label: "Checkbox", icon: "check2" as const },
  { key: "dropdown", label: "Dropdown", icon: "chevronDown" as const },
  { key: "stamp", label: "Company seal", icon: "shield" as const },
]

export function EditorView() {
  const { toast } = useToast()
  const [selectedRecipient, setSelectedRecipient] = useState(0)
  const [placedFields, setPlacedFields] = useState<{ id: string; type: string; recipientIdx: number; }[]>([])

  const recipients = [
    { name: "Rahul Verma", email: "rahul.verma@acme.example", color: "bg-blue-500" },
    { name: "Sarah Mitchell", email: "sarah.m@acme.example", color: "bg-amber-500" },
    { name: "VaultSign Legal", email: "legal@vaultsign.io", color: "bg-emerald-500" },
  ]

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TiptapImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: "Start typing your document, or use the toolbar to format…",
      }),
    ],
    content: `
      <h1>Master Service Agreement</h1>
      <p><em>VaultSign, Inc. · Effective Date: September 30, 2026</em></p>
      <p>This Master Service Agreement ("Agreement") is entered into as of the Effective Date by and between <strong>Acme Corporation</strong> ("Client") and <strong>VaultSign, Inc.</strong> ("Service Provider").</p>
      <h2>1. Services</h2>
      <p>Service Provider shall provide the services described in one or more mutually executed Statements of Work (each, a "SOW"). Each SOW shall incorporate by reference the terms and conditions of this Agreement.</p>
      <h2>2. Term & Termination</h2>
      <p>This Agreement commences on the Effective Date and continues until terminated by either Party upon thirty (30) days written notice.</p>
      <h2>3. Confidentiality</h2>
      <p>Each Party agrees to maintain the confidentiality of the other Party's Confidential Information with the same degree of care it uses for its own.</p>
      <h2>4. Signatures</h2>
      <p>IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date first written above.</p>
      <table>
        <tr>
          <td><strong>Client:</strong></td>
          <td><strong>Service Provider:</strong></td>
        </tr>
        <tr>
          <td><br/>Name / Title</td>
          <td><br/>Name / Title</td>
        </tr>
      </table>
    `,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[500px] p-12",
      },
    },
  })

  const addField = (type: string) => {
    const newField = {
      id: `f${Date.now()}`,
      type,
      recipientIdx: selectedRecipient,
    }
    setPlacedFields((prev) => [...prev, newField])
    toast({ title: `${type} field added`, description: `Assigned to ${recipients[selectedRecipient]?.name}` })
  }

  const removeField = (id: string) => {
    setPlacedFields((prev) => prev.filter((f) => f.id !== id))
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
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
              <h1 className="text-base font-semibold">Document Editor</h1>
              <Badge variant="secondary" className="h-5 text-[10px]">Draft</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">Auto-saved · {editor.storage.characterCount?.words?.() ?? 0} words</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-4">
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
              Click to add — assigns to <span className="font-medium text-foreground">{recipients[selectedRecipient]?.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FIELD_TYPES.map((f) => {
                const Icon = Icons[f.icon]
                return (
                  <button
                    key={f.key}
                    onClick={() => addField(f.key)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/60 hover:border-foreground/30 transition-all cursor-pointer"
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
                <Badge key={m} variant="outline" className="text-[10px] font-mono cursor-pointer hover:bg-accent/60" >{m}</Badge>
              ))}
            </div>
          </Card>
        </div>

        {/* Center — editor */}
        <div className="order-1 lg:order-2 min-w-0">
          {/* Toolbar */}
          <Card className="mb-3 p-1.5 shadow-card">
            <TooltipProvider delayDuration={300}>
              <div className="flex items-center gap-0.5 overflow-x-auto">
                {/* Undo/Redo */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} icon="arrowLeft" label="Undo" />
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} icon="arrowRight" label="Redo" />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Headings */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} label="H1" text />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} label="H2" text />
                <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} label="H3" text />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Bold/Italic/Underline/Strike */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} icon="edit3" label="Bold" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} icon="edit3" label="Italic" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} icon="edit3" label="Underline" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} icon="edit3" label="Strikethrough" />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} icon="chevronRight" label="Bullet list" />
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} icon="chevronRight" label="Numbered list" />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Alignment */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} icon="chevronRight" label="Align left" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} icon="chevronRight" label="Align center" />
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} icon="chevronRight" label="Align right" />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Insert */}
                <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 2, withHeaderRow: true }).run()} icon="plus" label="Insert table" />
                <ToolbarButton onClick={() => {
                  const url = prompt("Enter image URL")
                  if (url) editor.chain().focus().setImage({ src: url }).run()
                }} icon="plus" label="Insert image" />
                <ToolbarButton onClick={() => {
                  const url = prompt("Enter link URL")
                  if (url) editor.chain().focus().setLink({ href: url }).run()
                }} icon="plus" label="Insert link" />
                <Separator orientation="vertical" className="mx-1 h-5" />

                {/* Clear */}
                <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} icon="x" label="Clear formatting" />
              </div>
            </TooltipProvider>
          </Card>

          {/* Document canvas */}
          <div className="bg-secondary/40 p-4 lg:p-8 rounded-xl min-h-[600px] flex justify-center">
            <div className="bg-card shadow-card rounded-sm w-full max-w-[640px] min-h-[500px] overflow-hidden">
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Placed fields list */}
          {placedFields.length > 0 && (
            <Card className="mt-3 p-4 shadow-card">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-2">Placed fields ({placedFields.length})</div>
              <div className="flex flex-wrap gap-2">
                {placedFields.map((f) => {
                  const r = recipients[f.recipientIdx]
                  return (
                    <div key={f.id} className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-border bg-card text-xs">
                      <span className={cn("size-1.5 rounded-full", r?.color)} />
                      <span className="capitalize">{f.type}</span>
                      <span className="text-muted-foreground">· {r?.name.split(" ")[0]}</span>
                      <button onClick={() => removeField(f.id)} className="ml-1 hover:bg-accent/60 rounded p-0.5">
                        <Icons.x className="size-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
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
                    <div className="text-xs font-medium truncate">{recipients[selectedRecipient]?.name}</div>
                    <div className="text-[10px] text-muted-foreground truncate">{recipients[selectedRecipient]?.email}</div>
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
        </div>
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick, icon, label, active, disabled, text,
}: {
  onClick: () => void
  icon?: string
  label: string
  active?: boolean
  disabled?: boolean
  text?: boolean
}) {
  const Icon = icon ? Icons[icon] : null
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "size-7 shrink-0",
            active && "bg-foreground text-background hover:bg-foreground hover:text-background"
          )}
        >
          {text ? (
            <span className="text-xs font-semibold">{label.charAt(0)}</span>
          ) : Icon ? (
            <Icon className="size-3.5" />
          ) : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  )
}
