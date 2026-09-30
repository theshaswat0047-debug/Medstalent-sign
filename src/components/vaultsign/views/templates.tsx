"use client"

import { useState, useMemo } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { TEMPLATES, CATEGORIES, type TemplateCategory, type TemplateItem } from "@/lib/template-data"
import { useToast } from "@/hooks/use-toast"

const CAT_ICON: Record<string, string> = { "HR": "users", "Legal": "scale", "Real Estate": "home", "Sales": "trending", "Finance": "wallet", "Healthcare": "heart", "Education": "graduation", "Government": "landmark" }

export function TemplatesView() {
  const [activeCat, setActiveCat] = useState<TemplateCategory | "All">("All")
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<"popular" | "new" | "az">("popular")
  const [preview, setPreview] = useState<TemplateItem | null>(null)
  const { toast } = useToast()

  const filtered = useMemo(() => {
    let list = activeCat === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === activeCat)
    if (query.trim()) { const q = query.toLowerCase(); list = list.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q))) }
    if (sort === "popular") list = [...list].sort((a, b) => b.popularity - a.popularity)
    else if (sort === "new") list = [...list].sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew))
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [activeCat, query, sort])

  const handleUse = (t: TemplateItem) => { toast({ title: `Loaded "${t.name}"`, description: `${t.category} · ${t.pages} pages. Add a recipient to send.` }); window.dispatchEvent(new CustomEvent("navigate", { detail: "documents" })) }
  const handleEdit = (t: TemplateItem) => { toast({ title: "Opening editor", description: `Editing "${t.name}"` }); window.dispatchEvent(new CustomEvent("navigate", { detail: "editor" })) }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Template Library</h1><p className="text-sm text-muted-foreground mt-1">{TEMPLATES.length} templates across {CATEGORIES.length} categories.</p></div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Import template", description: "Upload .docx or .pdf" })}><Icons.upload className="size-3.5" />Import</Button><Button size="sm" className="h-9 gap-1.5" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "editor" }))}><Icons.plus className="size-4" />Create custom</Button></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => { const Icon = Icons[CAT_ICON[cat.name] || "documents"]; const active = activeCat === cat.name; return (
          <button key={cat.name} onClick={() => setActiveCat(active ? "All" : cat.name)} className={cn("text-left p-3.5 rounded-xl border transition-all", active ? "bg-foreground text-background border-foreground shadow-card" : "bg-card border-border hover:border-foreground/30 hover:shadow-card")}>
            <div className="flex items-center justify-between"><div className={cn("size-8 rounded-lg flex items-center justify-center", active ? "bg-background/10" : "bg-secondary")}><Icon className="size-4" /></div><span className={cn("text-[11px] tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{cat.count}</span></div>
            <div className="mt-2.5 text-sm font-semibold">{cat.name}</div>
            <div className={cn("text-[11px] mt-0.5 leading-snug line-clamp-2", active ? "text-background/70" : "text-muted-foreground")}>{cat.description}</div>
          </button>
        )})}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search templates..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9 bg-card" /></div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-card border border-border">{(["popular", "new", "az"] as const).map((s) => <button key={s} onClick={() => setSort(s)} className={cn("h-8 px-3 text-xs rounded-md font-medium transition-colors", sort === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>{s === "az" ? "A-Z" : s.charAt(0).toUpperCase() + s.slice(1)}</button>)}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtered.map((t) => { const Icon = Icons[CAT_ICON[t.category] || "documents"]; return (
          <Card key={t.id} className="group p-4 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5">
            <div className="aspect-[4/3] rounded-lg bg-secondary/60 border border-border mb-3 relative overflow-hidden cursor-pointer" onClick={() => setPreview(t)}>
              <div className="absolute inset-0 p-4 flex flex-col gap-1.5"><div className="h-1 w-2/3 bg-foreground/15 rounded" /><div className="h-1 w-1/2 bg-foreground/10 rounded mt-1" /><div className="h-0.5 w-full bg-foreground/8 rounded mt-2" /><div className="h-0.5 w-full bg-foreground/8 rounded" /><div className="h-0.5 w-4/5 bg-foreground/8 rounded" /><div className="h-0.5 w-full bg-foreground/8 rounded mt-2" /><div className="h-0.5 w-3/5 bg-foreground/8 rounded" /><div className="h-2 w-12 bg-foreground/25 rounded mt-2" /></div>
              <div className="absolute bottom-2 right-2 size-10 rounded border-2 border-dashed border-foreground/30 bg-card/70 flex items-center justify-center"><Icons.sign className="size-3.5 text-foreground/40" /></div>
              <div className="absolute top-2 left-2 flex gap-1">{t.isPopular && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-foreground text-background">POPULAR</span>}{t.isNew && <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-600 text-white">NEW</span>}</div>
            </div>
            <div className="flex items-center gap-1.5 mb-0.5"><Icon className="size-3 text-muted-foreground shrink-0" /><span className="text-[11px] text-muted-foreground">{t.category}</span></div>
            <h3 className="text-sm font-semibold leading-snug truncate">{t.name}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">{t.description}</p>
            <div className="mt-3 pt-3 border-t border-border flex items-center gap-1">
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1" onClick={() => setPreview(t)}><Icons.eye className="size-3" />View</Button>
              <Button size="sm" variant="ghost" className="flex-1 h-7 text-[11px] gap-1" onClick={() => handleEdit(t)}><Icons.edit3 className="size-3" />Edit</Button>
              <Button size="sm" variant="default" className="flex-1 h-7 text-[11px] gap-1" onClick={() => handleUse(t)}>Use<Icons.arrowRight className="size-3" /></Button>
            </div>
          </Card>
        )})}
      </div>

      {filtered.length === 0 && <div className="text-center py-16"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.search className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">No templates found</div><div className="text-xs text-muted-foreground mt-1">Try a different search or category.</div></div>}

      {preview && (
        <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
          <DialogContent className="max-w-2xl p-0 gap-0 shadow-popover max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
              <DialogTitle className="text-base flex items-center gap-2">{preview.name}<Badge variant="secondary" className="h-5 text-[10px]">{preview.category}</Badge><Badge variant="outline" className="h-5 text-[10px]">{preview.pages} pages</Badge></DialogTitle>
              <DialogDescription className="text-xs">{preview.description}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto bg-secondary/40 p-6">
              <div className="bg-card shadow-card rounded-sm w-full max-w-[560px] mx-auto p-10 min-h-[500px]">
                <h1 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px", textAlign: "center", fontFamily: "Georgia, serif" }}>{preview.name.toUpperCase()}</h1>
                <p style={{ fontSize: "10px", color: "#6B6B6B", textAlign: "center", marginBottom: "24px", fontStyle: "italic" }}>VaultSign Template · Effective Date: ___________</p>
                <p style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.6", fontFamily: "Georgia, serif" }}>This {preview.name} is entered into between <strong>Party A</strong> and <strong>Party B</strong> as of the Effective Date.</p>
                <h2 style={{ fontSize: "13px", fontWeight: 600, margin: "16px 0 6px", fontFamily: "Georgia, serif" }}>1. Terms</h2>
                <p style={{ fontSize: "12px", marginBottom: "12px", lineHeight: "1.6", fontFamily: "Georgia, serif" }}>The parties agree to the terms and conditions set forth in this document.</p>
                <h2 style={{ fontSize: "13px", fontWeight: 600, margin: "16px 0 6px", fontFamily: "Georgia, serif" }}>2. Signatures</h2>
                <table style={{ borderCollapse: "collapse", width: "100%" }}><tbody><tr><td style={{ border: "1px solid #E5E5E0", padding: "12px", background: "#F2EDE4", fontWeight: 600, fontSize: "11px", width: "50%" }}>Party A:</td><td style={{ border: "1px solid #E5E5E0", padding: "12px", background: "#F2EDE4", fontWeight: 600, fontSize: "11px" }}>Party B:</td></tr><tr><td style={{ border: "1px solid #E5E5E0", padding: "24px 12px" }}><div style={{ border: "1px dashed #999", height: "40px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "10px" }}>Signature</div></td><td style={{ border: "1px solid #E5E5E0", padding: "24px 12px" }}><div style={{ border: "1px dashed #999", height: "40px", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "#999", fontSize: "10px" }}>Signature</div></td></tr></tbody></table>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border flex items-center justify-between shrink-0">
              <div className="text-[11px] text-muted-foreground">Template ID: <code className="font-mono">{preview.id}</code></div>
              <div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => { handleEdit(preview); setPreview(null) }}><Icons.edit3 className="size-3.5" />Edit</Button><Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => { handleUse(preview); setPreview(null) }}><Icons.send className="size-3.5" />Use template</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
