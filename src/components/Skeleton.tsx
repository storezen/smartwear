"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "text" | "circular" | "rectangular" | "card"
  width?: string
  height?: string
}

export function Skeleton({ className, variant = "rectangular", width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "rounded-md h-4",
        variant === "card" && "rounded-xl",
        variant === "rectangular" && "rounded-lg",
        className,
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
