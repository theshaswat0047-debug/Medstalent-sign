"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Image from "next/image"
import { Icons } from "@/components/vaultsign/icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { isWorkEmail } from "@/lib/signup-helpers"
import { SupabaseConfigWarning } from "@/components/vaultsign/supabase-config-warning"

type AccountType = "ORG" | "PERSONAL"
const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"]

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [accountType, setAccountType] = useState<AccountType>("ORG")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [location, setLocation] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [website, setWebsite] = useState("")
  const [companySize, setCompanySize] = useState("1-10")
  const [purpose, setPurpose] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (accountType === "ORG" && !isWorkEmail(email)) {
      setError("Organization accounts require a work email (not gmail, yahoo, etc.).")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountType,
          name, phone, email, password, location,
          companyName, website, companySize,
          purpose,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create account")
        setLoading(false)
        return
      }

      // Sign in immediately after signup
      const result = await signIn("credentials", {
        email, password, redirect: false,
      })

      setLoading(false)

      if (result?.error) {
        // Account created but auto-login failed — redirect to login
        toast({ title: "Account created!", description: "Please sign in with your credentials." })
        router.push("/login")
        return
      }

      toast({ title: "Account created!", description: accountType === "ORG" ? `${companyName} is active. You're the admin.` : "Your personal account is ready." })
      router.replace("/")
      router.refresh()
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
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
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Get started with
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#A855F7]">
              VaultSign
            </span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {accountType === "ORG"
              ? "Create an organization account to send, sign, and track documents with your team. Invite members with your company email domain."
              : "Create a personal account to send and sign documents. No team needed — just you and your contracts."}
          </p>
        </div>
        <div className="relative text-[11px] text-muted-foreground">© 2026 VaultSign, Inc. · Secure. Sign. Done.</div>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <Image src="/vaultsign-logo.png" alt="VaultSign" width={96} height={44} className="h-9 w-auto object-contain" />
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold tracking-tight">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">Choose your account type to get started.</p>
          </div>

          {/* Account type tabs */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-secondary/60 border border-border mb-6">
            {([
              { v: "ORG" as const, label: "Organization", icon: "building" },
              { v: "PERSONAL" as const, label: "Personal", icon: "user" },
            ]).map((tab) => {
              const Icon = Icons[tab.icon]
              const active = accountType === tab.v
              return (
                <button key={tab.v} onClick={() => { setAccountType(tab.v); setError("") }}
                  className={cn("flex items-center justify-center gap-2 py-2.5 rounded-md transition-all text-sm font-medium",
                    active ? "bg-card shadow-card text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <Icon className="size-4" />{tab.label}
                </button>
              )
            })}
          </div>

          <SupabaseConfigWarning />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs font-medium">Full name *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1.5 h-10" required autoFocus />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs font-medium">Phone number *</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className="mt-1.5 h-10" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs font-medium">
                Email {accountType === "ORG" && <span className="text-muted-foreground">(work email only)</span>} *
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={accountType === "ORG" ? "you@company.com" : "you@example.com"} className="mt-1.5 h-10" required />
              {accountType === "ORG" && email && !isWorkEmail(email) && (
                <p className="text-[11px] text-rose-500 mt-1">Organization accounts require a work email (not gmail, yahoo, etc.).</p>
              )}
            </div>
            <div>
              <Label htmlFor="password" className="text-xs font-medium">Password *</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" className="mt-1.5 h-10" required />
            </div>

            {accountType === "ORG" && (
              <>
                <div>
                  <Label htmlFor="company" className="text-xs font-medium">Company name *</Label>
                  <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Holdings Pvt. Ltd." className="mt-1.5 h-10" required />
                </div>
                <div>
                  <Label htmlFor="website" className="text-xs font-medium">Website</Label>
                  <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" className="mt-1.5 h-10" />
                </div>
                <div>
                  <Label htmlFor="size" className="text-xs font-medium">Company size</Label>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {COMPANY_SIZES.map((s) => (
                      <button key={s} type="button" onClick={() => setCompanySize(s)}
                        className={cn("px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
                          companySize === s ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {accountType === "PERSONAL" && (
              <div>
                <Label htmlFor="purpose" className="text-xs font-medium">Purpose *</Label>
                <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g. Freelance contracts, personal NDAs" className="mt-1.5 h-10" required />
              </div>
            )}

            <div>
              <Label htmlFor="location" className="text-xs font-medium">Location *</Label>
              <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="mt-1.5 h-10" required />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <Icons.alert className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-rose-700">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-10 gap-1.5" disabled={loading}>
              {loading ? <Icons.loader className="size-4 animate-spin" /> : <Icons.check2 className="size-4" />}
              {loading ? "Creating account..." : `Create ${accountType === "ORG" ? "organization" : "personal"} account`}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <span className="text-xs text-muted-foreground">Already have an account? </span>
            <button onClick={() => router.push("/login")} className="text-xs font-medium text-foreground hover:underline">Sign in</button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <button onClick={() => router.push("/superadmin")} className="hover:text-foreground flex items-center gap-1">
              <Icons.shield className="size-3" /> SuperAdmin
            </button>
            <span>·</span>
            <button onClick={() => router.push("/organizationadmin")} className="hover:text-foreground flex items-center gap-1">
              <Icons.building className="size-3" /> Org Admin (HQ)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
