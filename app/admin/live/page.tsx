"use client"

import { useState, useMemo, useEffect } from "react"
import { Globe, MapIcon, Trash2, RefreshCw, Activity, Users, DollarSign, ShoppingCart, Eye, WifiOff, Clock, Loader2, Gauge, Sparkles } from "lucide-react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useRealtimeAnalytics } from "@/lib/realtime-analytics"
import type { ConnectionStatus } from "@/lib/realtime-analytics"
import { LiveStatsCard } from "@/components/ui/live-stats-card"
import { ConversionFunnel } from "@/components/ui/conversion-funnel"
import { TrafficSourcesChart } from "@/components/ui/traffic-sources-chart"
import { TimelineChart } from "@/components/ui/timeline-chart"
import { HotProducts } from "@/components/ui/hot-products"
import { PakistanMap } from "@/components/ui/pakistan-map"
import { HealthCheckPanel } from "@/components/ui/health-check-panel"

const LiveGlobe = dynamic(() => import("@/components/ui/live-globe"), { ssr: false })
const PremiumGlobe = dynamic(() => import("@/components/ui/premium-globe").then((m) => ({ default: m.PremiumGlobe })), { ssr: false })

const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Karachi: { lat: 24.8607, lng: 67.0011 },
  Lahore: { lat: 31.5204, lng: 74.3587 },
  Islamabad: { lat: 33.6844, lng: 73.0479 },
  Rawalpindi: { lat: 33.5909, lng: 73.0537 },
  Faisalabad: { lat: 31.4504, lng: 73.135 },
  Multan: { lat: 30.1575, lng: 71.5249 },
  Peshawar: { lat: 34.0151, lng: 71.5249 },
  Quetta: { lat: 30.1798, lng: 66.975 },
  PK: { lat: 30.3753, lng: 69.3451 },
}

function useClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return time
}

function StatusBadge({ status, reconnecting, error, retry }: { status: ConnectionStatus; reconnecting: boolean; error: string | null; retry: () => void }) {
  if (reconnecting) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 flex items-center gap-1.5">
          <Loader2 className="w-2.5 h-2.5 text-amber-400 animate-spin" />
          <span className="text-[9px] font-medium text-amber-400/70">Reconnecting...</span>
        </div>
      </div>
    )
  }

  switch (status) {
    case "connected":
      return (
        <div className="flex items-center gap-1.5">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[9px] font-medium text-emerald-400/70">Live</span>
          </div>
        </div>
      )
    case "degraded":
      return (
        <div className="flex items-center gap-1.5">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-2 py-0.5 flex items-center gap-1.5">
            <WifiOff className="w-2.5 h-2.5 text-amber-400/70" />
            <span className="text-[9px] font-medium text-amber-400/70">3s Polling</span>
            <button onClick={retry} className="text-[7px] text-amber-400/50 hover:text-amber-400 underline underline-offset-2 ml-0.5">
              Retry
            </button>
          </div>
        </div>
      )
    case "connecting":
      return (
        <div className="flex items-center gap-1.5">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5 flex items-center gap-1.5">
            <Loader2 className="w-2.5 h-2.5 text-blue-400/70 animate-spin" />
            <span className="text-[9px] font-medium text-blue-400/70">Connecting</span>
          </div>
        </div>
      )
    case "disconnected":
      return (
        <div className="flex items-center gap-1.5">
          <div className="bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5 flex items-center gap-1.5">
            <WifiOff className="w-2.5 h-2.5 text-red-400/60" />
            <span className="text-[9px] font-medium text-red-400/60">Offline</span>
            <button onClick={retry} className="text-[7px] text-red-400/50 hover:text-red-400 underline underline-offset-2 ml-0.5">
              Retry
            </button>
          </div>
        </div>
      )
  }
}

