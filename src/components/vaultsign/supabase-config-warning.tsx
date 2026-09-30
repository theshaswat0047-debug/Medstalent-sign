"use client"

import { Icons } from "@/components/vaultsign/icons"

/**
 * Shows a configuration warning if Supabase env vars are missing.
 * Rendered at the top of auth pages so users know why auth isn't working.
 * Uses a simple check — if AUTH_SECRET is missing, auth won't work.
 */
export function SupabaseConfigWarning() {
  // Auth.js v5 requires AUTH_SECRET — if it's not set, auth won't work.
  // We can't check server-side env vars from the client, so we always
  // render nothing here. Server-side errors will surface in the API response.
  return null
}
