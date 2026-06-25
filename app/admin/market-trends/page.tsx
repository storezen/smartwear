"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, ShoppingBag, Globe, BarChart3,
  Package, Star, Store, RefreshCw, Clock,
  DollarSign, MapPin, Tag, Flame, Zap,
  Target, Users, Percent, Store as StoreIcon,
  TrendingDown, AlertTriangle,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"

const COLORS = ["#B8860B", "#D4A017", "#F5C842", "#8B6508", "#E0BC5E", "#9A7A2E", "#6B4F0A", "#C5A028", "#A3841E"]

function formatPKR(n: number) {
  return 'PKR ' + n.toLocaleString()
}

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"trendScore" | "sold" | "price" | "rating">("trendScore")
  const [view, setView] = useState<"market" | "local" | "compare">("compare")

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/market-trends")
      if (!res.ok) throw new Error("Failed to load")
      setData(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[#B8860B] animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">Fetching live market data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 mb-2 text-sm">{error}</p>
          <button onClick={fetchData} className="text-[#B8860B] hover:text-[#D4A017] text-sm underline">Retry</button>
        </div>
      </div>
    )
  }

  // Tabs
  const tabs = [
    { key: "compare", label: "Compare", icon: BarChart3 },
    { key: "market", label: "Market (Daraz)", icon: Globe },
    { key: "local", label: "Your Store", icon: StoreIcon },
  ] as const

  // Data for current view
  const showMarket = view === "market" || view === "compare"
  const showLocal = view === "local" || view === "compare"

  const products = data?.topTrending || []
  const localProducts = data?.local?.products || []

  const gapAnalysis = data?.gapAnalysis || []
  const priceComparison = data?.priceComparison || []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight mb-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#B8860B]" />
            Pakistan Market Trends
          </h1>
          <p className="text-white/60 text-[12px]">
            Daraz.pk × Google Trends × Your Store
            {data?.generatedAt && (
              <span className="ml-2 inline-flex items-center gap-1 text-white/40">
                <Clock className="w-3 h-3" />
                {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-4 py-1.5 rounded-lg text-[11px] font-medium transition-colors border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1 bg-white/5 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setView(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${view === t.key ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80'}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${data?.darazBlocked ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Market Products</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.darazBlocked ? (
              <span className="text-red-400 text-[11px] font-medium">Blocked</span>
            ) : (data?.summary?.totalProducts || 0)}
          </p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Your Products</span>
          </div>
          <p className="text-xl font-bold text-white">{data?.local?.totalProducts || 0}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Market Avg Price</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.summary?.totalProducts ? formatPKR(data?.summary?.avgPrice) : '—'}
          </p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Your Avg Price</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.local?.categories?.length
              ? formatPKR(Math.round(data.local.categories.reduce((s: number, c: any) => s + c.avgPrice, 0) / data.local.categories.length))
              : '—'}
          </p>
        </SpotlightCard>
      </div>

      {/* Gap Analysis — Missing Opportunities */}
      {view === "compare" && (
        <SpotlightCard className="p-4 border-orange-400/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Opportunities — Products You're Missing</h2>
          </div>
          {data?.darazBlocked ? (
            <p className="text-white/40 text-xs py-3">Daraz data unavailable — market comparison not possible right now. Try again later.</p>
          ) : gapAnalysis.length === 0 ? (
            <p className="text-white/40 text-xs py-3">No market data to compare yet. Data refreshes every hour.</p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {gapAnalysis.filter((g: any) => g.status === 'missing' || g.status === 'low').slice(0, 6).map((g: any) => (
              <div key={g.category} className="bg-white/[0.03] border border-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-[13px]">{g.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    g.status === 'missing' ? 'bg-red-400/10 text-red-400' : 'bg-orange-400/10 text-orange-400'
                  }`}>
                    {g.status === 'missing' ? 'Missing' : 'Low Stock'}
                  </span>
                </div>
                <p className="text-white/50 text-[11px]">
                  {g.marketDemand.toLocaleString()} sold on Daraz · avg PKR {g.marketAvgPrice.toLocaleString()}
                </p>
                <p className="text-emerald-400 text-[11px] mt-1">
                  {g.marketAvgPerProduct} sold per product — {g.youHave === 0 ? 'You have 0' : `You have ${g.youHave}`}
                </p>
              </div>
            ))}
          </div>
        )}
        </SpotlightCard>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Comparison */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Category Comparison</h2>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {(priceComparison || []).map((c: any, i: number) => (
              <div key={c.category} className="py-2 px-2 rounded-lg hover:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white text-[12px] font-medium">{c.category}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-emerald-400">{c.marketTotalSold.toLocaleString()} sold</span>
                    {c.yourCount > 0 && <span className="text-[10px] text-white/30">· {c.yourCount} yours</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-white/60">Market: {formatPKR(c.marketAvgPrice)}</span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/60">You: {formatPKR(c.yourAvgPrice)}</span>
                  {c.diffPct !== 0 && (
                    <span className={`${c.diffPct > 0 ? 'text-red-400' : 'text-emerald-400'} text-[10px]`}>
                      {c.diffPct > 0 ? '+' : ''}{c.diffPct}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Market Hot Products */}
        {showMarket && (
          <SpotlightCard className="p-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-400" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Hot Products 🔥</h2>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {(data?.hotProducts || []).slice(0, 8).map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-white text-[11px] truncate">{p.name}</p>
                    <p className="text-[10px] text-white/40">{p.category} · {p.sold.toLocaleString()} sold</p>
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 whitespace-nowrap">{p.price}</span>
                </div>
            ))}
          </div>
        </SpotlightCard>
      )}

        {/* Your Store Summary */}
        {showLocal && (
          <SpotlightCard className="p-4 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <StoreIcon className="w-4 h-4 text-[#B8860B]" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Your Store Overview</h2>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {(data?.local?.categories || []).slice(0, 10).map((c: any, i: number) => (
                <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                  <span className="text-white/90 text-[12px]">{c.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white font-medium">{c.count} items</span>
                    <span className="text-[10px] text-white/40">{formatPKR(c.avgPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 text-[11px] text-white/40">
              Total inventory value: {formatPKR(data?.local?.totalValue || 0)}
            </div>
          </SpotlightCard>
        )}
      </div>

      {/* Google Trends (only in market/compare view) */}
      {showMarket && (
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Pakistan Trending Searches</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(data?.trending || []).slice(0, 12).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04]">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-white/30 w-4 shrink-0">{i + 1}</span>
                  <span className="text-white/90 text-[12px] capitalize truncate">{t.title}</span>
                  {t.categoryMatch && (
                    <span className="text-[9px] bg-[#B8860B]/20 text-[#D4A017] px-1.5 py-0.5 rounded-full whitespace-nowrap">
                      {t.categoryMatch}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-emerald-400/80 whitespace-nowrap shrink-0 ml-2">{t.traffic}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      {/* Price Distribution Comparison */}
      {view === "compare" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Price Distribution</h2>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.summary?.priceRanges || []).map((r: any) => ({ name: r.label, Products: r.count, Sales: r.totalSold }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="Products" fill="#B8860B" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
          <SpotlightCard className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-[#B8860B]" />
              <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Your Price Distribution</h2>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={(data?.local?.priceRanges || []).map((r: any) => ({ name: r.label, Products: r.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} />
                  <Tooltip contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} labelStyle={{ color: "#fff" }} />
                  <Bar dataKey="Products" fill="#D4A017" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>
      )}

      {/* Products Table */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
          <button onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === null ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
            {view === "local" ? "All Categories" : "All Products"}
          </button>
          {(view === "local" ? data?.local?.categories : data?.categorySummary || []).map((cat: any) => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === cat.label ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
              {cat.label}
            </button>
          ))}
        </div>
        {view !== "local" && (
          <div className="flex gap-1.5">
            {(["trendScore", "sold", "price", "rating"] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors uppercase tracking-wider ${sortBy === s ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
                {s === "trendScore" ? "Trend" : s === "sold" ? "Sold" : s === "price" ? "Price" : "Rating"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          {view === "local" ? (
            /* Local Products Table */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-white/50">
                  <th className="p-3 font-medium w-8">#</th>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Stock</th>
                  <th className="p-3 font-medium">Rating</th>
                  <th className="p-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {localProducts.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-white/30">No products</td></tr>
                ) : (() => {
                  const shown = localProducts.slice(0, 50)
                  return (
                    <>
                      {shown.map((p: any, i: number) => (
                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                          <td className="p-3 text-white/30 font-mono">{i + 1}</td>
                          <td className="p-3 text-white font-medium max-w-[250px] truncate" title={p.name}>
                            <Package className="w-3 h-3 text-white/30 inline mr-1.5" />
                            {p.name}
                          </td>
                          <td className="p-3 text-[#D4A017] font-semibold">{formatPKR(p.price)}</td>
                          <td className="p-3 text-white/80">{p.stock}</td>
                          <td className="p-3 text-white/60">{p.rating || '—'}</td>
                          <td className="p-3">
                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">{p.category}</span>
                          </td>
                        </tr>
                      ))}
                      {localProducts.length > 50 && (
                        <tr><td colSpan={6} className="p-2 text-center text-white/20 text-[10px]">Showing 50 of {localProducts.length} products</td></tr>
                      )}
                    </>
                  )
                })()}
              </tbody>
            </table>
          ) : (
            /* Market Products Table */
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] text-white/50">
                  <th className="p-3 font-medium w-8">#</th>
                  <th className="p-3 font-medium">Product</th>
                  <th className="p-3 font-medium">Price</th>
                  <th className="p-3 font-medium">Disc</th>
                  <th className="p-3 font-medium">Rating</th>
                  <th className="p-3 font-medium">Sold</th>
                  <th className="p-3 font-medium">Trend</th>
                  <th className="p-3 font-medium">Seller</th>
                  <th className="p-3 font-medium">City</th>
                  <th className="p-3 font-medium">Category</th>
                </tr>
              </thead>
              <tbody className="text-[12px]">
                {products.length === 0 ? (
                  <tr><td colSpan={10} className="p-8 text-center text-white/30">No products</td></tr>
                ) : (
                  products.filter((p: any) => !activeCategory || p.category === activeCategory)
                    .sort((a: any, b: any) => {
                      if (sortBy === "sold") return b.sold - a.sold
                      if (sortBy === "price") return b.priceNum - a.priceNum
                      if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
                      return (b.trendScore || 0) - (a.trendScore || 0)
                    })
                    .slice(0, 50)
                    .map((p: any, i: number) => (
                      <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02]">
                        <td className="p-3 text-white/30 font-mono">{i + 1}</td>
                        <td className="p-3 text-white font-medium max-w-[200px] truncate" title={p.name}>
                          <Package className="w-3 h-3 text-white/30 inline mr-1.5" />
                          {p.name}
                        </td>
                        <td className="p-3 text-[#D4A017] font-semibold whitespace-nowrap">{p.price}</td>
                        <td className="p-3">
                          {p.discount ? (
                            <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded">{p.discount}</span>
                          ) : <span className="text-white/20">—</span>}
                        </td>
                        <td className="p-3">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-[#B8860B]" />
                            {p.rating || "—"}
                          </span>
                        </td>
                        <td className="p-3 text-white/80 font-semibold">{p.sold.toLocaleString()}</td>
                        <td className="p-3">
                          {(p.trendScore || 0) > 0
                            ? <span className="text-[10px] font-medium text-orange-400">{p.trendScore}</span>
                            : <span className="text-white/20">—</span>}
                        </td>
                        <td className="p-3 text-white/60 truncate max-w-[100px]" title={p.seller}>
                          <Store className="w-3 h-3 text-white/30 inline mr-1" />
                          {p.seller}
                        </td>
                        <td className="p-3 text-white/50 text-[11px]">{p.location || '—'}</td>
                        <td className="p-3">
                          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">{p.category}</span>
                        </td>
                      </tr>
                  )))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <p className="text-[10px] text-white/20 text-center pb-4">
        Daraz.pk public API × Google Trends RSS × Your Store | Trend Score = sales × rating × discount ÷ √price
      </p>
    </div>
  )
}
