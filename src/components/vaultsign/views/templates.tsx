"use client"

import { useState, useMemo } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { TEMPLATES, CATEGORIES, type TemplateCategory, type TemplateItem } from "@/lib/template-data"
import { useAppStore } from "@/lib/store"
import { useToast } from "@/hooks/use-toast"

const CATEGORY_ICON_MAP: Record<string, string> = {
  "HR": "users",
  "Legal": "scale",
  "Real Estate": "home",
  "Sales": "trending",
  "Finance": "wallet",
  "Healthcare": "heart",
  "Education": "graduation",
  "Government": "landmark",
}

export function TemplatesView() {
  const [activeCat, setActiveCat] = useState<TemplateCategory | "All">("All")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"popular" | "new" | "az">("popular")
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null)
  const openSendModal = useAppStore((s) => s.openSendModal)
  const { toast } = useToast()

  const handleUseTemplate = (t: TemplateItem) => {
    openSendModal({ name: t.name, category: t.category, pages: t.pages })
    toast({
      title: `Loaded "${t.name}"`,
      description: `${t.category} · ${t.pages} pages. Add a recipient to send.`,
    })
  }

  const handleEditTemplate = (t: TemplateItem) => {
    toast({
      title: `Opening editor`,
      description: `Editing "${t.name}" template.`,
    })
    // In a real app this would route to /editor?template=t.id
    // For now, switch to editor view via a custom event
    window.dispatchEvent(new CustomEvent("navigate", { detail: "editor" }))
  }

  const handlePreviewTemplate = (t: TemplateItem) => {
    setPreviewTemplate(t)
  }

  const filtered = useMemo(() => {
    let list = TEMPLATES
    if (activeCat !== "All") list = list.filter((t) => t.category === activeCat)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.includes(q))
      )
    }
    if (sort === "popular") list = [...list].sort((a, b) => b.popularity - a.popularity)
    else if (sort === "new") list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew))
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activeCat, query, sort])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Template Library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {TEMPLATES.length} ready-to-use templates across {CATEGORIES.length} categories. Pick one to start in seconds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm" className="h-9 gap-1.5"
            onClick={() => toast({ title: "Import template", description: "Upload .docx or .pdf to create a reusable template." })}
          >
            <Icons.upload className="size-3.5" />
            Import template
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => openSendModal()}>
            <Icons.plus className="size-4" />
            Create custom
          </Button>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = Icons[CATEGORY_ICON_MAP[cat.name] || "documents"]
          const active = activeCat === cat.name
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCat(active ? "All" : cat.name)}
              className={cn(
                "text-left p-3.5 rounded-xl border transition-all",
                active
                  ? "bg-foreground text-background border-foreground shadow-card"
                  : "bg-card border-border hover:border-foreground/30 hover:shadow-card"
              )}
            >
              <div className="flex items-center justify-between">
                <div className={cn("size-8 rounded-lg flex items-center justify-center", active ? "bg-background/10" : "bg-secondary")}>
                  <Icon className="size-4" />
                </div>
                <span className={cn("text-[11px] tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>
                  {cat.count}
                </span>
              </div>
              <div className="mt-2.5 text-sm font-semibold">{cat.name}</div>
              <div className={cn("text-[11px] mt-0.5 leading-snug line-clamp-2", active ? "text-background/70" : "text-muted-foreground")}>
                {cat.description}
              </div>
            </button>
          )
        })}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search 103 templates by name, tag, or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-9 bg-card"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">
          {([
            { v: "popular", l: "Popular" },
            { v: "new", l: "New" },
            { v: "az", l: "A-Z" },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setSort(opt.v)}
              className={cn(
                "h-8 px-3 text-xs rounded-md font-medium transition-colors",
                sort === opt.v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter chips */}
      {activeCat !== "All" && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtering by:</span>
          <Badge variant="secondary" className="h-6 gap-1 pr-1 pl-2">
            {activeCat}
            <button onClick={() => setActiveCat("All")} className="ml-1 hover:bg-background/60 rounded p-0.5">
              <Icons.x className="size-3" />
            </button>
          </Badge>
          <span className="text-xs text-muted-foreground">{filtered.length} templates</span>
        </div>
      )}

      {/* Template grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onUse={() => handleUseTemplate(t)}
            onPreview={() => handlePreviewTemplate(t)}
            onEdit={() => handleEditTemplate(t)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.search className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">No templates found</div>
          <div className="text-xs text-muted-foreground mt-1">Try a different search or category.</div>
        </div>
      )}

      {/* Template Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onUse={(t) => { setPreviewTemplate(null); handleUseTemplate(t) }}
        onEdit={(t) => { setPreviewTemplate(null); handleEditTemplate(t) }}
      />
    </div>
  )
}

function TemplateCard({ template, onUse, onPreview, onEdit }: {
  template: (typeof TEMPLATES)[number]
  onUse: () => void
  onPreview: () => void
  onEdit: () => void
}) {
  const Icon = Icons[CATEGORY_ICON_MAP[template.category] || "documents"]

  return (
    <Card className="group p-4 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer relative">
      {/* Thumbnail mock */}
      <div
        className="aspect-[4/3] rounded-lg bg-secondary/60 border border-border mb-3 relative overflow-hidden flex items-center justify-center"
        onClick={onPreview}
      >
        {/* Document lines mock */}
        <div className="absolute inset-0 p-4 flex flex-col gap-1.5">
          <div className="h-1 w-2/3 bg-foreground/15 rounded" />
          <div className="h-1 w-1/2 bg-foreground/10 rounded mt-1" />
          <div className="h-0.5 w-full bg-foreground/8 rounded mt-2" />
          <div className="h-0.5 w-full bg-foreground/8 rounded" />
          <div className="h-0.5 w-4/5 bg-foreground/8 rounded" />
          <div className="h-0.5 w-full bg-foreground/8 rounded mt-2" />
          <div className="h-0.5 w-3/5 bg-foreground/8 rounded" />
          <div className="h-2 w-12 bg-foreground/25 rounded mt-2" />
          <div className="h-0.5 w-2/5 bg-foreground/8 rounded mt-2" />
          <div className="h-0.5 w-1/3 bg-foreground/8 rounded" />
        </div>
        {/* Signature field mock */}
        <div className="absolute bottom-2 right-2 size-10 rounded border-2 border-dashed border-foreground/30 bg-card/70 flex items-center justify-center">
          <Icons.sign className="size-3.5 text-foreground/40" />
        </div>
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {template.isPopular && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-foreground text-background">POPULAR</span>
          )}
          {template.isNew && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">NEW</span>
          )}
        </div>
        {/* Hover overlay with Preview button */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-[10px] font-medium px-2 py-1 rounded bg-card/90 border border-border flex items-center gap-1">
            <Icons.eye className="size-3" />
            Preview
          </span>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">{template.category}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug truncate">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">{template.description}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border">
        {/* 3 action buttons — always visible */}
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1" onClick={onPreview}>
            <Icons.eye className="size-3" />
            View
          </Button>
          <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1" onClick={onEdit}>
            <Icons.edit3 className="size-3" />
            Edit
          </Button>
          <Button size="sm" variant="default" className="flex-1 h-7 text-[11px] gap-1" onClick={onUse}>
            Use
            <Icons.arrowRight className="size-3" />
          </Button>
        </div>
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icons.documents className="size-2.5" />
            {template.pages}p
          </span>
          <span className="flex items-center gap-1">
            <Icons.star className="size-2.5" />
            {template.popularity}
          </span>
        </div>
      </div>
    </Card>
  )
}

