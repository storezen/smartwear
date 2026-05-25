"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const periods = ["Daily", "Weekly", "Monthly"] as const

const chartData: Record<string, { label: string; revenue: number; orders: number }[]> = {
  Daily: [
    { label: "Mon", revenue: 12400, orders: 4 },
    { label: "Tue", revenue: 18900, orders: 7 },
    { label: "Wed", revenue: 15200, orders: 5 },
    { label: "Thu", revenue: 22100, orders: 9 },
    { label: "Fri", revenue: 18300, orders: 6 },
    { label: "Sat", revenue: 25600, orders: 11 },
    { label: "Sun", revenue: 19800, orders: 8 },
  ],
  Weekly: [
    { label: "W1", revenue: 84500, orders: 32 },
    { label: "W2", revenue: 92300, orders: 38 },
    { label: "W3", revenue: 78800, orders: 29 },
    { label: "W4", revenue: 102400, orders: 45 },
  ],
  Monthly: [
    { label: "Jan", revenue: 320000, orders: 120 },
    { label: "Feb", revenue: 285000, orders: 105 },
    { label: "Mar", revenue: 410000, orders: 158 },
    { label: "Apr", revenue: 375000, orders: 142 },
    { label: "May", revenue: 520000, orders: 195 },
    { label: "Jun", revenue: 480000, orders: 178 },
  ],
}

function formatCurrency(n: number) {
  return `Rs. ${(n / 1000).toFixed(1)}k`
}

export function SalesChart() {
  const [period, setPeriod] = useState<"Daily" | "Weekly" | "Monthly">("Weekly")
  const data = chartData[period]
  const maxRevenue = Math.max(...data.map((d) => d.revenue))

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)
  const totalOrders = data.reduce((s, d) => s + d.orders, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-[24px] bg-white border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-5">
        <div>
          <h3 className="font-heading text-lg font-bold text-neutral-900">Sales Overview</h3>
          <p className="text-sm font-medium text-neutral-500 mt-1">Revenue & order trends</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-neutral-100 p-1 border border-neutral-200/60">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-200",
                period === p ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            key={`rev-${period}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-[16px] bg-blue-50/80 border border-blue-100 p-4"
          >
            <p className="text-sm text-blue-600 font-bold uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{formatCurrency(totalRevenue)}</p>
          </motion.div>
          <motion.div
            key={`ord-${period}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-[16px] bg-emerald-50/80 border border-emerald-100 p-4"
          >
            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider">Total Orders</p>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1">{totalOrders}</p>
          </motion.div>
        </div>

        <div className="flex gap-4 mb-4 text-xs font-bold text-neutral-500 tracking-wider">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> Orders
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-40"
          >
            <svg viewBox="0 0 600 160" className="h-full w-full" preserveAspectRatio="none">
              <polyline
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={data
                  .map((d, i) => {
                    const x = (i / (data.length - 1)) * 580 + 10
                    const y = 140 - (d.revenue / maxRevenue) * 120
                    return `${x},${y}`
                  })
                  .join(" ")}
              />
              <polygon
                fill="url(#revenueGrad)"
                points={data
                  .map((d, i) => {
                    const x = (i / (data.length - 1)) * 580 + 10
                    const y = 140 - (d.revenue / maxRevenue) * 120
                    return `${x},${y}`
                  })
                  .join(" ") + ` ${(data.length - 1) / (data.length - 1) * 580 + 10},140 10,140`}
              />
              {data.map((d, i) => {
                const cx = (i / (data.length - 1)) * 580 + 10
                const cy = 140 - (d.orders / Math.max(...data.map((x) => x.orders))) * 120
                return (
                  <motion.circle
                    key={d.label}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 3.5, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                    cx={cx}
                    cy={cy}
                    fill="#10B981"
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-4 text-xs font-bold tracking-wider text-neutral-400">
          {data.map((d) => (
            <span key={d.label}>{d.label}</span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
