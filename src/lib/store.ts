// Global app store — holds envelopes created at runtime so they show up
// in the Documents list and Tracking view. Persists to localStorage so
// a page refresh keeps your in-progress work.

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface DocumentItem {
  id: string
  name: string
  templateName: string
  category: string
  status: "DRAFT" | "SENT" | "DELIVERED" | "VIEWED" | "SIGNED" | "COMPLETED" | "DECLINED" | "EXPIRED" | "VOIDED"
  owner: string
  ownerAvatar: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  pageCount: number
  progress: number
  messageId?: string
  deliveryStatus?: "delivered" | "opened" | "clicked" | "bounced" | "blocked" | "queued"
  recipients: Array<{
    name: string
    email: string
    role: "SIGNER" | "CC" | "APPROVER" | "VIEWER"
    status: "PENDING" | "SENT" | "DELIVERED" | "VIEWED" | "SIGNED" | "DECLINED" | "BOUNCED"
    viewedAt?: string
    signedAt?: string
    ipAddress?: string
    geolocation?: string
    device?: string
  }>
  events: Array<{
    id: string
    type: string
    label: string
    description: string
    timestamp: string
    actor: string
    meta?: Record<string, string>
  }>
}

interface AppState {
  // All envelopes — starts EMPTY, user-created ones added at runtime
  envelopes: DocumentItem[]
  // The currently-selected envelope id (for Tracking detail)
  selectedEnvelopeId: string | null
  // Whether the "Send Document" modal is open
  sendModalOpen: boolean
  // The template preloaded into the modal (when "Use" is clicked)
  sendModalTemplate: { name: string; category: string; pages: number } | null

  // Actions
  openSendModal: (template?: { name: string; category: string; pages: number }) => void
  closeSendModal: () => void
  selectEnvelope: (id: string) => void
  createEnvelope: (input: {
    name: string
    templateName: string
    category: string
    recipientName: string
    recipientEmail: string
    message: string
    pageCount: number
  }) => string
}

function genId() {
  return `doc-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Start with empty list — no mock data
      envelopes: [],
      selectedEnvelopeId: null,
      sendModalOpen: false,
      sendModalTemplate: null,

      openSendModal: (template) =>
        set({ sendModalOpen: true, sendModalTemplate: template ?? null }),
      closeSendModal: () =>
        set({ sendModalOpen: false, sendModalTemplate: null }),
      selectEnvelope: (id) => set({ selectedEnvelopeId: id }),

      createEnvelope: (input) => {
        const id = genId()
        const now = new Date().toISOString()
        const expires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()

        const newDoc: DocumentItem = {
          id,
          name: input.name,
          templateName: input.templateName,
          category: input.category,
          status: "SENT",
          owner: "You",
          ownerAvatar: "YO",
          createdAt: now,
          updatedAt: now,
          expiresAt: expires,
          pageCount: input.pageCount,
          progress: 10,
          messageId: `msg_${id.slice(-6)}`,
          deliveryStatus: "queued",
          recipients: [
            {
              name: input.recipientName,
              email: input.recipientEmail,
              role: "SIGNER",
              status: "SENT",
            },
          ],
          events: [
            {
              id: `e-${Date.now()}-1`,
              type: "EMAIL_QUEUED",
              label: "Email queued",
              description: `Envelope queued for delivery to ${input.recipientEmail}`,
              timestamp: now,
              actor: "System",
              meta: { messageId: `msg_${id.slice(-6)}` },
            },
            {
              id: `e-${Date.now()}-2`,
              type: "EMAIL_SENT",
              label: "Email sent",
              description: `Email accepted for delivery`,
              timestamp: now,
              actor: "System",
              meta: { recipient: input.recipientEmail },
            },
          ],
        }

        set((state) => ({
          envelopes: [newDoc, ...state.envelopes],
          sendModalOpen: false,
          sendModalTemplate: null,
          selectedEnvelopeId: id,
        }))

        return id
      },
    }),
    {
      name: "vaultsign-store",
      // Only persist the envelopes, not the modal open state
      partialize: (state) => ({ envelopes: state.envelopes }),
    }
  )
)
