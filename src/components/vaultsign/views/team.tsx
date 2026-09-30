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

interface Member { id: string; name: string; email: string; avatar: string; role: string; status: string }

export function TeamView() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")

  useEffect(() => { fetch("/api/team").then(r => r.json()).then(d => setMembers(d.members || [])).catch(() => {}).finally(() => setLoading(false)) }, [])

  if (loading) return <div className="flex items-center justify-center py-20"><Icons.loader className="size-6 animate-spin text-muted-foreground" /></div>

  const filtered = members.filter(m => !query.trim() || m.name.toLowerCase().includes(query.toLowerCase()) || m.email.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Team</h1><p className="text-sm text-muted-foreground mt-1">Manage members in your organization.</p></div>
        <Button size="sm" className="h-9 gap-1.5" onClick={() => toast({ title: "Invite member", description: "Send an invitation email." })}><Icons.plus className="size-4" />Invite member</Button>
      </div>
      <div className="relative max-w-md"><Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" /><Input placeholder="Search members..." value={query} onChange={e => setQuery(e.target.value)} className="h-9 pl-9 bg-card" /></div>
      {filtered.length === 0 ? (
        <Card className="p-12 text-center shadow-card"><div className="size-12 mx-auto rounded-xl bg-secondary flex items-center justify-center"><Icons.team className="size-5 text-muted-foreground" /></div><div className="mt-3 text-sm font-medium">{members.length === 0 ? "No team members yet" : "No members found"}</div><div className="text-xs text-muted-foreground mt-1">{members.length === 0 ? "Invite your first team member." : "Try a different search."}</div>{members.length === 0 && <Button size="sm" className="mt-4 h-9 gap-1.5" onClick={() => toast({ title: "Invite member", description: "Send an invitation email." })}><Icons.plus className="size-4" />Invite member</Button>}</Card>
      ) : (
        <Card className="shadow-card overflow-hidden">
          <table className="w-full text-sm"><thead><tr className="border-b border-border bg-secondary/40"><th className="text-left font-medium text-xs text-muted-foreground px-4 py-2.5">Member</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Role</th><th className="text-left font-medium text-xs text-muted-foreground px-3 py-2.5">Status</th><th className="px-3 py-2.5"></th></tr></thead>
            <tbody>{filtered.map(m => <tr key={m.id} className="border-b border-border last:border-0 hover:bg-accent/30"><td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar className="size-9 rounded-md"><AvatarFallback className="rounded-md bg-secondary text-[11px] font-semibold">{m.avatar}</AvatarFallback></Avatar><div className="min-w-0"><div className="font-medium truncate">{m.name}</div><div className="text-[11px] text-muted-foreground truncate">{m.email}</div></div></div></td><td className="px-3 py-3"><Badge variant="secondary" className={cn("h-5 text-[10px]", m.role === "ORG" ? "bg-foreground text-background" : "bg-secondary")}>{m.role === "ORG" ? "Owner" : "Member"}</Badge></td><td className="px-3 py-3"><span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 h-5 rounded"><span className="size-1 rounded-full bg-emerald-500" />{m.status === "active" ? "Active" : "Invited"}</span></td><td className="px-3 py-3 text-right"><Button size="icon" variant="ghost" className="size-7"><Icons.more className="size-3.5" /></Button></td></tr>)}</tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
