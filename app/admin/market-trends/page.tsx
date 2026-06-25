"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, ShoppingBag, Globe, BarChart3,
  Package, Star, Store, RefreshCw, Clock,
  DollarSign, MapPin, Tag,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"

const COLORS = ["#B8860B", "#D4A017", "#F5C842", "#8B6508", "#E0BC5E", "#9A7A2E"]

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"sold" | "price" | "rating">("sold")

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
    : data?.topSelling || []

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price") return b.priceNum - a.priceNum
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0)
    return b.sold - a.sold
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
            Live from Daraz.pk + Google Trends Pakistan
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
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Total Sales</span>
          </div>
          <p className="text-xl font-bold text-white">
            {data?.summary?.priceRanges?.reduce((s: number, r: any) => s + r.count, 0).toLocaleString() || 0}
          </p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Avg Price</span>
          </div>
          <p className="text-xl font-bold text-white">PKR {(data?.summary?.avgPrice || 0).toLocaleString()}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Products Tracked</span>
          </div>
          <p className="text-xl font-bold text-white">{data?.summary?.totalProducts || 0}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Categories</span>
          </div>
          <p className="text-xl font-bold text-white">{data?.categories?.length || 0}</p>
        </SpotlightCard>
      </div>

      {/* What's Selling Now */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Categories by Sales */}
        <SpotlightCard className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Category Sales</h2>
          </div>
          <div className="space-y-2">
            {(data?.categorySummary || []).map((c: any, i: number) => (
              <div key={c.label} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                    style={{ background: COLORS[i % COLORS.length] + "30", color: COLORS[i % COLORS.length] }}>
                    {i + 1}
                  </span>
                  <span className="text-white/90 text-[12px]">{c.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold text-[12px]">{c.totalSold.toLocaleString()}</span>
                  <span className="text-white/40 text-[10px] ml-1">sold</span>
                </div>
              </div>
            ))}
          </div>
          {/* Price Range Breakdown */}
          <div className="mt-4 pt-3 border-t border-white/5">
            <h3 className="text-white/50 text-[10px] uppercase tracking-wider mb-2">Price Distribution</h3>
            <div className="space-y-1.5">
              {(data?.summary?.priceRanges || []).map((r: any) => (
                <div key={r.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-white/50 w-20">{r.label}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#B8860B] rounded-full transition-all"
                      style={{ width: `${(r.count / Math.max(...((data?.summary?.priceRanges || []).map((x: any) => x.count)))) * 100}%` }} />
                  </div>
                  <span className="text-[10px] text-white/70 w-6 text-right">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Google Trends */}
        <SpotlightCard className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Trending on Google Pakistan</h2>
          </div>
          <div className="space-y-1">
            {data?.trending?.slice(0, 12).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-white/30 w-4">{i + 1}</span>
                  <span className="text-white/90 text-[12px] capitalize">{t.title}</span>
                </div>
                <span className="text-[10px] font-medium text-emerald-400/80 whitespace-nowrap">{t.traffic}</span>
              </div>
            ))}
            {(!data?.trending || data.trending.length === 0) && (
              <p className="text-white/40 text-xs text-center py-4">No trending data right now</p>
            )}
          </div>
        </SpotlightCard>

        {/* Brand Mentions + Location Map */}
        <SpotlightCard className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Brand Mentions</h2>
          </div>
          {brandData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count">
                    {brandData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-white/40 text-xs">No brand data</div>
          )}
          {/* Seller locations */}
          <div className="mt-2 pt-2 border-t border-white/5">
            <h3 className="text-white/50 text-[10px] uppercase tracking-wider mb-1">Seller Locations</h3>
            <p className="text-white/40 text-[11px]">
              {[...new Set(products.filter((p: any) => p.location).map((p: any) => p.location))].slice(0, 6).join(", ") || "N/A"}
            </p>
          </div>
        </SpotlightCard>
      </div>

      {/* Filter tabs + Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
          <button onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === null ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
            All Products
          </button>
          {(data?.categorySummary || []).map((cat: any) => (
            <button key={cat.label} onClick={() => setActiveCategory(cat.label)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === cat.label ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {(["sold", "price", "rating"] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors uppercase tracking-wider ${sortBy === s ? "bg-white/10 text-white" : "bg-white/[0.03] text-white/40 hover:text-white/70"}`}>
              {s === "sold" ? "Most Sold" : s === "price" ? "Price" : "Rating"}
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
                <th className="p-3 font-medium">Rating</th>
                <th className="p-3 font-medium">Sold</th>
                <th className="p-3 font-medium">Seller</th>
                <th className="p-3 font-medium">Location</th>
                <th className="p-3 font-medium">Category</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {sortedProducts.length === 0 ? (
                <tr><td colSpan={8} className="p-8 text-center text-white/30">No products found</td></tr>
              ) : (
                sortedProducts.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white/30 font-mono">{i + 1}</td>
                    <td className="p-3 text-white font-medium max-w-[250px] truncate" title={p.name}>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-white/30 shrink-0" />
                        {p.name}
                      </span>
                    </td>
                    <td className="p-3 text-[#D4A017] font-semibold whitespace-nowrap">
                      {p.price}
                      {p.discount && <span className="ml-1 text-[10px] text-emerald-400">{p.discount}</span>}
                    </td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#B8860B]" />
                        {p.rating || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-white/80 font-semibold">{p.sold.toLocaleString()}</td>
                    <td className="p-3 text-white/60 truncate max-w-[120px]" title={p.seller}>
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-white/30 shrink-0" />
                        {p.seller}
                      </span>
                    </td>
                    <td className="p-3">
                      {p.location ? (
                        <span className="flex items-center gap-1 text-white/50">
                          <MapPin className="w-3 h-3" />
                          {p.location}
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
        Data from Daraz.pk public API & Google Trends RSS • Updates every hour • Prices in PKR
      </p>
    </div>
  )
}
