"use client"
import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"

export function PlatformSettingsView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKey] = useState("")
  const [apiKeySet, setApiKeySet] = useState(false)
  const [senderEmail, setSenderEmail] = useState("")
  const [senderName, setSenderName] = useState("VaultSign")
  const [maintenance, setMaintenance] = useState(false)
  const [signups, setSignups] = useState(true)

  useEffect(() => { fetch("/api/platform/settings").then(r => r.ok ? r.json() : null).then(d => { if (d) { setApiKey(d.brevo_api_key_masked || ""); setApiKeySet(d.brevo_api_key_set); setSenderEmail(d.brevo_sender_email || ""); setSenderName(d.brevo_sender_name || "VaultSign"); setMaintenance(d.maintenance_mode); setSignups(d.signups_enabled) } }).catch(() => {}).finally(() => setLoading(false)) }, [])

  const handleSave = async () => {
    setSaving(true)
    const body: any = { brevo_sender_email: senderEmail, brevo_sender_name: senderName, maintenance_mode: maintenance, signups_enabled: signups }
    if (apiKey && !apiKey.includes("••••")) body.brevo_api_key = apiKey
    const res = await fetch("/api/platform/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    if (res.ok) { toast({ title: "Saved", description: "Platform settings updated." }); const fresh = await fetch("/api/platform/settings").then(r => r.json()); if (fresh) { setApiKey(fresh.brevo_api_key_masked || ""); setApiKeySet(fresh.brevo_api_key_set) } } else toast({ title: "Save failed", variant: "destructive" })
    setSaving(false)
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1><p className="text-sm text-muted-foreground mt-1">SuperAdmin configuration. Affects the entire platform.</p></div>
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3"><div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center"><Icons.mail className="size-5 text-emerald-600" /></div><div><div className="flex items-center gap-2"><h2 className="text-sm font-semibold">Email Delivery</h2><Badge className={cn("h-5 text-[10px] gap-1", apiKeySet ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}><span className={cn("size-1.5 rounded-full bg-white", apiKeySet && "animate-pulse-dot")} />{apiKeySet ? "Configured" : "Not configured"}</Badge></div><p className="text-xs text-muted-foreground mt-0.5 max-w-md">Configure the email provider for OTP delivery and signing invitations.</p></div></div>
        </div>
        <div className="space-y-4">
          <div><Label className="text-xs font-medium">API Key {apiKeySet && <span className="text-emerald-600">✓ Set</span>}</Label><div className="relative mt-1.5"><Input type={showKey ? "text" : "password"} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={apiKeySet ? "•••••••• (saved) — enter new to replace" : "Enter API key"} className="h-10 pr-20 font-mono text-xs" /><Button size="sm" variant="ghost" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 px-2 text-xs" onClick={() => setShowKey(!showKey)}><Icons.eye className="size-3.5" />{showKey ? "Hide" : "Show"}</Button></div></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label className="text-xs font-medium">Sender email</Label><Input type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="sign@domain.com" className="mt-1.5 h-9" /></div><div><Label className="text-xs font-medium">Sender name</Label><Input value={senderName} onChange={e => setSenderName(e.target.value)} className="mt-1.5 h-9" /></div></div>
        </div>
        <div className="flex justify-end mt-5 pt-4 border-t border-border"><Button size="sm" className="h-9 gap-1.5" onClick={handleSave} disabled={saving}>{saving ? <Icons.loader className="size-3.5 animate-spin" /> : <Icons.check2 className="size-3.5" />}{saving ? "Saving..." : "Save"}</Button></div>
      </Card>
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Platform controls</h2><p className="text-xs text-muted-foreground mb-4">Apply globally to all organizations.</p>
        <div className="space-y-2"><ToggleRow label="Maintenance mode" desc="Block new sends, show banner to all users" checked={maintenance} onChange={setMaintenance} /><ToggleRow label="Allow new signups" desc="Public /signup page is active" checked={signups} onChange={setSignups} /></div>
        <div className="flex justify-end mt-5 pt-4 border-t border-border"><Button size="sm" className="h-9 gap-1.5" onClick={handleSave} disabled={saving}>{saving ? <Icons.loader className="size-3.5 animate-spin" /> : <Icons.check2 className="size-3.5" />}{saving ? "Saving..." : "Save"}</Button></div>
      </Card>
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40"><div><div className="text-sm font-medium">{label}</div><div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div></div><Switch checked={checked} onCheckedChange={onChange} /></div>
}
