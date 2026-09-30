// Auth.js v5 configuration
// Uses Credentials provider — verifies against our custom `users` table
// in Supabase (via service role key, bypasses RLS).

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail, fetchOrgById } from "./supabase-server"

// ============================================================
// Role hierarchy
// ============================================================
// Platform staff (manage the platform, DON'T use the product):
//   SUPERADMIN — OTP login at /superadmin, full platform access
//   ORG_ADMIN  — password login at /organizationadmin, HQ deputy
//
// Customers (use the product, NEVER see platform):
//   ORG_OWNER    — created an org account, admin of their org
//   ORG_MEMBER   — invited by org owner
//   PERSONAL_USER — personal account, no org
// ============================================================

export type Role =
  | "SUPERADMIN"      // platform — OTP login
  | "ORG_ADMIN"       // platform — HQ deputy, password login
  | "ORG_OWNER"       // customer — created org account
  | "ORG_MEMBER"      // customer — invited by org owner
  | "PERSONAL_USER"   // customer — personal account

export const PLATFORM_ROLES: Role[] = ["SUPERADMIN", "ORG_ADMIN"]
export const CUSTOMER_ROLES: Role[] = ["ORG_OWNER", "ORG_MEMBER", "PERSONAL_USER"]

export function isPlatformRole(role: string | undefined | null): boolean {
  return !!role && (PLATFORM_ROLES as string[]).includes(role)
}

export function isCustomerRole(role: string | undefined | null): boolean {
  return !!role && (CUSTOMER_ROLES as string[]).includes(role)
}

// Extend the session/user types to include our custom fields
declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
    accountType: string
    orgId: string | null
    orgName: string | null
    avatar: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      accountType: string
      orgId: string | null
      orgName: string | null
      avatar: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    accountType?: string
    orgId?: string | null
    orgName?: string | null
    avatar?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await getUserByEmail(credentials.email as string)
        if (!user) return null
        if (user.status === "disabled") return null

        // Verify password (SuperAdmin has null password_hash — can't use credentials)
        if (!user.password_hash) return null

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )
        if (!valid) return null

        let orgName: string | null = null
        if (user.org_id) {
          const org = await fetchOrgById(user.org_id)
          orgName = org?.name ?? null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          accountType: user.account_type,
          orgId: user.org_id,
          orgName,
          avatar: user.avatar,
        }
      },
    }),
    Credentials({
      id: "otp",
      name: "otp",
      credentials: {
        email: { label: "Email", type: "email" },
        otpToken: { label: "OTP Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otpToken) return null

        const token = credentials.otpToken as string
        const email = credentials.email as string

        if (!token.startsWith("verified:")) return null

        const [, tokenEmail, timestamp] = token.split(":")
        if (tokenEmail !== email.toLowerCase().trim()) return null

        const elapsed = Date.now() - parseInt(timestamp)
        if (elapsed > 2 * 60 * 1000) return null

        const user = await getUserByEmail(email)
        if (!user || user.status === "disabled") return null

        let orgName: string | null = null
        if (user.org_id) {
          const org = await fetchOrgById(user.org_id)
          orgName = org?.name ?? null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.full_name,
          role: user.role,
          accountType: user.account_type,
          orgId: user.org_id,
          orgName,
          avatar: user.avatar,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.accountType = (user as any).accountType
        token.orgId = (user as any).orgId
        token.orgName = (user as any).orgName
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role ?? "PERSONAL_USER"
        session.user.accountType = token.accountType ?? "PERSONAL"
        session.user.orgId = token.orgId ?? null
        session.user.orgName = token.orgName ?? null
        session.user.avatar = token.avatar ?? null
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role
      const { pathname } = nextUrl

      // ── Public routes (no auth required) ──────────────────
      const publicRoutes = ["/login", "/signup", "/api/auth"]
      if (publicRoutes.some((r) => pathname.startsWith(r))) {
        return true
      }

      // ── SuperAdmin OTP login page ─────────────────────────
      // If already logged in as a customer, redirect away from /superadmin
      if (pathname === "/superadmin") {
        if (isLoggedIn && isCustomerRole(role)) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true // allow (not logged in, or platform staff)
      }

      // ── OrganizationAdmin HQ login page ───────────────────
      if (pathname === "/organizationadmin") {
        if (isLoggedIn && isCustomerRole(role)) {
          return Response.redirect(new URL("/", nextUrl))
        }
        return true
      }

      // ── All other routes require login ────────────────────
      if (!isLoggedIn) {
        return false // middleware will redirect to /login
      }

      // ── Role-based route protection ───────────────────────
      // Platform staff can access everything (they manage the platform)
      // Customers are blocked from platform-internal API routes
      if (isCustomerRole(role)) {
        const blockedApiRoutes = ["/api/platform/"]
        if (blockedApiRoutes.some((r) => pathname.startsWith(r))) {
          return false
        }
      }

      return true
    },
  },
  pages: {
    signIn: "/login",
  },
})
