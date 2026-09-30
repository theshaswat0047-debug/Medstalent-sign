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
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Role } from "../shell"

type Tab = "general" | "api_keys" | "integrations" | "branding" | "security" | "billing"

export function SettingsView({ role }: { role: Role }) {
  // Customers land on "general", no Brevo tab for them
  const [tab, setTab] = useState<Tab>("general")

  // Role-based tabs — NO email/Brevo for customers (that's platform-only)
  const allTabs: { v: Tab; l: string; icon: string; roles: Role[] }[] = [
    { v: "general", l: "General", icon: "settings", roles: ["ORG_OWNER", "PERSONAL_USER"] },
    { v: "api_keys", l: "API Keys", icon: "key", roles: ["ORG_OWNER"] },
    { v: "integrations", l: "Integrations", icon: "plug", roles: ["ORG_OWNER"] },
    { v: "branding", l: "Branding", icon: "edit", roles: ["ORG_OWNER"] },
    { v: "security", l: "Security", icon: "shield", roles: ["ORG_OWNER", "PERSONAL_USER"] },
    { v: "billing", l: "Billing", icon: "card", roles: ["ORG_OWNER"] },
  ]

  const tabs = allTabs.filter((t) => t.roles.includes(role))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization's API keys, integrations, branding, and security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Tabs sidebar */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = Icons[t.icon]
            return (
              <button
                key={t.v}
                onClick={() => setTab(t.v)}
                className={cn(
                  "flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm font-medium whitespace-nowrap transition-colors shrink-0",
                  tab === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t.l}
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0">
          {tab === "general" && <GeneralTab />}
          {tab === "api_keys" && <ApiKeysTab />}
          {tab === "integrations" && <IntegrationsTab />}
          {tab === "branding" && <BrandingTab />}
          {tab === "security" && <SecurityTab />}
          {tab === "billing" && <BillingTab />}
        </div>
      </div>
    </div>
  )
}

// ============ General ============
function GeneralTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Organization profile</h2>
        <p className="text-xs text-muted-foreground mb-4">Visible to recipients and in the audit certificate.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Organization name" value="Acme Holdings Pvt. Ltd." />
          <Field label="Slug" value="acme-holdings" prefix="vaultsign.io/" />
          <Field label="Primary contact" value="Aisha Khan" />
          <Field label="Support email" value="support@acme-holdings.io" />
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" className="h-9">Cancel</Button>
          <Button size="sm" className="h-9">Save changes</Button>
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Default envelope settings</h2>
        <p className="text-xs text-muted-foreground mb-4">Applied to all new envelopes unless overridden.</p>
        <div className="space-y-3">
          <ToggleRow label="Watermark recipient email on every page" desc="Discourages document sharing" on />
          <ToggleRow label="Require email OTP to view document" desc="Adds recipient authentication" on />
          <ToggleRow label="Send reminders automatically" desc="Every 3 days until signed or expired" on />
          <ToggleRow label="Auto-void after expiration" desc="Voids envelopes 14 days after sending" />
          <ToggleRow label="Attach audit certificate on completion" desc="Tamper-evident PDF appended to signed doc" on />
        </div>
      </Card>
    </div>
  )
}

