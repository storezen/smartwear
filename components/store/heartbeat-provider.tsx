"use client"

import { useEffect, useRef } from "react"

function getSessionId(): string {
  const key = "sw_session_id"
  let id = localStorage.getItem(key)
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem(key, id)
  }
  return id
}

const HEARTBEAT_INTERVAL_MS = 12_000

async function sendHeartbeat(sessionId: string): Promise<void> {
  try {
    await fetch("/api/analytics/heartbeat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
      cache: "no-store",
    })
  } catch {
    // silent — don't break the page for a heartbeat failure
  }
}

function sendBeaconHeartbeat(sessionId: string): void {
  const blob = new Blob(
    [JSON.stringify({ sessionId })],
    { type: "application/json" }
  )
  navigator.sendBeacon("/api/analytics/heartbeat", blob)
}

export function HeartbeatProvider({ children }: { children: React.ReactNode }) {
  const sessionIdRef = useRef<string>("")

  useEffect(() => {
    const sessionId = getSessionId()
    sessionIdRef.current = sessionId

    sendHeartbeat(sessionId)

    const interval = setInterval(() => {
      sendHeartbeat(sessionId)
    }, HEARTBEAT_INTERVAL_MS)

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat(sessionId)
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    const onBeforeUnload = () => {
      sendBeaconHeartbeat(sessionId)
    }
    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibilityChange)
      window.removeEventListener("beforeunload", onBeforeUnload)
      sendBeaconHeartbeat(sessionId)
    }
  }, [])

  return <>{children}</>
}
