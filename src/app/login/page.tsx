"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Icons } from "@/components/vaultsign/icons"
import { BrandMark } from "@/components/vaultsign/brand-mark"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  useAuthStore,
  validateCredentials,
  generateOtp,
  type Role,
  type SessionUser,
} from "@/lib/auth-store"

type Step = "credentials" | "otp"

const ROLE_TABS: { role: Role; label: string; desc: string; icon: string }[] = [
  { role: "SUPERADMIN", label: "SuperAdmin", desc: "Platform-wide access", icon: "shield" },
  { role: "ORG_ADMIN", label: "Organization Admin", desc: "Manage your org", icon: "building" },
  { role: "USER", label: "User", desc: "Send & sign docs", icon: "user" },
]

const DEMO_ACCOUNTS = [
  { email: "maya@vaultsign.io", role: "SUPERADMIN" as Role, name: "Maya Krishnan" },
  { email: "aisha.k@vaultsign.io", role: "ORG_ADMIN" as Role, name: "Aisha Khan" },
  { email: "vikram.s@vaultsign.io", role: "USER" as Role, name: "Vikram Shah" },
]

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, login, setPendingOtp, clearPendingOtp, pendingOtp } = useAuthStore()

  const [role, setRole] = useState<Role>("SUPERADMIN")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<Step>("credentials")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // If already logged in, redirect to app
  useEffect(() => {
    if (user) {
      router.replace("/")
    }
  }, [user, router])

  const requiresOtp = role === "SUPERADMIN"

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const user = validateCredentials(email, password)
    if (!user) {
      setError("Invalid email or password. Try the demo accounts below.")
      return
    }

    if (user.role !== role) {
      setError(`This account is a ${user.role.replace("_", " ")}, not a ${role.replace("_", " ")}. Switch tabs.`)
      return
    }

    if (requiresOtp) {
      // Generate OTP and "send via Brevo"
      const code = generateOtp()
      setPendingOtp(email, role, code)
      setStep("otp")
      toast({
        title: "OTP sent via Brevo",
        description: `Demo OTP: ${code} (would be emailed to ${email})`,
      })
    } else {
      // No OTP needed — log in directly
      login(user)
      toast({
        title: `Welcome back, ${user.name.split(" ")[0]}`,
        description: `Signed in as ${user.role.replace("_", " ")}`,
      })
      router.replace("/")
    }
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    setTimeout(() => {
      if (otp !== pendingOtp) {
        setError("Invalid OTP code. Check the toast notification for the demo code.")
        setLoading(false)
        return
      }

      const user = validateCredentials(email, password)
      if (!user) {
        setError("Session expired. Please start over.")
        setStep("credentials")
        clearPendingOtp()
        setLoading(false)
        return
      }

      login(user)
      toast({
        title: `Welcome back, ${user.name.split(" ")[0]}`,
        description: "SuperAdmin authenticated via Email OTP",
      })
      router.replace("/")
      setLoading(false)
    }, 600)
  }

  const handleFillDemo = (demoEmail: string, demoRole: Role) => {
    setRole(demoRole)
    setEmail(demoEmail)
    setPassword("admin123")
    setError("")
  }

  const handleBack = () => {
    setStep("credentials")
    setOtp("")
    clearPendingOtp()
    setError("")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-secondary/40 border-r border-border relative overflow-hidden">
        {/* Subtle dotted backdrop */}
        <div className="absolute inset-0 bg-dotted opacity-40" />

        <div className="relative flex items-center gap-3">
          <Image
            src="/vaultsign-logo.png"
            alt="VaultSign"
            width={48}
            height={48}
            className="size-12 h-12 w-auto object-contain"
          />
          <BrandMark size="lg" showTagline />
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Enterprise e-signatures,
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#A855F7]">
              signed, sealed, tracked.
            </span>
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            VaultSign powers document signing for modern enterprises — 100+ templates,
            real-time Brevo tracking, tamper-evident audit trails, and SOC 2 / HIPAA / eIDAS compliance.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { icon: "shield", label: "SOC 2 Type II" },
              { icon: "lock", label: "AES-256 encrypted" },
              { icon: "check", label: "eIDAS compliant" },
              { icon: "zap", label: "99.97% uptime" },
            ].map((f) => {
              const Icon = Icons[f.icon as keyof typeof Icons]
              return (
                <div key={f.label} className="flex items-center gap-2 text-xs">
                  <Icon className="size-3.5 text-foreground" />
                  <span className="font-medium">{f.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative text-[11px] text-muted-foreground">
          © 2026 VaultSign, Inc. · Secure. Sign. Done.
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Image
              src="/vaultsign-logo.png"
              alt="VaultSign"
              width={36}
              height={36}
              className="size-9 h-9 w-auto object-contain"
            />
            <BrandMark size="md" showTagline />
          </div>

          {step === "credentials" && (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-tight">Sign in to VaultSign</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {requiresOtp
                    ? "SuperAdmin requires email OTP verification."
                    : "Enter your credentials to continue."}
                </p>
              </div>

              {/* Role tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-secondary/60 border border-border mb-6">
                {ROLE_TABS.map((tab) => {
                  const Icon = Icons[tab.icon as keyof typeof Icons]
                  const active = role === tab.role
                  return (
                    <button
                      key={tab.role}
                      onClick={() => {
                        setRole(tab.role)
                        setError("")
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1 py-2.5 rounded-md transition-all",
                        active
                          ? "bg-card shadow-card text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="text-[11px] font-medium leading-tight text-center">{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* OTP banner */}
              {requiresOtp && (
                <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Icons.mail className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-blue-800">
                    <span className="font-semibold">Two-step verification.</span> After entering your password,
                    a 6-digit code will be sent to your email via Brevo.
                  </div>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1.5 h-10"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 h-10"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <Icons.alert className="size-3.5 text-rose-600 shrink-0" />
                    <span className="text-[11px] text-rose-700">{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-10 gap-1.5">
                  {requiresOtp ? (
                    <>
                      <Icons.mail className="size-4" />
                      Continue to OTP
                    </>
                  ) : (
                    <>
                      Sign in
                      <Icons.arrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo accounts */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-1.5 mb-3">
                  <Icons.info className="size-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Demo accounts — click to fill</span>
                </div>
                <div className="space-y-1.5">
                  {DEMO_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.email}
                      onClick={() => handleFillDemo(acc.email, acc.role)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/60 transition-colors text-left border border-transparent hover:border-border"
                    >
                      <div className="size-7 rounded-md bg-secondary flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {acc.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">{acc.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{acc.email}</div>
                      </div>
                      <Badge variant="outline" className="h-5 text-[9px] shrink-0">{acc.role.replace("_", " ")}</Badge>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-center">
                  All demo passwords: <code className="font-mono bg-secondary px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
                >
                  <Icons.arrowLeft className="size-3.5" />
                  Back to login
                </button>
                <h2 className="text-xl font-semibold tracking-tight">Enter verification code</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <Icons.check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-emerald-800">
                  <span className="font-semibold">Brevo email dispatched.</span> The OTP has been queued for delivery.
                  <div className="mt-1 text-[10px]">Demo code: <code className="font-mono font-bold text-base">{pendingOtp}</code></div>
                </div>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="otp" className="text-xs font-medium">6-digit code</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="mt-1.5 h-12 text-center text-2xl font-mono tracking-[0.5em]"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <Icons.alert className="size-3.5 text-rose-600 shrink-0" />
                    <span className="text-[11px] text-rose-700">{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-10 gap-1.5" disabled={loading || otp.length !== 6}>
                  {loading ? <Icons.loader className="size-4 animate-spin" /> : <Icons.check2 className="size-4" />}
                  {loading ? "Verifying..." : "Verify & sign in"}
                </Button>
              </form>

              <button
                onClick={() => {
                  const code = generateOtp()
                  setPendingOtp(email, role, code)
                  setOtp("")
                  toast({ title: "New OTP sent", description: `Demo code: ${code}` })
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground mt-4"
              >
                Didn't receive it? Resend code
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