function formatTimeAgo(ts: string): string {
  const diff = Date.now() - new Date(ts).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <div className="flex items-center gap-3">
          <div className="w-0.5 h-4 bg-[#B8860B] rounded-full shadow-[0_0_8px_rgba(184,134,11,0.3)]" />
          <h2 className="text-sm font-semibold text-white/80 tracking-tight">{title}</h2>
        </div>
        {subtitle && <p className="text-[9px] text-white/20 mt-1 ml-3.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

function SectionDivider() {
  return (
    <div className="relative my-6">
      <div className="h-px bg-gradient-to-r from-[#B8860B]/10 via-white/[0.03] to-transparent" />
    </div>
  )
}

function EmptyState({ icon: Icon, label, sublabel }: { icon: any; label: string; sublabel?: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px]">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/15" />
        </div>
        <p className="text-[11px] text-white/25">{label}</p>
        {sublabel && <p className="text-[8px] text-white/15 mt-1">{sublabel}</p>}
      </div>
    </div>
  )
}

export default function LiveAnalyticsPage() {
  const {
    events,
    summary,
    loading,
    status,
    error,
    retry,
    reconnecting,
    lastUpdated,
  } = useRealtimeAnalytics({ pollInterval: 3000 })

  const [viewMode, setViewMode] = useState<"globe" | "map">("globe")
  const [globeEngine, setGlobeEngine] = useState<"premium" | "classic">("premium")
  const [isClearing, setIsClearing] = useState(false)
  const now = useClock()

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear all live analytics data?")) return
    setIsClearing(true)
    try {
      await fetch("/api/analytics/clear", { method: "POST" })
    } catch { /* silent */ }
    setIsClearing(false)
  }

  const globeLocations = useMemo(() => {
    if (!summary?.locationBreakdown) return []
    const map = new Map(summary.locationBreakdown.map((l) => [l.city, l.count]))
    return Array.from(map.entries()).map(([city, count]) => {
      const coords = CITY_COORDS[city] || CITY_COORDS.PK
      return { lat: coords.lat, lng: coords.lng, city, count, size: Math.min(0.08 + count * 0.02, 0.5) }
    })
  }, [summary])

  const recentEvents = useMemo(() => events.slice(0, 14), [events])
  const liveEventCount = events.length

  return (
    <div className="bg-[#0A0D12] min-h-[calc(100vh-4rem)] text-white font-sans overflow-y-auto">
      <div className="fixed inset-0 pointer-events-none opacity-[0.012]"
        style={{
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#B8860B]/30 to-transparent pointer-events-none z-50" />

      {/* ─── Header ─── */}
      <div className="sticky top-0 z-30 bg-[#0A0D12]/85 backdrop-blur-2xl border-b border-white/[0.04] px-4 md:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B8860B]/25 to-[#B8860B]/5 border border-[#B8860B]/20 flex items-center justify-center shadow-[0_0_20px_rgba(184,134,11,0.1)]">
              <Gauge className="w-4 h-4 text-[#B8860B]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-bold tracking-tight" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                  Command Center
                </h1>
                <div className="px-1.5 py-0.5 rounded bg-[#B8860B]/10 border border-[#B8860B]/15">
                  <span className="text-[7px] font-semibold text-[#B8860B]/70 tracking-[0.15em] uppercase">Live</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusBadge status={status} reconnecting={reconnecting} error={error} retry={retry} />
                {lastUpdated && (
                  <>
                    <span className="text-[7px] text-white/15">|</span>
                    <Clock className="w-2 h-2 text-white/25" />
                    <span className="text-[8px] text-white/25 tabular-nums font-mono">
                      {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="bg-[#0A0D12] rounded-lg border border-white/[0.06] p-0.5 flex shadow-[0_1px_6px_rgba(0,0,0,0.2)]">
              <button
                onClick={() => { setViewMode("globe"); setGlobeEngine("premium") }}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "globe" && globeEngine === "premium"
                    ? "bg-[#B8860B]/20 text-[#B8860B] shadow-[0_0_12px_rgba(184,134,11,0.15)]"
                    : "text-white/25 hover:text-white/50"
                }`}
                title="Premium 3D Globe"
              >
                <Globe className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => { setViewMode("globe"); setGlobeEngine("classic") }}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "globe" && globeEngine === "classic"
                    ? "bg-white/10 text-white"
                    : "text-white/25 hover:text-white/50"
                }`}
                title="Classic Globe"
              >
                <span className="text-[10px] font-bold px-0.5">C</span>
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === "map"
                    ? "bg-white/10 text-white"
                    : "text-white/25 hover:text-white/50"
                }`}
                title="Pakistan Map"
              >
                <MapIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <HealthCheckPanel
              connectionStatus={status}
              error={error}
              eventCount={liveEventCount}
              lastUpdated={lastUpdated}
              reconnecting={reconnecting}
            />

            <button
              onClick={handleClear}
              disabled={isClearing}
              className="p-1.5 bg-red-500/8 border border-red-500/15 rounded-lg text-red-400/60 hover:bg-red-500/15 hover:text-red-400 transition-all disabled:opacity-40"
              title="Clear all data"
            >
              {isClearing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-[1600px] mx-auto">
        {loading ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow"
                >
                  <div className="w-16 h-2.5 skeleton rounded mb-3" />
                  <div className="w-24 h-7 skeleton rounded mb-2" />
                  <div className="w-12 h-2 skeleton rounded" />
                  <div className="mt-3 h-px w-full bg-white/[0.02]" />
                </motion.div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="lg:col-span-3 h-64 bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06]"
              >
                <div className="p-5 space-y-4">
                  <div className="w-32 h-3 skeleton rounded" />
                  <div className="w-48 h-40 skeleton rounded" />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 h-64 bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06]"
              >
                <div className="p-5 space-y-4">
                  <div className="w-24 h-3 skeleton rounded" />
                  <div className="w-full h-40 skeleton rounded" />
                </div>
              </motion.div>
            </div>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-5 px-4 py-2.5 bg-red-500/8 border border-red-500/20 rounded-xl flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-[11px] text-red-300/80">{error}</span>
                  </div>
                  <button
                    onClick={retry}
                    className="text-[10px] font-medium text-red-400/70 hover:text-red-300 transition-colors underline underline-offset-2"
                  >
                    Retry now
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Overview Stats ── */}
            <SectionHeader title="Overview" subtitle="Real-time store performance metrics" />
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.06 } },
              }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <LiveStatsCard
                  title="Active Visitors"
                  value={summary?.activeVisitors ?? 0}
                  trend={summary?.activeVisitorsTrend}
                  trendLabel="vs last 5 min"
                  icon={<Users className="w-3 h-3" />}
                  accentColor="#B8860B"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <LiveStatsCard
                  title="Total Revenue"
                  value={summary?.totalRevenue ?? 0}
                  prefix="PKR "
                  decimals={0}
                  icon={<DollarSign className="w-3 h-3" />}
                  accentColor="#10B981"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <LiveStatsCard
                  title="Sessions"
                  value={summary?.totalSessions ?? 0}
                  icon={<Activity className="w-3 h-3" />}
                  accentColor="#6366F1"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <LiveStatsCard
                  title="Orders"
                  value={summary?.totalOrders ?? 0}
                  icon={<ShoppingCart className="w-3 h-3" />}
                  accentColor="#F59E0B"
                />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="h-full">
                <LiveStatsCard
                  title="Abandonment"
                  value={summary?.abandonmentRate ?? 0}
                  suffix="%"
                  trend={-(summary?.abandonmentRate ?? 0)}
                  trendLabel="cart abandonment"
                  icon={<Eye className="w-3 h-3" />}
                  accentColor="#EC4899"
                  isInverseTrend={true}
                />
              </motion.div>
            </motion.div>

            <SectionDivider />

            {/* ── Timeline + Funnel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
              <div className="lg:col-span-1 h-full">
                <TimelineChart data={summary?.timeline ?? []} />
              </div>
              <div className="lg:col-span-1 h-full">
                <ConversionFunnel
                  funnel={summary?.funnel ?? []}
                  abandonmentRate={summary?.abandonmentRate ?? 0}
                />
              </div>
            </div>

            {/* ── Sources + Products + Globe ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6">
              <div className="md:col-span-1 h-full">
                <TrafficSourcesChart sources={summary?.trafficSources ?? []} />
              </div>
              <div className="md:col-span-1 h-full">
                <HotProducts products={summary?.hotProducts ?? []} />
              </div>
              <div className="md:col-span-1 h-full min-h-[400px]">
                {viewMode === "globe" ? (
                  globeEngine === "premium" ? (
                    <PremiumGlobe locations={globeLocations} autoRotate />
                  ) : (
                    <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] overflow-hidden relative h-full flex flex-col card-glow">
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-[#0A0D12]/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5">
                          <span className="text-[9px] font-medium text-white/50">Classic Globe</span>
                        </div>
                      </div>
                      <LiveGlobe locations={globeLocations} />
                    </div>
                  )
                ) : (
                  <PakistanMap locations={summary?.locationBreakdown ?? []} />
                )}
              </div>
            </div>

            {/* ── Events Feed ── */}
            <div className="mb-6">
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] overflow-hidden card-glow h-full flex flex-col"
                >
                  <div className="px-5 py-4 border-b border-white/[0.04] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-0.5 h-3.5 bg-[#B8860B] rounded-full shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
                  <h3 className="text-[12px] font-semibold text-white/70">Live Events Feed</h3>
                  <span className="text-[9px] text-white/20 font-mono tabular-nums">({liveEventCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]" />
                    <span className="text-[8px] text-white/25 font-medium">Purchase</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B8860B] shadow-[0_0_4px_rgba(184,134,11,0.5)]" />
                    <span className="text-[8px] text-white/25 font-medium">Cart</span>
                  </div>
                </div>
              </div>

              {!recentEvents.length ? (
                <EmptyState icon={Activity} label="No events yet. Start browsing the store!" sublabel="Events appear here in real-time as customers interact" />
              ) : (
                <div className="max-h-64 overflow-y-auto custom-scrollbar divide-y divide-white/[0.02]">
                  {recentEvents.map((event, i) => {
                    const isPurchase = event.base_event === "Purchase" || event.base_event === "CompletePayment"
                    const isCart = event.base_event === "AddToCart"
                    const isNew = i === 0 && events.length > 1
                    return (
                      <motion.div
                        key={event.id || i}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 24, delay: i * 0.05 }}
                        className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/[0.02] transition-colors group border-b border-white/[0.02] last:border-0"
                      >
                        <div className="relative flex items-center justify-center shrink-0 w-2 h-2">
                          {isNew && (
                            <span className={`absolute inset-0 rounded-full animate-ping opacity-75 ${
                              isPurchase ? "bg-emerald-400" : isCart ? "bg-[#B8860B]" : "bg-white/40"
                            }`} />
                          )}
                          <div
                            className={`w-1.5 h-1.5 rounded-full relative z-10 ${
                              isPurchase
                                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                                : isCart
                                  ? "bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.5)]"
                                  : "bg-white/20"
                            }`}
                          />
                        </div>
                        <span className="text-[11px] text-white/60 truncate flex-1 min-w-0">
                          <span
                            className={
                              isPurchase
                                ? "text-emerald-400 font-semibold"
                                : isCart
                                  ? "text-[#B8860B] font-semibold"
                                  : "text-white/80"
                            }
                          >
                            {event.item_name}
                          </span>
                          <span className="text-white/15"> — {event.base_event}</span>
                        </span>
                        <span className="text-[8px] text-white/20 shrink-0 hidden sm:inline font-medium">{event.city}</span>
                        <span className="text-[8px] text-white/15 shrink-0 tabular-nums font-mono min-w-[3ch] text-right">
                          {isNew ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400/60 font-semibold">
                              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
                              now
                            </span>
                          ) : (
                            formatTimeAgo(event.timestamp)
                          )}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
              </div>
            </div>
            <div className="mt-8 pb-4 text-center flex items-center justify-center gap-3">
              <span className="text-[8px] text-white/10 font-mono tracking-[0.2em] uppercase">
                Smartwear Pakistan · Command Center v2
              </span>
              <span className="w-1 h-1 rounded-full bg-white/10" />
              <span className="text-[8px] text-white/10 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                Real-time analytics
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
