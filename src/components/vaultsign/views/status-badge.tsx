import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    DRAFT: { label: "Draft", cls: "bg-secondary text-muted-foreground" },
    SENT: { label: "Sent", cls: "bg-blue-50 text-blue-700" },
    DELIVERED: { label: "Delivered", cls: "bg-blue-50 text-blue-700" },
    VIEWED: { label: "Viewed", cls: "bg-amber-50 text-amber-700" },
    SIGNED: { label: "Signed", cls: "bg-emerald-50 text-emerald-700" },
    COMPLETED: { label: "Completed", cls: "bg-emerald-50 text-emerald-700" },
    DECLINED: { label: "Declined", cls: "bg-rose-50 text-rose-700" },
    EXPIRED: { label: "Expired", cls: "bg-secondary text-muted-foreground" },
    VOIDED: { label: "Voided", cls: "bg-secondary text-muted-foreground" },
  }
  const s = map[status] ?? { label: status, cls: "bg-secondary" }
  return <Badge variant="secondary" className={cn("h-5 px-1.5 text-[10px] font-medium", s.cls)}>{s.label}</Badge>
}
