"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { AppShell } from "@/components/vaultsign/shell"
import { Icons } from "@/components/vaultsign/icons"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()

  // Redirect unauthenticated users to /login
  useEffect(() => {
    if (status === "loading") return
    if (status === "unauthenticated") {
      router.replace("/login")
    }
  }, [status, router])

  if (status === "loading" || status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Icons.loader className="size-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {status === "loading" ? "Loading VaultSign…" : "Redirecting to login…"}
          </span>
        </div>
      </div>
    )
  }

  return <AppShell />
}
