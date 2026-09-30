// Server-side Supabase client — uses service role key, bypasses RLS.
// NEVER import this in client components. Only use in API routes, server
// components, and middleware.

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""

export const isSupabaseServerConfigured = Boolean(supabaseUrl && serviceRoleKey)

if (!isSupabaseServerConfigured && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  Supabase server not configured. Set SUPABASE_SERVICE_ROLE_KEY in your .env file."
  )
}

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)

// User type — mirrors the public.users table
export interface AppUser {
  id: string
  email: string
  password_hash: string | null
  full_name: string
  phone: string | null
  avatar: string | null
  role: "SUPERADMIN" | "ORG_ADMIN" | "ORG_OWNER" | "ORG_MEMBER" | "PERSONAL_USER"
  account_type: "ORG" | "PERSONAL"
  org_id: string | null
  purpose: string | null
  location: string | null
  status: "active" | "disabled"
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

// Fetch a user by email (server-side, bypasses RLS)
export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .single()
  if (error) return null
  return data as AppUser
}

// Fetch a user by id
export async function getUserById(id: string): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("id", id)
    .single()
  if (error) return null
  return data as AppUser
}

// Insert a new user (signup)
export async function createUser(input: {
  email: string
  password_hash: string | null
  full_name: string
  phone?: string
  role?: string
  account_type?: string
  org_id?: string | null
  purpose?: string
  location?: string
}): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      email: input.email.toLowerCase().trim(),
      password_hash: input.password_hash,
      full_name: input.full_name,
      phone: input.phone ?? null,
      role: input.role ?? "USER",
      account_type: input.account_type ?? "PERSONAL",
      org_id: input.org_id ?? null,
      purpose: input.purpose ?? null,
      location: input.location ?? null,
      status: "active",
      email_verified_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) {
    console.error("createUser error:", error.message)
    return null
  }
  return data as AppUser
}

// OTP code operations
export async function createOtpCode(email: string, codeHash: string): Promise<boolean> {
  const { error } = await supabaseAdmin.from("otp_codes").insert({
    email: email.toLowerCase().trim(),
    code_hash: codeHash,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    used: false,
    attempts: 0,
  })
  return !error
}

export async function getValidOtpCodes(email: string): Promise<Array<{ id: string; code_hash: string; expires_at: string; attempts: number }>> {
  const { data, error } = await supabaseAdmin
    .from("otp_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("email", email.toLowerCase().trim())
    .eq("used", false)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(3)
  if (error || !data) return []
  return data
}

export async function markOtpUsed(email: string): Promise<void> {
  await supabaseAdmin
    .from("otp_codes")
    .update({ used: true })
    .eq("email", email.toLowerCase().trim())
    .eq("used", false)
}

export async function incrementOtpAttempt(email: string): Promise<void> {
  await supabaseAdmin.rpc("increment_otp_attempts", { email_input: email.toLowerCase().trim() })
    .then(() => {})
    .catch(() => {}) // ignore if RPC doesn't exist yet
}

// Fetch the org for a given org_id (server-side)
export async function fetchOrgById(orgId: string) {
  const { data, error } = await supabaseAdmin
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single()
  if (error) return null
  return data
}

// ============================================================
// Platform Settings — Brevo config stored in DB (SuperAdmin-managed)
// ============================================================

export interface PlatformSettings {
  brevo_api_key: string | null
  brevo_sender_email: string | null
  brevo_sender_name: string | null
  brevo_webhook_secret: string | null
  brevo_smtp_host: string | null
  brevo_smtp_port: number | null
  brevo_smtp_username: string | null
  brevo_smtp_password: string | null
  maintenance_mode: boolean
  signups_enabled: boolean
  enforce_2fa_admins: boolean
}

// In-memory cache (60-second TTL) so we don't hit the DB on every OTP send
let settingsCache: { data: PlatformSettings | null; expires: number } | null = null
const CACHE_TTL = 60 * 1000 // 60 seconds

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  // Return cached value if fresh
  if (settingsCache && Date.now() < settingsCache.expires) {
    return settingsCache.data
  }

  const { data, error } = await supabaseAdmin
    .from("platform_settings")
    .select("*")
    .eq("id", 1)
    .single()

  if (error || !data) {
    settingsCache = { data: null, expires: Date.now() + CACHE_TTL }
    return null
  }

  settingsCache = { data: data as PlatformSettings, expires: Date.now() + CACHE_TTL }
  return data as PlatformSettings
}

// Force-refresh the cache (called after SuperAdmin saves new settings)
export function invalidateSettingsCache() {
  settingsCache = null
}

// Get the effective Brevo config — DB first, env var fallback
export async function getBrevoConfig(): Promise<{
  apiKey: string
  senderEmail: string
  senderName: string
}> {
  const settings = await getPlatformSettings()
  return {
    apiKey: settings?.brevo_api_key || process.env.BREVO_API_KEY || "",
    senderEmail: settings?.brevo_sender_email || process.env.BREVO_SENDER_EMAIL || "",
    senderName: settings?.brevo_sender_name || process.env.BREVO_SENDER_NAME || "VaultSign",
  }
}

// Save platform settings (SuperAdmin only — verify role before calling)
export async function savePlatformSettings(input: Partial<PlatformSettings>, updatedBy: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("platform_settings")
    .update({
      ...input,
      updated_by: updatedBy,
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1)

  if (error) {
    console.error("savePlatformSettings error:", error.message)
    return false
  }

  invalidateSettingsCache()
  return true
}
