"use client"

import { useState, useEffect } from "react"
import { Icons } from "../icons"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

type RoleFilter = "all" | "ORG_OWNER" | "ORG_MEMBER"

const ROLE_LABELS: Record<string, string> = {
  ORG_OWNER: "Org Owner",
  ORG_MEMBER: "Member",
  PERSONAL_USER: "Personal User",
}

interface Member {
  id: string
  name: string
  email: string
  avatar: string
  role: string
  status: string
  lastActive: string
}

export function TeamView() {
  const { toast } = useToast()
  const [filter, setFilter] = useState<RoleFilter>("all")
  const [query, setQuery] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/team")
        if (res.ok) {
          const data = await res.json()
          setMembers(data.members || [])
        }
      } catch {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = members.filter((m) => {
    if (filter !== "all" && m.role !== filter) return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
    }
    return true
  })

  const counts = {
    all: members.length,
    ORG_OWNER: members.filter((m) => m.role === "ORG_OWNER").length,
    ORG_MEMBER: members.filter((m) => m.role === "ORG_MEMBER").length,
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage members and roles in your organization.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9 gap-1.5"
            onClick={() => toast({ title: "Bulk import", description: "Upload a CSV to invite multiple members at once." })}>
            <Icons.upload className="size-3.5" />
            Bulk import
          </Button>
          <Button size="sm" className="h-9 gap-1.5"
            onClick={() => toast({ title: "Invite member", description: "Send an invitation email to join your organization." })}>
            <Icons.plus className="size-4" />
            Invite member
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total members", value: members.length.toString(), sub: "in your org", icon: "users" as const },
          { label: "Active", value: members.filter((m) => m.status === "active").length.toString(), sub: "signed in recently", icon: "check2" as const },
          { label: "Owners", value: counts.ORG_OWNER.toString(), sub: "admin access", icon: "shield" as const },
          { label: "Members", value: counts.ORG_MEMBER.toString(), sub: "standard access", icon: "user" as const },
        ].map((k) => {
          const Icon = Icons[k.icon]
          return (
            <Card key={k.label} className="p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div className="size-7 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon className="size-3.5 text-foreground" />
                </div>
              </div>
              <div className="mt-2.5 text-xl font-semibold tabular-nums">{k.value}</div>
              <div className="text-xs text-muted-foreground">{k.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</div>
            </Card>
          )
        })}
      </div>

      {/* Search + tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {([
            { v: "all" as const, l: "All members", count: counts.all },
            { v: "ORG_OWNER" as const, l: "Owners", count: counts.ORG_OWNER },
            { v: "ORG_MEMBER" as const, l: "Members", count: counts.ORG_MEMBER },
          ]).map((t) => (
            <button key={t.v} onClick={() => setFilter(t.v)}
              className={cn("h-8 px-3 text-xs rounded-md font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                filter === t.v ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
              {t.l}
              <span className={cn("text-[10px] tabular-nums px-1.5 py-0.5 rounded",
                filter === t.v ? "bg-background/15" : "bg-secondary text-muted-foreground")}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search members..." value={query} onChange={(e) => setQuery(e.target.value)} className="h-9 pl-9 bg-card" />
        </div>
      </div>

      {/* Members table or empty state */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card">
          <div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center">
            <Icons.team className="size-5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-sm font-medium">
            {members.length === 0 ? "No team members yet" : "No members match this filter"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {members.length === 0 ? "Invite your first team member to collaborate on documents." : "Try a different filter or search."}
          </div>
          {members.length === 0 && (
            <Button size="sm" className="mt-4 h-9 gap-1.5"
              onClick={() => toast({ title: "Invite member", description: "Send an invitation email to join your organization." })}>
              <Icons.plus className="size-4" />
              Invite member
            </Button>
          )}
        </Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <div className="hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/40">
                  <th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Member</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Role</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th>
                  <th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Last active</th>
                  <th className="px-3 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-9 rounded-md">
                          <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{m.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{m.name}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><RoleBadge role={m.role} /></td>
                    <td className="px-3 py-3"><StatusPill status={m.status} /></td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{m.lastActive}</td>
                    <td className="px-3 py-3 text-right">
                      <Button size="icon" variant="ghost" className="size-7">
                        <Icons.more className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden divide-y divide-border">
            {filtered.map((m) => (
              <div key={m.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 rounded-md">
                    <AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{m.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{m.email}</div>
                  </div>
                  <Button size="icon" variant="ghost" className="size-7">
                    <Icons.more className="size-3.5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <RoleBadge role={m.role} />
                  <StatusPill status={m.status} />
                  <span className="text-[10px] text-muted-foreground ml-auto">{m.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Permissions matrix */}
      <Card className="p-5 shadow-card">
        <div className="mb-4">
          <h2 className="text-sm font-semibold">Role permission matrix</h2>
          <p className="text-xs text-muted-foreground mt-0.5">What each role can do in your organization</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium text-muted-foreground py-2 pr-4">Capability</th>
                <th className="font-medium text-muted-foreground px-2 py-2 text-center">Org Owner</th>
                <th className="font-medium text-muted-foreground px-2 py-2 text-center">Member</th>
                <th className="font-medium text-muted-foreground px-2 py-2 text-center">Personal User</th>
              </tr>
            </thead>
            <tbody>
              {[
                { cap: "View dashboard", perms: [true, true, true] },
                { cap: "Send documents", perms: [true, true, true] },
                { cap: "Create templates", perms: [true, false, false] },
                { cap: "View team documents", perms: [true, true, false] },
                { cap: "Manage team members", perms: [true, false, false] },
                { cap: "Configure branding", perms: [true, false, false] },
                { cap: "Manage billing", perms: [true, false, false] },
              ].map((row) => (
                <tr key={row.cap} className="border-b border-border last:border-0">
                  <td className="py-2 pr-4 font-medium">{row.cap}</td>
                  {row.perms.map((p, i) => (
                    <td key={i} className="text-center py-2">
                      {p ? (
                        <Icons.check className="size-3.5 text-emerald-600 inline" />
                      ) : (
                        <Icons.x className="size-3.5 text-muted-foreground/40 inline" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ORG_OWNER: "bg-foreground text-background",
    ORG_MEMBER: "bg-secondary text-foreground border border-border",
    PERSONAL_USER: "bg-secondary text-muted-foreground",
  }
  return <Badge variant="secondary" className={cn("h-5 px-1.5 text-[10px] font-medium", map[role] || "bg-secondary")}>{ROLE_LABELS[role] || role}</Badge>
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; dot: string }> = {
    active:   { label: "Active",   cls: "text-emerald-700 bg-emerald-50", dot: "bg-emerald-500" },
    disabled: { label: "Disabled", cls: "text-muted-foreground bg-secondary", dot: "bg-muted-foreground" },
    invited:  { label: "Invited",  cls: "text-amber-700 bg-amber-50",   dot: "bg-amber-500" },
  }
  const s = map[status] || map.active
  return (
    <span className={cn("inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-medium", s.cls)}>
      <span className={cn("size-1 rounded-full", s.dot)} />
      {s.label}
    </span>
  )
}
