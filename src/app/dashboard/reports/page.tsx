"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { StatCards } from "@/components/dashboard/stat-card"
import { useOrders } from "@/lib/orders-context"
import { useProducts } from "@/lib/products-context"
import type { CODOrder } from "@/lib/orders-context"
import { cn } from "@/lib/utils"
import { BarChart3, DollarSign, ShoppingBag, Package, Download, TrendingDown, TrendingUp } from "lucide-react"

type Period = "7d" | "30d" | "90d" | "1y"

const periodLabels: Record<Period, string> = { "7d": "Last 7 Days", "30d": "Last 30 Days", "90d": "Last 90 Days", "1y": "Last Year" }

function groupOrdersByPeriod(orders: CODOrder[], period: Period) {
  const now = Date.now()
  const msLimit = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365
  const cutoff = now - msLimit * 24 * 60 * 60 * 1000
  const relevant = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff)

  if (period === "1y") {
    const months = Array.from({ length: 12 }, (_, i) => ({
      label: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
      revenue: 0,
      orders: 0,
    }))
    for (const o of relevant) {
      const m = new Date(o.createdAt).getMonth()
      months[m].revenue += o.total
      months[m].orders++
    }
    return months
  }

  const days = Math.min(msLimit, 30)
  const data = Array.from({ length: days }, (_, i) => ({
    label: `Day ${i + 1}`,
    revenue: 0,
    orders: 0,
  }))
  for (const o of relevant) {
    const day = Math.min(days - 1, Math.floor((now - new Date(o.createdAt).getTime()) / (24 * 60 * 60 * 1000)))
    const idx = days - 1 - day
    if (idx >= 0 && idx < days) {
      data[idx].revenue += o.total
      data[idx].orders++
    }
  }
  return data
}

