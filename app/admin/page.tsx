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
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/mock-data"
import { products as mockProducts } from "@/lib/mock-data"
import {
  LineChart,
  Line,
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

const revenueData = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 },
  { month: "May", revenue: 0 },
  { month: "Jun", revenue: 0 },
]

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
          <p className="text-[9px] tracking-[1.5px] text-white/60 font-medium uppercase mb-1">
            {title}
          </p>
          <p className="text-xl font-bold tracking-tight text-white leading-none">
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
  const config: Record<string, { bg: string; text: string; label: string }> = {
    delivered: { bg: "bg-[#4ADE80]/10 border-[#4ADE80]/20", text: "text-[#4ADE80]", label: "Delivered" },
    shipped: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-500", label: "Shipped" },
    pending: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-500", label: "Pending" },
    cancelled: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-500", label: "Cancelled" },
  }
  const c = config[status] || config["pending"]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md border text-[8px] font-semibold tracking-wide ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-[#0F1923] border border-white/10 rounded-xl px-4 py-2.5 shadow-xl text-sm">
        <p className="text-white/60 text-xs mb-1">{label}</p>
        <p className="font-bold text-[#C8972A]">{formatPrice(payload[0].value)}</p>
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
            title: "Total Orders",
            rawValue: orders.length,
            change: "0",
            trend: "up",
            icon: ShoppingCart,
            accentColor: "#3B82F6",
            iconBg: "rgba(59, 130, 246, 0.1)",
          },
          {
            title: "Products",
            rawValue: products.length,
            change: "+3 new",
            trend: "up",
            icon: Package,
            accentColor: "#10B981",
            iconBg: "rgba(16, 185, 129, 0.1)",
          },
          {
            title: "Customers",
            rawValue: orders.length,
            change: "0",
            trend: "up",
            icon: Users,
            accentColor: "#8B5CF6",
            iconBg: "rgba(139, 92, 246, 0.1)",
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
            className="text-lg font-semibold tracking-tight text-white"
          >
            Operations Overview
          </h1>
          <p className="text-[11px] text-white/60 mt-0.5">
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
        <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">REVENUE</div>
              <h3 className="text-[13px] font-semibold text-white">Monthly Overview</h3>
            </div>
            <div className="flex items-center gap-1 bg-[#4ADE80]/10 text-[#4ADE80] px-2 py-1 rounded-lg text-[10px] font-semibold">
              <TrendingUp className="w-3 h-3" />
              +12.5%
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8972A" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#C8972A" stopOpacity={0} />
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
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">LATEST</div>
              <h3 className="text-[13px] font-semibold text-white">Recent Orders</h3>
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
                  <div className="w-7 h-7 bg-white/5 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                    <div className="h-2.5 w-12 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-14 bg-white/5 rounded animate-pulse" />
                </div>
              ))
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#C8972A]/10 flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[#C8972A]">
                      #{order.id.slice(-3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate text-white">
                      {order.customer_name || "Guest Customer"}
                    </p>
                    <p className="text-[10px] text-white/50">
                      {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <p className="text-[12px] font-bold text-white">{formatPrice(order.total)}</p>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <p className="text-[12px] text-white/60">No orders yet.</p>
                <p className="text-[10px] text-white/60 mt-0.5">Place a test order from the store.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Top Products + Quick Actions ── */}
      <div className="grid lg:grid-cols-3 gap-3">
        {/* Top Products */}
        <div className="lg:col-span-2 bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">INVENTORY</div>
              <h3 className="text-[13px] font-semibold text-white">Top Products</h3>
            </div>
            <Link href="/admin/products">
              <button className="sw-btn-ghost-white h-7 px-3 rounded-lg text-[10px]">
                Manage All
              </button>
            </Link>
          </div>

          <div className="space-y-1.5">
            {loading ? (
              <div className="text-center py-3 text-white/50 text-[12px]">Loading...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-3 text-white/50 text-[12px]">No products added yet.</div>
            ) : topProducts.map((product: any, index: number) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-[10px] font-bold text-white/60 w-3 shrink-0">
                  {index + 1}
                </span>
                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-[#0C0F14] border border-white/10 shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-white/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold truncate text-white">{product.name}</p>
                  <p className="text-[10px] text-[#C8972A] font-medium">{product.brand}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-bold text-white">{formatPrice(product.price)}</p>
                  <p className="text-[9px] text-white/60 mt-0.5">
                    {product.stock} in stock
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl">
          <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">SHORTCUTS</div>
          <h3 className="text-[13px] font-semibold mb-3 text-white">Quick Actions</h3>

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
                <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-white/50">{desc}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[9px] tracking-[1.5px] text-white/60 mb-0.5">MONITORING</div>
              <h3 className="text-[13px] font-semibold text-white">System Health</h3>
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
              <div className="p-2.5 bg-white/5 border border-white/5 rounded-lg text-[11px] text-white/70 leading-relaxed">
                {healthData.message}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <Database className="w-3.5 h-3.5 text-blue-400" />
                    Supabase Configured
                  </div>
                  {healthData.supabaseConfigured ? (
                    <span className="text-[#4ADE80] text-[11px]">Yes</span>
                  ) : (
                    <span className="text-white/40 text-[11px]">No</span>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 text-white/80">
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
      <p className="text-[10px] text-white/60 text-center mt-4">
        Revenue and customer figures are demonstration data. Real tracking is enabled via Supabase.
      </p>
    </div>
  )
}