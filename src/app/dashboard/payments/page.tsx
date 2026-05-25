"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { StatCards } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { FilterPills } from "@/components/dashboard/filter-pills"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { useOrders } from "@/lib/orders-context"
import { Search, DollarSign, CreditCard, TrendingUp, Ban } from "lucide-react"

const PAGE_SIZE = 10

export default function PaymentsPage() {
  const { orders } = useOrders()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const transactions = useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((o, i) => ({
        id: `TXN-${String(i + 1).padStart(5, "0")}`,
        orderId: o.id,
        customer: o.customerName,
        amount: o.total,
        method: "Cash on Delivery",
        status: o.status === "cancelled" ? "failed" : o.status === "delivered" ? "completed" : "processing",
        date: o.createdAt,
      }))
  }, [orders])

  const filtered = useMemo(() => {
    let result = transactions
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) =>
        p.id.toLowerCase().includes(q) ||
        p.customer.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter)
    return result
  }, [transactions, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalRevenue = transactions.reduce((s, p) => s + (p.status === "completed" ? p.amount : 0), 0)
  const completedCount = transactions.filter((p) => p.status === "completed").length
  const failedCount = transactions.filter((p) => p.status === "failed").length

  return (
    <div className="space-y-6">
      <DashboardHeader title="Payments" description="Transactions derived from order records." />

      <StatCards items={[
        { label: "Total Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
        { label: "Total Transactions", value: transactions.length, icon: CreditCard, iconBg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400" },
        { label: "Completed", value: completedCount, icon: TrendingUp, iconBg: "bg-emerald-50 dark:bg-emerald-950/30", iconColor: "text-emerald-600 dark:text-emerald-400" },
        { label: "Failed", value: failedCount, icon: Ban, iconBg: "bg-red-50 dark:bg-red-950/30", iconColor: "text-red-600 dark:text-red-400" },
      ]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="size-5 text-neutral-500" strokeWidth={2} /> Transactions
              </h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                <input placeholder="Search transactions..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="h-[48px] w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-11 text-sm sm:w-64 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-inner text-neutral-900 placeholder:text-neutral-400" />
              </div>
            </div>
          </div>

          <FilterPills options={["all", "completed", "processing", "failed"] as const} selected={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} />

          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={CreditCard} title="No transactions found"
                description={orders.length === 0 ? "Transactions will appear once orders are placed." : search ? `No transactions matching "${search}"` : "No transactions in this filter"} />
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        <th className="px-6 py-4">Transaction ID</th>
                        <th className="px-6 py-4">Order</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Method</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((p, idx) => (
                          <motion.tr key={p.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                            className="border-b border-neutral-200/60 last:border-0 hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-sm font-bold text-neutral-900">{p.id}</td>
                            <td className="px-6 py-4 font-mono text-xs font-bold text-neutral-500">{p.orderId}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500">{p.customer}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500">{p.method}</td>
                            <td className="px-6 py-4 text-sm font-bold text-neutral-900">Rs. {p.amount.toLocaleString()}</td>
                            <td className="px-6 py-4"><StatusBadge status={p.status} /></td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500 whitespace-nowrap">
                              {new Date(p.date).toLocaleDateString("en-PK")}
                            </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-border md:hidden">
                  {paginated.map((p, idx) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-foreground">{p.id}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[160px]">{p.customer}</span>
                        <span className="font-semibold text-foreground">Rs. {p.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{p.method}</span>
                        <span>{new Date(p.date).toLocaleDateString("en-PK")}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="transaction" onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