export default function ReportsPage() {
  const { orders } = useOrders()
  const { products } = useProducts()
  const [period, setPeriod] = useState<Period>("30d")

  const salesData = useMemo(() => groupOrdersByPeriod(orders, period), [orders, period])

  const totals = useMemo(() => {
    const revenue = salesData.reduce((s, d) => s + d.revenue, 0)
    const orderCount = salesData.reduce((s, d) => s + d.orders, 0)
    const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0
    return { revenue, orders: orderCount, avgOrder }
  }, [salesData])

  const maxRevenue = Math.max(...salesData.map((d) => d.revenue), 1)
  const maxOrders = Math.max(...salesData.map((d) => d.orders), 1)

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { count: number; revenue: number }> = {}
    products.forEach((p) => {
      if (!map[p.category]) map[p.category] = { count: 0, revenue: 0 }
      map[p.category].count++
      map[p.category].revenue += p.price
    })
    return Object.entries(map).sort((a, b) => b[1].revenue - a[1].revenue)
  }, [])

  const maxCatRevenue = Math.max(...categoryBreakdown.map(([, v]) => v.revenue))

  const prevPeriodRevenue = useMemo(() => {
    const now = Date.now()
    const msLimit = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365
    const prevCutoff = now - 2 * msLimit * 24 * 60 * 60 * 1000
    const cutoff = now - msLimit * 24 * 60 * 60 * 1000
    return orders
      .filter((o) => {
        const t = new Date(o.createdAt).getTime()
        return t >= prevCutoff && t < cutoff
      })
      .reduce((s, o) => s + o.total, 0)
  }, [orders, period])

  const revenueTrend = prevPeriodRevenue > 0
    ? (((totals.revenue - prevPeriodRevenue) / prevPeriodRevenue) * 100).toFixed(1)
    : "0"

  return (
    <div className="space-y-6">
      <DashboardHeader title="Reports" description="Sales analytics and performance insights.">
        <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 border-neutral-200/60 shadow-sm text-neutral-700 hover:text-neutral-900 font-bold">
          <Download className="h-4 w-4" strokeWidth={2} /> Export
        </Button>
      </DashboardHeader>

      <StatCards items={[
        { label: "Revenue", value: `Rs. ${totals.revenue.toLocaleString()}`, icon: DollarSign, iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400", trend: { value: `${revenueTrend}%`, positive: Number(revenueTrend) >= 0 } },
        { label: "Orders", value: totals.orders, icon: ShoppingBag, iconBg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400" },
        { label: "Avg Order Value", value: `Rs. ${totals.avgOrder.toLocaleString()}`, icon: BarChart3, iconBg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400" },
        { label: "Total Products", value: products.length, icon: Package, iconBg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400" },
      ]} />

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-neutral-500" strokeWidth={2} /> Revenue
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mt-1">{periodLabels[period]}</p>
                </div>
                <div className="flex rounded-full border border-neutral-200/60 p-1 bg-neutral-50/50">
                  {(["7d", "30d", "90d", "1y"] as Period[]).map((p) => (
                    <button key={p} onClick={() => setPeriod(p)}
                      className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide transition-all duration-200", period === p ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/60" : "text-neutral-400 hover:text-neutral-700")}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="h-48">
                {totals.revenue === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No revenue data in this period</div>
                ) : (
                  <svg viewBox="0 0 300 120" className="h-full w-full overflow-visible">
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {salesData.map((d, i) => {
                      const x = (i / (salesData.length - 1)) * 280 + 10
                      const h = (d.revenue / maxRevenue) * 100
                      return (
                        <g key={i}>
                          <rect x={x - 4} y={110 - h} width={8} height={h} rx={2} fill="#2563EB" opacity={0.7} className="transition-all duration-300" />
                          <circle cx={x} cy={110 - h} r={2} fill="#2563EB" />
                        </g>
                      )
                    })}
                    <line x1="10" y1="110" x2="290" y2="110" stroke="#E2E8F0" strokeWidth="1" />
                  </svg>
                )}
              </div>
              <div className="flex justify-between text-[11px] font-bold tracking-wide uppercase text-neutral-400 mt-3">
                <span>{salesData[0]?.label}</span>
                <span>{salesData[salesData.length - 1]?.label}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 pb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Package className="h-4 w-4 text-neutral-500" strokeWidth={2} /> Category Breakdown
              </h3>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mt-1">Products by category</p>
            </div>
            <div className="px-6 pb-6 space-y-4 pt-2">
              {categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories available</p>
              ) : (
                categoryBreakdown.map(([cat, data]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="font-bold text-neutral-900">{cat}</span>
                      <span className="font-medium text-neutral-500 text-xs">{data.count} products · Rs. {data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-100 overflow-hidden shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(data.revenue / maxCatRevenue) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full rounded-full bg-neutral-900"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 pb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-neutral-500" strokeWidth={2} /> Orders Over Time
              </h3>
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 mt-1">{periodLabels[period]}</p>
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="h-44">
                {totals.orders === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No orders in this period</div>
                ) : (
                  <svg viewBox="0 0 300 110" className="h-full w-full overflow-visible">
                    {salesData.map((d, i) => {
                      const x = (i / (salesData.length - 1)) * 280 + 10
                      const h = (d.orders / maxOrders) * 90
                      return (
                        <g key={i}>
                          <rect x={x - 3} y={100 - h} width={6} height={h} rx={1.5} fill="#8B5CF6" opacity={0.7} className="transition-all duration-300" />
                        </g>
                      )
                    })}
                    <line x1="10" y1="100" x2="290" y2="100" stroke="#E2E8F0" strokeWidth="1" />
                  </svg>
                )}
              </div>
              <div className="flex justify-between text-[11px] font-bold tracking-wide uppercase text-neutral-400 mt-3">
                <span>{salesData[0]?.label}</span>
                <span>{salesData[salesData.length - 1]?.label}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 pb-4">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-neutral-500" strokeWidth={2} /> Summary
              </h3>
            </div>
            <div className="px-6 pb-6 pt-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Period", value: periodLabels[period] },
                  { label: "Revenue per Day", value: `Rs. ${Math.round(totals.revenue / salesData.length).toLocaleString()}` },
                  { label: "Orders per Day", value: (totals.orders / salesData.length).toFixed(1) },
                  { label: "Revenue Trend", value: `${revenueTrend}%`, icon: Number(revenueTrend) >= 0 ? TrendingUp : TrendingDown, iconColor: Number(revenueTrend) >= 0 ? "text-emerald-500" : "text-red-500" },
                  { label: "Top Category", value: categoryBreakdown[0]?.[0] || "N/A" },
                  { label: "Categories", value: categoryBreakdown.length },
                ].map((s: any) => (
                  <div key={s.label} className="rounded-[16px] border border-neutral-200/60 p-4 bg-neutral-50/50">
                    <p className="text-[11px] font-bold tracking-wide uppercase text-neutral-500">{s.label}</p>
                    <p className="text-base font-bold text-neutral-900 mt-1.5 flex items-center gap-1.5">
                      {s.icon && <s.icon className={`h-4 w-4 ${s.iconColor}`} strokeWidth={2} />}
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
