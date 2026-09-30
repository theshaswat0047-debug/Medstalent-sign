// Auth.js v5 — simplified to 2 roles only
// SUPERADMIN: OTP login, controls the platform
// ORG: customer who uses the product

import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { getUserByEmail, fetchOrgById } from "./supabase-server"

export type Role = "SUPERADMIN" | "ORG"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    name: string
    role: string
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
      orgId: string | null
      orgName: string | null
      avatar: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    orgId?: string | null
    orgName?: string | null
    avatar?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email as string)
        if (!user || user.status === "disabled" || !user.password_hash) return null
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null
        let orgName: string | null = null
        if (user.org_id) {
          const org = await fetchOrgById(user.org_id)
          orgName = org?.name ?? null
        }
        return { id: user.id, email: user.email, name: user.full_name, role: user.role, orgId: user.org_id, orgName, avatar: user.avatar }
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
        if (Date.now() - parseInt(timestamp) > 2 * 60 * 1000) return null
        const user = await getUserByEmail(email)
        if (!user || user.status === "disabled") return null
        let orgName: string | null = null
        if (user.org_id) {
          const org = await fetchOrgById(user.org_id)
          orgName = org?.name ?? null
        }
        return { id: user.id, email: user.email, name: user.full_name, role: user.role, orgId: user.org_id, orgName, avatar: user.avatar }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.orgId = (user as any).orgId
        token.orgName = (user as any).orgName
        token.avatar = (user as any).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = token.role ?? "ORG"
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

      // Public routes
      if (["/login", "/signup", "/api/auth"].some((r) => pathname.startsWith(r))) return true

      // SuperAdmin OTP login page — customers redirected away
      if (pathname === "/superadmin") {
        if (isLoggedIn && role !== "SUPERADMIN") return Response.redirect(new URL("/", nextUrl))
        return true
      }

      // All other routes require login
      return isLoggedIn
    },
  },
  pages: { signIn: "/login" },
})
