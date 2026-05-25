"use client"

import { useEffect, useState, useRef } from "react"
import {
  Users, ShoppingCart, CreditCard, CheckCircle2,
  TrendingUp, Activity, Clock, Zap, MapPin,
  ArrowUpRight, ArrowDownRight, Eye, Minus
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Session {
  id: string
  source: string
  currentStep: string
  lastPingAt: string
}

interface Snapshot {
  count: number
  timestamp: number
}

const SOURCE_COLORS: Record<string, string> = {
  tiktok: "bg-[#010101] text-white",
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500 text-white",
  facebook: "bg-blue-600 text-white",
  google: "bg-emerald-600 text-white",
  organic: "bg-neutral-200 text-neutral-700",
  direct: "bg-neutral-200 text-neutral-700",
}

const SOURCE_DOT: Record<string, string> = {
  tiktok: "bg-[#010101]",
  instagram: "bg-pink-500",
  facebook: "bg-blue-500",
  google: "bg-emerald-500",
  organic: "bg-neutral-400",
  direct: "bg-neutral-400",
}

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null
  const max = Math.max(...data, 1)
  const w = 80
  const h = 32
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`)
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.join(" ")}
        className="text-fuchsia-500"
      />
    </svg>
  )
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return null
  const diff = current - previous
  if (diff === 0) return (
    <span className="flex items-center gap-0.5 text-[10px] font-bold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
      <Minus className="size-2.5" /> Same
    </span>
  )
  const pct = previous > 0 ? Math.abs(Math.round((diff / previous) * 100)) : 100
  const up = diff > 0
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full
      ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
      {up ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
      {pct}%
    </span>
  )
}

export function LiveDashboard() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [history, setHistory] = useState<Snapshot[]>([])
  const prevCountRef = useRef(0)

  useEffect(() => {
    const fetchLiveStats = async () => {
      try {
        const res = await fetch("/api/analytics/live")
        if (res.ok) {
          const data = await res.json()
          const newSessions: Session[] = data.sessions
          setSessions(newSessions)
          setLastUpdated(new Date())
          setHistory(prev => {
            const next = [...prev, { count: newSessions.length, timestamp: Date.now() }]
            return next.slice(-20) // Keep last 20 snapshots for sparkline
          })
          prevCountRef.current = newSessions.length
        }
      } catch (err) {
        console.error("Error fetching live stats:", err)
      }
    }

    fetchLiveStats()
    const interval = setInterval(fetchLiveStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const activeCount = sessions.length
  const prevCount = history.length > 1 ? history[history.length - 2]?.count ?? 0 : 0

  const funnel = {
    Catalog: sessions.filter(s => s.currentStep === "Catalog").length,
    Cart: sessions.filter(s => s.currentStep === "Cart").length,
    Checkout: sessions.filter(s => s.currentStep === "Checkout_Initiated").length,
    Complete: sessions.filter(s => s.currentStep === "Purchase_Complete").length,
  }

  // Conversion rate: People in cart / Total viewers
  const cartConvRate = activeCount > 0
    ? Math.round(((funnel.Cart + funnel.Checkout + funnel.Complete) / activeCount) * 100)
    : 0

  // Checkout rate: People in checkout / Cart entrants
  const checkoutConvRate = funnel.Cart > 0
    ? Math.round((funnel.Checkout / funnel.Cart) * 100)
    : 0

  // Source breakdown
  const sources = sessions.reduce((acc, s) => {
    const src = s.source.toLowerCase()
    acc[src] = (acc[src] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sortedSources = Object.entries(sources).sort((a, b) => b[1] - a[1])
  const sparklineData = history.map(h => h.count)

  // Funnel steps with drop-off
  const funnelSteps = [
    { label: "Browsing", count: funnel.Catalog, icon: Eye, color: "text-neutral-600" },
    { label: "In Cart", count: funnel.Cart, icon: ShoppingCart, color: "text-blue-600" },
    { label: "Checkout", count: funnel.Checkout, icon: CreditCard, color: "text-fuchsia-600" },
    { label: "Purchased", count: funnel.Complete, icon: CheckCircle2, color: "text-emerald-600" },
  ]
  const funnelMax = Math.max(activeCount, 1)

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 mb-8 relative overflow-hidden">

      {/* Live pulse + last updated */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          {lastUpdated.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </span>
        <span className="relative flex size-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500" />
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-neutral-950 text-white rounded-2xl">
          <Activity className="size-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-neutral-900">Real-Time Traffic</h2>
          <p className="text-sm font-medium text-neutral-500">Live shoppers on your store</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* 1. Active Sessions hero */}
        <div className="bg-[#F6F8FA] rounded-3xl p-6 border border-neutral-200/60 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              <Users className="size-3.5" /> Active Now
            </p>
            <TrendBadge current={activeCount} previous={prevCount} />
          </div>
          <div>
            <AnimatePresence mode="wait">
              <motion.p
                key={activeCount}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-bold font-mono text-neutral-900 tracking-tight"
              >
                {activeCount}
              </motion.p>
            </AnimatePresence>
            <p className="text-xs font-medium text-neutral-400 mt-1">sessions in last 60s</p>
          </div>
          <div className="flex items-end justify-between">
            <Sparkline data={sparklineData} />
            <div className="text-right">
              <p className="text-xs font-bold text-fuchsia-600">{cartConvRate}%</p>
              <p className="text-[10px] font-medium text-neutral-400">cart rate</p>
            </div>
          </div>
        </div>

        {/* 2. Funnel Visualizer */}
        <div className="bg-[#F6F8FA] rounded-3xl p-6 border border-neutral-200/60 flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 mb-3">
            <TrendingUp className="size-3.5" /> Live Funnel
          </p>
          {funnelSteps.map((step, idx) => {
            const widthPct = funnelMax > 0 ? Math.round((step.count / funnelMax) * 100) : 0
            const prevStep = idx > 0 ? funnelSteps[idx - 1].count : funnelMax
            const dropOff = prevStep > 0 ? Math.round(((prevStep - step.count) / prevStep) * 100) : 0
            return (
              <div key={step.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold flex items-center gap-1.5 ${step.color}`}>
                    <step.icon className="size-3.5" />
                    {step.label}
                  </span>
                  <div className="flex items-center gap-2">
                    {idx > 0 && step.count < funnelSteps[idx - 1].count && (
                      <span className="text-[9px] font-bold text-red-400">-{dropOff}%</span>
                    )}
                    <span className="font-mono font-bold text-sm text-neutral-900 tabular-nums w-6 text-right">
                      {step.count}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-700 ${step.color.replace("text-", "bg-")}`}
                    style={{ width: `${Math.max(widthPct, step.count > 0 ? 4 : 0)}%` }}
                  />
                </div>
              </div>
            )
          })}
          <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Checkout rate</span>
            <span className={`text-sm font-bold font-mono ${checkoutConvRate > 50 ? "text-emerald-600" : "text-amber-600"}`}>
              {checkoutConvRate}%
            </span>
          </div>
        </div>

        {/* 3. Traffic Source Breakdown */}
        <div className="bg-[#F6F8FA] rounded-3xl p-6 border border-neutral-200/60 flex flex-col gap-4">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <Zap className="size-3.5" /> Traffic Sources
          </p>

          {sortedSources.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 py-4">
              <MapPin className="size-8 text-neutral-300" />
              <p className="text-xs font-medium text-neutral-400">Waiting for traffic...</p>
              <p className="text-[10px] text-neutral-300">Add <code className="bg-neutral-100 px-1 rounded">?utm_source=tiktok</code> to your ad URLs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSources.map(([src, count]) => {
                const pct = Math.round((count / activeCount) * 100)
                const dotColor = SOURCE_DOT[src] || "bg-neutral-400"
                return (
                  <div key={src} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-bold text-neutral-700 capitalize">
                        <span className={`size-2 rounded-full ${dotColor}`} />
                        {src}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-neutral-900">{count}</span>
                        <span className="text-[10px] font-bold text-neutral-400">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${dotColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Potential Revenue at risk */}
          {funnel.Checkout > 0 && (
            <div className="mt-auto pt-3 border-t border-neutral-200/60 bg-amber-50 -mx-1 px-3 py-2.5 rounded-2xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-0.5">⚡ Revenue at risk</p>
              <p className="text-sm font-bold text-amber-700">
                {funnel.Checkout} checkout{funnel.Checkout > 1 ? "s" : ""} in progress
              </p>
            </div>
          )}

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-400">
            <Clock className="size-3" /> Refreshes every 5s
          </div>
        </div>
      </div>
    </div>
  )
}
