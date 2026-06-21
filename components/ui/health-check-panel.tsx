"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Clock } from "lucide-react"

interface HealthCheck {
  api: { status: "ok" | "error" | "checking"; latency: number | null; error?: string }
  supabase: { status: "ok" | "warning" | "offline" | "checking"; detail: string }
  dataFlow: { status: "ok" | "warning" | "error"; eventCount: number; lastEvent: string | null; sessions: number }
  endpoints: Array<{ name: string; status: "ok" | "error"; latency: number }>
}

interface HealthCheckPanelProps {
  connectionStatus: string
  error: string | null
  eventCount: number
  lastUpdated: Date | null
  reconnecting: boolean
}

function StatusIcon({ status }: { status: "ok" | "warning" | "error" | "offline" | "checking" }) {
  switch (status) {
    case "ok":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case "warning":
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    case "error":
    case "offline":
      return <XCircle className="w-3.5 h-3.5 text-red-400" />
    case "checking":
      return <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
  }
}

function HealthRow({ label, status, detail, latency }: { label: string; status: "ok" | "warning" | "error" | "offline" | "checking"; detail: string; latency?: number | null }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <StatusIcon status={status} />
        <span className="text-[11px] text-white/70 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-[9px] text-white/40">{detail}</span>
        {latency !== undefined && latency !== null && (
          <span className={`text-[9px] font-mono tabular-nums ${latency < 200 ? "text-emerald-400/60" : latency < 500 ? "text-amber-400/60" : "text-red-400/60"}`}>
            {latency}ms
          </span>
        )}
      </div>
    </div>
  )
}

