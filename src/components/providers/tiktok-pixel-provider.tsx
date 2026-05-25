"use client"

import { useEffect, useRef } from "react"
import { loadTikTokPixel, trackTikTokEvent, TikTokEvent } from "@/lib/integrations/tiktok-pixel"

export interface TikTokConfig {
  events: {
    PageView: boolean
    ViewContent: boolean
    AddToCart: boolean
    Purchase: boolean
    Search: boolean
  }
  advancedMatching: boolean
  currency: string
}

const DEFAULT_CONFIG: TikTokConfig = {
  events: { PageView: true, ViewContent: true, AddToCart: true, Purchase: true, Search: true },
  advancedMatching: false,
  currency: "PKR"
}

interface Props {
  children: React.ReactNode
  pixelId?: string
  enabled?: boolean
  config?: string
}

export function TikTokPixelProvider({ children, pixelId, enabled, config }: Props) {
  const isLoaded = useRef(false)
  const activeConfig = useRef<TikTokConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    if (config) {
      try {
        activeConfig.current = { ...DEFAULT_CONFIG, ...JSON.parse(config) }
      } catch (e) {
        console.error("Failed to parse TikTok config", e)
      }
    }
  }, [config])

  useEffect(() => {
    const id = pixelId || process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID
    if (id && enabled && !isLoaded.current) {
      loadTikTokPixel(id)
      isLoaded.current = true
      
      // Override track function globally to respect config
      const originalTrack = window.ttq?.track
      if (originalTrack && window.ttq) {
        window.ttq.track = (event: TikTokEvent, params?: any) => {
          const evtMap = activeConfig.current.events as Record<string, boolean>
          if (evtMap[event] !== false) { // True or undefined = track
            originalTrack(event, params)
          } else {
            console.log(`[TikTok Pixel] Blocked event: ${event}`)
          }
        }
      }

      if (activeConfig.current.events.PageView) {
        trackTikTokEvent("PageView")
      }
    }
  }, [pixelId, enabled])

  return <>{children}</>
}
