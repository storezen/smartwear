"use client"

import { useEffect } from "react"
import { initTikTokPixel, TikTokEvents } from "@/lib/tiktok-pixel"
import { usePathname } from "next/navigation"

export function TikTokPixelProvider({ pixelId }: { pixelId: string | null }) {
  const pathname = usePathname()

  useEffect(() => {
    if (pixelId) {
      initTikTokPixel(pixelId)
    }
  }, [pixelId])

  useEffect(() => {
    TikTokEvents.pageView()
  }, [pathname])

  return null
}
