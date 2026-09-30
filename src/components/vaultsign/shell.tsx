"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Icons } from "./icons"
import { BrandMark } from "./brand-mark"
import { SendDocumentModal } from "./send-modal"
import { useAppStore } from "@/lib/store"
import { useSession } from "@/lib/use-session"
import { supabase } from "@/lib/supabase-client"
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
import { PlatformOrganizationsView } from "./views/platform-organizations"
import { PlatformSettingsView } from "./views/platform-settings"

export type Role = "SUPERADMIN" | "ORG_ADMIN" | "MANAGER" | "USER"
export type ViewKey =
  | "dashboard" | "templates" | "documents" | "editor"
  | "tracking" | "analytics" | "team" | "settings"
  | "platform_organizations" | "platform_settings"

interface NavItem {
  key: ViewKey
  label: string
  icon: string
  /** Which roles can see this nav item. Empty = all roles. */
  roles?: Role[]
  /** Section label in the sidebar */
  section: "workspace" | "platform" | "admin"
}

// Role-aware nav. Each role sees a different set of views.
const NAV_ITEMS: NavItem[] = [
  // Workspace — everyone
  { key: "dashboard", label: "Dashboard", icon: "dashboard", section: "workspace" },
  { key: "templates", label: "Templates", icon: "documents", section: "workspace" },
  { key: "documents", label: "Documents", icon: "sign", section: "workspace" },
  { key: "editor", label: "Editor", icon: "editor", section: "workspace", roles: ["SUPERADMIN", "ORG_ADMIN", "MANAGER", "USER"] },
  { key: "tracking", label: "Tracking", icon: "tracking", section: "workspace" },
  { key: "analytics", label: "Analytics", icon: "analytics", section: "workspace", roles: ["SUPERADMIN", "ORG_ADMIN", "MANAGER"] },

  // Org admin — manage their organization
  { key: "team", label: "Team", icon: "team", section: "admin", roles: ["SUPERADMIN", "ORG_ADMIN", "MANAGER"] },
  { key: "settings", label: "Settings", icon: "settings", section: "admin", roles: ["ORG_ADMIN"] },

  // Platform — superadmin only
  { key: "platform_organizations", label: "Organizations", icon: "building", section: "platform", roles: ["SUPERADMIN"] },
  { key: "platform_settings", label: "Platform Settings", icon: "shield", section: "platform", roles: ["SUPERADMIN"] },
]

const ROLE_PROFILES: Record<Role, { name: string; email: string; avatar: string; orgLabel: string; scope: string }> = {
  SUPERADMIN: { name: "Maya Krishnan", email: "maya@vaultsign.io", avatar: "MK", orgLabel: "VaultSign Platform", scope: "Platform-wide access" },
  ORG_ADMIN:  { name: "Aisha Khan", email: "aisha.k@vaultsign.io", avatar: "AK", orgLabel: "Acme Holdings", scope: "Organization admin" },
  MANAGER:    { name: "Priya Nair", email: "priya.n@vaultsign.io", avatar: "PN", orgLabel: "Acme · Legal Dept", scope: "Team manager" },
  USER:       { name: "Vikram Shah", email: "vikram.s@vaultsign.io", avatar: "VS", orgLabel: "Acme · Sales", scope: "Standard user" },
}

// Helper: nav items visible to a given role
function navForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role))
}

// Helper: when switching roles, land on a sensible default view
function defaultViewForRole(role: Role): ViewKey {
  if (role === "SUPERADMIN") return "platform_organizations"
  if (role === "ORG_ADMIN") return "dashboard"
  if (role === "MANAGER") return "dashboard"
  return "dashboard"
}

