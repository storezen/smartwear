"use client"

import type { Spec } from "@/lib/products"
import { cn } from "@/lib/utils"

interface ProductSpecificationsProps {
  specs: Spec[]
  className?: string
}

export function ProductSpecifications({ specs, className }: ProductSpecificationsProps) {
  if (!specs || specs.length === 0) return null

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <h3 className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">
          Specifications
        </h3>
        <div className="h-px w-8 bg-accent/40" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {specs.map((spec, i) => (
          <div
            key={`${spec.label}-${i}`}
            className="flex items-baseline gap-2 rounded-lg border border-border/50 bg-card/50 px-4 py-2.5 transition-colors hover:border-border/80"
          >
            <span className="text-xs font-medium text-muted-foreground shrink-0 min-w-[100px]">
              {spec.label}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {spec.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
