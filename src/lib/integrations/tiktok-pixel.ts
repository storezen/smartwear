"use client"

export type TikTokEvent =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "RemoveFromCart"
  | "AddToWishlist"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "PlaceAnOrder"
  | "Purchase"
  | "Search"
  | "CompleteRegistration"
  | "Contact"
  | "Subscribe"
  | "StartTrial"
  | "SignUp"
  | "Download"

interface TikTokEventParams {
  contents?: { content_id: string; content_name?: string; quantity?: number; price?: number }[]
  content_type?: string
  content_id?: string
  content_name?: string
  category?: string
  currency?: string
  value?: number
  search_string?: string
  num_items?: number
  order_id?: string
  description?: string
  status?: string
  [key: string]: unknown
}

declare global {
  interface Window {
    __tiktokpixel?: unknown[]
    ttq?: {
      load: (pixelId: string) => void
      page: () => void
      track: (event: TikTokEvent, params?: TikTokEventParams) => void
      identify: (data: { email?: string; phone_number?: string }) => void
      instance: (pixelId: string) => {
        page: () => void
        track: (event: TikTokEvent, params?: TikTokEventParams) => void
        identify: (data: { email?: string; phone_number?: string }) => void
      }
    }
  }
}

export function loadTikTokPixel(pixelId: string) {
  if (typeof window === "undefined" || typeof window.ttq !== "undefined") return

  ;(function (w, d, t) {
    w.__tiktokpixel = w.__tiktokpixel || []
    const script = d.createElement("script")
    script.async = true
    script.src = "https://analytics.tiktok.com/i18n/pixel/events.js"
    const firstScript = d.getElementsByTagName(t)[0]
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript)
    }
  })(window, document, "script")

  const checkLoaded = setInterval(() => {
    if (typeof window.ttq !== "undefined") {
      window.ttq.load(pixelId)
      window.ttq.page()
      clearInterval(checkLoaded)
    }
  }, 200)

  setTimeout(() => clearInterval(checkLoaded), 10000)
}

export function trackTikTokEvent(event: TikTokEvent, params?: TikTokEventParams) {
  if (typeof window === "undefined" || typeof window.ttq === "undefined") return
  window.ttq.track(event, params)
}

export function identifyTikTokUser(data: { email?: string; phone_number?: string }) {
  if (typeof window === "undefined" || typeof window.ttq === "undefined") return
  window.ttq.identify(data)
}

export function trackServerEvent(
  pixelId: string,
  event: TikTokEvent,
  params?: TikTokEventParams
) {
  return fetch("/api/integrations/tiktok/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pixelId, event, params }),
  })
}
