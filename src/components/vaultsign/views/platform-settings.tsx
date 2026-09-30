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

interface Settings {
  brevo_api_key_masked: string
  brevo_api_key_set: boolean
  brevo_sender_email: string
  brevo_sender_name: string
  brevo_webhook_secret_masked: string
  brevo_webhook_secret_set: boolean
  brevo_smtp_host: string
  brevo_smtp_port: number
  brevo_smtp_username: string
  brevo_smtp_password_set: boolean
  maintenance_mode: boolean
  signups_enabled: boolean
  enforce_2fa_admins: boolean
}

export function PlatformSettingsView() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  // Brevo config form state
  const [apiKey, setApiKey] = useState("")
  const [apiKeySet, setApiKeySet] = useState(false)
  const [senderEmail, setSenderEmail] = useState("")
  const [senderName, setSenderName] = useState("VaultSign")
  const [webhookSecret, setWebhookSecret] = useState("")
  const [webhookSecretSet, setWebhookSecretSet] = useState(false)

  // Platform toggles
  const [maintenance, setMaintenance] = useState(false)
  const [signups, setSignups] = useState(true)
  const [enforce2fa, setEnforce2fa] = useState(true)

  // Load current settings on mount
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/platform/settings")
        if (!res.ok) return
        const data: Settings = await res.json()
        setApiKey(data.brevo_api_key_masked || "")
        setApiKeySet(data.brevo_api_key_set)
        setSenderEmail(data.brevo_sender_email || "")
        setSenderName(data.brevo_sender_name || "VaultSign")
        setWebhookSecret(data.brevo_webhook_secret_masked || "")
        setWebhookSecretSet(data.brevo_webhook_secret_set)
        setMaintenance(data.maintenance_mode)
        setSignups(data.signups_enabled)
        setEnforce2fa(data.enforce_2fa_admins)
      } catch {
        // ignore — settings just aren't loaded yet
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        brevo_sender_email: senderEmail,
        brevo_sender_name: senderName,
        maintenance_mode: maintenance,
        signups_enabled: signups,
        enforce_2fa_admins: enforce2fa,
      }
      // Only send API key / webhook secret if user changed them (not masked)
      if (apiKey && !apiKey.includes("••••")) {
        body.brevo_api_key = apiKey
      }
      if (webhookSecret && !webhookSecret.includes("••••")) {
        body.brevo_webhook_secret = webhookSecret
      }

      const res = await fetch("/api/platform/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()

      if (!res.ok) {
        toast({ title: "Save failed", description: data.error, variant: "destructive" })
        setSaving(false)
        return
      }

      // Reload to get fresh masked values
      const freshRes = await fetch("/api/platform/settings")
      if (freshRes.ok) {
        const freshData: Settings = await freshRes.json()
        setApiKey(freshData.brevo_api_key_masked || "")
        setApiKeySet(freshData.brevo_api_key_set)
        setWebhookSecret(freshData.brevo_webhook_secret_masked || "")
        setWebhookSecretSet(freshData.brevo_webhook_secret_set)
      }

      toast({ title: "Settings saved", description: "Platform configuration updated." })
    } catch {
      toast({ title: "Save failed", description: "Network error", variant: "destructive" })
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.loader className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          SuperAdmin-only configuration. Affects every organization on the VaultSign platform.
        </p>
      </div>

      {/* Email Delivery config */}
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icons.mail className="size-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Email Delivery</h2>
                <Badge className={cn("h-5 text-[10px] gap-1", apiKeySet ? "bg-emerald-500 hover:bg-emerald-500 text-white" : "bg-amber-500 hover:bg-amber-500 text-white")}>
                  <span className={cn("size-1.5 rounded-full", apiKeySet ? "bg-white animate-pulse-dot" : "bg-white")} />
                  {apiKeySet ? "Configured" : "Not configured"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                Configure your email delivery provider. This is used to send OTP codes, signing invitations, and completion certificates. Stored encrypted at rest.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] gap-1 shrink-0">
            <Icons.shield className="size-2.5" /> SuperAdmin
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium">API Key {apiKeySet && <span className="text-emerald-600">✓ Set</span>}</Label>
            <div className="relative mt-1.5">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={apiKeySet ? "•••••••• (saved) — enter new key to replace" : "Enter your Brevo API key (xkeysib-...)"}
                className="h-10 pr-24 font-mono text-xs"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowKey((s) => !s)}>
                  <Icons.eye className="size-3.5" /> {showKey ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Get your API key from Brevo → SMTP &amp; API → API Keys
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Sender email (must be verified in Brevo)</Label>
              <Input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="sign@notifications.yourdomain.com"
                className="mt-1.5 h-9"
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Sender name</Label>
              <Input
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="VaultSign"
                className="mt-1.5 h-9"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-medium">Webhook secret {webhookSecretSet && <span className="text-emerald-600">✓ Set</span>}</Label>
            <div className="relative mt-1.5">
              <Input
                type={showSecret ? "text" : "password"}
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder={webhookSecretSet ? "•••••••• (saved) — enter new secret to replace" : "Optional: webhook secret for verifying inbound webhooks"}
                className="h-9 pr-24 font-mono text-xs"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowSecret((s) => !s)}>
                  <Icons.eye className="size-3.5" /> {showSecret ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
          <Button size="sm" className="h-9 gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Icons.loader className="size-3.5 animate-spin" /> : <Icons.check2 className="size-3.5" />}
            {saving ? "Saving..." : "Save email config"}
          </Button>
        </div>
      </Card>

      {/* Platform toggles */}
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Platform controls</h2>
        <p className="text-xs text-muted-foreground mb-4">Apply globally to all organizations.</p>
        <div className="space-y-2">
          <ToggleRow
            label="Maintenance mode"
            desc="Display a read-only banner to all users. New sends are blocked."
            checked={maintenance}
            onCheckedChange={setMaintenance}
          />
          <ToggleRow
            label="Allow new organization signups"
            desc="Public signup page at /signup is active."
            checked={signups}
            onCheckedChange={setSignups}
          />
          <ToggleRow
            label="Enforce 2FA for all org admins"
            desc="Org admins must enable TOTP within 7 days of signup."
            checked={enforce2fa}
            onCheckedChange={setEnforce2fa}
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
          <Button size="sm" className="h-9 gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Icons.loader className="size-3.5 animate-spin" /> : <Icons.check2 className="size-3.5" />}
            {saving ? "Saving..." : "Save toggles"}
          </Button>
        </div>
      </Card>

      {/* Compliance */}
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Compliance certifications</h2>
        <p className="text-xs text-muted-foreground mb-4">VaultSign is independently audited.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { name: "SOC 2 Type II", date: "Aug 2026" },
            { name: "GDPR", date: "Ongoing" },
            { name: "HIPAA", date: "BAAs signed" },
            { name: "eIDAS QES", date: "EU certified" },
            { name: "ESIGN Act", date: "US compliant" },
            { name: "UETA", date: "US compliant" },
            { name: "ISO 27001", date: "Jun 2026" },
            { name: "PCI DSS", date: "Via Stripe" },
            { name: "CCPA", date: "Ongoing" },
          ].map((c) => (
            <div key={c.name} className="p-3 rounded-lg border border-border bg-secondary/40">
              <div className="flex items-center gap-1.5">
                <Icons.check className="size-3.5 text-emerald-600" />
                <span className="text-xs font-medium">{c.name}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{c.date}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ToggleRow({
  label, desc, checked, onCheckedChange,
}: {
  label: string; desc: string; checked: boolean; onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
