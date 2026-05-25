"use client"

import { ShieldCheck, Truck, HandCoins } from "lucide-react"

interface TrustBannerProps {
  className?: string
}

export function TrustBanner({ className = "" }: TrustBannerProps) {
  const trustItems = [
    {
      icon: HandCoins,
      title: "Cash on Delivery",
      description: "Pay securely at your doorstep"
    },
    {
      icon: Truck,
      title: "Fast Nationwide Delivery",
      description: "Partnered with PostEx for speed"
    },
    {
      icon: ShieldCheck,
      title: "7-Day Checking Warranty",
      description: "100% Secure & guaranteed"
    }
  ]

  return (
    <div className={`w-full bg-[#FAFAFA] border-y border-[#E5E5E5] py-8 ${className}`}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]">
          {trustItems.map((item, idx) => {
            const Icon = item.icon
            return (
              <div 
                key={idx} 
                className="flex flex-col items-center text-center pt-6 md:pt-0 first:pt-0"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#0A0A0A]/5 text-[#0A0A0A]">
                  <Icon className="h-6 w-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-sm font-semibold tracking-tight text-[#0A0A0A]">
                  {item.title}
                </h3>
                <p className="text-sm text-[#0A0A0A]/60 font-medium">
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
