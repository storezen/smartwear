"use client"

import { useEffect, useRef } from "react"
import { initTikTokPixel, TikTokEvents } from "@/lib/tiktok-pixel"
import { usePathname } from "next/navigation"

export function TikTokPixelProvider({ pixelId }: { pixelId: string | null }) {
  const pathname = usePathname()
  const initialized = useRef(false)

  useEffect(() => {
    if (!pixelId || initialized.current) return
    initTikTokPixel(pixelId)
    initialized.current = true
  }, [pixelId])

  useEffect(() => {
    TikTokEvents.pageView()
  }, [pathname])

  return null
}
