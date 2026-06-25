"use client"

import { useState, useEffect } from "react"
import {
  TrendingUp, Globe, RefreshCw, Clock,
  DollarSign, Flame, ShoppingBag, Target,
  Package, AlertTriangle,
} from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"

function formatPKR(n: number) {
  return 'PKR ' + n.toLocaleString()
}

export default function MarketTrendsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = async () => {
    setLoading(true); setError("")
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 30000)
      const res = await fetch("/api/market-trends", { signal: controller.signal })
      clearTimeout(timer)
      if (!res.ok) throw new Error("Failed to load")
      setData(await res.json())
    } catch (err: any) {
      setError(err.name === 'AbortError' ? "Timed out" : err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <SpotlightCard key={i} className="p-4"><div className="h-9 w-20 bg-white/5 rounded" /></SpotlightCard>)}
        </div>
        <SpotlightCard className="p-4"><div className="h-[200px] bg-white/5 rounded" /></SpotlightCard>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-white/50 text-sm">{error}</p>
          <button onClick={fetchData} className="text-[11px] text-[#B8860B] hover:text-[#D4A017] underline">Retry</button>
        </div>
      </div>
    )
  }

  const products = data?.topTrending || []
  const opportunities = (data?.gapAnalysis || []).filter((g: any) => g.status === 'missing' || g.status === 'low')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#B8860B]" />
            Pakistan Market Trends
          </h1>
          <p className="text-white/40 text-[12px] flex items-center gap-2">
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
          className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SpotlightCard className="p-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">Market Products</p>
          <p className="text-2xl font-bold text-white font-mono">{data?.summary?.totalProducts || 0}</p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">Your Products</p>
          <p className="text-2xl font-bold text-white font-mono">{data?.local?.totalProducts || 0}</p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">Market Avg Price</p>
          <p className="text-2xl font-bold text-white font-mono">{data?.summary?.totalProducts ? formatPKR(data.summary.avgPrice) : <span className="text-sm text-white/40">—</span>}</p>
        </SpotlightCard>
        <SpotlightCard className="p-4">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium mb-1">Your Inventory Value</p>
          <p className="text-2xl font-bold text-white font-mono">{formatPKR(data?.local?.totalValue || 0)}</p>
        </SpotlightCard>
      </div>

      {opportunities.length > 0 && (
        <SpotlightCard className="p-4 border border-orange-400/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-400" />
            <h2 className="text-white font-semibold text-sm">Opportunities — What to Stock</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {opportunities.slice(0, 6).map((g: any) => (
              <div key={g.category} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium text-[13px]">{g.category}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    g.status === 'missing' ? 'bg-red-400/10 text-red-400' : 'bg-orange-400/10 text-orange-400'
                  }`}>
                    {g.status === 'missing' ? 'Not stocked' : 'Low stock'}
                  </span>
                </div>
                <p className="text-white/50 text-[11px]">
                  <ShoppingBag className="w-3 h-3 inline mr-1 text-emerald-400/60" />
                  {g.marketDemand.toLocaleString()} sold on Daraz · Avg PKR {g.marketAvgPrice.toLocaleString()}
                </p>
                <p className="text-emerald-400 text-[11px] font-medium mt-1">
                  {g.yourCount === 0 ? 'Add to catalog' : `Stock up (${g.yourCount} items)`}
                </p>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      <SpotlightCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-orange-400" />
          <h2 className="text-white font-semibold text-sm">Hot Products on Daraz</h2>
        </div>
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
          {(data?.hotProducts || []).length === 0 ? (
            <p className="text-white/30 text-xs py-4 text-center">No data</p>
          ) : (
            (data?.hotProducts || []).slice(0, 10).map((p: any, i: number) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-white/[0.02]">
                <span className="text-[10px] font-bold text-white/20 w-4 shrink-0 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[12px] truncate">{p.name}</p>
                  <p className="text-[10px] text-white/30">{p.category} · {p.sold.toLocaleString()} sold</p>
                </div>
                <span className="text-[12px] font-semibold text-[#D4A017] font-mono">{p.price}</span>
              </div>
            ))
          )}
        </div>
      </SpotlightCard>

      {(data?.trending || []).length > 0 && (
        <SpotlightCard className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-semibold text-sm">Pakistan Trending Searches</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(data?.trending || []).slice(0, 12).map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/[0.01] hover:bg-white/[0.03]">
                <span className="text-[10px] font-bold text-white/15 w-4 shrink-0 font-mono">{i + 1}</span>
                <span className="text-white/80 text-[12px] capitalize truncate flex-1">{t.title}</span>
                <span className="text-[10px] text-emerald-400/60 font-mono shrink-0">{t.traffic}</span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      )}

      <SpotlightCard className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4 text-[#B8860B]" />
          <h2 className="text-white font-semibold text-sm">Trending Products</h2>
        </div>
        {products.length === 0 ? (
          <p className="text-white/30 text-xs py-4 text-center">No products to display</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.04] text-[10px] text-white/30 uppercase tracking-wider">
                  <th className="p-2 pl-3 font-medium w-8">#</th>
                  <th className="p-2 font-medium">Product</th>
                  <th className="p-2 font-medium">Price</th>
                  <th className="p-2 font-medium">Sold</th>
                  <th className="p-2 font-medium">Category</th>
                  <th className="p-2 font-medium pr-3">Seller</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 30).map((p: any, i: number) => (
                  <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.015]">
                    <td className="p-2 pl-3 text-white/20 font-mono">{i + 1}</td>
                    <td className="p-2 text-white font-medium max-w-[180px] truncate">{p.name}</td>
                    <td className="p-2 text-[#D4A017] font-mono whitespace-nowrap">{p.price}</td>
                    <td className="p-2 text-white/70 font-mono">{p.sold.toLocaleString()}</td>
                    <td className="p-2 text-white/30 text-[11px]">{p.category}</td>
                    <td className="p-2 pr-3 text-white/30 text-[11px] truncate max-w-[100px]">{p.seller}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}
