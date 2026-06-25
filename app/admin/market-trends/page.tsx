"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, ShoppingBag, Globe, BarChart3,
  Package, Star, Store, RefreshCw, Clock,
  DollarSign, MapPin, Tag, Flame, Zap,
  Target, TrendingDown, Users, Percent,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"

const COLORS = ["#B8860B", "#D4A017", "#F5C842", "#8B6508", "#E0BC5E", "#9A7A2E", "#6B4F0A", "#C5A028", "#A3841E"]

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"trendScore" | "sold" | "price" | "rating">("trendScore")

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

  const brandData = data?.brandMentions
    ? Object.entries(data.brandMentions).map(([name, count]) => ({ name, count }))
    : []

  const products = activeCategory
    ? data?.categories?.find((c: any) => c.label === activeCategory)?.products || []
    : data?.topTrending || []

  const sortedProducts = [...products].sort((a: any, b: any) => {
    if (sortBy === "sold") return b.sold - a.sold
    if (sortBy === "price") return b.priceNum - a.priceNum
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
    return (b.trendScore || 0) - (a.trendScore || 0)
  })

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
            Daraz.pk × Google Trends Pakistan
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

      {/* Market Pulse */}
      <SpotlightCard className="p-4 border-[#B8860B]/20">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-[#B8860B]" />
          <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Pulse — What's Moving</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Top Category</p>
            <p className="text-white font-bold text-sm">{data?.categorySummary?.[0]?.label || "—"}</p>
            <p className="text-[11px] text-emerald-400">{data?.categorySummary?.[0]?.totalSold?.toLocaleString() || 0} sold</p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Demand Density</p>
            <p className="text-white font-bold text-sm">{data?.categorySummary?.[0]?.avgSoldPerProduct || 0}</p>
            <p className="text-[11px] text-white/50">avg sold per product</p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Price Sweet Spot</p>
            <p className="text-white font-bold text-sm">{data?.bestPricePerCategory?.[0]?.sweetSpot || "—"}</p>
            <p className="text-[11px] text-white/50">most sales in this range</p>
          </div>
          <div>
            <p className="text-[10px] text-white/50 uppercase tracking-wider mb-1">Best Opportunity</p>
            <p className="text-white font-bold text-sm">{data?.opportunityScore?.[0]?.label || "—"}</p>
            <p className="text-[11px] text-emerald-400">high demand, low competition</p>
          </div>
        </div>
      </SpotlightCard>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Sales + Demand Density */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Category Performance</h2>
          </div>
          <div className="space-y-2">
            {(data?.categorySummary || []).map((c: any, i: number) => (
              <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold"
                    style={{ background: COLORS[i % COLORS.length] + "30", color: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </span>
                  <span className="text-white/90 text-[12px]">{c.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px]">
                    <span className="text-emerald-400 font-semibold">{c.totalSold.toLocaleString()}</span>
                    <span className="text-white/30 ml-1">sold</span>
                  </span>
                  <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">
                    {c.avgSoldPerProduct}/prod
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SpotlightCard>

        {/* Hot Products — Trend Score */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Hot Products 🔥</h2>
          </div>
          <div className="space-y-2">
            {(data?.hotProducts || []).slice(0, 8).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-white text-[11px] truncate">{p.name}</p>
                  <p className="text-[10px] text-white/40">{p.category} · {p.sold.toLocaleString()} sold</p>
                </div>
                <span className="text-[11px] font-bold text-orange-400 whitespace-nowrap">
                  {p.price}
                </span>
              </div>
            ))}
            {(!data?.hotProducts || data.hotProducts.length === 0) && (
              <p className="text-white/40 text-xs text-center py-4">No hot products yet</p>
            )}
          </div>
        </SpotlightCard>

        {/* Google Trends */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Pakistan Trending Searches</h2>
          </div>
          <div className="space-y-1.5">
            {data?.trending?.slice(0, 10).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
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
            {(!data?.trending || data.trending.length === 0) && (
              <p className="text-white/40 text-xs text-center py-4">No trending data right now</p>
            )}
          </div>
        </SpotlightCard>
      </div>

      {/* Opportunity + Price Sweet Spot + Brands */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Opportunity Score */}
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Market Opportunity</h2>
          </div>
          <div className="space-y-2">
            {(data?.opportunityScore || []).map((c: any, i: number) => (
              <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold w-4 ${i === 0 ? 'text-emerald-400' : 'text-white/30'}`}>{i + 1}</span>
                  <span className="text-white/90 text-[12px]">{c.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/40">
                    {c.demandDensity}/prod · {c.competition}% comp
                  </span>
                  {i === 0 && <Zap className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2 pt-2 border-t border-white/5">
            Higher demand per product + lower competition = best entry opportunity
          </p>
        </SpotlightCard>

        {/* Price Sweet Spot per Category */}
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Price Sweet Spot</h2>
          </div>
          <div className="space-y-2">
            {(data?.bestPricePerCategory || []).slice(0, 6).map((c: any) => (
              <div key={c.category} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <span className="text-white/90 text-[12px]">{c.category}</span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {c.sweetSpot || "—"}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2 pt-2 border-t border-white/5">
            Price range with highest sales volume per category
          </p>
        </SpotlightCard>

        {/* Brand Mentions */}
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Brand Mentions</h2>
          </div>
          {brandData.length > 0 ? (
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="count">
                    {brandData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[160px] flex items-center justify-center text-white/40 text-xs">No brand data</div>
          )}
        </SpotlightCard>
      </div>

      {/* Price Distribution + Competition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Price Distribution — Products × Sales</h2>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={(data?.summary?.priceRanges || []).map((r: any) => ({ name: r.label, Products: r.count, Sales: r.totalSold }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 9 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} labelStyle={{ color: "#fff" }} />
                <Bar dataKey="Products" fill="#B8860B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="Sales" fill="#D4A017" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>

        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Competition Analysis</h2>
          </div>
          <div className="space-y-2">
            {(data?.categorySummary || []).slice(0, 6).map((c: any) => (
              <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <span className="text-white/90 text-[12px]">{c.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/50">{c.uniqueSellers} sellers</span>
                  <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${Math.min(c.competition, 100)}%`,
                        background: c.competition > 70 ? '#ef4444' : c.competition > 40 ? '#B8860B' : '#22c55e'
                      }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/30 mt-2 pt-2 border-t border-white/5">
            Lower bar = less competition (green = easy entry, red = saturated)
          </p>
        </SpotlightCard>
      </div>

      {/* Filter + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
          <button onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === null ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
            All Categories
          </button>
          {(data?.categorySummary || []).map((cat: any) => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === cat.label ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["trendScore", "sold", "price", "rating"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors uppercase tracking-wider ${sortBy === s ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
              {s === "trendScore" ? "Trend Score" : s === "sold" ? "Most Sold" : s === "price" ? "Price" : "Rating"}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
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
              {sortedProducts.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-white/30">No products found</td></tr>
              ) : (
                sortedProducts.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white/30 font-mono">{i + 1}</td>
                    <td className="p-3 text-white font-medium max-w-[220px] truncate" title={p.name}>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-white/30 shrink-0" />
                        {p.name}
                      </span>
                    </td>
                    <td className="p-3 text-[#D4A017] font-semibold whitespace-nowrap">{p.price}</td>
                    <td className="p-3">
                      {p.discount ? (
                        <span className="text-[10px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded">{p.discount}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#B8860B]" />
                        {p.rating || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-white/80 font-semibold">{p.sold.toLocaleString()}</td>
                    <td className="p-3">
                      {(p.trendScore || 0) > 0 ? (
                        <span className="text-[10px] font-medium text-orange-400">{p.trendScore}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="p-3 text-white/60 truncate max-w-[100px]" title={p.seller}>
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-white/30 shrink-0" />
                        {p.seller}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.location ? (
                        <span className="flex items-center gap-1 text-white/50">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[80px]">{p.location}</span>
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">{p.category || "—"}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-white/20 text-center pb-4">
        Data from Daraz.pk public API × Google Trends RSS • 3 pages per query • Trend Score = sales × rating × discount ÷ √price
      </p>
    </div>
  )
}
