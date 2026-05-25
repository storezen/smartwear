"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { StatCards } from "@/components/dashboard/stat-card"
import { FilterPills } from "@/components/dashboard/filter-pills"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { useOrders } from "@/lib/orders-context"
import { Search, Users, Phone, MapPin, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

export default function CustomersPage() {
  const { orders } = useOrders()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)

  const customerMap = useMemo(() => {
    const map = new Map<string, {
      name: string
      phone: string
      city: string
      orders: number
      totalSpent: number
      firstOrder: string
      lastOrder: string
    }>()
    for (const o of orders) {
      const existing = map.get(o.phone)
      if (existing) {
        existing.orders++
        existing.totalSpent += o.total
        if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt
      } else {
        map.set(o.phone, {
          name: o.customerName,
          phone: o.phone,
          city: o.city,
          orders: 1,
          totalSpent: o.total,
          firstOrder: o.createdAt,
          lastOrder: o.createdAt,
        })
      }
    }
    return map
  }, [orders])

  const customers = useMemo(() => {
    return Array.from(customerMap.entries())
      .map(([phone, data], i) => ({
        id: `CUST-${String(i + 1).padStart(4, "0")}`,
        ...data,
        phone,
        status: (Date.now() - new Date(data.lastOrder).getTime() < 90 * 24 * 60 * 60 * 1000 ? "active" : "inactive") as "active" | "inactive",
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }, [customerMap])

  const filtered = useMemo(() => {
    let result = customers
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.city.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") result = result.filter((c) => c.status === statusFilter)
    return result
  }, [customers, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0)
  const avgOrders = customers.length > 0 ? (customers.reduce((s, c) => s + c.orders, 0) / customers.length).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <DashboardHeader title="Customers" description={`${customers.length} customer${customers.length !== 1 ? "s" : ""} from order history.`} />

      <StatCards items={[
        { label: "Total Customers", value: customers.length, icon: Users, iconBg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400" },
        { label: "Active (90d)", value: customers.filter((c) => c.status === "active").length, icon: Users, iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
        { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: ShoppingBag, iconBg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400" },
        { label: "Avg Orders/Customer", value: avgOrders, icon: ShoppingBag, iconBg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400" },
      ]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Users className="size-5 text-neutral-500" strokeWidth={2} /> All Customers
              </h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                <input placeholder="Search customers..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="h-[48px] w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-11 text-sm sm:w-64 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-inner text-neutral-900 placeholder:text-neutral-400" />
              </div>
            </div>
          </div>

          <FilterPills options={["all", "active", "inactive"] as const} selected={statusFilter} onChange={(v) => { setStatusFilter(v as typeof statusFilter); setPage(1) }} />

          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={Users} title="No customers found"
                description={orders.length === 0 ? "Customers will appear once orders are placed." : search ? `No customers matching "${search}"` : "No customers in this filter"} />
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">City</th>
                        <th className="px-6 py-4">Orders</th>
                        <th className="px-6 py-4">Total Spent</th>
                        <th className="px-6 py-4">Last Order</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c, idx) => (
                        <motion.tr key={c.phone} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: idx * 0.03 }}
                          className="border-b border-neutral-200/60 last:border-0 hover:bg-neutral-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600 border border-blue-100 shadow-sm">
                                {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-bold text-neutral-900">{c.name}</p>
                                <p className="text-xs font-medium text-neutral-500 mt-0.5">{c.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                              <Phone className="size-3.5" strokeWidth={2} />
                              <span className="text-sm">{c.phone}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-neutral-500 font-medium">
                              <MapPin className="size-3.5" strokeWidth={2} />{c.city}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-neutral-900">{c.orders}</td>
                          <td className="px-6 py-4 font-bold text-neutral-900">Rs. {c.totalSpent.toLocaleString()}</td>
                          <td className="px-6 py-4 text-neutral-500 font-medium whitespace-nowrap text-sm">
                            {new Date(c.lastOrder).toLocaleDateString("en-PK")}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
                              c.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"
                            )}>
                              {c.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-border md:hidden">
                  {paginated.map((c, idx) => (
                    <motion.div key={c.phone} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground">{c.id}</p>
                          </div>
                        </div>
                        <Badge variant={c.status === "active" ? "primary" : "secondary"} className="text-[10px]">{c.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{c.phone}</span>
                        <span>{c.city}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{c.orders} orders</span>
                        <span className="font-semibold text-foreground">Rs. {c.totalSpent.toLocaleString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="customer" onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
