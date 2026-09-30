"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase, fetchProfile, fetchOrg, type Profile, type Organization } from "./supabase-client"

export interface Session {
  user: { id: string; email: string } | null
  profile: Profile | null
  org: Organization | null
  loading: boolean
}

export function useSession(): Session & { refresh: () => Promise<void> } {
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfileAndOrg = useCallback(async (userId: string) => {
    const p = await fetchProfile(userId)
    setProfile(p)
    if (p?.org_id) {
      const o = await fetchOrg(p.org_id)
      setOrg(o)
    } else {
      setOrg(null)
    }
  }, [])

  // Initial session load — runs once on mount
  useEffect(() => {
    let mounted = true

    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email ?? "" })
        await loadProfileAndOrg(session.user.id)
      }
      if (mounted) setLoading(false)
    }

    init()

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email ?? "" })
        await loadProfileAndOrg(session.user.id)
      } else {
        setAuthUser(null)
        setProfile(null)
        setOrg(null)
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [loadProfileAndOrg])

  const refresh = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setAuthUser({ id: session.user.id, email: session.user.email ?? "" })
      await loadProfileAndOrg(session.user.id)
    } else {
      setAuthUser(null)
      setProfile(null)
      setOrg(null)
    }
    setLoading(false)
  }, [loadProfileAndOrg])

  return {
    user: authUser,
    profile,
    org,
    loading,
    refresh,
  }
}

// Helper: extract email domain
export function getEmailDomain(email: string): string {
  return email.split("@")[1]?.toLowerCase() ?? ""
}

// Helper: check if email is a "work" email (not a free provider)
const FREE_EMAIL_PROVIDERS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com",
  "icloud.com", "aol.com", "protonmail.com", "proton.me", "zoho.com",
  "mail.com", "yandex.com", "gmx.com", "msn.com", "me.com",
])

export function isWorkEmail(email: string): boolean {
  const domain = getEmailDomain(email)
  return !FREE_EMAIL_PROVIDERS.has(domain)
}
