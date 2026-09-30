// VaultSign brand wordmark — reusable component
// "Vault" = solid dark navy (#111827)
// "Sign"  = gradient cyan→blue (#3B82F6) to purple (#A855F7)
// Tagline "Secure. Sign. Done." below in lighter weight

import { cn } from "@/lib/utils"

interface BrandMarkProps {
  /** Size of the wordmark text */
  size?: "sm" | "md" | "lg"
  /** Show the "Secure. Sign. Done." tagline beneath */
  showTagline?: boolean
  /** Render "Sign" as solid color instead of gradient (for dark backgrounds) */
  onDark?: boolean
  className?: string
}

const sizeMap = {
  sm: { word: "text-sm", tag: "text-[9px]" },
  md: { word: "text-[15px]", tag: "text-[10px]" },
  lg: { word: "text-xl", tag: "text-xs" },
}

export function BrandMark({
  size = "md",
  showTagline = false,
  onDark = false,
  className,
}: BrandMarkProps) {
  const s = sizeMap[size]
  return (
    <div className={cn("leading-none", className)}>
      <div className={cn("font-bold tracking-tight leading-none", s.word)}>
        <span className={onDark ? "text-white" : "text-foreground"}>Vault</span>
        <span
          className={cn(
            "bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#A855F7]",
          )}
        >
          Sign
        </span>
      </div>
      {showTagline && (
        <div className={cn("mt-1 tracking-wide font-medium", s.tag, onDark ? "text-white/60" : "text-muted-foreground")}>
          Secure. Sign. Done.
        </div>
      )}
    </div>
  )
}

/**
 * Inline brand wordmark for use in body text / sentences.
 * Renders "VaultSign" with the gradient on "Sign".
 */
export function BrandInline({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold", className)}>
      <span className="text-foreground">Vault</span>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3B82F6] via-[#6366F1] to-[#A855F7]">
        Sign
      </span>
    </span>
  )
}