// ============ API Keys ============
function ApiKeysTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">API keys</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Programmatic access to the VaultSign REST API.</p>
          </div>
          <Button size="sm" className="h-9 gap-1.5">
            <Icons.plus className="size-4" />
            Generate key
          </Button>
        </div>
        <div className="space-y-2">
          {/* API keys are managed via the real API — show empty state for new orgs */}
          <div className="p-6 rounded-lg border border-dashed border-border text-center">
            <div className="size-10 mx-auto rounded-lg bg-secondary flex items-center justify-center mb-2">
              <Icons.key className="size-4 text-muted-foreground" />
            </div>
            <div className="text-sm font-medium">No API keys yet</div>
            <div className="text-xs text-muted-foreground mt-1">Generate an API key to access the VaultSign REST API programmatically.</div>
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Webhooks</h2>
        <p className="text-xs text-muted-foreground mb-4">Receive real-time events at your endpoint.</p>
        <div className="space-y-2">
          {[
            { url: "https://crm.acme.io/webhooks/vaultsign", events: ["envelope.completed", "envelope.declined"], status: "Active" },
            { url: "https://hooks.slack.com/services/T0/B0/...", events: ["envelope.sent", "envelope.signed"], status: "Active" },
          ].map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <Icons.webhook className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono truncate">{w.url}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  {w.events.map((e) => (
                    <code key={e} className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{e}</code>
                  ))}
                </div>
              </div>
              <Badge className="h-5 text-[10px] bg-emerald-500 hover:bg-emerald-500 text-white">{w.status}</Badge>
              <Button size="icon" variant="ghost" className="size-7"><Icons.more className="size-3.5" /></Button>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-9 mt-3 gap-1.5">
          <Icons.plus className="size-3.5" />
          Add webhook endpoint
        </Button>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-2">Quick start — REST API</h2>
        <p className="text-xs text-muted-foreground mb-3">Send an envelope in 3 lines.</p>
        <div className="bg-foreground text-background rounded-lg p-4 font-mono text-xs overflow-x-auto">
          <div><span className="text-background/60"># Send an envelope for e-signature</span></div>
          <div><span className="text-background/60">curl</span> -X POST \</div>
          <div className="pl-4">https://api.vaultsign.io/v1/envelopes \</div>
          <div className="pl-4">-H <span className="text-emerald-300">"Authorization: Bearer vsk_live_8a4f..."</span> \</div>
          <div className="pl-4">-H <span className="text-emerald-300">"Content-Type: application/json"</span> \</div>
          <div className="pl-4">-d <span className="text-emerald-300">'{"{"}</span></div>
          <div className="pl-8"><span className="text-emerald-300">"template_id"</span>: <span className="text-emerald-300">"tpl_offer_letter"</span>,</div>
          <div className="pl-8"><span className="text-emerald-300">"recipients"</span>: [{"{"} <span className="text-emerald-300">"email"</span>: <span className="text-emerald-300">"k.rao@example.com"</span> {"}"}],</div>
          <div className="pl-8"><span className="text-emerald-300">"merge_fields"</span>: {"{"} <span className="text-emerald-300">"salary"</span>: <span className="text-emerald-300">"₹24,00,000"</span> {"}"}</div>
          <div className="pl-4"><span className="text-emerald-300">{'}'}</span><span className="text-emerald-300">'</span></div>
        </div>
      </Card>
    </div>
  )
}

// ============ Integrations ============
function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Integrations</h2>
        <p className="text-xs text-muted-foreground mb-4">Connect VaultSign to your existing toolchain.</p>
        <div className="p-8 rounded-lg border border-dashed border-border text-center">
          <div className="size-12 mx-auto rounded-lg bg-secondary flex items-center justify-center mb-3">
            <Icons.plug className="size-5 text-muted-foreground" />
          </div>
          <div className="text-sm font-medium">No integrations connected</div>
          <div className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Connect Slack, HubSpot, Salesforce, Google Drive, and more to sync signed documents to your existing tools.
          </div>
          <Button size="sm" variant="outline" className="mt-4 h-8 text-xs gap-1.5">
            <Icons.plus className="size-3.5" />
            Browse integrations
          </Button>
        </div>
      </Card>
    </div>
  )
}

