"use client"

import { useEffect, useState, useCallback } from "react"
import {
  TrendingUp, TrendingDown, DollarSign, Package,
  Truck, Megaphone, AlertTriangle, BarChart3,
  RefreshCw, Download, Target, Percent
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface DaySummary {
  date: string
  totalRevenue: number
  totalCOGS: number
  totalShipping: number
  totalAdSpend: number
  netProfit: number
  lossRecovery: number
}

interface Totals {
  totalRevenue: number
  totalCOGS: number
  totalShipping: number
  totalAdSpend: number
  netProfit: number
  lossRecovery: number
}

const DAYS_OPTIONS = [7, 14, 30]

function fmt(val: number) {
  return `Rs. ${Math.abs(val).toLocaleString("en-PK")}`
}

function pct(numerator: number, denominator: number) {
  if (!denominator) return "0%"
  return `${Math.round((numerator / denominator) * 100)}%`
}

function MetricCard({
  label, value, icon: Icon, color, sublabel, badge
}: {
  label: string; value: string; icon: React.ElementType
  color: string; sublabel?: string; badge?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#F6F8FA] rounded-3xl p-5 border border-neutral-200/60 flex flex-col gap-3 relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        <div className={`p-2 rounded-xl bg-white border border-neutral-200/60 shadow-sm`}>
          <Icon className={`size-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold font-mono tracking-tight ${color}`}>{value}</p>
      <div className="flex items-center justify-between">
        {sublabel && <p className="text-xs font-medium text-neutral-400">{sublabel}</p>}
        {badge && (
          <span className="text-[10px] font-bold bg-white border border-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full shadow-sm">
            {badge}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function MiniBar({
  label, value, max, color
}: { label: string; value: number; max: number; color: string }) {
  const pctWidth = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-neutral-600">{label}</span>
        <span className="text-xs font-bold font-mono text-neutral-900">{fmt(value)}</span>
      </div>
      <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pctWidth}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export function FinancialWidget() {
  const [days, setDays] = useState(7)
  const [summaries, setSummaries] = useState<DaySummary[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch(`/api/financials?days=${days}`)
      if (res.ok) {
        const data = await res.json()
        setSummaries(data.summaries)
        setTotals(data.totals)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [days])

  useEffect(() => { loadData() }, [loadData])

  const handleExportCSV = () => {
    if (!summaries.length) return
    const headers = ["Date", "Revenue", "COGS", "Shipping", "Ad Spend", "Net Profit", "Loss Recovery"]
    const rows = summaries.map(s => [
      s.date, s.totalRevenue, s.totalCOGS, s.totalShipping,
      s.totalAdSpend, s.netProfit, s.lossRecovery
    ])
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financials-${days}d.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isProfit = (totals?.netProfit ?? 0) >= 0
  const maxRevenue = Math.max(...summaries.map(s => s.totalRevenue), 1)
  const profitMargin = totals && totals.totalRevenue > 0
    ? Math.round((totals.netProfit / totals.totalRevenue) * 100)
    : 0
  const rtoLossRatio = totals && totals.totalRevenue > 0
    ? Math.round((totals.lossRecovery / totals.totalRevenue) * 100)
    : 0
  const totalCosts = totals
    ? totals.totalCOGS + totals.totalShipping + totals.totalAdSpend + totals.lossRecovery
    : 0

  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-neutral-950 text-white rounded-2xl">
            <BarChart3 className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-neutral-900">Financial Intelligence</h2>
            <p className="text-sm font-medium text-neutral-500">
              Profit margin today: <span className={`font-bold ${profitMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>{profitMargin}%</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="h-9 px-3 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-all hover:shadow-sm"
          >
            <Download className="size-3.5" /> CSV
          </button>
          <button
            onClick={() => loadData(true)}
            className={`h-9 px-3 rounded-xl border border-neutral-200 bg-white text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 transition-all hover:shadow-sm ${refreshing ? "opacity-50" : ""}`}
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <div className="flex gap-1 p-1 bg-neutral-100 rounded-2xl">
            {DAYS_OPTIONS.map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`h-8 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200
                  ${days === d ? "bg-neutral-950 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-neutral-100 rounded-3xl h-28" />
          ))}
        </div>
      ) : totals ? (
        <AnimatePresence mode="wait">
          <motion.div key={days} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

            {/* KPI Grid – 4 columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Total Revenue"
                value={fmt(totals.totalRevenue)}
                icon={DollarSign}
                color="text-neutral-900"
                sublabel={`${days}-day total`}
              />
              <MetricCard
                label="Net Profit"
                value={(isProfit ? "+" : "-") + fmt(totals.netProfit)}
                icon={isProfit ? TrendingUp : TrendingDown}
                color={isProfit ? "text-emerald-600" : "text-red-600"}
                sublabel={isProfit ? "Profitable" : "In loss"}
                badge={`${Math.abs(profitMargin)}% margin`}
              />
              <MetricCard
                label="Total Costs"
                value={fmt(totalCosts)}
                icon={Target}
                color="text-amber-600"
                sublabel="COGS + Shipping + Ads"
                badge={pct(totalCosts, totals.totalRevenue) + " of rev"}
              />
              <MetricCard
                label="RTO / Loss"
                value={fmt(totals.lossRecovery)}
                icon={AlertTriangle}
                color={totals.lossRecovery > 0 ? "text-red-600" : "text-neutral-400"}
                sublabel="Failed delivery losses"
                badge={rtoLossRatio > 0 ? `${rtoLossRatio}% of rev` : "No losses"}
              />
            </div>

            {/* Cost Breakdown + Chart side by side */}
            <div className="grid md:grid-cols-5 gap-5">

              {/* Cost Breakdown */}
              <div className="md:col-span-2 bg-[#F6F8FA] rounded-3xl p-5 border border-neutral-200/60 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Percent className="size-3.5" /> Cost Breakdown
                </p>
                <MiniBar label="COGS" value={totals.totalCOGS} max={totals.totalRevenue} color="bg-amber-400" />
                <MiniBar label="Shipping (PostEx)" value={totals.totalShipping} max={totals.totalRevenue} color="bg-blue-400" />
                <MiniBar label="Ad Spend (TikTok)" value={totals.totalAdSpend} max={totals.totalRevenue} color="bg-fuchsia-400" />
                {totals.lossRecovery > 0 && (
                  <MiniBar label="RTO Loss" value={totals.lossRecovery} max={totals.totalRevenue} color="bg-red-400" />
                )}

                {/* Profit Margin Gauge */}
                <div className="pt-3 border-t border-neutral-200/60">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-neutral-600">Profit Margin</span>
                    <span className={`text-sm font-bold font-mono ${profitMargin >= 20 ? "text-emerald-600" : profitMargin >= 10 ? "text-amber-600" : "text-red-600"}`}>
                      {profitMargin}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-neutral-200 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${profitMargin >= 20 ? "bg-emerald-500" : profitMargin >= 10 ? "bg-amber-500" : "bg-red-500"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(Math.min(Math.abs(profitMargin), 100), 0)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] font-bold text-red-400">0%</span>
                    <span className="text-[9px] font-bold text-amber-400">10%</span>
                    <span className="text-[9px] font-bold text-emerald-400">20%+</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="md:col-span-3 bg-[#F6F8FA] rounded-3xl p-5 border border-neutral-200/60">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-5">Daily Revenue vs Net Profit</p>
                <div className="flex items-end gap-1.5 h-32">
                  {summaries.map((s) => {
                    const revenueH = (s.totalRevenue / maxRevenue) * 100
                    const profitH = s.netProfit > 0 ? (s.netProfit / maxRevenue) * 100 : 0
                    const isLoss = s.netProfit < 0

                    return (
                      <div key={s.date} className="flex-1 flex items-end gap-0.5 relative group">
                        <div
                          className="flex-1 bg-neutral-200 rounded-t-lg transition-all duration-700"
                          style={{ height: `${Math.max(revenueH, s.totalRevenue > 0 ? 4 : 0)}%` }}
                        />
                        <div
                          className={`flex-1 rounded-t-lg transition-all duration-700 ${isLoss ? "bg-red-400" : "bg-emerald-400"}`}
                          style={{ height: `${Math.max(profitH, s.netProfit !== 0 ? 2 : 0)}%` }}
                        />
                        {/* Tooltip */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[10px] rounded-xl px-2.5 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg pointer-events-none">
                          <p className="font-bold mb-0.5">{new Date(s.date).toLocaleDateString("en-PK", { month: "short", day: "numeric" })}</p>
                          <p className="text-neutral-300">Rev: {fmt(s.totalRevenue)}</p>
                          <p className={s.netProfit >= 0 ? "text-emerald-400" : "text-red-400"}>
                            P&L: {s.netProfit >= 0 ? "+" : ""}{fmt(s.netProfit)}
                          </p>
                          <p className="text-neutral-400 text-[9px]">
                            Margin: {s.totalRevenue > 0 ? Math.round((s.netProfit / s.totalRevenue) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* Date labels */}
                <div className="flex gap-1.5 mt-2">
                  {summaries.map(s => (
                    <div key={s.date} className="flex-1 text-center text-[9px] font-bold text-neutral-400 uppercase">
                      {new Date(s.date).toLocaleDateString("en-PK", { day: "numeric" })}
                    </div>
                  ))}
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-200/60">
                  {[
                    { color: "bg-neutral-200", label: "Revenue" },
                    { color: "bg-emerald-400", label: "Profit" },
                    { color: "bg-red-400", label: "Loss" },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <span className={`size-2.5 rounded ${color}`} /> {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Break-even Status Banner */}
            <div className={`rounded-2xl px-5 py-4 border flex items-center justify-between flex-wrap gap-3
              ${isProfit
                ? "bg-emerald-50 border-emerald-200"
                : "bg-red-50 border-red-200"}`}
            >
              <div className="flex items-center gap-3">
                {isProfit
                  ? <TrendingUp className="size-5 text-emerald-600 shrink-0" />
                  : <TrendingDown className="size-5 text-red-600 shrink-0" />
                }
                <div>
                  <p className={`text-sm font-bold ${isProfit ? "text-emerald-800" : "text-red-800"}`}>
                    {isProfit
                      ? `You are profitable by ${fmt(totals.netProfit)} this period.`
                      : `You are in loss by ${fmt(totals.netProfit)} this period.`
                    }
                  </p>
                  <p className={`text-xs font-medium ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                    {isProfit
                      ? `Keep the RTO rate under ${rtoLossRatio + 2}% to maintain margins.`
                      : "Reduce RTO rate and ad spend to recover profitability."}
                  </p>
                </div>
              </div>
              <div className={`text-right`}>
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Margin</p>
                <p className={`text-2xl font-bold font-mono ${isProfit ? "text-emerald-600" : "text-red-600"}`}>
                  {profitMargin}%
                </p>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-16 space-y-2">
          <BarChart3 className="size-12 text-neutral-200 mx-auto" />
          <p className="text-sm font-bold text-neutral-500">No financial data yet</p>
          <p className="text-xs text-neutral-400">Data appears automatically when PostEx delivers or fails orders.</p>
        </div>
      )}
    </div>
  )
}
