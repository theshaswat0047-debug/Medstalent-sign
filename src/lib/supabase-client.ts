// Supabase browser client — uses NEXT_PUBLIC_ env vars (safe to expose)
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured && process.env.NODE_ENV === "development") {
  console.warn(
    "⚠️  Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file (and Vercel env vars for production)."
  )
}

// Create the client even if env vars are missing — uses placeholder values
// so the build doesn't crash. Auth calls will fail gracefully at runtime
// and the UI will show a configuration error instead.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// Profile type — mirrors the public.profiles table
export interface Profile {
  id: string
  email: string
  full_name: string
  phone: string | null
  avatar: string | null
  role: "SUPERADMIN" | "ORG_ADMIN" | "MANAGER" | "USER" | "PERSONAL"
  account_type: "ORG" | "PERSONAL"
  org_id: string | null
  purpose: string | null
  location: string | null
  status: "active" | "disabled"
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  website: string | null
  location: string | null
  company_size: string | null
  domain: string
  status: "active" | "suspended" | "deleted"
  approval_status: "pending" | "approved" | "rejected"
  created_by: string | null
  created_at: string
  updated_at: string
}

// Fetch the profile for the currently authenticated user
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()
  if (error) {
    console.error("fetchProfile error:", error.message)
    return null
  }
  return data as Profile
}

// Fetch the org for a given org_id
export async function fetchOrg(orgId: string): Promise<Organization | null> {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", orgId)
    .single()
  if (error) return null
  return data as Organization
}
