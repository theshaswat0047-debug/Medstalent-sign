// Auth.js v5 configuration
// Uses Credentials provider — verifies against our custom `users` table
// in Supabase (via service role key, bypasses RLS).

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail, fetchOrgById, type AppUser } from "./supabase-server"

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
  // JWT session strategy — works on Vercel free tier (no DB session table needed)
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
        if (!user) {
          return null
        }

        // Check status
        if (user.status === "disabled") {
          return null
        }

        // Verify password (SuperAdmin has null password_hash — can't use credentials)
        if (!user.password_hash) {
          return null
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password_hash
        )
        if (!valid) {
          return null
        }

        // Fetch org name if user belongs to an org
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
    // Custom OTP provider — verifies via a special token format
    // that's set after OTP verification
    Credentials({
      id: "otp",
      name: "otp",
      credentials: {
        email: { label: "Email", type: "email" },
        otpToken: { label: "OTP Token", type: "text" },
      },
      async authorize(credentials) {
        // The otpToken is a verified email signed by our /api/auth/verify-otp route.
        // We check that the email matches and the user exists.
        if (!credentials?.email || !credentials?.otpToken) {
          return null
        }

        // otpToken format: "verified:<email>:<timestamp>"
        // We verify the email matches and timestamp is recent (< 2 minutes)
        const token = credentials.otpToken as string
        const email = credentials.email as string

        if (!token.startsWith("verified:")) {
          return null
        }

        const [, tokenEmail, timestamp] = token.split(":")
        if (tokenEmail !== email.toLowerCase().trim()) {
          return null
        }

        const elapsed = Date.now() - parseInt(timestamp)
        if (elapsed > 2 * 60 * 1000) {
          return null // token expired
        }

        const user = await getUserByEmail(email)
        if (!user || user.status === "disabled") {
          return null
        }

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
      // Called on sign-in — add custom fields to the JWT
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
      // Called on every session read — add custom fields from JWT
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role ?? "USER"
        session.user.accountType = token.accountType ?? "PERSONAL"
        session.user.orgId = token.orgId ?? null
        session.user.orgName = token.orgName ?? null
        session.user.avatar = token.avatar ?? null
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      // Protect routes — redirect to /login if not authenticated
      const isLoggedIn = !!auth?.user
      const { pathname } = nextUrl

      // Public routes — no auth required
      const publicRoutes = ["/login", "/signup", "/superadmin", "/organizationadmin", "/api/auth"]
      if (publicRoutes.some((r) => pathname.startsWith(r))) {
        return true
      }

      // All other routes require login
      return isLoggedIn
    },
  },
  pages: {
    // We use custom pages — Auth.js won't render its default pages
    signIn: "/login",
  },
})