export function AppShell() {
  const router = useRouter()
  const { profile, org } = useSession()

  // Role comes from the Supabase profiles table
  const role: Role = profile?.role ?? "USER"
  const [view, setView] = useState<ViewKey>(defaultViewForRole(role))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const openSendModal = useAppStore((s) => s.openSendModal)

  // Derive display profile from Supabase session
  const profileDisplay = {
    avatar: profile?.avatar ?? "??",
    name: profile?.full_name ?? "User",
    email: profile?.email ?? "",
    orgLabel: org?.name ?? (profile?.account_type === "PERSONAL" ? "Personal account" : "—"),
    scope: role === "SUPERADMIN" ? "Platform-wide access"
      : role === "ORG_ADMIN" ? "Organization admin"
      : role === "MANAGER" ? "Team manager"
      : "Standard user",
  }

  const visibleNav = navForRole(role)

  // If the current view isn't available to the current role, fall back.
  const effectiveView: ViewKey = visibleNav.some((n) => n.key === view) ? view : defaultViewForRole(role)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace("/login")
  }

  const handleSetView = (v: ViewKey) => {
    // Guard: only allow views the role can access
    if (visibleNav.some((n) => n.key === v)) {
      setView(v)
    }
  }

  const renderView = () => {
    switch (effectiveView) {
      case "dashboard":  return <DashboardView role={role} onNavigate={handleSetView} />
      case "templates":  return <TemplatesView />
      case "documents":  return <DocumentsView onOpenTracking={() => handleSetView("tracking")} />
      case "editor":      return <EditorView />
      case "tracking":   return <TrackingView />
      case "analytics":   return <AnalyticsView />
      case "team":        return <TeamView />
      case "settings":    return <SettingsView role={role} />
      case "platform_organizations": return <PlatformOrganizationsView />
      case "platform_settings":       return <PlatformSettingsView />
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
            <Image
              src="/vaultsign-logo.png"
              alt="VaultSign"
              width={36}
              height={36}
              priority
              className="size-9 h-9 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <BrandMark size="md" showTagline />
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
            <Button
              size="sm"
              className="hidden sm:inline-flex h-9 gap-1.5"
              onClick={() => openSendModal()}
            >
              <Icons.plus className="size-4" />
              <span>New Document</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden h-9 w-9"
              onClick={() => openSendModal()}
              aria-label="New document"
            >
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

            {/* User menu — shows logged-in user + logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 h-9 pl-1.5 pr-2 rounded-lg hover:bg-accent/60 transition-colors">
                  <Avatar className="size-6.5 rounded-md">
                    <AvatarFallback className="rounded-md bg-foreground text-background text-[11px] font-semibold">
                      {profileDisplay.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-medium leading-none">{profileDisplay.name}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">{profileDisplay.orgLabel}</div>
                  </div>
                  <Icons.chevronDown className="size-3.5 text-muted-foreground hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0 shadow-popover">
                {/* Current user info */}
                <div className="px-3 py-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 rounded-md">
                      <AvatarFallback className="rounded-md bg-foreground text-background text-[11px] font-semibold">{profileDisplay.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{profileDisplay.name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{profileDisplay.email}</div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5">
                    <Badge variant="outline" className="h-5 text-[10px] gap-1">
                      <Icons.shield className="size-2.5" />
                      {role.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{profileDisplay.scope}</span>
                  </div>
                </div>
                <DropdownMenuItem className="cursor-pointer text-xs h-9" onSelect={(e) => e.preventDefault()}>
                  <Icons.user className="size-3.5 mr-2" /> Profile settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-xs h-9" onSelect={(e) => e.preventDefault()}>
                  <Icons.key className="size-3.5 mr-2" /> API keys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-xs h-9 text-rose-600" onSelect={handleLogout}>
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
          <SidebarContent role={role} view={effectiveView} setView={handleSetView} profile={profileDisplay} openSendModal={openSendModal} />
        </aside>

        {/* Sidebar — mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-72 max-w-[80vw] bg-card border-r border-border flex flex-col animate-fade-in">
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <Image
                    src="/vaultsign-logo.png"
                    alt="VaultSign"
                    width={28}
                    height={28}
                    className="size-7 h-7 w-auto object-contain"
                  />
                  <BrandMark size="sm" />
                </div>
                <Button size="icon" variant="ghost" className="size-8" onClick={() => setSidebarOpen(false)}>
                  <Icons.x className="size-4" />
                </Button>
              </div>
              <SidebarContent role={role} view={effectiveView} setView={(v) => { handleSetView(v); setSidebarOpen(false) }} profile={profileDisplay} mobile openSendModal={openSendModal} />
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

      {/* Global Send Document modal — opened from topbar, sidebar, templates, documents */}
      <SendDocumentModal />
    </div>
  )
}

function SidebarContent({
  role, view, setView, profile, mobile, openSendModal,
}: {
  role: Role
  view: ViewKey
  setView: (v: ViewKey) => void
  profile: { name: string; avatar: string; orgLabel: string; scope: string } | undefined
  mobile?: boolean
  openSendModal: () => void
}) {
  const visibleNav = navForRole(role)
  const sections: { key: NavItem["section"]; label: string }[] = [
    { key: "workspace", label: "Workspace" },
    { key: "admin", label: role === "SUPERADMIN" ? "Administration" : "Manage org" },
    { key: "platform", label: "Platform" },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* New document button — hidden for superadmin (they don't send docs) */}
      {role !== "SUPERADMIN" && (
        <div className="p-3">
          <Button className="w-full h-9 gap-2 shadow-card" onClick={() => openSendModal()}>
            <Icons.plus className="size-4" />
            New Document
          </Button>
        </div>
      )}
      {role === "SUPERADMIN" && (
        <div className="p-3">
          <div className="px-3 py-2.5 rounded-lg bg-secondary/60 border border-border flex items-center gap-2">
            <div className="size-7 rounded-md bg-foreground flex items-center justify-center">
              <Icons.shield className="size-3.5 text-background" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold">Superadmin mode</div>
              <div className="text-[10px] text-muted-foreground">Platform-wide access</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav — grouped by section, filtered by role */}
      <nav className="flex-1 px-2 pb-2 overflow-y-auto">
        {sections.map((section) => {
          const items = visibleNav.filter((n) => n.section === section.key)
          if (items.length === 0) return null
          return (
            <div key={section.key}>
              <div className="px-2 py-2 text-[11px] uppercase tracking-wide text-muted-foreground font-medium">{section.label}</div>
              {items.map((item) => {
                const Icon = Icons[item.icon]
                const active = view === item.key
                return (
                  <button
                    key={`${item.section}-${item.key}`}
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
                      <Badge variant="secondary" className={cn("ml-auto h-5 px-1.5 text-[10px]", active ? "bg-background/20 text-background" : "")}>
                        3
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
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
            <AvatarFallback className="rounded-md bg-foreground text-background text-xs font-semibold">{profileDisplay.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{profileDisplay.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{profileDisplay.orgLabel}</div>
          </div>
          <Button size="icon" variant="ghost" className="size-7">
            <Icons.settings className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
