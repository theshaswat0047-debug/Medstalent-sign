"use client"

import { useState, useMemo } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
  const openSendModal = useAppStore((s) => s.openSendModal)
  const { toast } = useToast()

  const handleUseTemplate = (t: TemplateItem) => {
    openSendModal({ name: t.name, category: t.category, pages: t.pages })
    toast({
      title: `Loaded "${t.name}"`,
      description: `${t.category} · ${t.pages} pages. Add a recipient to send.`,
    })
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
          <TemplateCard key={t.id} template={t} onUse={() => handleUseTemplate(t)} />
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
    </div>
  )
}

function TemplateCard({ template, onUse }: { template: (typeof TEMPLATES)[number]; onUse: () => void }) {
  const Icon = Icons[CATEGORY_ICON_MAP[template.category] || "documents"]

  return (
    <Card
      className="group p-4 shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5 cursor-pointer relative"
      onClick={onUse}
    >
      {/* Thumbnail mock */}
      <div className="aspect-[4/3] rounded-lg bg-secondary/60 border border-border mb-3 relative overflow-hidden flex items-center justify-center">
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
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Icon className="size-3 text-muted-foreground shrink-0" />
            <span className="text-[11px] text-muted-foreground">{template.category}</span>
          </div>
          <h3 className="text-sm font-semibold leading-snug truncate group-hover:text-foreground">{template.name}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug">{template.description}</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icons.documents className="size-3" />
            {template.pages}p
          </span>
          <span className="flex items-center gap-1">
            <Icons.star className="size-3" />
            {template.popularity}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => { e.stopPropagation(); onUse() }}
        >
          Use
          <Icons.arrowRight className="size-3" />
        </Button>
      </div>
    </Card>
  )
}
