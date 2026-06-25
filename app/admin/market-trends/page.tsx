"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, ShoppingBag, Globe, BarChart3,
  Package, Star, Store, RefreshCw, Clock,
  DollarSign, Tag, Flame, Zap, Target,
  TrendingDown, AlertTriangle, Filter,
  Box, ShoppingCart, Activity,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"

const GOLD = "#B8860B"
const EMERALD = "#34D399"
const RED = "#F87171"
const BLUE = "#60A5FA"
const ORANGE = "#FB923C"

const COLORS = ["#B8860B", "#D4A017", "#F5C842", "#8B6508", "#E0BC5E", "#9A7A2E", "#6B4F0A", "#C5A028", "#A3841E"]

function formatPKR(n: number) {
  return 'PKR ' + n.toLocaleString()
}

const STATUS_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  live: { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10 text-emerald-400', label: 'Live' },
  estimated: { dot: 'bg-amber-400', bg: 'bg-amber-400/10 text-amber-400', label: 'Estimated' },
  blocked: { dot: 'bg-red-400', bg: 'bg-red-400/10 text-red-400', label: 'Unavailable' },
}

function Pill({ dot, bg, label }: { dot: string; bg: string; label: string }) {
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${bg}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    {label}
  </span>
}

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"trendScore" | "sold" | "price" | "rating">("trendScore")
  const [view, setView] = useState<"market" | "local" | "compare">("compare")

  const fetchData = async () => {
    setLoading(true); setError("")
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/market-trends", { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error(res.status === 504 ? "Server timeout — try again" : "Failed to load")
      setData(await res.json())
    } catch (err: any) {
      if (err.name === 'AbortError') setError("Request timed out — try again")
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  useEffect(() => {
    if (!data?.generatedAt) return
    const msUntilNext = 3600000 - (Date.now() - new Date(data.generatedAt).getTime())
    if (msUntilNext <= 0) return
    const timer = setTimeout(() => fetchData(), msUntilNext)
    return () => clearTimeout(timer)
  }, [data?.generatedAt])

  const status = data?.darazBlocked ? (data?.estimatedData ? 'estimated' : 'blocked') : 'live'
  const st = STATUS_COLORS[status]

  if (loading && !data) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-6 w-48 bg-white/5 rounded-lg" />
          <div className="h-4 w-16 bg-white/5 rounded-full" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <SpotlightCard key={i} className="p-4"><div className="h-9 w-24 bg-white/5 rounded" /></SpotlightCard>)}
        </div>
        <SpotlightCard className="p-4"><div className="h-[200px] bg-white/5 rounded" /></SpotlightCard>
        <SpotlightCard className="p-4"><div className="h-8 w-32 bg-white/5 rounded mb-3" /><div className="h-[300px] bg-white/5 rounded" /></SpotlightCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={fetchData} className="text-[11px] text-[#B8860B] hover:text-[#D4A017] underline underline-offset-2">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const showMarket = view === "market" || view === "compare"
  const showLocal = view === "local" || view === "compare"
  const products = data?.topTrending || []
  const localProducts = data?.local?.products || []
  const gapAnalysis = data?.gapAnalysis || []
  const priceComparison = data?.priceComparison || []

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#B8860B]" />
              Pakistan Market Trends
            </h1>
            <Pill {...st} />
          </div>
          <p className="text-white/40 text-[12px] flex items-center gap-3">
            <span>Daraz.pk × Google Trends × Your Store</span>
            {data?.generatedAt && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white px-4 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* ── View Switcher ── */}
      <div className="flex gap-1 bg-white/[0.03] border border-white/[0.05] rounded-xl p-1 w-fit">
        {([
          { key: "compare", label: "Compare", icon: BarChart3 },
          { key: "market", label: "Market", icon: Globe },
          { key: "local", label: "Your Store", icon: Store },
        ] as const).map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 ${
              view === t.key ? 'bg-[#B8860B]/20 text-[#D4A017] shadow-sm' : 'text-white/40 hover:text-white/70'
            }`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Market Products</span>
            <ShoppingCart className={`w-4 h-4 ${data?.darazBlocked ? 'text-red-400/60' : 'text-emerald-400/80'}`} />
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {data?.darazBlocked ? (
              <span className="text-sm font-medium text-white/40">No data</span>
            ) : (data?.summary?.totalProducts || 0)}
          </p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Your Products</span>
            <Box className="w-4 h-4 text-[#B8860B]/80" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">{data?.local?.totalProducts || 0}</p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Market Avg Price</span>
            <DollarSign className="w-4 h-4 text-emerald-400/80" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {data?.summary?.totalProducts ? formatPKR(data.summary.avgPrice).replace('PKR ', '') : <span className="text-sm font-medium text-white/40">—</span>}
            <span className="text-xs text-white/30 font-sans font-normal ml-1">PKR</span>
          </p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">Your Avg Price</span>
            <DollarSign className="w-4 h-4 text-[#B8860B]/80" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tracking-tight">
            {data?.local?.categories?.length
              ? formatPKR(Math.round(data.local.categories.reduce((s: number, c: any) => s + c.avgPrice, 0) / data.local.categories.length)).replace('PKR ', '')
              : <span className="text-sm font-medium text-white/40">—</span>}
            <span className="text-xs text-white/30 font-sans font-normal ml-1">PKR</span>
          </p>
        </SpotlightCard>
      </div>

      {/* ── Gap Analysis — Hero ── */}
      {view === "compare" && (
        <SpotlightCard className="p-5 border border-orange-400/10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-orange-400/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Market Opportunities</h2>
              <p className="text-white/30 text-[10px]">Products in demand on Daraz that you&apos;re missing or understocked</p>
            </div>
          </div>
          {gapAnalysis.filter((g: any) => g.status === 'missing' || g.status === 'low').length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-6 text-center">
              <Activity className="w-6 h-6 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-xs">No gaps found — your catalog covers the trending categories well.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gapAnalysis.filter((g: any) => g.status === 'missing' || g.status === 'low').slice(0, 6).map((g: any) => (
                <div key={g.category} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:border-orange-400/20 transition-colors duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold text-[13px]">{g.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      g.status === 'missing' ? 'bg-red-400/10 text-red-400' : 'bg-orange-400/10 text-orange-400'
                    }`}>
                      {g.status === 'missing' ? 'Not stocked' : 'Low stock'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                      <ShoppingBag className="w-3 h-3 text-emerald-400/60" />
                      {g.marketDemand.toLocaleString()} sold on Daraz
                    </p>
                    <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                      <DollarSign className="w-3 h-3 text-emerald-400/60" />
                      Avg PKR {g.marketAvgPrice.toLocaleString()}
                    </p>
                    <p className="text-white/50 text-[11px] flex items-center gap-1.5">
                      <Package className="w-3 h-3 text-emerald-400/60" />
                      {g.marketAvgPerProduct} sold/product
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.03]">
                    <span className="text-[11px] font-medium text-emerald-400">
                      {g.yourCount === 0 ? 'Add to catalog' : `Stock up (${g.yourCount} items)`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      )}

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Price Comparison */}
        <SpotlightCard className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#B8860B]/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Price Comparison</h2>
              <p className="text-white/30 text-[10px]">Your average price vs market average by category</p>
            </div>
          </div>
          <div className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
            {(priceComparison || []).length === 0 ? (
              <div className="py-6 text-center text-white/30 text-xs">No comparison data yet</div>
            ) : (
              (priceComparison || []).map((c: any, i: number) => (
                <div key={c.category} className="py-2.5 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white text-[12px] font-medium">{c.category}</span>
                    <span className="text-[10px] text-white/30 font-mono">
                      {c.marketTotalSold.toLocaleString()} sold
                      {c.yourCount > 0 && <span className="text-white/20 ml-1">· {c.yourCount} yours</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center px-2 text-[9px] text-white/20 font-mono">
                        Market: {formatPKR(c.marketAvgPrice)}
                      </div>
                      <div
                        className="h-full bg-emerald-400/20 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((c.marketAvgPrice / Math.max(c.yourAvgPrice, c.marketAvgPrice, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="flex-1 h-5 bg-white/[0.03] rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex items-center px-2 text-[9px] text-white/20 font-mono">
                        You: {formatPKR(c.yourAvgPrice)}
                      </div>
                      <div
                        className="h-full bg-[#B8860B]/20 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((c.yourAvgPrice / Math.max(c.yourAvgPrice, c.marketAvgPrice, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    {c.diffPct !== 0 && (
                      <span className={`text-[10px] font-medium w-14 text-right shrink-0 ${
                        c.marketCount === 0 ? 'text-white/20' : c.diffPct > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {c.marketCount === 0 ? '—' : `${c.diffPct > 0 ? '+' : ''}${c.diffPct}%`}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </SpotlightCard>

        {/* Hot Products */}
        {showMarket && (
          <SpotlightCard className="p-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-orange-400/10 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Hot Products</h2>
                <p className="text-white/30 text-[10px]">Top trend score on Daraz</p>
              </div>
            </div>
            <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
              {(data?.hotProducts || []).length === 0 ? (
                <div className="py-6 text-center text-white/30 text-xs">No data</div>
              ) : (
                (data?.hotProducts || []).slice(0, 8).map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors group">
                    <span className="text-[10px] font-bold text-white/20 w-4 shrink-0 font-mono">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[11px] truncate font-medium group-hover:text-[#D4A017] transition-colors">{p.name}</p>
                      <p className="text-[10px] text-white/30 flex items-center gap-2">
                        <span>{p.category}</span>
                        <span className="text-emerald-400/60">{p.sold.toLocaleString()} sold</span>
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#D4A017] font-mono whitespace-nowrap">{p.price}</span>
                  </div>
                ))
              )}
            </div>
          </SpotlightCard>
        )}

        {/* Your Store Overview */}
        {showLocal && (
          <SpotlightCard className="p-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#B8860B]/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-[#B8860B]" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Your Store</h2>
                <p className="text-white/30 text-[10px]">Category breakdown</p>
              </div>
            </div>
            <div className="space-y-1 max-h-[360px] overflow-y-auto">
              {(data?.local?.categories || []).length === 0 ? (
                <div className="py-6 text-center text-white/30 text-xs">No products</div>
              ) : (
                (data?.local?.categories || []).slice(0, 10).map((c: any, i: number) => (
                  <div key={c.label} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-white/90 text-[12px]">{c.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-white font-mono">{c.count}</span>
                      <span className="text-[10px] text-white/30 font-mono">{formatPKR(c.avgPrice)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-2 pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[11px]">
              <span className="text-white/30">Total value</span>
              <span className="text-white/70 font-mono font-medium">{formatPKR(data?.local?.totalValue || 0)}</span>
            </div>
          </SpotlightCard>
        )}
      </div>

      {/* ── Price Distribution Charts ── */}
      {view === "compare" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Price Distribution</h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.summary?.priceRanges || []).map((r: any) => ({ name: r.label.split(' ')[0], Products: r.count, Sales: r.totalSold }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                    labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="Products" fill="#B8860B" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#B8860B]" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Your Price Distribution</h2>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.local?.priceRanges || []).map((r: any) => ({ name: r.label.split(' ')[0], Products: r.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", fontSize: "11px" }}
                    labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="Products" fill="#D4A017" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* ── Google Trends ── */}
      {showMarket && (
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-emerald-400/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Pakistan Trending Searches</h2>
              <p className="text-white/30 text-[10px]">Google Trends — Pakistan, last 24h</p>
            </div>
          </div>
          {(data?.trending || []).length === 0 ? (
            <div className="py-6 text-center text-white/30 text-xs">No trending data available</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(data?.trending || []).slice(0, 15).map((t: any, i: number) => (
                <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-colors border border-transparent hover:border-white/[0.04]">
                  <span className="text-[10px] font-bold text-white/15 w-4 shrink-0 font-mono">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-white/80 text-[12px] capitalize truncate block">{t.title}</span>
                    {t.categoryMatch && (
                      <span className="text-[9px] text-[#B8860B]/60 font-medium">{t.categoryMatch}</span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400/60 whitespace-nowrap shrink-0 font-mono">{t.traffic}</span>
                </div>
              ))}
            </div>
          )}
        </SpotlightCard>
      )}

      {/* ── Category Filters ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap">
          <button onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
              activeCategory === null ? "bg-[#B8860B]/20 text-[#D4A017]" : "bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
            }`}>
            {view === "local" ? "All Categories" : "All Products"}
          </button>
          {(view === "local" ? data?.local?.categories : data?.categorySummary || []).map((cat: any) => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 whitespace-nowrap ${
                activeCategory === cat.label ? "bg-[#B8860B]/20 text-[#D4A017]" : "bg-white/[0.03] text-white/40 hover:text-white/70 hover:bg-white/[0.06]"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>
        {view !== "local" && (
          <div className="flex gap-1 bg-white/[0.02] rounded-lg p-0.5 border border-white/[0.04]">
            {(["trendScore", "sold", "price", "rating"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-200 ${
                  sortBy === s ? "bg-white/[0.06] text-white" : "text-white/30 hover:text-white/60"
                }`}>
                {s === "trendScore" ? "Trend" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Products Table ── */}
      <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {view === "local" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-[11px] text-white/30 uppercase tracking-wider">
                  <th className="p-3 pl-5 font-medium w-10">#</th>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Rating</th>
                  <th className="p-3 font-medium pr-5">Category</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {localProducts.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-white/20 text-xs">No products in your store</td></tr>
                ) : (() => {
                  const filtered = activeCategory
                    ? localProducts.filter((p: any) => p.category === activeCategory)
                    : localProducts
                  const shown = filtered.slice(0, 50)
                  return (
                    <>
                      {shown.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                          <td className="p-3 pl-5 text-white/20 font-mono text-[10px]">{i + 1}</td>
                          <td className="p-3 text-white font-medium max-w-[240px] truncate" title={p.name}>
                            <Package className="w-3 h-3 text-white/20 inline mr-2 shrink-0" />
                            {p.name}
                          </td>
                          <td className="p-3 text-[#D4A017] font-semibold font-mono">{formatPKR(p.price)}</td>
                          <td className="p-3 text-white/60 font-mono">{p.stock}</td>
                          <td className="p-3 text-white/40 font-mono">{p.rating || '—'}</td>
                          <td className="p-3 pr-5">
                            <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded text-white/30">{p.category}</span>
                          </td>
                        </tr>
                      ))}
                      {localProducts.length > 50 && (
                        <tr><td colSpan={6} className="p-2 text-center text-white/15 text-[10px]">Showing 50 of {localProducts.length} products</td></tr>
                      )}
                    </>
                  )
                })()}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] text-[11px] text-white/30 uppercase tracking-wider">
                  <th className="p-3 pl-5 font-medium w-10">#</th>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Disc</th>
                  <th className="p-3 font-medium">Rating</th>
                  <th className="p-3 font-medium">Sold</th>
                  <th className="p-3 font-medium">Trend</th>
                  <th className="p-3 font-medium">Seller</th>
                  <th className="p-3 font-medium">City</th>
                  <th className="p-3 font-medium pr-5">Category</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {products.length === 0 ? (
                  <tr><td colSpan={10} className="p-10 text-center text-white/20 text-xs">No market products to display</td></tr>
                ) : (
                  products
                    .filter((p: any) => !activeCategory || p.category === activeCategory)
                    .sort((a: any, b: any) => {
                      if (sortBy === "sold") return b.sold - a.sold
                      if (sortBy === "price") return b.priceNum - a.priceNum
                      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
                      return (b.trendScore || 0) - (a.trendScore || 0)
                    })
                    .slice(0, 50)
                    .map((p: any, i: number) => (
                      <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.015] transition-colors">
                        <td className="p-3 pl-5 text-white/20 font-mono text-[10px]">{i + 1}</td>
                        <td className="p-3 text-white font-medium max-w-[200px] truncate" title={p.name}>
                          <Package className="w-3 h-3 text-white/20 inline mr-2 shrink-0" />
                          {p.name}
                        </td>
                        <td className="p-3 text-[#D4A017] font-semibold font-mono whitespace-nowrap">{p.price}</td>
                        <td className="p-3">
                          {p.discount ? (
                            <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">{p.discount}</span>
                          ) : <span className="text-white/15">—</span>}
                        </td>
                        <td className="p-3 text-white/60 font-mono">{p.rating || '—'}</td>
                        <td className="p-3 text-white/70 font-semibold font-mono">{p.sold.toLocaleString()}</td>
                        <td className="p-3">
                          {(p.trendScore || 0) > 0
                            ? <span className="text-[10px] font-medium text-orange-400 font-mono">{p.trendScore}</span>
                            : <span className="text-white/15">—</span>}
                        </td>
                        <td className="p-3 text-white/40 truncate max-w-[100px] font-mono text-[11px]" title={p.seller}>
                          {p.seller}
                        </td>
                        <td className="p-3 text-white/30 text-[11px] font-mono">{p.location || '—'}</td>
                        <td className="p-3 pr-5">
                          <span className="text-[10px] bg-white/[0.03] px-2 py-0.5 rounded text-white/30">{p.category}</span>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between pb-4 text-[10px] text-white/15 border-t border-white/[0.02] pt-4">
        <span>Daraz.pk × Google Trends × Your Store</span>
        <span>Trend Score = sales × rating × (1 + discount%) ÷ √price</span>
      </div>
    </div>
  )
}
