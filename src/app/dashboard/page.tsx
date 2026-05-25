"use client"

import { useState, useEffect, Suspense } from "react"
import dynamic from "next/dynamic"
import { motion } from "framer-motion"
import { useOrders } from "@/lib/orders-context"
import { useProducts } from "@/lib/products-context"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders-table"
import { StatCardSkeleton, ChartSkeleton } from "@/components/dashboard/skeleton"
import { DollarSign, ShoppingBag, Clock, Package } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// Dynamically imported so they don't block initial render
const LiveDashboard = dynamic(
  () => import("@/components/admin/LiveDashboard").then(m => ({ default: m.LiveDashboard })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
)

const FinancialWidget = dynamic(
  () => import("@/components/admin/FinancialWidget").then(m => ({ default: m.FinancialWidget })),
  { ssr: false, loading: () => <WidgetSkeleton /> }
)

function WidgetSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-6 mb-8 animate-pulse">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-12 rounded-2xl bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-4 w-40 bg-neutral-100 rounded-lg" />
          <div className="h-3 w-28 bg-neutral-100 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-neutral-100" />
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [loaded, setLoaded] = useState(false)
  const { orders } = useOrders()
  const { products } = useProducts()

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 200)
    return () => clearTimeout(timer)
  }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingOrders = orders.filter((o) => o.status === "pending")

  return (
    <div className="space-y-8">
      <DashboardHeader title="Dashboard" description="Store overview at a glance." />

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {!loaded ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total Revenue" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={DollarSign} iconBg="bg-emerald-50 border border-emerald-100" iconColor="text-emerald-600" />
            <StatCard label="Total Orders" value={orders.length} icon={ShoppingBag} iconBg="bg-blue-50 border border-blue-100" iconColor="text-blue-600" />
            <StatCard label="Pending" value={pendingOrders.length} icon={Clock} iconBg="bg-amber-50 border border-amber-100" iconColor="text-amber-600" />
            <StatCard label="Products" value={products.length} icon={Package} iconBg="bg-purple-50 border border-purple-100" iconColor="text-purple-600" />
          </>
        )}
      </motion.div>

      {/* Live Analytics (Real-Time Active Users) */}
      {loaded && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <LiveDashboard />
        </motion.div>
      )}
      {!loaded && <WidgetSkeleton />}

      {/* Financial Intelligence Widget */}
      {loaded && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <FinancialWidget />
        </motion.div>
      )}
      {!loaded && <WidgetSkeleton />}

      {/* Sales Chart */}
      {loaded && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SalesChart />
        </motion.div>
      )}
      {!loaded && <ChartSkeleton />}

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <RecentOrdersTable />
      </motion.div>
    </div>
  )
}
