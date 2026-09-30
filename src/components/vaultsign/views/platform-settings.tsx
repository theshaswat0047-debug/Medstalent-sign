"use client"

import { useState } from "react"
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
  const [showKey, setShowKey] = useState(false)
  const [maintenance, setMaintenance] = useState(false)
  const [signups, setSignups] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Superadmin-only configuration. Affects every organization on the VaultSign platform.
        </p>
      </div>

      {/* Brevo platform-level config */}
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Icons.mail className="size-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">Brevo Platform Integration</h2>
                <Badge className="h-5 text-[10px] gap-1 bg-emerald-500 hover:bg-emerald-500 text-white">
                  <span className="size-1.5 rounded-full bg-white animate-pulse-dot" />
                  Connected
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-md">
                Master Brevo credentials used to send emails on behalf of all organizations.
                Per-org sender identities are configured in each org's Settings.
              </p>
            </div>
          </div>
          <Badge variant="outline" className="h-5 text-[10px] gap-1 shrink-0">
            <Icons.shield className="size-2.5" /> Superadmin
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-xs font-medium">Master Brevo API key</Label>
            <div className="relative mt-1.5">
              <Input
                type={showKey ? "text" : "password"}
                defaultValue="xkeysib-master-3f8a9c2e1b7d4f6a8c0e2b9d7f4a1c3e5b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6"
                className="h-10 pr-24 font-mono text-xs"
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setShowKey((s) => !s)}>
                  <Icons.eye className="size-3.5" /> {showKey ? "Hide" : "Reveal"}
                </Button>
                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">
                  <Icons.copy className="size-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Stored encrypted at rest (AES-256). Last rotated Sep 12, 2026.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium">Default sender email</Label>
              <Input defaultValue="noreply@vaultsign.io" className="mt-1.5 h-9" readOnly />
            </div>
            <div>
              <Label className="text-xs font-medium">Default sender name</Label>
              <Input defaultValue="VaultSign Notifications" className="mt-1.5 h-9" readOnly />
            </div>
            <div>
              <Label className="text-xs font-medium">Webhook endpoint</Label>
              <Input defaultValue="https://api.vaultsign.io/webhooks/brevo" className="mt-1.5 h-9 font-mono text-xs" readOnly />
            </div>
            <div>
              <Label className="text-xs font-medium">Webhook secret</Label>
              <Input defaultValue="whsec_master_8a4f2c1b9d7e" className="mt-1.5 h-9 font-mono text-xs" readOnly />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            {[
              { l: "Emails sent (24h)", v: "12,847" },
              { l: "Delivery rate", v: "99.4%" },
              { l: "Open rate", v: "78.2%" },
              { l: "Bounce rate", v: "0.4%" },
            ].map((m) => (
              <div key={m.l} className="p-3 rounded-lg bg-secondary/50">
                <div className="text-lg font-semibold tabular-nums">{m.v}</div>
                <div className="text-[10px] text-muted-foreground">{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="h-9">Cancel</Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Saved", description: "Brevo credentials updated. Webhook re-verified." })}>
            <Icons.check2 className="size-3.5" /> Save & verify
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
            on={maintenance}
            onChange={setMaintenance}
          />
          <ToggleRow
            label="Allow new organization signups"
            desc="Public signup page at vaultsign.io/signup is active."
            on={signups}
            onChange={setSignups}
          />
          <ToggleRow
            label="Enforce 2FA for all org admins"
            desc="Org admins must enable TOTP within 7 days of signup."
            on
            onChange={() => {}}
          />
          <ToggleRow
            label="Auto-suspend on payment failure"
            desc="After 3 failed retries, suspend the organization automatically."
            on
            onChange={() => {}}
          />
        </div>
      </Card>

      {/* Feature flags */}
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Feature flags</h2>
        <p className="text-xs text-muted-foreground mb-4">Roll out features to specific plans or all orgs.</p>
        <div className="space-y-2">
          {[
            { f: "AI smart field detection", plans: "Enterprise only", on: true },
            { f: "Bulk send (CSV)", plans: "Business + Enterprise", on: true },
            { f: "Conditional content blocks", plans: "Enterprise only", on: true },
            { f: "WhatsApp delivery", plans: "Beta · Enterprise", on: false },
            { f: "Stripe billing pass-through", plans: "All plans", on: true },
            { f: "Custom signing domain", plans: "Business + Enterprise", on: true },
          ].map((flag) => (
            <div key={flag.f} className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
              <div className="min-w-0">
                <div className="text-sm font-medium">{flag.f}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{flag.plans}</div>
              </div>
              <Switch defaultChecked={flag.on} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ToggleRow({
  label, desc, on, onChange,
}: {
  label: string; desc: string; on: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch checked={on} onCheckedChange={onChange} />
    </div>
  )
}
