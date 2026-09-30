"use client"

import { useState } from "react"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { DashboardView } from "./views/dashboard"
import { TemplatesView } from "./views/templates"
import { DocumentsView } from "./views/documents"
import { EditorView } from "./views/editor"
import { TrackingView } from "./views/tracking"
import { AnalyticsView } from "./views/analytics"
import { SettingsView } from "./views/settings"
import { TeamView } from "./views/team"

export type Role = "SUPERADMIN" | "ORG_ADMIN" | "MANAGER" | "USER"
export type ViewKey =
  | "dashboard" | "templates" | "documents" | "editor"
  | "tracking" | "analytics" | "team" | "settings"

interface NavItem {
  key: ViewKey
  label: string
  icon: string
  superadminOnly?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "dashboard" },
  { key: "templates", label: "Templates", icon: "documents" },
  { key: "documents", label: "Documents", icon: "sign" },
  { key: "editor", label: "Editor", icon: "editor" },
  { key: "tracking", label: "Tracking", icon: "tracking" },
  { key: "analytics", label: "Analytics", icon: "analytics" },
  { key: "team", label: "Team", icon: "team" },
  { key: "settings", label: "Settings", icon: "settings" },
]

const ROLE_PROFILES: Record<Role, { name: string; email: string; avatar: string; orgLabel: string; scope: string }> = {
  SUPERADMIN: { name: "Maya Krishnan", email: "maya@vaultsign.io", avatar: "MK", orgLabel: "Vaultsign Platform", scope: "Platform-wide access" },
  ORG_ADMIN:  { name: "Aisha Khan", email: "aisha.k@vaultsign.io", avatar: "AK", orgLabel: "Acme Holdings", scope: "Organization admin" },
  MANAGER:    { name: "Priya Nair", email: "priya.n@vaultsign.io", avatar: "PN", orgLabel: "Acme · Legal Dept", scope: "Team manager" },
  USER:       { name: "Vikram Shah", email: "vikram.s@vaultsign.io", avatar: "VS", orgLabel: "Acme · Sales", scope: "Standard user" },
}