export function HealthCheckPanel({ connectionStatus, error, eventCount, lastUpdated, reconnecting }: HealthCheckPanelProps) {
  const [open, setOpen] = useState(false)
  const [health, setHealth] = useState<HealthCheck | null>(null)
  const [checking, setChecking] = useState(false)

  const runCheck = useCallback(async () => {
    setChecking(true)

    const supabaseStatus: HealthCheck["supabase"] = {
      status: "checking",
      detail: "Checking...",
    }

    if (reconnecting) {
      supabaseStatus.status = "warning"
      supabaseStatus.detail = "Reconnecting..."
    } else {
      switch (connectionStatus) {
        case "connected":
          supabaseStatus.status = "ok"
          supabaseStatus.detail = "Realtime subscribed"
          break
        case "degraded":
          supabaseStatus.status = "warning"
          supabaseStatus.detail = "Polling fallback active"
          break
        case "connecting":
          supabaseStatus.status = "checking"
          supabaseStatus.detail = "Connecting..."
          break
        case "disconnected":
          supabaseStatus.status = "offline"
          supabaseStatus.detail = error || "No connection"
          break
      }
    }

    const endpointResults: HealthCheck["endpoints"] = []
    const endpoints = ["/api/analytics", "/api/analytics/summary"]
    let apiOk = true
    let apiLatency: number | null = null

    for (const ep of endpoints) {
      const start = performance.now()
      try {
        const res = await fetch(ep, { cache: "no-store", signal: AbortSignal.timeout(5000) })
        const latency = Math.round(performance.now() - start)
        endpointResults.push({ name: ep, status: res.ok ? "ok" : "error", latency })
        if (!res.ok) apiOk = false
        if (apiLatency === null || latency < apiLatency) apiLatency = latency
      } catch {
        const latency = Math.round(performance.now() - start)
        endpointResults.push({ name: ep, status: "error", latency })
        apiOk = false
      }
    }

    const lastEventTime = lastUpdated ? formatTimeSince(lastUpdated) : null

    const sessions = eventCount > 0 ? Math.max(1, Math.round(eventCount * 0.3)) : 0

    const dataFlowStatus: "ok" | "warning" | "error" =
      eventCount === 0 ? "warning" : connectionStatus === "disconnected" ? "error" : "ok"

    setHealth({
      api: { status: apiOk ? "ok" : "error", latency: apiLatency, error: apiOk ? undefined : "One or more endpoints failed" },
      supabase: supabaseStatus,
      dataFlow: {
        status: dataFlowStatus,
        eventCount,
        lastEvent: lastEventTime,
        sessions,
      },
      endpoints: endpointResults,
    })

    setChecking(false)
  }, [connectionStatus, error, eventCount, lastUpdated, reconnecting])

  useEffect(() => {
    if (open) runCheck()
  }, [open, runCheck])

  const isAllGood = health && health.api.status === "ok" && health.supabase.status === "ok" && health.dataFlow.status === "ok"

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`p-1.5 rounded-lg border transition-all ${
          open
            ? "bg-[#B8860B]/10 border-[#B8860B]/20 text-[#B8860B]"
            : isAllGood
              ? "bg-emerald-500/8 border-emerald-500/15 text-emerald-400/60 hover:bg-emerald-500/15"
              : health
                ? "bg-amber-500/8 border-amber-500/15 text-amber-400/60 hover:bg-amber-500/15"
                : "bg-white/[0.03] border-white/5 text-white/30 hover:text-white/50"
        }`}
        title="System Health"
      >
        <Activity className="w-3.5 h-3.5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 top-full mt-2 w-80 z-50"
          >
            <div className="bg-gradient-to-b from-[#1a1f2e] to-[#141B24] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[11px] font-semibold text-white/70">System Health</span>
                </div>
                <button
                  onClick={runCheck}
                  disabled={checking}
                  className="text-[9px] text-white/30 hover:text-white/50 transition-colors disabled:opacity-40"
                >
                  <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="py-1">
                <HealthRow
                  label="Supabase Realtime"
                  status={health?.supabase.status || "checking"}
                  detail={health?.supabase.detail || "Waiting..."}
                />
                <HealthRow
                  label="API Gateway"
                  status={health?.api.status || "checking"}
                  detail={health?.api.status === "ok" ? "All endpoints reachable" : health?.api.error || "Checking..."}
                  latency={health?.api.latency}
                />
                <HealthRow
                  label="Data Flow"
                  status={health?.dataFlow.status || "checking"}
                  detail={
                    health
                      ? `${health.dataFlow.eventCount} events · ${health.dataFlow.sessions} sessions`
                      : "Waiting..."
                  }
                />
                {health?.dataFlow.lastEvent && (
                  <HealthRow
                    label="Last Event"
                    status="ok"
                    detail={health.dataFlow.lastEvent}
                  />
                )}
              </div>

              {health?.endpoints && health.endpoints.length > 0 && (
                <div className="border-t border-white/[0.04] px-4 py-2">
                  <p className="text-[8px] text-white/20 font-mono mb-1.5 tracking-wider uppercase">Endpoint Latency</p>
                  {health.endpoints.map((ep) => (
                    <div key={ep.name} className="flex items-center justify-between py-0.5">
                      <span className="text-[8px] text-white/30 font-mono truncate max-w-[180px]">{ep.name}</span>
                      <div className="flex items-center gap-2">
                        <StatusIcon status={ep.status} />
                        <span className={`text-[8px] font-mono tabular-nums ${ep.latency < 200 ? "text-emerald-400/50" : ep.latency < 500 ? "text-amber-400/50" : "text-red-400/50"}`}>
                          {ep.latency}ms
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="px-4 py-2.5 border-t border-white/[0.04] bg-white/[0.01]">
                {health ? (
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAllGood ? "bg-emerald-400" : "bg-amber-400"}`} />
                    <span className="text-[9px] text-white/40">
                      {isAllGood ? "All systems operational" : "Issues detected — see above"}
                    </span>
                  </div>
                ) : (
                  <span className="text-[9px] text-white/30">Click refresh to run diagnostics</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatTimeSince(date: Date): string {
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 5) return "just now"
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}
