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
import { SupabaseConfigWarning } from "@/components/vaultsign/supabase-config-warning"

type Step = "email" | "otp"

export default function SuperAdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      setLoading(false)

      if (!res.ok) {
        setError(data.error || "Failed to send OTP")
        return
      }

      setStep("otp")
      toast({
        title: "Verification code sent",
        description: `A 6-digit code was sent to ${email}. Check your inbox (and spam folder).`,
      })
    } catch {
      setLoading(false)
      setError("Network error. Please try again.")
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 1. Verify the OTP code via our API
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        setLoading(false)
        setError(verifyData.error || "Invalid OTP code")
        return
      }

      // 2. Sign in via Auth.js using the OTP token
      const result = await signIn("otp", {
        email,
        otpToken: verifyData.otpToken,
        redirect: false,
      })

      setLoading(false)

      if (result?.error) {
        setError("Failed to sign in. Please try again.")
        return
      }

      toast({ title: "Welcome back", description: "SuperAdmin authenticated via OTP" })
      router.replace("/")
      router.refresh()
    } catch {
      setLoading(false)
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left — brand panel (dark) */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-dotted opacity-10" style={{ filter: "invert(1)" }} />
        <div className="relative flex items-center gap-3">
          <Image src="/vaultsign-logo.png" alt="VaultSign" width={120} height={55} className="h-12 w-auto object-contain" />
        </div>
        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 text-xs font-medium">
            <Icons.shield className="size-3.5" />
            SuperAdmin Access
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">
            Platform control,
            <br />
            one code away.
          </h1>
          <p className="text-sm text-background/70 leading-relaxed">
            Enter your email and we'll send a one-time passcode. No password to remember —
            your email is your key to the platform.
          </p>
        </div>
        <div className="relative text-[11px] text-background/50">© 2026 VaultSign, Inc. · Secure. Sign. Done.</div>
      </div>

      {/* Right — OTP form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Image src="/vaultsign-logo.png" alt="VaultSign" width={96} height={44} className="h-9 w-auto object-contain" />
          </div>

          <SupabaseConfigWarning />

          {step === "email" && (
            <>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary text-[10px] font-medium mb-3">
                  <Icons.shield className="size-3" /> SUPERADMIN
                </div>
                <h2 className="text-xl font-semibold tracking-tight">Sign in with email OTP</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  No password needed. We'll send a 6-digit code to your email.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium">SuperAdmin email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@vaultsign.io"
                    className="mt-1.5 h-10"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <Icons.alert className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-rose-700">{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-10 gap-1.5" disabled={loading}>
                  {loading ? <Icons.loader className="size-4 animate-spin" /> : <Icons.mail className="size-4" />}
                  {loading ? "Sending code..." : "Send OTP code"}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[11px] text-muted-foreground mb-2">Not a SuperAdmin? Go to:</p>
                <div className="flex gap-3 text-xs">
                  <button onClick={() => router.push("/signup")} className="font-medium text-foreground hover:underline">Sign up</button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={() => router.push("/login")} className="font-medium text-foreground hover:underline">Customer login</button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={() => router.push("/organizationadmin")} className="font-medium text-foreground hover:underline">Org Admin (HQ)</button>
                </div>
              </div>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-6">
                <button
                  onClick={() => { setStep("email"); setOtp(""); setError("") }}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4"
                >
                  <Icons.arrowLeft className="size-3.5" />
                  Back
                </button>
                <h2 className="text-xl font-semibold tracking-tight">Enter verification code</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                    <Icons.alert className="size-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-rose-700">{error}</span>
                  </div>
                )}

                <Button type="submit" className="w-full h-10 gap-1.5" disabled={loading || otp.length !== 6}>
                  {loading ? <Icons.loader className="size-4 animate-spin" /> : <Icons.check2 className="size-4" />}
                  {loading ? "Verifying..." : "Verify & sign in"}
                </Button>
              </form>

              <button
                onClick={() => { setOtp(""); handleSendOtp(new Event("submit") as unknown as React.FormEvent) }}
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
