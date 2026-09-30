"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/vaultsign/shell"
import { useAuthStore } from "@/lib/auth-store"
import { Icons } from "@/components/vaultsign/icons"

export default function Home() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [hydrated, setHydrated] = useState(false)

  // Detect when Zustand persist store has hydrated from localStorage
  useEffect(() => {
    // Zustand persist hydrates synchronously on mount in the browser;
    // the microtask ensures it's applied before we check `user`.
    const t = setTimeout(() => setHydrated(true), 0)
    return () => clearTimeout(t)
  }, [])

  // Redirect to /login if unauthenticated (after hydration)
  useEffect(() => {
    if (hydrated && !user) {
      router.replace("/login")
    }
  }, [hydrated, user, router])

  // Show loader while hydrating or before user is confirmed
  if (!hydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icons.loader className="size-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading VaultSign…</span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
