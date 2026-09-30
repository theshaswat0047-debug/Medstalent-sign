"use client"

import { useState } from "react"
import { Icons } from "./icons"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { TEMPLATES } from "@/lib/template-data"
import { useToast } from "@/hooks/use-toast"

interface Step {
  key: "details" | "recipient" | "review"
  label: string
}

const STEPS: Step[] = [
  { key: "details", label: "Document" },
  { key: "recipient", label: "Recipient" },
  { key: "review", label: "Review & send" },
]

type CreateEnvelopeInput = Parameters<ReturnType<typeof useAppStore.getState>["createEnvelope"]>[0]
type TemplatePrefill = { name: string; category: string; pages: number }

export function SendDocumentModal() {
  const sendModalOpen = useAppStore((s) => s.sendModalOpen)
  const closeSendModal = useAppStore((s) => s.closeSendModal)
  const sendModalTemplate = useAppStore((s) => s.sendModalTemplate)
  const createEnvelope = useAppStore((s) => s.createEnvelope)

  // Remount the inner form every time the modal opens or the preselected
  // template changes, so the form state resets cleanly without needing
  // a setState-in-effect.
  const remountKey = `${sendModalOpen ? "open" : "closed"}:${sendModalTemplate?.name ?? "blank"}`

  return (
    <Dialog open={sendModalOpen} onOpenChange={(o) => !o && closeSendModal()}>
      <DialogContent className="max-w-lg p-0 gap-0 shadow-popover max-h-[90vh] overflow-hidden flex flex-col">
        {sendModalOpen && (
          <SendFormBody
            key={remountKey}
            template={sendModalTemplate}
            createEnvelope={createEnvelope}
            onClose={closeSendModal}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SendFormBody({
  template,
  createEnvelope,
  onClose,
}: {
  template: TemplatePrefill | null
  createEnvelope: (input: CreateEnvelopeInput) => string
  onClose: () => void
}) {
  const { toast } = useToast()
  const [step, setStep] = useState<Step["key"]>("details")
  const [name, setName] = useState(template?.name ?? "")
  const [templateName, setTemplateName] = useState(template?.name ?? "Blank document")
  const [category, setCategory] = useState(template?.category ?? "Legal")
  const [pageCount, setPageCount] = useState(template?.pages ?? 1)
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")
  const [message, setMessage] = useState(
    "Please review and sign the attached document at your earliest convenience."
  )
  const [sending, setSending] = useState(false)

  const canProceedDetails = name.trim().length > 0
  const canProceedRecipient =
    recipientName.trim().length > 0 && /\S+@\S+\.\S+/.test(recipientEmail)

  const handleSend = () => {
    if (!canProceedDetails || !canProceedRecipient) return
    setSending(true)
    // Simulate email dispatch + processing
    setTimeout(() => {
      createEnvelope({
        name: name.trim(),
        templateName: templateName.trim() || "Custom document",
        category,
        recipientName: recipientName.trim(),
        recipientEmail: recipientEmail.trim(),
        message: message.trim(),
        pageCount,
      })
      setSending(false)
      toast({
        title: "Envelope sent",
        description: `${name} dispatched to ${recipientEmail} via email. Tracking is live.`,
      })
      onClose()
    }, 1100)
  }

  const stepIndex = STEPS.findIndex((s) => s.key === step)

  return (
    <>
      <DialogHeader className="px-5 pt-5 pb-3 border-b border-border shrink-0">
        <DialogTitle className="text-base flex items-center gap-2">
          <Icons.send className="size-4" />
          Send for signature
        </DialogTitle>
        <DialogDescription className="text-xs">
          Dispatch an envelope to a recipient. The email is delivered to the recipient; events flow into tracking in real time.
        </DialogDescription>
      </DialogHeader>

      {/* Stepper */}
      <div className="px-5 py-3 border-b border-border flex items-center gap-2 shrink-0">
        {STEPS.map((s, i) => {
          const active = step === s.key
          const done = STEPS.findIndex((x) => x.key === step) > i
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors",
                active ? "bg-foreground text-background" :
                done ? "bg-emerald-500 text-white" :
                "bg-secondary text-muted-foreground"
              )}>
                {done ? <Icons.check2 className="size-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-border mx-1" />}
            </div>
          )
        })}
      </div>

      {/* Body — step content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {step === "details" && (
          <>
            <div>
              <Label className="text-xs font-medium">Document name <span className="text-rose-500">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Vendor MSA — Acme Corp"
                className="mt-1.5 h-10"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Template</Label>
              <div className="mt-1.5 flex items-center gap-2 p-2.5 rounded-lg border border-border bg-secondary/40">
                <Icons.documents className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{templateName || "Custom document"}</div>
                  <div className="text-[10px] text-muted-foreground">{category} · {pageCount} pages</div>
                </div>
                <Badge variant="secondary" className="h-5 text-[10px]">Template</Badge>
              </div>
            </div>
            {/* Quick template picker */}
            <div>
              <Label className="text-xs font-medium">Quick switch</Label>
              <div className="mt-1.5 max-h-32 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                {TEMPLATES.slice(0, 6).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTemplateName(t.name)
                      setCategory(t.category)
                      setPageCount(t.pages)
                      if (!name.trim()) setName(t.name)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-accent/60 transition-colors",
                      templateName === t.name && "bg-accent/40"
                    )}
                  >
                    <Icons.documents className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-medium truncate flex-1">{t.name}</span>
                    <span className="text-[10px] text-muted-foreground">{t.category}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Pages</Label>
                <Input
                  type="number" min={1} max={50}
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, Math.min(50, Number(e.target.value) || 1)))}
                  className="mt-1.5 h-9"
                />
              </div>
              <div>
                <Label className="text-xs font-medium">Category</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 h-9" />
              </div>
            </div>
          </>
        )}

        {step === "recipient" && (
          <>
            <div>
              <Label className="text-xs font-medium">Recipient name <span className="text-rose-500">*</span></Label>
              <Input
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="mt-1.5 h-10"
                autoFocus
              />
            </div>
            <div>
              <Label className="text-xs font-medium">Recipient email <span className="text-rose-500">*</span></Label>
              <Input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="rahul.verma@example.com"
                className="mt-1.5 h-10"
              />
              {recipientEmail && !/\S+@\S+\.\S+/.test(recipientEmail) && (
                <p className="text-[11px] text-rose-500 mt-1">Please enter a valid email address.</p>
              )}
            </div>
            <div>
              <Label className="text-xs font-medium">Message to recipient</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a personal note..."
                className="mt-1.5 min-h-[80px] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">Authentication</div>
                <div className="text-xs font-medium mt-0.5">Email OTP</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/40">
                <div className="text-[11px] text-muted-foreground">Expires</div>
                <div className="text-xs font-medium mt-0.5">In 14 days</div>
              </div>
            </div>
          </>
        )}

        {step === "review" && (
          <>
            <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
              <ReviewRow icon="documents" label="Document" value={name || "Untitled"} />
              <ReviewRow icon="fileCheck" label="Template" value={`${templateName} · ${pageCount}p`} />
              <ReviewRow icon="users" label="Recipient" value={recipientName} />
              <ReviewRow icon="mail" label="Email" value={recipientEmail} />
              <ReviewRow icon="shield" label="Authentication" value="Email OTP · 14-day expiry" />
              <ReviewRow icon="send" label="Delivery" value="Transactional email" />
            </div>
            {message.trim() && (
              <div>
                <Label className="text-xs font-medium">Message</Label>
                <div className="mt-1.5 p-3 rounded-lg bg-secondary/40 text-xs text-muted-foreground italic">“{message}”</div>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <Icons.check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-emerald-800">
                On send, The email will be delivered and webhook events (delivered, opened, viewed, signed) will appear in the Tracking timeline automatically.
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer — nav */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between shrink-0">
        <div className="text-[11px] text-muted-foreground">
          Step {stepIndex + 1} of {STEPS.length}
        </div>
        <div className="flex items-center gap-2">
          {step !== "details" && (
            <Button variant="ghost" size="sm" className="h-9" onClick={() => {
              const prev = STEPS[Math.max(0, stepIndex - 1)]
              setStep(prev.key)
            }}>
              <Icons.arrowLeft className="size-3.5" />
              Back
            </Button>
          )}
          {step !== "review" ? (
            <Button
              size="sm" className="h-9 gap-1.5"
              disabled={step === "details" ? !canProceedDetails : !canProceedRecipient}
              onClick={() => {
                const next = STEPS[Math.min(STEPS.length - 1, stepIndex + 1)]
                setStep(next.key)
              }}
            >
              Continue
              <Icons.arrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              size="sm" className="h-9 gap-1.5"
              disabled={sending || !canProceedDetails || !canProceedRecipient}
              onClick={handleSend}
            >
              {sending ? <Icons.loader className="size-4 animate-spin" /> : <Icons.send className="size-4" />}
              {sending ? "Dispatching..." : "Send for signature"}
            </Button>
          )}
        </div>
      </div>
    </>
  )
}

function ReviewRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = Icons[icon as keyof typeof Icons] || Icons.dot
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <Icon className="size-3.5 text-muted-foreground shrink-0" />
      <span className="text-[11px] text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-xs font-medium truncate flex-1 text-right">{value}</span>
    </div>
  )
}
