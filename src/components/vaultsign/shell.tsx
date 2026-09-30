"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Image from "next/image"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardView } from "./views/dashboard"
import { TemplatesView } from "./views/templates"
import { DocumentsView } from "./views/documents"
import { EditorView } from "./views/editor"
import { TrackingView } from "./views/tracking"
import { AnalyticsView } from "./views/analytics"
import { TeamView } from "./views/team"
import { SettingsView } from "./views/settings"
import { PlatformOrganizationsView } from "./views/platform-organizations"
import { PlatformApprovalsView } from "./views/platform-approvals"
import { PlatformSettingsView } from "./views/platform-settings"

// Only 2 roles: SUPERADMIN (platform) and ORG (customer)
type Role = "SUPERADMIN" | "ORG"
type ViewKey =
  // Customer views
  | "dashboard" | "templates" | "documents" | "editor" | "tracking" | "analytics" | "team" | "settings"
  // Platform views
  | "organizations" | "approvals" | "platform_settings"

const NAV: Record<Role, { key: ViewKey; label: string; icon: string }[]> = {
  SUPERADMIN: [
    { key: "organizations", label: "Organizations", icon: "building" },
    { key: "approvals", label: "Approvals", icon: "check" },
    { key: "platform_settings", label: "Platform Settings", icon: "shield" },
  ],
  ORG: [
    { key: "dashboard", label: "Dashboard", icon: "dashboard" },
    { key: "templates", label: "Templates", icon: "documents" },
    { key: "documents", label: "Documents", icon: "sign" },
    { key: "editor", label: "Editor", icon: "editor" },
    { key: "tracking", label: "Tracking", icon: "tracking" },
    { key: "analytics", label: "Analytics", icon: "analytics" },
    { key: "team", label: "Team", icon: "team" },
    { key: "settings", label: "Settings", icon: "settings" },
  ],
}

function defaultView(role: Role): ViewKey {
  return role === "SUPERADMIN" ? "organizations" : "dashboard"
}

export function AppShell() {
  const router = useRouter()
  const { data: session } = useSession()
  const role = (session?.user?.role as Role) ?? "ORG"
  const [view, setView] = useState<ViewKey>(defaultView(role))
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const nav = NAV[role] ?? NAV.ORG
  const effectiveView = nav.some((n) => n.key === view) ? view : defaultView(role)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.replace("/login")
  }

  const profile = {
    avatar: session?.user?.avatar ?? session?.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) ?? "??",
    name: session?.user?.name ?? "User",
    email: session?.user?.email ?? "",
    orgLabel: session?.user?.orgName ?? (role === "ORG" ? "Organization" : "VaultSign Platform"),
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex h-full items-center gap-3 px-4 lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen((s) => !s)} aria-label="Toggle navigation">
            <Icons.menu className="size-5" />
          </Button>

          <Image src="/vaultsign-logo.png" alt="VaultSign" width={80} height={36} priority className="h-7 w-auto object-contain" />

          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                placeholder="Search documents, templates, recipients..."
                className="h-8 w-full rounded-lg border border-transparent bg-secondary/60 pl-9 pr-3 text-sm focus:border-border focus:bg-card outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 md:hidden" />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 h-8 px-1.5 pr-2 rounded-lg hover:bg-accent/60 transition-colors">
                <Avatar className="size-6 rounded-md">
                  <AvatarFallback className="rounded-md bg-foreground text-background text-[11px] font-semibold">{profile.avatar}</AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-medium leading-none">{profile.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">{profile.orgLabel}</div>
                </div>
                <Icons.chevronDown className="size-3.5 text-muted-foreground hidden lg:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-0 shadow-popover">
              <div className="px-3 py-3 border-b border-border">
                <div className="text-sm font-medium truncate">{profile.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">{profile.email}</div>
                <div className="mt-2">
                  <Badge variant="outline" className="h-5 text-[10px] gap-1">
                    <Icons.shield className="size-2.5" />
                    {role === "SUPERADMIN" ? "SuperAdmin" : "Organization"}
                  </Badge>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-xs h-9 text-rose-600" onSelect={handleLogout}>
                <Icons.x className="size-3.5 mr-2" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-card">
          <SidebarContent role={role} nav={nav} view={effectiveView} setView={setView} profile={profile} />
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="relative w-64 max-w-[80vw] bg-card border-r border-border flex flex-col animate-fade-in">
              <SidebarContent role={role} nav={nav} view={effectiveView} setView={(v) => { setView(v); setSidebarOpen(false) }} profile={profile} mobile />
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          <div className="mx-auto max-w-[1400px] px-4 lg:px-8 py-6 lg:py-8 animate-fade-in">
            {renderView(effectiveView, role, setView)}
          </div>
        </main>
      </div>
    </div>
  )
}

function SidebarContent({ role, nav, view, setView, profile, mobile }: {
  role: Role
  nav: { key: ViewKey; label: string; icon: string }[]
  view: ViewKey
  setView: (v: ViewKey) => void
  profile: { avatar: string; name: string; orgLabel: string }
  mobile?: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {nav.map((item) => {
          const Icon = Icons[item.icon]
          const active = view === item.key
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 h-9 rounded-lg text-sm transition-colors mb-0.5",
                active ? "bg-foreground text-background font-medium" : "text-foreground/70 hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="size-7 rounded-md">
            <AvatarFallback className="rounded-md bg-foreground text-background text-[10px] font-semibold">{profile.avatar}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{profile.name}</div>
            <div className="text-[10px] text-muted-foreground truncate">{profile.orgLabel}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// View router — uses static imports (no require)
function renderView(view: ViewKey, role: Role, setView: (v: ViewKey) => void) {
  const props: any = {}
  if (view === "dashboard") props.onNavigate = setView
  if (view === "documents") props.onOpenTracking = () => setView("tracking")

  switch (view) {
    case "dashboard": return <DashboardView onNavigate={setView} />
    case "templates": return <TemplatesView />
    case "documents": return <DocumentsView onOpenTracking={() => setView("tracking")} />
    case "editor": return <EditorView />
    case "tracking": return <TrackingView />
    case "analytics": return <AnalyticsView />
    case "team": return <TeamView />
    case "settings": return <SettingsView />
    case "organizations": return <PlatformOrganizationsView />
    case "approvals": return <PlatformApprovalsView />
    case "platform_settings": return <PlatformSettingsView />
    default: return <div>View not found</div>
  }
}