export function AppShell() {
  const [role, setRole] = useState<Role>("SUPERADMIN")
  const [view, setView] = useState<ViewKey>("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const profile = ROLE_PROFILES[role]

  const renderView = () => {
    switch (view) {
      case "dashboard":  return <DashboardView role={role} onNavigate={setView} />
      case "templates":  return <TemplatesView />
      case "documents":  return <DocumentsView onOpenTracking={() => setView("tracking")} />
      case "editor":      return <EditorView />
      case "tracking":   return <TrackingView />
      case "analytics":   return <AnalyticsView />
      case "team":        return <TeamView />
      case "settings":    return <SettingsView role={role} />
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ============ Top Bar ============ */}
      <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 lg:px-6">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost" size="icon" className="lg:hidden"
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle navigation"
          >
            <Icons.menu className="size-5" />
          </Button>

          {/* Logo + brand */}
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-foreground flex items-center justify-center">
              <Icons.shield className="size-4.5 text-background" />
            </div>
            <div className="hidden sm:block">
              <div className="text-[15px] font-semibold tracking-tight leading-none">Vaultsign</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-none">Enterprise e-Signature</div>
            </div>
          </div>

          {/* Global search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full group">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search documents, templates, recipients..."
                className="h-9 pl-9 pr-16 bg-secondary/60 border-transparent focus-visible:border-border focus-visible:bg-card"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <Button size="sm" className="hidden sm:inline-flex h-9 gap-1.5">
              <Icons.plus className="size-4" />
              <span>New Document</span>
            </Button>
            <Button size="icon" variant="ghost" className="sm:hidden h-9 w-9">
              <Icons.plus className="size-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="relative h-9 w-9">
                  <Icons.bell className="size-4.5" />
                  <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-foreground animate-pulse-dot" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="px-4 py-3 border-b border-border">
                  <div className="text-sm font-semibold">Notifications</div>
                  <div className="text-xs text-muted-foreground">3 unread · today</div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[
                    { t: "Karthik Rao signed Offer Letter", s: "5 min ago", c: "text-emerald-600" },
                    { t: "Rahul Verma viewed Q4 Vendor MSA", s: "18 min ago", c: "text-foreground" },
                    { t: "Brevo delivered Lease — 4BHK Indiranagar", s: "3 hr ago", c: "text-muted-foreground" },
                    { t: "Globex AP declined Q3 Invoice", s: "Yesterday", c: "text-rose-600" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-2.5 hover:bg-accent/60 cursor-pointer border-b border-border/60 last:border-0">
                      <div className={cn("text-sm leading-snug", n.c)}>{n.t}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{n.s}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <Button variant="ghost" size="sm" className="w-full h-8 text-xs">View all activity</Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Role switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-accent/60 transition-colors">
                  <Avatar className="size-6.5 rounded-md">
                    <AvatarFallback className="rounded-md bg-foreground text-background text-[11px] font-semibold">
                      {profile.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-medium leading-none">{profile.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">{profile.orgLabel}</div>
                  </div>
                  <Icons.chevronDown className="size-3.5 text-muted-foreground hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0 shadow-popover">
                <div className="px-3 py-3 border-b border-border">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1">Switch role</div>
                  <div className="text-xs text-muted-foreground">Preview the app from each role's perspective</div>
                </div>
                {(Object.keys(ROLE_PROFILES) as Role[]).map((r) => {
                  const p = ROLE_PROFILES[r]
                  return (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => setRole(r)}
                      className={cn("flex items-start gap-2.5 px-3 py-2.5 cursor-pointer", role === r && "bg-accent/60")}
                    >
                      <Avatar className="size-8 rounded-md mt-0.5">
                        <AvatarFallback className="rounded-md bg-foreground text-background text-[11px] font-semibold">{p.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-medium truncate">{p.name}</span>
                          {role === r && <Icons.check2 className="size-3.5 text-foreground" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">{p.scope}</div>
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{p.orgLabel}</div>
                      </div>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator />
                <div className="px-3 py-2.5">
                  <div className="text-[11px] text-muted-foreground mb-1.5">Currently signed in as</div>
                  <div className="text-xs font-medium">{profile.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-xs h-9">
                  <Icons.user className="size-3.5 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs h-9">
                  <Icons.key className="size-3.5 mr-2" /> API keys
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs h-9 text-rose-600">
                  <Icons.x className="size-3.5 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ============ Body: sidebar + main ============ */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-border bg-card">
          <SidebarContent role={role} view={view} setView={setView} profile={profile} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-72 max-w-[80vw] bg-card border-r border-border flex flex-col animate-fade-in">
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-foreground flex items-center justify-center">
                    <Icons.shield className="size-4 text-background" />
                  </div>
                  <span className="font-semibold text-sm">Vaultsign</span>
                </div>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => setSidebarOpen(false)}>
                  <Icons.x className="size-4" />
                </Button>
              </div>
              <SidebarContent role={role} view={view} setView={(v) => { setView(v); setSidebarOpen(false) }} profile={profile} mobile />
            </aside>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-6 lg:py-8 animate-fade-in">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({
  role, view, setView, profile, mobile,
}: {
  role: Role
  view: ViewKey
  setView: (v: ViewKey) => void
  profile: { name: string; avatar: string; orgLabel: string; scope: string }
  mobile?: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      {/* New document button */}
      <div className="p-3">
        <Button className="w-full h-9 gap-2 shadow-card">
          <Icons.plus className="size-4" />
          New Document
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-2 overflow-y-auto">
        <div className="px-2 py-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Workspace</div>
        {NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon]
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-sm transition-colors mb-0.5",
                active
                  ? "bg-foreground text-background font-medium"
                  : "text-foreground/70 hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.key === "tracking" && (
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-[10px] bg-background/20 text-background">
                  3
                </Badge>
              )}
              {active && !mobile && (
                <span className="ml-auto lg:hidden">
                  <Icons.chevronRight className="size-3.5" />
                </span>
              )}
            </button>
          )
        })}

        {/* Status pill — Brevo health */}
        <div className="px-2 pt-4 pb-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Integrations</div>
        <div className="px-2 py-2 mx-1 rounded-lg bg-secondary/60 border border-border">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
            <span className="text-xs font-medium">Brevo connected</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5">Delivery · Tracking · Webhooks</div>
          <div className="mt-2 flex items-center gap-1">
            <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: "99%" }} />
            </div>
            <span className="text-[10px] text-muted-foreground">99.4%</span>
          </div>
        </div>
      </nav>

      {/* Bottom — plan + profile */}
      <div className="p-3 border-t border-border space-y-2">
        <div className="px-2 py-2.5 rounded-lg bg-secondary/60 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Icons.zap className="size-3.5 text-foreground" />
              <span className="text-xs font-medium">Enterprise plan</span>
            </div>
            <Badge variant="outline" className="h-5 text-[10px]">Active</Badge>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">1,043 / 1,284 envelopes this month</div>
          <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-foreground rounded-full" style={{ width: "81%" }} />
          </div>
        </div>

        <div className="flex items-center gap-2 px-1 pt-1">
          <Avatar className="size-8 rounded-md">
            <AvatarFallback className="rounded-md bg-foreground text-background text-xs font-semibold">{profile.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{profile.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{profile.orgLabel}</div>
          </div>
          <Button size="icon" variant="ghost" className="size-7">
            <Icons.settings className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