// ============ Branding ============
function BrandingTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Brand identity</h2>
        <p className="text-xs text-muted-foreground mb-4">Applied to the signing page, emails, and audit certificate.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-medium">Logo</Label>
            <div className="mt-1.5 h-24 rounded-lg border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-foreground/30 transition-colors">
              <Icons.upload className="size-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">PNG, SVG · max 2MB</span>
            </div>
          </div>
          <div>
            <Label className="text-xs font-medium">Brand colors</Label>
            <div className="mt-1.5 space-y-2">
              <ColorRow label="Primary" value="#1A1A1A" />
              <ColorRow label="Accent" value="#3B82F6" />
              <ColorRow label="Background" value="#FAFAF7" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Custom signing domain" value="sign.acme-holdings.io" prefix="https://" />
          <Field label="Sender display name" value="Acme Holdings · VaultSign" />
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Signing page preview</h2>
        <p className="text-xs text-muted-foreground mb-4">What recipients see when they open the signing link.</p>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="h-10 bg-foreground flex items-center px-4 gap-2">
            <div className="size-5 rounded bg-background/15 flex items-center justify-center">
              <Icons.shield className="size-3 text-background" />
            </div>
            <span className="text-xs font-medium text-background">Acme Holdings</span>
            <span className="text-[10px] text-background/60 ml-auto">Secured by <span className="font-semibold text-background">Vault</span><span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] via-[#818CF8] to-[#C084FC]">Sign</span></span>
          </div>
          <div className="p-6">
            <div className="text-sm font-semibold">Review & sign your document</div>
            <div className="text-xs text-muted-foreground mt-1">Offer Letter — Software Engineer II</div>
            <div className="mt-4 p-3 rounded-lg bg-secondary/40">
              <div className="text-xs text-muted-foreground">Please sign here</div>
              <div className="mt-2 h-12 rounded-md border-2 border-dashed border-foreground/40 flex items-center justify-center">
                <Icons.sign className="size-5 text-foreground/40" />
              </div>
            </div>
            <Button className="w-full mt-4 h-9 gap-1.5">
              <Icons.plus className="size-4" />
              Click to sign
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ============ Security ============
function SecurityTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Authentication</h2>
        <p className="text-xs text-muted-foreground mb-4">Protect access to your VaultSign workspace.</p>
        <div className="space-y-2">
          <ToggleRow label="Two-factor authentication (TOTP)" desc="Require time-based OTP at sign-in" on />
          <ToggleRow label="Enforce 2FA for all admins" desc="Org admins must enable 2FA within 7 days" on />
          <ToggleRow label="Single Sign-On (SAML 2.0)" desc="Connected to Okta · auto-provisioning on" on />
          <ToggleRow label="Session timeout" desc="Auto sign-out after 30 minutes inactivity" />
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Document security</h2>
        <p className="text-xs text-muted-foreground mb-4">Protect envelopes after they're sent.</p>
        <div className="space-y-2">
          <ToggleRow label="Tamper-evident audit trail" desc="SHA-256 hash chain on every event" on />
          <ToggleRow label="Dynamic watermarking" desc="Stamp recipient email + IP on every page" on />
          <ToggleRow label="Require recipient authentication" desc="Email OTP or SMS code to view" on />
          <ToggleRow label="Knowledge-based authentication (KBA)" desc="5 questions from credit header — for high-value docs" />
          <ToggleRow label="ID verification" desc="Upload gov ID + selfie match via Veriff" />
          <ToggleRow label="Document access recall" desc="Revoke recipient access even after sending" on />
        </div>
      </Card>

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

// ============ Billing ============
function BillingTab() {
  return (
    <div className="space-y-4">
      <Card className="p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">Enterprise plan</h2>
              <Badge className="h-5 text-[10px] bg-foreground hover:bg-foreground text-background">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Billed annually · renews March 14, 2027</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold tabular-nums">$2,400<span className="text-sm text-muted-foreground">/mo</span></div>
            <div className="text-[10px] text-muted-foreground">25 seats · unlimited envelopes</div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          {[
            { l: "Seats used", v: "12 / 25" },
            { l: "Envelopes (mo)", v: "1,043 / ∞" },
            { l: "API calls (mo)", v: "84,210" },
            { l: "Storage used", v: "12.4 / 250 GB" },
          ].map((m) => (
            <div key={m.l} className="p-3 rounded-lg bg-secondary/40">
              <div className="text-xs font-semibold tabular-nums">{m.v}</div>
              <div className="text-[10px] text-muted-foreground">{m.l}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5"><Icons.download className="size-3.5" />Download invoices</Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">Manage payment method</Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-600">Cancel subscription</Button>
        </div>
      </Card>

      <Card className="p-5 shadow-card">
        <h2 className="text-sm font-semibold mb-1">Recent invoices</h2>
        <p className="text-xs text-muted-foreground mb-3">All paid via Stripe.</p>
        <div className="divide-y divide-border">
          {[
            { id: "INV-2026-0914", date: "Sep 14, 2026", amount: "$2,400.00", status: "Paid" },
            { id: "INV-2026-0814", date: "Aug 14, 2026", amount: "$2,400.00", status: "Paid" },
            { id: "INV-2026-0714", date: "Jul 14, 2026", amount: "$2,400.00", status: "Paid" },
            { id: "INV-2026-0614", date: "Jun 14, 2026", amount: "$2,400.00", status: "Paid" },
          ].map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="size-8 rounded-md bg-secondary flex items-center justify-center">
                <Icons.documents className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{inv.id}</div>
                <div className="text-[11px] text-muted-foreground">{inv.date}</div>
              </div>
              <div className="text-sm font-medium tabular-nums">{inv.amount}</div>
              <Badge variant="secondary" className="h-5 text-[10px] bg-emerald-50 text-emerald-700">{inv.status}</Badge>
              <Button size="icon" variant="ghost" className="size-7"><Icons.download className="size-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// ============ Shared atoms ============
function Field({ label, value, prefix, readOnly }: { label: string; value: string; prefix?: string; readOnly?: boolean }) {
  return (
    <div>
      <Label className="text-xs font-medium">{label}</Label>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">{prefix}</span>
        )}
        <Input
          defaultValue={value}
          readOnly={readOnly}
          className={cn("h-9 bg-card", prefix && "pl-32", readOnly && "text-muted-foreground")}
        />
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, on }: { label: string; desc: string; on?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/40">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
      </div>
      <Switch defaultChecked={on} />
    </div>
  )
}

function ColorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/40">
      <div className="size-6 rounded-md border border-border" style={{ background: value }} />
      <span className="text-xs font-medium flex-1">{label}</span>
      <code className="text-[11px] font-mono text-muted-foreground">{value}</code>
    </div>
  )
}
