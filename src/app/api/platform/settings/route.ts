// GET /api/platform/settings — fetch current platform settings (SuperAdmin only)
// POST /api/platform/settings — save Brevo config + platform toggles (SuperAdmin only)
//
// Security: uses auth() to verify the caller is SUPERADMIN before allowing
// any read or write. The Brevo API key is never returned to the client —
// we return a masked version instead.

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPlatformSettings, savePlatformSettings } from "@/lib/supabase-server"

// GET — returns settings with API key masked
export async function GET() {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const settings = await getPlatformSettings()
  if (!settings) {
    return NextResponse.json({ error: "Settings not found. Run the SQL schema." }, { status: 500 })
  }

  // Mask the API key — only show first 8 + last 4 chars
  const maskKey = (key: string | null): string => {
    if (!key) return ""
    if (key.length <= 12) return "••••"
    return `${key.slice(0, 8)}••••••••${key.slice(-4)}`
  }

  return NextResponse.json({
    brevo_api_key_masked: maskKey(settings.brevo_api_key),
    brevo_api_key_set: Boolean(settings.brevo_api_key),
    brevo_sender_email: settings.brevo_sender_email || "",
    brevo_sender_name: settings.brevo_sender_name || "VaultSign",
    brevo_webhook_secret_masked: maskKey(settings.brevo_webhook_secret),
    brevo_webhook_secret_set: Boolean(settings.brevo_webhook_secret),
    brevo_smtp_host: settings.brevo_smtp_host || "",
    brevo_smtp_port: settings.brevo_smtp_port || 587,
    brevo_smtp_username: settings.brevo_smtp_username || "",
    brevo_smtp_password_set: Boolean(settings.brevo_smtp_password),
    maintenance_mode: settings.maintenance_mode,
    signups_enabled: settings.signups_enabled,
    enforce_2fa_admins: settings.enforce_2fa_admins,
  })
}

// POST — save settings (SuperAdmin only)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  try {
    const body = await req.json()

    // Build update object — only include fields that are present
    // and not the masked placeholder
    const update: Record<string, unknown> = {}

    // Brevo API key — only update if a real value is provided (not masked)
    if (body.brevo_api_key && !body.brevo_api_key.includes("••••")) {
      update.brevo_api_key = body.brevo_api_key
    }
    if (body.brevo_sender_email !== undefined) {
      update.brevo_sender_email = body.brevo_sender_email || null
    }
    if (body.brevo_sender_name !== undefined) {
      update.brevo_sender_name = body.brevo_sender_name || "VaultSign"
    }
    if (body.brevo_webhook_secret && !body.brevo_webhook_secret.includes("••••")) {
      update.brevo_webhook_secret = body.brevo_webhook_secret
    }
    if (body.brevo_smtp_host !== undefined) {
      update.brevo_smtp_host = body.brevo_smtp_host || null
    }
    if (body.brevo_smtp_port !== undefined) {
      update.brevo_smtp_port = Number(body.brevo_smtp_port) || 587
    }
    if (body.brevo_smtp_username !== undefined) {
      update.brevo_smtp_username = body.brevo_smtp_username || null
    }
    if (body.brevo_smtp_password && !body.brevo_smtp_password.includes("••••")) {
      update.brevo_smtp_password = body.brevo_smtp_password
    }

    // Platform toggles
    if (typeof body.maintenance_mode === "boolean") {
      update.maintenance_mode = body.maintenance_mode
    }
    if (typeof body.signups_enabled === "boolean") {
      update.signups_enabled = body.signups_enabled
    }
    if (typeof body.enforce_2fa_admins === "boolean") {
      update.enforce_2fa_admins = body.enforce_2fa_admins
    }

    const saved = await savePlatformSettings(update, session.user.id!)
    if (!saved) {
      return NextResponse.json({ error: "Failed to save settings" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Settings saved" })
  } catch (error) {
    console.error("platform settings save error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
