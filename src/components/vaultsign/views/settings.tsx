"use client"
import { useState } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

type Tab = "general" | "branding" | "security"
const TABS: { v: Tab; l: string; icon: string }[] = [{ v: "general", l: "General", icon: "settings" }, { v: "branding", l: "Branding", icon: "edit3" }, { v: "security", l: "Security", icon: "shield" }]

export function SettingsView() {
  const [tab, setTab] = useState<Tab>("general")
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Settings</h1><p className="text-sm text-muted-foreground mt-1">Manage your organization's profile, branding, and security.</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">{TABS.map(t => { const Icon = Icons[t.icon]; return <button key={t.v} onClick={() => setTab(t.v)} className={cn("flex items-center gap-2 px-3 h-9 rounded-lg text-sm font-medium whitespace-0 transition-colors", tab === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60")}><Icon className="size-4" />{t.l}</button> })}</nav>
        <div className="min-w-0">
          {tab === "general" && <Card className="p-5 shadow-card space-y-4"><h2 className="text-sm font-semibold">Organization profile</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label className="text-xs font-medium">Organization name</Label><Input placeholder="Your company" className="mt-1.5 h-9" /></div><div><Label className="text-xs font-medium">Support email</Label><Input type="email" placeholder="support@company.com" className="mt-1.5 h-9" /></div></div><div className="flex justify-end"><Button size="sm" className="h-9" onClick={() => toast({ title: "Saved", description: "Profile updated." })}>Save changes</Button></div></Card>}
          {tab === "branding" && <Card className="p-5 shadow-card space-y-4"><h2 className="text-sm font-semibold">Brand identity</h2><div><Label className="text-xs font-medium">Logo</Label><div className="mt-1.5 h-24 rounded-lg border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-foreground/30 transition-colors"><Icons.upload className="size-5 text-muted-foreground" /><span className="text-xs text-muted-foreground">PNG, SVG · max 2MB</span></div></div><div><Label className="text-xs font-medium">Primary color</Label><div className="mt-1.5 flex items-center gap-2 p-2 rounded-lg bg-secondary/40"><div className="size-6 rounded-md border border-border" style={{ background: "#1A1A1A" }} /><Input defaultValue="#1A1A1A" className="h-7 font-mono text-xs border-0 bg-transparent" /></div></div><div className="flex justify-end"><Button size="sm" className="h-9" onClick={() => toast({ title: "Saved", description: "Branding updated." })}>Save</Button></div></Card>}
          {tab === "security" && <Card className="p-5 shadow-card space-y-3"><h2 className="text-sm font-semibold">Security</h2><ToggleRow label="Two-factor authentication" desc="Require OTP at sign-in" on /><ToggleRow label="Watermark documents" desc="Stamp recipient email on every page" on /><ToggleRow label="Require email verification" desc="Recipients must verify before viewing" /><ToggleRow label="Auto-void after expiry" desc="Voids envelopes 14 days after sending" on /><div className="flex justify-end pt-2"><Button size="sm" className="h-9" onClick={() => toast({ title: "Saved", description: "Security settings updated." })}>Save</Button></div></Card>}
        </div>
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, on }: { label: string; desc: string; on?: boolean }) {
  return <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40"><div><div className="text-sm font-medium">{label}</div><div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div></div><Switch defaultChecked={on} /></div>
}
