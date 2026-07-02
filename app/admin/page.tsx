"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  Eye,
  Download,
  BarChart3,
  Server,
  Database,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/mock-data"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { AnimatedCounter } from "@/components/ui/animated-counter"

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

/* ── Stat Card ────────────────────────────────────── */
interface StatCardProps {
  title: string
  rawValue?: number
  prefix?: string
  value?: string // fallback
  change: string
  trend: "up" | "down"
  icon: React.ElementType
  accentColor: string
  iconBg: string
}

function StatCard({ title, rawValue, prefix, value, change, trend, icon: Icon, accentColor, iconBg }: StatCardProps) {
  return (
    <SpotlightCard className="p-4" style={{ borderLeft: `2px solid ${accentColor}` }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[9px] tracking-[1.5px] text-foreground/60 font-medium uppercase mb-1">
            {title}
          </p>
          <p className="text-xl font-bold tracking-tight text-foreground leading-none">
            {rawValue !== undefined ? <AnimatedCounter value={rawValue} prefix={prefix} /> : value}
          </p>
          <div className={`flex items-center gap-1 mt-1.5 text-[10px] font-semibold ${trend === "up" ? "text-[#4ADE80]" : "text-red-500"}`}>
            <TrendingUp className="w-3 h-3" />
            <span>{change} this month</span>
          </div>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg }}
        >
          <Icon className="w-4 h-4" style={{ color: accentColor }} />
        </div>
      </div>
    </SpotlightCard>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase()
  const palette: Record<string, { bg: string; text: string }> = {
    delivered: { bg: "bg-[#4ADE80]/10 border-[#4ADE80]/20", text: "text-[#4ADE80]" },
    booked: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500" },
    transferred: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500" },
    pending: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500" },
    unbooked: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500" },
    attempted: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500" },
    cancelled: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-500" },
    "postex warehouse": { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-500" },
    "out for delivery": { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-500" },
    "out for return": { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-500" },
    returned: { bg: "bg-orange-500/10 border-orange-500/20", text: "text-orange-500" },
    "delivery under review": { bg: "bg-pink-500/10 border-pink-500/20", text: "text-pink-500" },
    "un-assigned by me": { bg: "bg-card border-border", text: "text-foreground/40" },
    lost: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500" },
    stolen: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500" },
    damage: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500" },
  }
  const c = palette[s] || { bg: "bg-card border-border", text: "text-foreground/70" }
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[8px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
      {status}
    </span>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="text-foreground/60 text-xs mb-1.5">{label}</p>
        <p className="font-bold text-[#C8972A]">Revenue: {formatPrice(payload[0]?.value || 0)}</p>
        {payload[1] && <p className="font-bold text-[#10B981] text-xs mt-0.5">Profit: {formatPrice(payload[1]?.value || 0)}</p>}
      </div>
    )
  }
  return null
}

/* ── Dashboard ────────────────────────────────────── */
export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCardProps[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [healthData, setHealthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<{ month: string; revenue: number; profit: number }[]>(MONTHS.map(m => ({ month: m, revenue: 0, profit: 0 })))

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, ordRes, healthRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/orders'),
          fetch('/api/health')
        ])
        
        const products = prodRes.ok ? await prodRes.json() : []
        const orders = ordRes.ok ? await ordRes.json() : []
        const health = healthRes.ok ? await healthRes.json() : null
        
        setHealthData(health)

        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        const totalCogs = orders.reduce((sum: number, o: any) => sum + (o.cogs || 0), 0)
        const grossProfit = orders.reduce((sum: number, o: any) => {
          return sum + ((o.total || 0) - (o.cogs || 0) - (o.shipping_fee || 0))
        }, 0)
        const netProfit = orders.reduce((sum: number, o: any) => {
          return sum + ((o.total || 0) - (o.cogs || 0) - (o.shipping_fee || 0) - (o.discount || 0))
        }, 0)
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

        // Build monthly chart data
        const monthlyMap: Record<string, { revenue: number; cogs: number; profit: number }> = {}
        orders.forEach((o: any) => {
          if (!o.created_at) return
          const d = new Date(o.created_at)
          const key = MONTHS[d.getMonth()]
          monthlyMap[key] = monthlyMap[key] || { revenue: 0, cogs: 0, profit: 0 }
          monthlyMap[key].revenue += o.total || 0
          monthlyMap[key].cogs += o.cogs || 0
          monthlyMap[key].profit += ((o.total || 0) - (o.cogs || 0) - (o.shipping_fee || 0) - (o.discount || 0))
        })
        const chartData = MONTHS.map((m, i) => ({
          month: m,
          ...(monthlyMap[m] || { revenue: 0, cogs: 0, profit: 0 })
        }))
        setChartData(chartData)

        setStats([
          {
            title: "Total Revenue",
            rawValue: totalRevenue,
            prefix: "Rs. ",
            change: "+0%",
            trend: "up",
            icon: DollarSign,
            accentColor: "#C8972A",
            iconBg: "rgba(200, 151, 42, 0.1)",
          },
          {
            title: "COGS",
            rawValue: totalCogs,
            prefix: "Rs. ",
            change: "Cost of goods sold",
            trend: "up",
            icon: Package,
            accentColor: "#F43F5E",
            iconBg: "rgba(244, 63, 94, 0.1)",
          },
          {
            title: "Gross Profit",
            rawValue: grossProfit,
            prefix: "Rs. ",
            change: "After COGS + Shipping",
            trend: "up",
            icon: TrendingUp,
            accentColor: "#10B981",
            iconBg: "rgba(16, 185, 129, 0.1)",
          },
          {
            title: "Net Profit",
            rawValue: netProfit,
            prefix: "Rs. ",
            change: `${profitMargin.toFixed(1)}% margin`,
            trend: profitMargin >= 0 ? "up" : "down",
            icon: DollarSign,
            accentColor: "#3B82F6",
            iconBg: "rgba(59, 130, 246, 0.1)",
          },
        ])

        setRecentOrders(orders.slice(0, 5))
        setTopProducts(products.slice(0, 5))
      } catch (err) {
        console.error("Failed to load dashboard stats", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div>
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Operations Overview
          </h1>
          <p className="text-[11px] text-foreground/60 mt-0.5">
            Smartwear Pakistan • {new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          <button className="sw-btn-ghost-white h-8 px-3 rounded-lg flex items-center gap-1.5 text-[11px]">
            <Download className="w-3 h-3" />
            Export
          </button>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="admin-stat-card">
                <div className="h-3 w-20 skeleton rounded mb-2" />
                <div className="h-6 w-24 skeleton rounded mb-1.5" />
                <div className="h-2.5 w-16 skeleton rounded" />
              </div>
            ))
          : stats.map((stat, i) => <StatCard key={i} {...stat} />)}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid lg:grid-cols-2 gap-3 mb-4">
        {/* Revenue Chart */}
        <div className="bg-card rounded-xl border border-border p-4 backdrop-blur-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-0.5">REVENUE & PROFIT</div>
              <h3 className="text-[13px] font-semibold text-foreground">Monthly Overview</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[10px] text-[#C8972A]"><span className="w-2 h-2 rounded-full bg-[#C8972A]" /> Revenue</span>
              <span className="flex items-center gap-1 text-[10px] text-[#10B981]"><span className="w-2 h-2 rounded-full bg-[#10B981]" /> Profit</span>
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8972A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C8972A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
                <XAxis
                  dataKey="month"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5 }}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "currentColor", opacity: 0.5 }}
                  tickFormatter={(v) => `₨${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C8972A"
                  strokeWidth={2.5}
                  fill="url(#goldGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#C8972A", strokeWidth: 2, stroke: "white" }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#profitGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#10B981", strokeWidth: 2, stroke: "white" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card rounded-xl border border-border p-4 backdrop-blur-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-0.5">LATEST</div>
              <h3 className="text-[13px] font-semibold text-foreground">Recent Orders</h3>
            </div>
            <Link href="/admin/orders">
              <button className="sw-btn-ghost-white h-7 px-2.5 rounded-lg text-[10px] flex items-center gap-1">
                <Eye className="w-3 h-3" />
                View All
              </button>
            </Link>
          </div>

          <div className="space-y-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2">
                  <div className="w-7 h-7 bg-card rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 bg-card rounded animate-pulse" />
                    <div className="h-2.5 w-12 bg-card rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-14 bg-card rounded animate-pulse" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-card transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#C8972A]/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[#C8972A]">
                      #{order.id.slice(-3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate text-foreground">
                      {order.customer_name || "Guest Customer"}
                    </p>
                    <p className="text-[10px] text-foreground/50">
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-[12px] font-bold text-foreground">{formatPrice(order.total)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-[12px] text-foreground/60">No orders yet.</p>
                <p className="text-[10px] text-foreground/60 mt-0.5">Place a test order from the store.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Products + Quick Actions ── */}
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-0.5">INVENTORY</div>
              <h3 className="text-[13px] font-semibold text-foreground">Top Products</h3>
            </div>
            <Link href="/admin/products">
              <button className="sw-btn-ghost-white h-7 px-3 rounded-lg text-[10px]">
                Manage All
              </button>
            </Link>
          </div>

          <div className="space-y-1.5">
            {loading ? (
              <div className="text-center py-3 text-foreground/50 text-[12px]">Loading...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-3 text-foreground/50 text-[12px]">No products added yet.</div>
            ) : topProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors"
              >
                <span className="text-[10px] font-bold text-foreground/60 w-3 shrink-0">
                  {index + 1}
                </span>
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-background border border-border shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image src={product.images[0]} alt={product.name} fill sizes="36px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate text-foreground">{product.name}</p>
                  <p className="text-[10px] text-[#C8972A] font-medium">{product.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-foreground">{formatPrice(product.price)}</p>
                  {product.cost_price ? (
                    <p className="text-[9px] text-[#10B981] mt-0.5">
                      {formatPrice(product.price - product.cost_price)} profit/unit
                    </p>
                  ) : (
                    <p className="text-[9px] text-foreground/40 mt-0.5">
                      {product.stock} in stock
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-4 backdrop-blur-xl">
          <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-0.5">SHORTCUTS</div>
          <h3 className="text-[13px] font-semibold mb-3 text-foreground">Quick Actions</h3>

          <div className="space-y-1">
            {[
              {
                label: "Add New Product",
                desc: "List a new watch",
                href: "/admin/products?new=true",
                icon: Plus,
                color: "#C8972A",
                bg: "rgba(200, 151, 42, 0.15)",
              },
              {
                label: "View All Orders",
                desc: "Manage & fulfill",
                href: "/admin/orders",
                icon: ShoppingCart,
                color: "#3B82F6",
                bg: "rgba(59, 130, 246, 0.15)",
              },
              {
                label: "Customer List",
                desc: "Browse customers",
                href: "/admin/customers",
                icon: Users,
                color: "#8B5CF6",
                bg: "rgba(139, 92, 246, 0.15)",
              },
              {
                label: "Revenue Report",
                desc: "View analytics",
                href: "/admin",
                icon: BarChart3,
                color: "#10B981",
                bg: "rgba(16, 185, 129, 0.15)",
              },
            ].map(({ label, desc, href, icon: Icon, color, bg }) => (
              <Link key={href} href={href}>
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-card transition-colors cursor-pointer group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground">{label}</p>
                    <p className="text-[10px] text-foreground/50">{desc}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-foreground/60 group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-card rounded-xl border border-border p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-foreground/60 mb-0.5">MONITORING</div>
              <h3 className="text-[13px] font-semibold text-foreground">System Health</h3>
            </div>
            {healthData?.supabaseConnection ? (
              <Badge className="bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 gap-1 px-2 py-0.5 text-[9px]">
                <CheckCircle2 className="w-3 h-3" /> Healthy
              </Badge>
            ) : (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1 px-2 py-0.5 text-[9px]">
                <Server className="w-3 h-3" /> Memory Fallback
              </Badge>
            )}
          </div>
          
          {healthData && (
            <div className="space-y-3">
              <div className="p-2.5 bg-card border border-border rounded-lg text-[11px] text-foreground/70 leading-relaxed">
                {healthData.message}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 text-foreground/&">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    Supabase Configured
                  </div>
                  {healthData.supabaseConfigured ? (
                    <span className="text-[#4ADE80] text-[11px]">Yes</span>
                  ) : (
                    <span className="text-foreground/40 text-[11px]">No</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 text-foreground/&">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                    Tables Sync Status
                  </div>
                  {healthData.supabaseConnection ? (
                    <span className="text-[#4ADE80] text-[11px]">100% Synced</span>
                  ) : (
                    <span className="text-amber-500 text-[11px]">Missing Tables</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Demo note */}
      <p className="text-[10px] text-foreground/60 text-center mt-4">
        Revenue and customer figures are demonstration data. Real tracking is enabled via Supabase.
      </p>
    </div>
  )
}