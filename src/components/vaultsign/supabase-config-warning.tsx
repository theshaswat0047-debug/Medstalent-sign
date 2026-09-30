"use client"

import { isSupabaseConfigured } from "@/lib/supabase-client"
import { Icons } from "@/components/vaultsign/icons"

/**
 * Shows a configuration warning if Supabase env vars are missing.
 * Rendered at the top of auth pages so users know why auth isn't working.
 */
export function SupabaseConfigWarning() {
  if (isSupabaseConfigured) return null

  return (
    <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
      <Icons.alert className="size-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="text-[11px] text-amber-800">
        <span className="font-semibold">Supabase not configured.</span>{" "}
        Add <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your
        Vercel environment variables to enable authentication.
      </div>
    </div>
  )
}
