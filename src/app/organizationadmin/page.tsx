"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { Icons } from "@/components/vaultsign/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { SupabaseConfigWarning } from "@/components/vaultsign/supabase-config-warning"

export default function OrganizationAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await signIn("credentials", {
      email, password, redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError("Invalid email or password.")
      return
    }

    toast({ title: "Welcome back", description: "Organization Admin signed in" })
    router.replace("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-secondary/40 border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-dotted opacity-40" />
        <div className="relative flex items-center gap-3">
          <Image src="/vaultsign-logo.png" alt="VaultSign" width={120} height={55} className="h-12 w-auto object-contain" />
        </div>
        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground text-background text-xs font-medium">
            <Icons.building className="size-3.5" /> HQ Organization Admin
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Manage the platform,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#A855F7]">
              with assigned duties.
            </span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign in with your VaultSign HQ credentials. Your duties — approvals, verifications,
            credits — are assigned by the SuperAdmin.
          </p>
        </div>
        <div className="relative text-[11px] text-muted-foreground">© 2026 VaultSign, Inc. · Secure. Sign. Done.</div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Image src="/vaultsign-logo.png" alt="VaultSign" width={96} height={44} className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-[10px] font-medium mb-3">
              <Icons.building className="size-3" /> HQ ORGANIZATION ADMIN
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground mt-1">Enter your HQ credentials.</p>
          </div>

          <SupabaseConfigWarning />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@vaultsign.io" className="mt-1.5 h-10" required autoFocus />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-medium">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-1.5 h-10" required />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <Icons.alert className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-rose-700">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-10 gap-1.5" disabled={loading}>
              {loading ? <Icons.loader className="size-4 animate-spin" /> : <Icons.arrowRight className="size-4" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">Not an HQ admin? </span>
            <button onClick={() => router.push("/signup")} className="text-xs font-medium text-foreground hover:underline">Sign up</button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <button onClick={() => router.push("/superadmin")} className="hover:text-foreground flex items-center gap-1">
              <Icons.shield className="size-3" /> SuperAdmin
            </button>
            <span>·</span>
            <button onClick={() => router.push("/login")} className="hover:text-foreground flex items-center gap-1">
              <Icons.user className="size-3" /> Customer login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
