"use client"

import { ShieldCheck, Banknote, PackageOpen, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductTrustBadgesProps {
  className?: string
}

export function ProductTrustBadges({ className }: ProductTrustBadgesProps) {
  const badges = [
    { icon: PackageOpen, label: "Open Parcel Policy" },
    { icon: Banknote, label: "Pehle Dekhein, Phir Paise Dein" },
    { icon: Truck, label: "Nationwide Free Delivery" },
    { icon: ShieldCheck, label: "100% Original Product" },
  ]

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-3", className)}>
      {badges.map((b) => (
        <div
          key={b.label}
          className="flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <b.icon className="h-4 w-4 shrink-0" />
          </div>
          <span className="text-xs font-bold text-neutral-700 leading-tight">{b.label}</span>
        </div>
      ))}
    </div>
  )
}
