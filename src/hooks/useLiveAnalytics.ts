"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, usePathname } from "next/navigation"

export function useLiveAnalytics() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Generate or retrieve session ID
    let sessionId = localStorage.getItem("live_session_id")
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem("live_session_id", sessionId)
    }

    // Determine Source
    const sourceParam = searchParams.get("utm_source") || searchParams.get("source")
    const source = sourceParam ? sourceParam.toLowerCase() : "organic"

    // Determine current step based on pathname
    let currentStep = "Catalog"
    if (pathname.includes("/cart")) currentStep = "Cart"
    else if (pathname.includes("/checkout")) currentStep = "Checkout_Initiated"
    else if (pathname.includes("/track") || pathname.includes("/success")) currentStep = "Purchase_Complete"

    // Also try to get cart data if we are in checkout/cart
    const cartData = localStorage.getItem("cart-storage") // Assuming Zustand persist uses this key
    
    // Attempt to parse customer details if stored
    const customerInfo = localStorage.getItem("customer-info")
    let customerName = null
    let phone = null
    if (customerInfo) {
      try {
        const parsed = JSON.parse(customerInfo)
        customerName = parsed.name
        phone = parsed.phone
      } catch (e) {}
    }

    const sendPing = async () => {
      try {
        await fetch("/api/analytics/ping", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            source,
            currentStep,
            cartData: cartData ? JSON.parse(cartData) : null,
            customerName,
            phone
          }),
          // Keepalive ensures the request fires even if user is navigating away
          keepalive: true 
        })
      } catch (err) {
        console.error("Failed to send analytics ping", err)
      }
    }

    // Fire immediately on mount/route change
    sendPing()

    // Then interval every 30 seconds
    intervalRef.current = setInterval(sendPing, 30 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [pathname, searchParams])
}
