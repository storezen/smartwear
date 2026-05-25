"use client"

import { cn } from "@/lib/utils"

interface StockBadgeProps {
  quantity: number
  threshold?: number
  className?: string
}

export function StockBadge({ quantity, threshold = 5, className }: StockBadgeProps) {
  if (quantity === 0) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        Out of Stock
      </span>
    )
  }

  if (quantity <= threshold) {
    return (
      <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Low Stock — Only {quantity} left
      </span>
    )
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-success" />
      In Stock
    </span>
  )
}
