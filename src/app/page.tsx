"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/vaultsign/shell"
import { useSession } from "@/lib/use-session"
import { Icons } from "@/components/vaultsign/icons"

export default function Home() {
  const router = useRouter()
  const { user, profile, loading } = useSession()

  // Redirect unauthenticated users to the right login page
  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace("/login")
      return
    }
    // If the user is a SUPERADMIN but doesn't have a profile with role set,
    // they may have signed up via /superadmin OTP but not been configured yet.
    // For now, just let them through — the shell will handle the fallback.
  }, [loading, user, router])

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icons.loader className="size-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {loading ? "Loading VaultSign…" : "Setting up your workspace…"}
          </span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
