import { useEffect, useRef, useState, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { AnalyticsEvent, parseEvent, LiveSummary } from "@/lib/analytics"

export type ConnectionStatus = "connecting" | "connected" | "degraded" | "disconnected"

interface UseRealtimeAnalyticsOptions {
  pollInterval?: number
}

interface UseRealtimeAnalyticsResult {
  events: AnalyticsEvent[]
  summary: LiveSummary | null
  loading: boolean
  status: ConnectionStatus
  error: string | null
  retry: () => void
  reconnecting: boolean
  lastUpdated: Date | null
}

export function useRealtimeAnalytics(
  { pollInterval = 3000 }: UseRealtimeAnalyticsOptions = {}
): UseRealtimeAnalyticsResult {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [summary, setSummary] = useState<LiveSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<ConnectionStatus>("connecting")
  const [error, setError] = useState<string | null>(null)
  const [reconnecting, setReconnecting] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const eventsRef = useRef<AnalyticsEvent[]>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const maxReconnectDelay = 30000
  const mountedRef = useRef(true)
  const statusRef = useRef<ConnectionStatus>(status)

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    eventsRef.current = events
  }, [events])

  const fetchData = useCallback(async () => {
    try {
      const [eventsRes, summaryRes] = await Promise.all([
        fetch(`/api/analytics?t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/analytics/summary?t=${Date.now()}`, { cache: "no-store" }),
      ])
      if (!eventsRes.ok || !summaryRes.ok) {
        setError("API returned an error")
        return false
      }
      const eventsData = await eventsRes.json()
      const summaryData = await summaryRes.json()
      if (Array.isArray(eventsData)) {
        setEvents(eventsData)
        eventsRef.current = eventsData
        setLoading(false)
      }
      if (summaryData) {
        setSummary(summaryData)
      }
      setLastUpdated(new Date())
      setError(null)
      return true
    } catch {
      setError("Network error — check your connection")
      return false
    }
  }, [])

  const subscribe = useCallback(() => {
    if (!isSupabaseConfigured()) {
      console.warn("[realtime-analytics] Supabase not configured — check env vars NEXT_PUBLIC_SUPABASE_URL / ANON_KEY")
      setStatus("disconnected")
      return null
    }

    setStatus("connecting")

    const channel = supabase!
      .channel("analytics-live", {
        config: {
          broadcast: { self: true },
          presence: { key: "" },
        },
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "analytics",
        },
        (payload: any) => {
          const parsed = parseEvent(payload.new)
          const updated = [parsed, ...eventsRef.current].slice(0, 500)
          eventsRef.current = updated
          setEvents(updated)
          setLastUpdated(new Date())
          setError(null)
          reconnectAttemptRef.current = 0
        }
      )
      .subscribe((socketStatus: string) => {
        if (!mountedRef.current) return

        switch (socketStatus) {
          case "SUBSCRIBED":
            setStatus("connected")
            setReconnecting(false)
            reconnectAttemptRef.current = 0
            break
          case "CHANNEL_ERROR":
            setStatus("degraded")
            setError("Realtime channel error — falling back to polling")
            break
          case "TIMED_OUT":
            setStatus("degraded")
            setError("Connection timed out")
            break
          case "CLOSED":
            setStatus("disconnected")
            setError("Connection closed")
            break
        }
      })

    return channel
  }, [])

  const startPolling = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    pollRef.current = setInterval(fetchData, pollInterval)
  }, [fetchData, pollInterval])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    reconnectAttemptRef.current = 0

    fetchData().catch(() => {})

    const channel = subscribe()

    if (channel) {
      const channelErrorTimeout = setTimeout(() => {
        if (mountedRef.current && statusRef.current !== "connected") {
          startPolling()
          setStatus("degraded")
        }
      }, 5000)

      return () => {
        mountedRef.current = false
        clearTimeout(channelErrorTimeout)
        supabase?.removeChannel(channel)
        stopPolling()
      }
    }

    startPolling()
    setStatus("disconnected")

    return () => {
      mountedRef.current = false
      stopPolling()
    }
  }, [])

  const retry = useCallback(async () => {
    setReconnecting(true)
    setError(null)
    stopPolling()

    const delay = Math.min(
      1000 * Math.pow(2, reconnectAttemptRef.current),
      maxReconnectDelay
    )
    reconnectAttemptRef.current++

    await new Promise((r) => setTimeout(r, delay))

    if (!mountedRef.current) return

    const ok = await fetchData()
    if (!mountedRef.current) return

    if (isSupabaseConfigured()) {
      supabase?.removeAllChannels()
      const newChannel = subscribe()
      if (newChannel) {
        const fallbackTimer = setTimeout(() => {
        if (mountedRef.current && statusRef.current !== "connected") {
            startPolling()
          }
        }, 5000)
        return () => clearTimeout(fallbackTimer)
      }
    }

    if (!ok) {
      startPolling()
      setStatus("disconnected")
    }
    setReconnecting(false)
  }, [fetchData, subscribe, startPolling, stopPolling])

  return {
    events,
    summary,
    loading,
    status,
    error,
    retry,
    reconnecting,
    lastUpdated,
  }
}
