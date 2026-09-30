// Global app store — holds envelopes created at runtime so they show up
// in the Documents list and Tracking view. Persists to localStorage so
// a page refresh keeps your in-progress work.

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DOCUMENTS } from "./mock-data"
import type { DocumentItem } from "./mock-data"

interface AppState {
  // All envelopes = seeded mock docs + user-created ones
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
      // Start with the seeded mock documents
      envelopes: DOCUMENTS,
      selectedEnvelopeId: DOCUMENTS[0]?.id ?? null,
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
          brevoMessageId: `msg_brevo_${id.slice(-6)}`,
          brevoStatus: "queued",
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
              description: `Envelope queued in Brevo for delivery to ${input.recipientEmail}`,
              timestamp: now,
              actor: "System",
              meta: { messageId: `msg_brevo_${id.slice(-6)}` },
            },
            {
              id: `e-${Date.now()}-2`,
              type: "EMAIL_SENT",
              label: "Email sent",
              description: `Brevo accepted the message for delivery`,
              timestamp: now,
              actor: "Brevo",
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
