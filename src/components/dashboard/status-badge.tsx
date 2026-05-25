import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-blue-50 text-blue-700 ring-blue-200",
  shipped: "bg-purple-50 text-purple-700 ring-purple-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-orange-50 text-orange-700 ring-orange-200",
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status.toLowerCase()] || "bg-secondary text-muted-foreground ring-border"
  return (
    <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", style, className)}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