// Template Preview Modal — shows a read-only preview of the template
function TemplatePreviewModal({
  template, onClose, onUse, onEdit,
}: {
  template: TemplateItem | null
  onClose: () => void
  onUse: (t: TemplateItem) => void
  onEdit: (t: TemplateItem) => void
}) {
  if (!template) return null

  return (
    <Dialog open={!!template} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 shadow-popover max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
          <DialogTitle className="text-base flex items-center gap-2">
            {template.name}
            <Badge variant="secondary" className="h-5 text-[10px]">{template.category}</Badge>
            <Badge variant="outline" className="h-5 text-[10px]">{template.pages} pages</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">{template.description}</DialogDescription>
        </DialogHeader>

        {/* Preview content — document-like */}
        <div className="flex-1 overflow-y-auto bg-secondary/40 p-6">
          <div className="bg-card shadow-card rounded-sm w-full max-w-[560px] mx-auto p-10 min-h-[500px]">
            <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", textAlign: "center", fontFamily: "Georgia, serif" }}>
              {template.name.toUpperCase()}
            </h1>
            <p style={{ fontSize: "10px", color: "#6B6B6B", textAlign: "center", marginBottom: "24px", fontStyle: "italic" }}>
              VaultSign Template · Effective Date: ___________
            </p>
            <p style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.6", fontFamily: "Georgia, serif" }}>
              This {template.name} is entered into between <strong>Party A</strong> and <strong>Party B</strong> as of the Effective Date set forth above.
            </p>
            <h2 style={{ fontSize: "13px", fontWeight: 600, margin: "16px 0 6px", fontFamily: "Georgia, serif" }}>1. Terms</h2>
            <p style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.6", fontFamily: "Georgia, serif" }}>
              The parties agree to the terms and conditions set forth in this document. This is a preview of the template content.
            </p>
            <h2 style={{ fontSize: "13px", fontWeight: 600, margin: "16px 0 6px", fontFamily: "Georgia, serif" }}>2. Signatures</h2>
            <p style={{ fontSize: "12px", marginBottom: "16px", fontFamily: "Georgia, serif" }}>
              IN WITNESS WHEREOF, the parties have executed this agreement.
            </p>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ border: "1px solid #E5E5E0", padding: "12px", background: "#F2EDE4", fontWeight: 600, fontSize: "11px", width: "50%" }}>Party A:</td>
                  <td style={{ border: "1px solid #E5E5E0", padding: "12px", background: "#F2EDE4", fontWeight: 600, fontSize: "11px" }}>Party B:</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #E5E5E0", padding: "24px 12px", height: "50px" }}>
                    <div style={{ border: "1px dashed #999", height: "40px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "10px" }}>
                      Signature
                    </div>
                  </td>
                  <td style={{ border: "1px solid #E5E5E0", padding: "24px 12px", height: "50px" }}>
                    <div style={{ border: "1px dashed #999", height: "40px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "10px" }}>
                      Signature
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between shrink-0">
          <div className="text-[11px] text-muted-foreground">
            Template ID: <code className="font-mono">{template.id}</code> · {template.tags.join(", ")}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => onEdit(template)}>
              <Icons.edit3 className="size-3.5" />
              Edit
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => onUse(template)}>
              <Icons.send className="size-3.5" />
              Use this template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
