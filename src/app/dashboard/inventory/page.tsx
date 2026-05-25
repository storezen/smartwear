"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { StatCards } from "@/components/dashboard/stat-card"
import { Search, Boxes, Package, AlertTriangle, Minus, Plus, Check, X } from "lucide-react"
import { useProducts } from "@/lib/products-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const PAGE_SIZE = 10
const stockFilters = ["all", "in-stock", "low", "out"] as const

export default function InventoryPage() {
  const { products, updateProduct } = useProducts()
  const [search, setSearch] = useState("")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editQty, setEditQty] = useState(0)

  const inventoryItems = useMemo(() =>
    products.map((p) => ({ ...p, sku: p.sku || `ATH-${p.id.slice(0, 6).toUpperCase()}` })),
  [products])

  const filtered = useMemo(() => {
    let result = inventoryItems
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q) || i.category.toLowerCase().includes(q))
    }
    if (stockFilter === "low") result = result.filter((i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold)
    else if (stockFilter === "in-stock") result = result.filter((i) => i.quantity > i.lowStockThreshold)
    else if (stockFilter === "out") result = result.filter((i) => i.quantity === 0)
    return result
  }, [search, stockFilter, inventoryItems])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalItems = inventoryItems.length
  const lowStock = inventoryItems.filter((i) => i.quantity > 0 && i.quantity <= i.lowStockThreshold).length
  const outOfStock = inventoryItems.filter((i) => i.quantity === 0).length
  const totalQty = inventoryItems.reduce((sum, i) => sum + i.quantity, 0)

  function startEdit(item: typeof inventoryItems[number]) { setEditingId(item.id); setEditQty(item.quantity) }

  function saveEdit(id: string) {
    const product = products.find((p) => p.id === id)
    if (!product) return
    const newQty = Math.max(0, editQty)
    updateProduct(id, { ...product, quantity: newQty, inStock: newQty > 0 ? product.inStock : false })
    setEditingId(null)
    toast.success("Stock updated")
  }

  function quickAdjust(id: string, delta: number) {
    const product = products.find((p) => p.id === id)
    if (!product) return
    const newQty = Math.max(0, product.quantity + delta)
    updateProduct(id, { ...product, quantity: newQty, inStock: newQty > 0 ? product.inStock : false })
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Inventory" description="Track stock levels across all products." />

      <StatCards items={[
        { label: "Total Products", value: totalItems, icon: Package, iconBg: "bg-blue-50 dark:bg-blue-950/30", iconColor: "text-blue-600 dark:text-blue-400" },
        { label: "Total Units", value: totalQty.toLocaleString(), icon: Boxes, iconBg: "bg-purple-50 dark:bg-purple-950/30", iconColor: "text-purple-600 dark:text-purple-400" },
        { label: "Low Stock", value: lowStock, icon: AlertTriangle, iconBg: "bg-amber-50 dark:bg-amber-950/30", iconColor: "text-amber-600 dark:text-amber-400" },
        { label: "Out of Stock", value: outOfStock, icon: X, iconBg: "bg-red-50 dark:bg-red-950/30", iconColor: "text-red-600 dark:text-red-400" },
      ]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Boxes className="size-5 text-neutral-500" strokeWidth={2} /> Stock Levels
              </h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                <input placeholder="Search by name, SKU, category..." value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                  className="h-[48px] w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-11 text-sm sm:w-64 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-inner text-neutral-900 placeholder:text-neutral-400" />
              </div>
            </div>
          </div>

          <div className="flex gap-2 px-6 pt-4 pb-2">
            {stockFilters.map((f) => (
              <button key={f} onClick={() => { setStockFilter(f); setPage(1) }}
                className={cn("px-4 py-2 rounded-full text-sm font-bold transition-all duration-200",
                  stockFilter === f ? "bg-neutral-900 text-white shadow-md" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80")}>
                {f === "all" ? "All" : f === "in-stock" ? "In Stock" : f === "low" ? "Low Stock" : "Out of Stock"}
              </button>
            ))}
          </div>

          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={Boxes} title="No items found" description={search ? `No items matching "${search}"` : "No items in this filter"} />
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">SKU</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Quantity</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((item, idx) => {
                        const isLow = item.quantity > 0 && item.quantity <= item.lowStockThreshold
                        const isOut = item.quantity === 0
                        return (
                          <motion.tr key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.25, delay: idx * 0.03 }}
                            className="border-b border-neutral-200/60 last:border-0 transition-colors hover:bg-neutral-50/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="size-10 rounded-lg object-cover border border-neutral-200/60 shadow-sm" loading="lazy" />
                                ) : (
                                  <div className="size-10 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200/60">
                                    <Package className="size-4 text-neutral-400" />
                                  </div>
                                )}
                                <span className="font-bold text-neutral-900 truncate max-w-[180px]">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm font-medium text-neutral-500">{item.sku}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500">{item.category}</td>
                            <td className="px-6 py-4">
                              {editingId === item.id ? (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setEditQty(Math.max(0, editQty - 1))}
                                    className="flex size-8 items-center justify-center rounded-lg border border-neutral-200/60 text-neutral-500 hover:bg-neutral-100/80 transition-colors">
                                    <Minus className="size-3.5" strokeWidth={2} />
                                  </button>
                                  <input type="number" value={editQty} onChange={(e) => setEditQty(Math.max(0, Number(e.target.value)))}
                                    className="h-8 w-16 rounded-lg border border-neutral-200/60 text-center text-sm font-bold text-neutral-900 bg-neutral-50/50 shadow-inner focus:outline-none [appearance:textfield]" />
                                  <button onClick={() => setEditQty(editQty + 1)}
                                    className="flex size-8 items-center justify-center rounded-lg border border-neutral-200/60 text-neutral-500 hover:bg-neutral-100/80 transition-colors">
                                    <Plus className="size-3.5" strokeWidth={2} />
                                  </button>
                                  <Button variant="default" className="size-8 p-0 rounded-lg bg-neutral-950 hover:bg-neutral-800 text-white shadow-[0_4px_14px_rgb(0,0,0,0.1)] ml-2" onClick={() => saveEdit(item.id)}>
                                    <Check className="size-4" strokeWidth={2} />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-3">
                                  <span className={cn("font-bold text-base", isOut ? "text-red-600" : isLow ? "text-amber-600" : "text-neutral-900")}>
                                    {item.quantity}
                                  </span>
                                  <button onClick={() => quickAdjust(item.id, -1)}
                                    className="flex size-7 items-center justify-center rounded-md border border-neutral-200/60 text-neutral-500 hover:bg-neutral-100/80 transition-colors">
                                    <Minus className="size-3" strokeWidth={2} />
                                  </button>
                                  <button onClick={() => quickAdjust(item.id, 1)}
                                    className="flex size-7 items-center justify-center rounded-md border border-neutral-200/60 text-neutral-500 hover:bg-neutral-100/80 transition-colors">
                                    <Plus className="size-3" strokeWidth={2} />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
                                isOut ? "bg-red-50 text-red-600 border border-red-100" : isLow ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              )}>
                                {isOut ? "Out of Stock" : isLow ? "Low" : "In Stock"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm" className="h-8 px-4 rounded-full font-bold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/80 transition-colors" onClick={() => startEdit(item)}>
                                Set Qty
                              </Button>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-border md:hidden">
                  {paginated.map((item, idx) => {
                    const isLow = item.quantity > 0 && item.quantity <= item.lowStockThreshold
                    return (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: idx * 0.03 }} className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="size-8 rounded-lg object-cover" loading="lazy" />
                            ) : (
                              <div className="size-8 rounded-lg bg-muted flex items-center justify-center">
                                <Package className="size-3 text-muted-foreground/50" />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-foreground">{item.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{item.sku}</p>
                            </div>
                          </div>
                          {item.quantity === 0 ? (
                            <Badge variant="destructive" className="text-[10px]">Out</Badge>
                          ) : isLow ? (
                            <Badge variant="secondary" className="text-[10px]">Low</Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Qty: <span className="font-medium text-foreground">{item.quantity}</span></span>
                            <button onClick={() => quickAdjust(item.id, -1)}
                              className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground">
                              <Minus className="size-3" />
                            </button>
                            <button onClick={() => quickAdjust(item.id, 1)}
                              className="flex size-6 items-center justify-center rounded border border-border text-muted-foreground">
                              <Plus className="size-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="item" onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
