"use client"

import { useState, useMemo, useEffect } from "react"
import { Globe, MapIcon, Trash2, RefreshCw, Activity, Users, DollarSign, ShoppingCart, Eye, WifiOff, Clock, Loader2 } from "lucide-react"
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
import { LiveEventsFeed } from "@/components/ui/live-events-feed"
import { DateRangeSelector } from "@/components/ui/date-range-selector"
import type { DateRange } from "@/components/ui/date-range-selector"

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

export default function LiveAnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>({
    label: "Live (2h)",
    from: new Date(Date.now() - 2 * 60 * 60 * 1000),
    to: new Date(),
  })
  const [dateRangeKey, setDateRangeKey] = useState("live")

  const isLive = dateRangeKey === "live"

  const {
    events,
    summary,
    loading,
    status,
    error,
    retry,
    reconnecting,
    lastUpdated,
  } = useRealtimeAnalytics({
    pollInterval: isLive ? 10000 : 0,
    from: dateRange.from.toISOString(),
    to: dateRange.to.toISOString(),
  })

  const [viewMode, setViewMode] = useState<"globe" | "map">("globe")
  const [globeEngine, setGlobeEngine] = useState<"premium" | "classic">("premium")
  const [isClearing, setIsClearing] = useState(false)
  const now = useClock()

  const handleDateChange = (key: string, range: DateRange) => {
    setDateRange(range)
    setDateRangeKey(key)
  }

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
    <div>
      {/* ── Toolbar (globe toggle + health + clear) ── */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <StatusBadge status={status} reconnecting={reconnecting} error={error} retry={retry} />
          {lastUpdated && (
            <>
              <span className="text-[8px] text-foreground/20">|</span>
              <Clock className="w-3 h-3 text-foreground/30" />
              <span className="text-[9px] text-foreground/30 tabular-nums font-mono">
                {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </span>
            </>
          )}
          <DateRangeSelector value={dateRangeKey} onChange={handleDateChange} />
        </div>

        <div className="flex items-center gap-1.5">
          <div className="bg-card rounded-lg border border-white/[0.06] p-0.5 flex">
            <button
              onClick={() => { setViewMode("globe"); setGlobeEngine("premium") }}
              className={`p-1 rounded-md transition-all ${
                viewMode === "globe" && globeEngine === "premium"
                  ? "bg-[#B8860B]/20 text-[#B8860B]" : "text-foreground/& hover:text-foreground/50"
              }`}
              aria-label="Premium 3D globe"
              title="Premium 3D Globe"
            >
              <Globe className="w-3 h-3" />
            </button>
            <button
              onClick={() => { setViewMode("globe"); setGlobeEngine("classic") }}
              className={`p-1 rounded-md transition-all ${
                viewMode === "globe" && globeEngine === "classic"
                  ? "bg-card text-foreground" : "text-foreground/& hover:text-foreground/50"
              }`}
              title="Classic Globe"
            >
              <span className="text-[9px] font-bold px-0.5">C</span>
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-1 rounded-md transition-all ${
                viewMode === "map" ? "bg-card text-foreground" : "text-foreground/& hover:text-foreground/50"
              }`}
              aria-label="Pakistan map"
              title="Pakistan Map"
            >
              <MapIcon className="w-3 h-3" />
            </button>
          </div>
          <HealthCheckPanel connectionStatus={status} error={error} eventCount={liveEventCount} lastUpdated={lastUpdated} reconnecting={reconnecting} />
          <button
            onClick={handleClear}
            disabled={isClearing}
            className="p-1.5 bg-red-500/8 border border-red-500/15 rounded-lg text-red-400/60 hover:bg-red-500/15 hover:text-red-400 transition-all disabled:opacity-40"
            aria-label="Clear all data"
            title="Clear all data"
          >
            {isClearing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-4">
                <div className="w-14 h-2 skeleton rounded mb-2" />
                <div className="w-20 h-6 skeleton rounded mb-1.5" />
                <div className="w-10 h-2 skeleton rounded" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-3 h-48 bg-card rounded-xl border border-border">
              <div className="p-4 space-y-3">
                <div className="w-28 h-2.5 skeleton rounded" />
                <div className="w-full h-36 skeleton rounded" />
              </div>
            </div>
            <div className="lg:col-span-2 h-48 bg-card rounded-xl border border-border">
              <div className="p-4 space-y-3">
                <div className="w-20 h-2.5 skeleton rounded" />
                <div className="w-full h-36 skeleton rounded" />
              </div>
            </div>
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
                className="mb-4 px-3 py-2 bg-red-500/8 border border-red-500/20 rounded-lg flex items-center justify-between overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[11px] text-red-300/80">{error}</span>
                </div>
                <button onClick={retry} className="text-[10px] font-medium text-red-400/70 hover:text-red-300 underline underline-offset-2">
                  Retry now
                </button>
              </motion.div>
            )}
          </AnimatePresence>

            {/* ── Overview Stats ── */}
            <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-3">REAL-TIME METRICS</div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
              <div className="h-full">
                <LiveStatsCard
                  title="Active Visitors"
                  value={summary?.activeVisitors ?? 0}
                  trend={summary?.activeVisitorsTrend}
                  trendLabel="vs last 5 min"
                  icon={<Users className="w-3 h-3" />}
                  info="People actively browsing your store right now"
                  accentColor="#B8860B"
                />
              </div>
              <div className="h-full">
                <LiveStatsCard
                  title="Total Revenue"
                  value={summary?.totalRevenue ?? 0}
                  prefix="PKR "
                  decimals={0}
                  icon={<DollarSign className="w-3 h-3" />}
                  info="Revenue from completed orders"
                  accentColor="#10B981"
                />
              </div>
              <div className="h-full">
                <LiveStatsCard
                  title="Visits"
                  value={summary?.totalSessions ?? 0}
                  icon={<Activity className="w-3 h-3" />}
                  info="Total store visits (each time someone opens your store)"
                  accentColor="#6366F1"
                />
              </div>
              <div className="h-full">
                <LiveStatsCard
                  title="Orders"
                  value={summary?.totalOrders ?? 0}
                  icon={<ShoppingCart className="w-3 h-3" />}
                  info="Completed orders placed"
                  accentColor="#F59E0B"
                />
              </div>
              <div className="h-full">
                <LiveStatsCard
                  title="Abandonment"
                  value={summary?.abandonmentRate ?? 0}
                  suffix="%"
                  trend={-(summary?.abandonmentRate ?? 0)}
                  trendLabel="cart abandonment"
                  icon={<Eye className="w-3 h-3" />}
                  info="% of people who add to cart but don't buy. Lower is better."
                  accentColor="#EC4899"
                  isInverseTrend={true}
                />
              </div>
            </div>

            {/* ── Timeline + Funnel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="md:col-span-1 h-full">
                <TrafficSourcesChart sources={summary?.trafficSources ?? []} />
              </div>
              <div className="md:col-span-1 h-full">
                <HotProducts products={summary?.hotProducts ?? []} />
              </div>
              <div className="md:col-span-1 h-full min-h-[320px]">
                {viewMode === "globe" ? (
                  globeEngine === "premium" ? (
                    <PremiumGlobe locations={globeLocations} autoRotate />
                  ) : (
                    <div className="bg-card rounded-xl border border-border overflow-hidden relative h-full flex flex-col">
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-background/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-border">
                          <span className="text-[9px] font-medium text-foreground/50">Classic Globe</span>
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
            <LiveEventsFeed events={recentEvents} />
          </>
        )}
      <p className="text-[10px] text-foreground/60 text-center mt-4">Real-time analytics with Supabase Realtime and heartbeat presence.</p>
    </div>
  )
}
