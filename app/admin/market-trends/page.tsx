"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, ShoppingBag, Globe, BarChart3, Sparkles,
  Package, Star, Store, RefreshCw, Clock, BrainCircuit,
  LineChart, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart as ReLineChart, Line, AreaChart, Area,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"

const COLORS = ["#B8860B", "#D4A017", "#F5C842", "#8B6508", "#E0BC5E", "#9A7A2E"]

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)
  const [error, setError] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [marketRes, historyRes] = await Promise.all([
        fetch("/api/market-trends"),
        fetch("/api/market-trends/history"),
      ])
      if (!marketRes.ok) throw new Error("Failed to load")
      setData(await marketRes.json())
      setHistory(await historyRes.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchInsights = async () => {
    setLoadingAI(true)
    try {
      const res = await fetch("/api/market-trends/insights")
      setInsights(await res.json())
    } catch {
      // silent
    } finally {
      setLoadingAI(false)
    }
  }

  useEffect(() => {
    fetchData()
    fetchInsights()
  }, [])

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
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 mb-2">{error}</p>
          <button onClick={fetchData} className="text-[#B8860B] hover:text-[#D4A017] text-sm underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const brandData = data?.brandMentions
    ? Object.entries(data.brandMentions).map(([name, count]) => ({ name, count }))
    : []

  const categoryChart = data?.categories
    ? data.categories.map((c: any) => ({
        name: c.label,
        products: c.products.length,
        totalSold: c.products.reduce((s: number, p: any) => s + p.sold, 0),
      }))
    : []

  const historyChart = history?.length > 1
    ? history.map((s: any) => ({
        date: s.date?.slice(5) || s.date,
        ...Object.fromEntries((s.categories || []).map((c: any) => [c.label, c.totalSold])),
      }))
    : []

  const productCount = data?.trendingProducts?.length || 0
  const avgPrice = data?.trendingProducts?.length
    ? Math.round(data.trendingProducts.reduce((s: number, p: any) => {
        const price = parseInt((p.price || '').replace(/[^0-9]/g, '')) || 0
        return s + price
      }, 0) / data.trendingProducts.length)
    : 0
  const totalSales = data?.trendingProducts?.reduce((s: number, p: any) => s + p.sold, 0) || 0

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
            Daraz.pk + Google Trends Pakistan
            {data?.generatedAt && (
              <span className="ml-2 inline-flex items-center gap-1 text-white/40">
                <Clock className="w-3 h-3" />
                {new Date(data.generatedAt).toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => { fetchData(); fetchInsights() }}
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
            <Package className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Products Tracked</span>
          </div>
          <p className="text-xl font-bold text-white">{productCount}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Avg Price</span>
          </div>
          <p className="text-xl font-bold text-white">PKR {avgPrice.toLocaleString()}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-3.5 h-3.5 text-[#B8860B]" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Total Sales</span>
          </div>
          <p className="text-xl font-bold text-white">{totalSales.toLocaleString()}</p>
        </SpotlightCard>
        <SpotlightCard className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] text-white/50 uppercase tracking-wider">Categories</span>
          </div>
          <p className="text-xl font-bold text-white">{data?.categories?.length || 0}</p>
        </SpotlightCard>
      </div>

      {/* AI Briefing */}
      <SpotlightCard className="p-4 border-[#B8860B]/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">AI Market Briefing</h2>
          </div>
          <button
            onClick={fetchInsights}
            disabled={loadingAI}
            className="text-[10px] text-[#B8860B]/60 hover:text-[#B8860B] flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loadingAI ? 'animate-spin' : ''}`} />
            {loadingAI ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>
        {loadingAI ? (
          <div className="flex items-center gap-3 py-3">
            <div className="w-5 h-5 rounded-full border-2 border-[#B8860B]/30 border-t-[#B8860B] animate-spin" />
            <span className="text-white/50 text-xs">Gemini AI analyzing Pakistan market...</span>
          </div>
        ) : insights?.available ? (
          <div className="text-white/80 text-[13px] leading-relaxed whitespace-pre-line font-light">
            {insights.insight}
          </div>
        ) : (
          <div className="text-white/40 text-xs">
            {insights?.note || 'Add GEMINI_API_KEY to .env.local for AI-powered market analysis'}
          </div>
        )}
      </SpotlightCard>

      {/* Historical Trend Chart */}
      {historyChart.length > 1 && (
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <LineChart className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Sales Trend Over Time</h2>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyChart}>
                <defs>
                  {data?.categories?.map((c: any, i: number) => (
                    <linearGradient key={c.label} id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: "#6B7280", fontSize: 10 }} />
                <YAxis tick={{ fill: "#6B7280", fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    background: "#0F1923",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                    fontSize: "11px",
                  }}
                  labelStyle={{ color: "#fff" }}
                />
                {data?.categories?.slice(0, 3).map((c: any, i: number) => (
                  <Area
                    key={c.label}
                    type="monotone"
                    dataKey={c.label}
                    stroke={COLORS[i % COLORS.length]}
                    fillOpacity={1}
                    fill={`url(#gradient-${i})`}
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      )}

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Google Trending */}
        <SpotlightCard className="p-4 lg:col-span-1">
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

        {/* Brand Mentions */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Brand Mentions on Daraz</h2>
          </div>
          {brandData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={brandData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="count">
                    {brandData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "10px", color: "#9CA3AF" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/40 text-xs">No brand data</div>
          )}
        </SpotlightCard>

        {/* Category Overview */}
        <SpotlightCard className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-[#B8860B]" />
            <h2 className="text-white font-semibold text-xs uppercase tracking-wider">Category Overview</h2>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fill: "#6B7280", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#9CA3AF", fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ background: "#0F1923", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "11px" }} labelStyle={{ color: "#fff" }} />
                <Bar dataKey="totalSold" fill="#B8860B" radius={[0, 4, 4, 0]} name="Total Sold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SpotlightCard>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 flex-wrap">
        <button onClick={() => setActiveCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === null ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
          All Products
        </button>
        {data?.categories?.map((cat: any) => (
          <button key={cat.query} onClick={() => setActiveCategory(cat.query)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap ${activeCategory === cat.query ? "bg-[#B8860B] text-black" : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"}`}>
            {cat.label} ({cat.products.length})
          </button>
        ))}
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
                <th className="p-3 font-medium">Category</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {(() => {
                const products = activeCategory
                  ? data?.categories?.find((c: any) => c.query === activeCategory)?.products || []
                  : data?.trendingProducts || []
                if (products.length === 0) return (
                  <tr><td colSpan={7} className="p-8 text-center text-white/30">No products found</td></tr>
                )
                return products.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 text-white/30 font-mono">{i + 1}</td>
                    <td className="p-3 text-white font-medium max-w-[280px] truncate" title={p.name}>
                      <span className="flex items-center gap-1.5">
                        <Package className="w-3 h-3 text-white/30 shrink-0" />
                        {p.name}
                      </span>
                    </td>
                    <td className="p-3 text-[#D4A017] font-semibold whitespace-nowrap">{p.price}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#B8860B]" />
                        {p.rating}
                      </span>
                    </td>
                    <td className="p-3 text-white/80">{p.sold.toLocaleString()}</td>
                    <td className="p-3 text-white/60 truncate max-w-[120px]" title={p.seller}>
                      <span className="flex items-center gap-1">
                        <Store className="w-3 h-3 text-white/30 shrink-0" />
                        {p.seller}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50">{p.category || "—"}</span>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-white/20 text-center pb-4">
        Data from Daraz.pk public API & Google Trends RSS • Snapshots saved daily • AI by Gemini
      </p>
    </div>
  )
}
