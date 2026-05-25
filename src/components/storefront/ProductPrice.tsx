"use client"

import { cn } from "@/lib/utils"
import { formatPrice } from "@/lib/products"

interface ProductPriceProps {
  price: number
  compareAtPrice?: number
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ProductPrice({ price, compareAtPrice, size = "md", className }: ProductPriceProps) {
  const discount = compareAtPrice && compareAtPrice > price
    ? Math.round((1 - price / compareAtPrice) * 100)
    : 0

  const priceSize = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  }[size]

  const oldPriceSize = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
  }[size]

  return (
    <div className={cn(
      "flex flex-wrap items-baseline gap-2",
      size === "sm" ? "flex-row items-center" : "flex-col items-start",
      className
    )}>
      <span className={cn("font-bold text-foreground", priceSize)}>
        {formatPrice(price)}
      </span>
      {compareAtPrice && compareAtPrice > price && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-muted-foreground line-through", oldPriceSize)}>
            {formatPrice(compareAtPrice)}
          </span>
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600 border border-red-200">
            -{discount}%
          </span>
        </div>
      )}
    </div>
  )
}
