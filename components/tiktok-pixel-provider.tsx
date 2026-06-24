"use client"

import { useEffect } from "react"
import { TikTokEvents } from "@/lib/tiktok-pixel"
import { usePathname } from "next/navigation"

export function TikTokPixelProvider({ pixelId }: { pixelId: string | null }) {
  const pathname = usePathname()

  useEffect(() => {
    TikTokEvents.pageView()
  }, [pathname])

  return null
}
