"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { FilterPills } from "@/components/dashboard/filter-pills"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { StatCards } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useOrders, STATUS_FLOW, type OrderStatus, type CODOrder } from "@/lib/orders-context"
import {
  Search, ShoppingBag, Eye, ChevronDown, Package,
  Truck, CheckSquare, Trash2, Download, RefreshCw,
  Filter, X, ChevronUp, ArrowUpDown, DollarSign, Clock, CheckCircle2
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

const PAGE_SIZE = 10
const orderStatuses = ["all", "pending", "processing", "shipped", "delivered", "cancelled"] as const

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  shipped: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
}

type SortKey = "createdAt" | "total" | "customerName" | "status"
type SortDir = "asc" | "desc"

function exportOrdersCSV(orders: CODOrder[]) {
  const headers = ["Order ID", "Customer", "Phone", "Product", "City", "Amount", "Status", "Date"]
  const rows = orders.map(o => [
    o.id, o.customerName, o.phone, o.productName, o.city,
    o.total, o.status, new Date(o.createdAt).toLocaleDateString("en-PK")
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function OrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, bulkUpdateOrders } = useOrders()

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [cityFilter, setCityFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)

  // Sort
  const [sortKey, setSortKey] = useState<SortKey>("createdAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // Status dropdown
  const [statusOpen, setStatusOpen] = useState<string | null>(null)

  // Bulk action state
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false)

  const cities = useMemo(() => {
    const all = [...new Set(orders.map(o => o.city).filter(Boolean))]
    return ["all", ...all.sort()]
  }, [orders])

  const filtered = useMemo(() => {
    let result = orders
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.phone.includes(q) ||
        o.city.toLowerCase().includes(q)
      )
    }
    if (statusFilter !== "all") result = result.filter(o => o.status === statusFilter)
    if (cityFilter !== "all") result = result.filter(o => o.city === cityFilter)
    if (dateFrom) result = result.filter(o => new Date(o.createdAt) >= new Date(dateFrom))
    if (dateTo) result = result.filter(o => new Date(o.createdAt) <= new Date(dateTo + "T23:59:59"))

    result = [...result].sort((a, b) => {
      let va: any = a[sortKey], vb: any = b[sortKey]
      if (sortKey === "createdAt") { va = new Date(va).getTime(); vb = new Date(vb).getTime() }
      if (va < vb) return sortDir === "asc" ? -1 : 1
      if (va > vb) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return result
  }, [orders, search, statusFilter, cityFilter, dateFrom, dateTo, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalRevenue = orders.reduce((s, o) => o.status !== "cancelled" ? s + o.total : s, 0)
  const pendingCount = orders.filter(o => o.status === "pending").length
  const deliveredCount = orders.filter(o => o.status === "delivered").length

  const allPageSelected = paginated.length > 0 && paginated.every(o => selected.has(o.id))

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (allPageSelected) {
      setSelected(prev => {
        const next = new Set(prev)
        paginated.forEach(o => next.delete(o.id))
        return next
      })
    } else {
      setSelected(prev => {
        const next = new Set(prev)
        paginated.forEach(o => next.add(o.id))
        return next
      })
    }
  }, [allPageSelected, paginated])

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("desc") }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ArrowUpDown className="size-3 text-neutral-300" />
    return sortDir === "desc"
      ? <ChevronDown className="size-3 text-fuchsia-500" />
      : <ChevronUp className="size-3 text-fuchsia-500" />
  }

  function handleQuickStatus(orderId: string, newStatus: OrderStatus) {
    updateOrderStatus(orderId, newStatus)
    toast.success(`Order marked as ${statusLabels[newStatus]}`)
    setStatusOpen(null)
  }

  async function handleBulkAction(action: string, newStatus?: OrderStatus) {
    if (selected.size === 0) return
    setBulkLoading(true)
    setBulkStatusOpen(false)
    try {
      if (action === "bulk_delete") {
        if (!confirm(`Delete ${selected.size} orders? This cannot be undone.`)) return
      }
      await bulkUpdateOrders([...selected], action, newStatus)
      if (action === "bulk_status" && newStatus) toast.success(`${selected.size} orders → ${statusLabels[newStatus]}`)
      if (action === "bulk_delete") { toast.success(`${selected.size} orders deleted`); setSelected(new Set()) }
      if (action === "postex_push") toast.success(`${selected.size} orders pushed to PostEx`)
      if (action !== "bulk_delete") setSelected(new Set())
    } catch {
      toast.error("Bulk action failed")
    } finally {
      setBulkLoading(false)
    }
  }

  const hasFilters = search || statusFilter !== "all" || cityFilter !== "all" || dateFrom || dateTo

  return (
    <div className="space-y-6">
      <DashboardHeader title="Orders" description="Manage, bulk-edit, and push orders to PostEx." />

      <StatCards items={[
        { label: "Total Orders", value: orders.length, icon: ShoppingBag, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Revenue", value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Pending", value: pendingCount, icon: Clock, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        { label: "Delivered", value: deliveredCount, icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
      ]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-visible">

          {/* Toolbar */}
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <ShoppingBag className="size-5 text-neutral-400" />
                All Orders
                <span className="text-sm font-normal text-neutral-400">({filtered.length})</span>
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    placeholder="Search orders, customer, phone..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="h-[48px] w-64 rounded-2xl border border-neutral-200/60 bg-neutral-50 pl-11 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20 focus:border-fuchsia-400/50 text-neutral-900 placeholder:text-neutral-400"
                  />
                  {search && (
                    <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                      <X className="size-4" />
                    </button>
                  )}
                </div>

                {/* Filters toggle */}
                <button
                  onClick={() => setShowFilters(v => !v)}
                  className={`h-[48px] px-4 rounded-2xl border text-sm font-bold flex items-center gap-2 transition-all
                    ${hasFilters ? "bg-fuchsia-50 border-fuchsia-300 text-fuchsia-700" : "border-neutral-200 text-neutral-600 hover:border-neutral-300 bg-neutral-50"}`}
                >
                  <Filter className="size-4" />
                  Filters
                  {hasFilters && <span className="size-2 rounded-full bg-fuchsia-500" />}
                </button>

                {/* Export CSV */}
                <button
                  onClick={() => exportOrdersCSV(filtered)}
                  className="h-[48px] px-4 rounded-2xl border border-neutral-200 bg-neutral-50 text-sm font-bold text-neutral-600 hover:border-neutral-300 flex items-center gap-2 transition-all"
                >
                  <Download className="size-4" /> Export
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-[#F6F8FA] rounded-2xl border border-neutral-200/60 flex flex-wrap gap-3 items-end">
                    {/* City Filter */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">City</label>
                      <select
                        value={cityFilter}
                        onChange={e => { setCityFilter(e.target.value); setPage(1) }}
                        className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                      >
                        {cities.map(c => <option key={c} value={c}>{c === "all" ? "All Cities" : c}</option>)}
                      </select>
                    </div>
                    {/* Date From */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">From</label>
                      <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }}
                        className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
                    </div>
                    {/* Date To */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">To</label>
                      <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }}
                        className="h-10 px-3 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
                    </div>
                    {/* Clear */}
                    {hasFilters && (
                      <button
                        onClick={() => { setSearch(""); setStatusFilter("all"); setCityFilter("all"); setDateFrom(""); setDateTo(""); setPage(1) }}
                        className="h-10 px-4 rounded-xl border border-red-200 bg-red-50 text-sm font-bold text-red-600 flex items-center gap-1.5 transition-all hover:bg-red-100"
                      >
                        <X className="size-3.5" /> Clear All
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Status Filters */}
            <FilterPills options={orderStatuses as unknown as string[]} selected={statusFilter} onChange={v => { setStatusFilter(v); setPage(1) }} />
          </div>

          {/* Bulk Action Bar */}
          <AnimatePresence>
            {selected.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mx-6 mb-4 px-5 py-3 bg-neutral-950 text-white rounded-2xl flex items-center gap-3 flex-wrap"
              >
                <span className="text-sm font-bold">{selected.size} selected</span>
                <div className="h-4 w-px bg-white/20" />

                {/* Bulk Status Change */}
                <div className="relative">
                  <button
                    onClick={() => setBulkStatusOpen(v => !v)}
                    disabled={bulkLoading}
                    className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="size-3.5" /> Change Status <ChevronDown className="size-3" />
                  </button>
                  <AnimatePresence>
                    {bulkStatusOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 top-full mt-2 w-44 bg-white border border-neutral-200/60 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.12)] p-1.5 z-30"
                      >
                        {(["processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => handleBulkAction("bulk_status", s)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 rounded-[8px] transition-colors"
                          >
                            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s].split(" ")[0].replace("bg-", "bg-")}`} />
                            {statusLabels[s]}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PostEx Push */}
                <button
                  onClick={() => handleBulkAction("postex_push")}
                  disabled={bulkLoading}
                  className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Truck className="size-3.5" />
                  {bulkLoading ? "Pushing..." : "Push to PostEx"}
                </button>

                {/* Export Selected */}
                <button
                  onClick={() => exportOrdersCSV(orders.filter(o => selected.has(o.id)))}
                  className="h-8 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Download className="size-3.5" /> Export
                </button>

                {/* Bulk Delete */}
                <button
                  onClick={() => handleBulkAction("bulk_delete")}
                  disabled={bulkLoading}
                  className="h-8 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="size-3.5" /> Delete
                </button>

                {/* Deselect */}
                <button onClick={() => setSelected(new Set())} className="ml-auto text-white/50 hover:text-white transition-colors">
                  <X className="size-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Table */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description={hasFilters ? "Try adjusting your filters" : "Orders appear once customers checkout"}
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-y border-neutral-200/60 bg-neutral-50/50 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      <th className="pl-6 pr-3 py-4">
                        <input
                          type="checkbox"
                          checked={allPageSelected}
                          onChange={toggleAll}
                          className="rounded border-neutral-300 accent-neutral-950 cursor-pointer"
                        />
                      </th>
                      <th className="px-3 py-4 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => handleSort("createdAt")}>
                        <div className="flex items-center gap-1">Order ID / Date <SortIcon k="createdAt" /></div>
                      </th>
                      <th className="px-3 py-4 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => handleSort("customerName")}>
                        <div className="flex items-center gap-1">Customer <SortIcon k="customerName" /></div>
                      </th>
                      <th className="px-3 py-4">Product</th>
                      <th className="px-3 py-4 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => handleSort("total")}>
                        <div className="flex items-center gap-1">Amount <SortIcon k="total" /></div>
                      </th>
                      <th className="px-3 py-4 cursor-pointer hover:text-neutral-900 transition-colors" onClick={() => handleSort("status")}>
                        <div className="flex items-center gap-1">Status <SortIcon k="status" /></div>
                      </th>
                      <th className="px-3 py-4">City</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((o, idx) => (
                      <motion.tr
                        key={o.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.025 }}
                        className={`border-b border-neutral-200/60 last:border-0 transition-colors
                          ${selected.has(o.id) ? "bg-fuchsia-50/50" : "hover:bg-neutral-50/50"}`}
                      >
                        <td className="pl-6 pr-3 py-4">
                          <input
                            type="checkbox"
                            checked={selected.has(o.id)}
                            onChange={() => toggleSelect(o.id)}
                            className="rounded border-neutral-300 accent-neutral-950 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-bold text-neutral-900 font-mono text-xs">{o.id}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
                          {o.aiTrustScore !== undefined && o.aiTrustScore !== null && (
                            <div title={o.aiFraudReason || "AI Trust Score"} className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${o.aiTrustScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : o.aiTrustScore >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                              {o.aiTrustScore >= 80 ? "🟢" : o.aiTrustScore >= 50 ? "🟡" : "🔴"} {o.aiTrustScore}% Trust
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4">
                          <p className="font-bold text-neutral-900 text-sm">{o.customerName}</p>
                          <p className="text-xs text-neutral-500 font-mono">{o.phone}</p>
                        </td>
                        <td className="px-3 py-4 text-sm font-medium text-neutral-700 max-w-[140px] truncate">{o.productName}</td>
                        <td className="px-3 py-4 font-bold text-neutral-900">Rs. {o.total.toLocaleString()}</td>
                        <td className="px-3 py-4 relative">
                          <button
                            onClick={() => setStatusOpen(statusOpen === o.id ? null : o.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all hover:opacity-80 ${STATUS_COLORS[o.status]}`}
                          >
                            {statusLabels[o.status as OrderStatus]}
                            {STATUS_FLOW[o.status as OrderStatus]?.length > 0 && <ChevronDown className="size-3" />}
                          </button>
                          <AnimatePresence>
                            {statusOpen === o.id && STATUS_FLOW[o.status as OrderStatus]?.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, y: 4, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.97 }}
                                className="absolute left-0 top-full z-20 mt-1 w-44 rounded-2xl border border-neutral-200/60 bg-white shadow-[0_12px_40px_rgb(0,0,0,0.1)] p-1.5"
                              >
                                {STATUS_FLOW[o.status as OrderStatus].map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleQuickStatus(o.id, s)}
                                    className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-colors hover:bg-neutral-50`}
                                  >
                                    <span className={`size-2 rounded-full ${STATUS_COLORS[s].split(" ")[0]}`} />
                                    {statusLabels[s]}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </td>
                        <td className="px-3 py-4 text-xs font-medium text-neutral-500">{o.city}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* Single PostEx Push */}
                            <button
                              onClick={async () => {
                                toast.loading("Pushing to PostEx...", { id: o.id })
                                await bulkUpdateOrders([o.id], "postex_push")
                                toast.success("Pushed to PostEx!", { id: o.id })
                              }}
                              title="Push to PostEx"
                              className="size-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors"
                            >
                              <Truck className="size-4" />
                            </button>
                            <Link href={`/dashboard/orders/${o.id}`}>
                              <button
                                title="View order"
                                className="size-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Eye className="size-4" />
                              </button>
                            </Link>
                            <button
                              onClick={() => { deleteOrder(o.id); toast.success("Order deleted") }}
                              title="Delete order"
                              className="size-8 flex items-center justify-center rounded-xl text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="divide-y divide-neutral-100 md:hidden">
                {paginated.map((o, idx) => (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                    className={`p-4 space-y-3 ${selected.has(o.id) ? "bg-fuchsia-50/40" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} className="rounded border-neutral-300 accent-neutral-950" />
                        <div>
                          <p className="font-bold text-neutral-900 font-mono text-xs">{o.id}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-neutral-400">{new Date(o.createdAt).toLocaleDateString("en-PK")}</p>
                            {o.aiTrustScore !== undefined && o.aiTrustScore !== null && (
                              <span className={`px-1 rounded text-[9px] font-bold ${o.aiTrustScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : o.aiTrustScore >= 50 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                {o.aiTrustScore >= 80 ? "🟢" : o.aiTrustScore >= 50 ? "🟡" : "🔴"} {o.aiTrustScore}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-bold ${STATUS_COLORS[o.status]}`}>
                        {statusLabels[o.status as OrderStatus]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-neutral-900">{o.customerName}</p>
                        <p className="text-xs text-neutral-500">{o.phone} · {o.city}</p>
                      </div>
                      <p className="font-bold text-neutral-900">Rs. {o.total.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-neutral-500 truncate">{o.productName}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => { await bulkUpdateOrders([o.id], "postex_push"); toast.success("Pushed!") }}
                        className="flex-1 h-9 rounded-xl border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Truck className="size-3.5" /> PostEx
                      </button>
                      <Link href={`/dashboard/orders/${o.id}`} className="flex-1">
                        <button className="w-full h-9 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 text-xs font-bold flex items-center justify-center gap-1.5">
                          <Eye className="size-3.5" /> View
                        </button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="order" onPageChange={setPage} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
