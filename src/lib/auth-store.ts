// Auth store — holds the current user session in localStorage
// Demo-only: passwords are checked against a hardcoded credential table.
// In production this would call a real API endpoint.

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Role = "SUPERADMIN" | "ORG_ADMIN" | "MANAGER" | "USER"

export interface SessionUser {
  id: string
  email: string
  name: string
  avatar: string // initials
  role: Role
  orgLabel: string
  scope: string
  orgId?: string
}

interface AuthState {
  user: SessionUser | null
  // OTP state (transient — not persisted)
  pendingOtp: string | null
  pendingEmail: string | null
  pendingRole: Role | null
  // Actions
  setPendingOtp: (email: string, role: Role, otp: string) => void
  clearPendingOtp: () => void
  login: (user: SessionUser) => void
  logout: () => void
}

// Demo credential table. In production, this would be a DB lookup.
export const DEMO_CREDENTIALS: Record<string, { password: string; user: Omit<SessionUser, "id"> & { id: string } }> = {
  "maya@vaultsign.io": {
    password: "admin123",
    user: {
      id: "u-superadmin",
      email: "maya@vaultsign.io",
      name: "Maya Krishnan",
      avatar: "MK",
      role: "SUPERADMIN",
      orgLabel: "VaultSign Platform",
      scope: "Platform-wide access",
    },
  },
  "aisha.k@vaultsign.io": {
    password: "admin123",
    user: {
      id: "u-orgadmin",
      email: "aisha.k@vaultsign.io",
      name: "Aisha Khan",
      avatar: "AK",
      role: "ORG_ADMIN",
      orgLabel: "Acme Holdings",
      scope: "Organization admin",
      orgId: "acme-holdings",
    },
  },
  "priya.n@vaultsign.io": {
    password: "admin123",
    user: {
      id: "u-manager",
      email: "priya.n@vaultsign.io",
      name: "Priya Nair",
      avatar: "PN",
      role: "MANAGER",
      orgLabel: "Acme · Legal Dept",
      scope: "Team manager",
      orgId: "acme-holdings",
    },
  },
  "vikram.s@vaultsign.io": {
    password: "admin123",
    user: {
      id: "u-user",
      email: "vikram.s@vaultsign.io",
      name: "Vikram Shah",
      avatar: "VS",
      role: "USER",
      orgLabel: "Acme · Sales",
      scope: "Standard user",
      orgId: "acme-holdings",
    },
  },
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function validateCredentials(email: string, password: string): SessionUser | null {
  const entry = DEMO_CREDENTIALS[email.toLowerCase().trim()]
  if (!entry || entry.password !== password) return null
  return entry.user
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      pendingOtp: null,
      pendingEmail: null,
      pendingRole: null,

      setPendingOtp: (email, role, otp) =>
        set({ pendingOtp: otp, pendingEmail: email, pendingRole: role }),
      clearPendingOtp: () =>
        set({ pendingOtp: null, pendingEmail: null, pendingRole: null }),

      login: (user) => set({ user, pendingOtp: null, pendingEmail: null, pendingRole: null }),
      logout: () => set({ user: null }),
    }),
    {
      name: "vaultsign-auth",
      // Only persist the user session, not transient OTP state
      partialize: (state) => ({ user: state.user }),
    }
  )
)
