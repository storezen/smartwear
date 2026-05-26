"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { formatPrice, type Product } from "@/lib/products"
import { useProducts } from "@/lib/products-context"
import { useCategories } from "@/lib/categories-context"
import { ProductFormModal } from "@/components/ProductFormModal"
import { exportProductsCsv } from "@/lib/csv-utils"
import { Search, Package, Plus, Grid3X3, List, Edit, X, Upload, Download, Copy, CheckSquare, Square, ChevronDown, Check, Trash2, Filter, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ConfirmDialog } from "@/app/dashboard/sections/ConfirmDialog"

const PAGE_SIZE = 8

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const itemAnim = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
}

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, deleteAllProducts, cloneProduct, bulkUpdateProduct } = useProducts()
  const { categories } = useCategories()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ mode: "add"; product: Product } | { mode: "edit"; product: Product } | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkModal, setBulkModal] = useState(false)
  const [bulkForm, setBulkForm] = useState<{ inStock?: boolean; featured?: boolean; category?: string }>({})
  const [enrichingId, setEnrichingId] = useState<string | null>(null)

  async function handleEnrich(id: string) {
    try {
      setEnrichingId(id)
      toast.loading("Enriching product with AI...", { id: "enrich" })
      const res = await fetch(`/api/products/${id}/enrich`, { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        updateProduct(id, data.product)
        toast.success(data.message || "Product enriched!", { id: "enrich" })
      } else {
        toast.error(data.error || "Failed to enrich product", { id: "enrich" })
      }
    } catch (err: any) {
      console.error("Enrichment fetch error:", err)
      toast.error(`Failed to connect to AI service: ${err.message}`, { id: "enrich" })
    } finally {
      setEnrichingId(null)
    }
  }

  const filtered = useMemo(() => {
    let result = products
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => (p.status || "draft") === statusFilter)
    }
    if (stockFilter === "in") {
      result = result.filter((p) => p.inStock)
    } else if (stockFilter === "out") {
      result = result.filter((p) => !p.inStock)
    }
    return result
  }, [search, statusFilter, stockFilter, products])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(paginated.map((p) => p.id)))
    }
  }

  function handleBulkDelete() {
    if (selected.size === 0) return
    selected.forEach((id) => deleteProduct(id))
    toast.success(`${selected.size} product${selected.size !== 1 ? "s" : ""} deleted`)
    setSelected(new Set())
    setBulkDeleteOpen(false)
  }

  function handleBulkEdit() {
    if (selected.size === 0 || Object.keys(bulkForm).length === 0) return
    const data: Partial<Product> = {}
    if (bulkForm.inStock !== undefined) data.inStock = bulkForm.inStock
    if (bulkForm.featured !== undefined) data.featured = bulkForm.featured
    if (bulkForm.category !== undefined) data.category = bulkForm.category
    bulkUpdateProduct(Array.from(selected), data)
    toast.success(`${selected.size} product${selected.size !== 1 ? "s" : ""} updated`)
    setSelected(new Set())
    setBulkModal(false)
    setBulkForm({})
  }

  function handleDeleteAll() {
    deleteAllProducts()
    setDeleteAllOpen(false)
    toast.success("All products deleted")
  }

  function handleExport() {
    const csv = exportProductsCsv(products)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "smartwear-products-export.csv"
    a.click(); URL.revokeObjectURL(url)
    toast.success("Products exported as CSV")
  }

  function handleSave(product: Product) {
    if (modal?.mode === "edit") {
      updateProduct(product.id, product)
      toast.success("Product updated")
    } else {
      addProduct(product)
      toast.success("Product added")
    }
    setModal(null)
  }

  function handleDelete() {
    if (!deleteId) return
    deleteProduct(deleteId)
    setDeleteId(null)
    toast.success("Product deleted")
  }

  function handleClone(id: string) {
    cloneProduct(id)
    toast.success("Product cloned")
  }

  return (
    <div className="space-y-6">
      <DashboardHeader title="Products" description="Manage your product catalog.">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 border-neutral-200/60 shadow-sm text-neutral-700 hover:text-neutral-900 font-bold" onClick={handleExport}>
            <Download className="size-4" strokeWidth={2} /> Export
          </Button>
          <Link href="/dashboard/products/import">
            <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 border-neutral-200/60 shadow-sm text-neutral-700 hover:text-neutral-900 font-bold">
              <Upload className="size-4" strokeWidth={2} /> Import
            </Button>
          </Link>
          {products.length > 0 && (
            <Button variant="outline" size="sm" className="gap-2 rounded-full h-9 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold shadow-sm" onClick={() => setDeleteAllOpen(true)}>
              <Trash2 className="size-4" strokeWidth={2} /> Delete All
            </Button>
          )}
          <Button size="sm" className="gap-2 rounded-full h-9 bg-neutral-950 text-white hover:bg-neutral-800 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)]" onClick={() => setModal({ mode: "add", product: {} as Product })}>
            <Plus className="size-4" strokeWidth={2} /> Add Product
          </Button>
        </div>
      </DashboardHeader>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-[16px] border border-blue-200 bg-blue-50/50 px-5 py-4 shadow-sm">
          <span className="text-sm font-bold text-blue-600 tracking-wide">{selected.size} selected</span>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-full border-blue-200 text-blue-700 bg-white hover:bg-blue-50 font-bold shadow-sm" onClick={() => setBulkModal(true)}>
            <CheckSquare className="size-3.5" strokeWidth={2} /> Bulk Edit
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-full text-red-600 border-red-200 bg-white hover:bg-red-50 font-bold shadow-sm" onClick={() => setBulkDeleteOpen(true)}>
            <X className="size-3.5" strokeWidth={2} /> Delete
          </Button>
          <Button variant="ghost" size="sm" className="text-xs h-8 rounded-full font-bold text-neutral-500 hover:text-neutral-700" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Package className="size-5 text-neutral-500" strokeWidth={2} /> All Products ({filtered.length})
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                  <input placeholder="Search products..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="h-[40px] w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-10 pr-4 text-sm sm:w-48 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-inner text-neutral-900 placeholder:text-neutral-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                  className="h-[40px] rounded-full border border-neutral-200/60 bg-white px-4 pr-8 text-sm font-bold text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:16px_16px]"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={stockFilter}
                  onChange={(e) => { setStockFilter(e.target.value); setPage(1) }}
                  className="h-[40px] rounded-full border border-neutral-200/60 bg-white px-4 pr-8 text-sm font-bold text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_10px_center] bg-[length:16px_16px]"
                >
                  <option value="all">All Stock</option>
                  <option value="in">In Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
                <div className="flex rounded-full border border-neutral-200/60 p-1 bg-neutral-50/50">
                  <button onClick={() => setView("grid")} className={cn("rounded-full p-1.5 transition-all duration-200", view === "grid" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-700")}>
                    <Grid3X3 className="size-4" strokeWidth={2} />
                  </button>
                  <button onClick={() => setView("list")} className={cn("rounded-full p-1.5 transition-all duration-200", view === "list" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-700")}>
                    <List className="size-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6 pt-0">
            {filtered.length === 0 ? (
              <EmptyState icon={Package} title="No products found" description={search || statusFilter !== "all" || stockFilter !== "all" ? "Try adjusting your search or filters" : "Add your first product to get started"} />
            ) : view === "grid" ? (
              <>
                <motion.div variants={container} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((p) => (
                    <motion.div key={p.id} variants={itemAnim} className={cn("group rounded-[24px] border bg-white transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1 overflow-hidden", selected.has(p.id) ? "border-blue-500 ring-2 ring-blue-500/20" : "border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]")}>
                      <div className="relative">
                        <button onClick={() => toggleSelect(p.id)} className="absolute left-3 top-3 z-10 rounded-lg p-1 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors border border-neutral-200/60">
                          {selected.has(p.id) ? <CheckSquare className="size-4.5 text-blue-600" /> : <Square className="size-4.5 text-neutral-400" />}
                        </button>
                        <div className="aspect-square overflow-hidden bg-[#F6F8FA]">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-neutral-300">
                              <Package className="size-10" strokeWidth={1} />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-medium text-[#64748B] uppercase tracking-wider">{p.category}</span>
                          <div className="flex gap-1">
                            {p.status === "published" ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">Published</span>
                            ) : p.status === "archived" ? (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">Archived</span>
                            ) : (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">Draft</span>
                            )}
                            {!p.inStock && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-600">Out of Stock</span>}
                          </div>
                        </div>
                        <p className="mt-2 text-sm font-medium text-[#0F172A] truncate">{p.name}</p>
                        <div className="flex items-baseline gap-2 mt-0.5">
                          <span className="text-sm font-semibold text-[#0F172A]">{formatPrice(p.price)}</span>
                          {p.originalPrice && <span className="text-xs text-[#64748B] line-through">{formatPrice(p.originalPrice)}</span>}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className={cn("size-1.5 rounded-full", p.inStock ? "bg-emerald-500" : "bg-red-500")} />
                            <span className={p.inStock ? "text-emerald-600" : "text-red-500"}>{p.inStock ? "In Stock" : "Out of Stock"}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-7 text-amber-500 hover:text-amber-600 hover:bg-amber-50" onClick={() => handleEnrich(p.id)} disabled={enrichingId === p.id} title="Auto-Enrich with AI">
                              {enrichingId === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => handleClone(p.id)} title="Clone">
                              <Copy className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => setModal({ mode: "edit", product: p })}>
                              <Edit className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-7 text-red-400 hover:text-red-600" onClick={() => setDeleteId(p.id)}>
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="product" onPageChange={setPage} />
              </>
            ) : (
              <>
                <div className="overflow-x-auto rounded-[24px] border border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white mt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        <th className="px-6 py-4 w-12">
                          <button onClick={toggleSelectAll} className="p-1 rounded-md hover:bg-neutral-200/50 transition-colors">
                            {selected.size === paginated.length && paginated.length > 0
                              ? <CheckSquare className="size-4.5 text-blue-600" />
                              : <Square className="size-4.5 text-neutral-400" />}
                          </button>
                        </th>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((p, idx) => (
                        <motion.tr key={p.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: idx * 0.03 }} className={cn("border-b border-neutral-200/60 last:border-0 transition-colors", selected.has(p.id) ? "bg-blue-50/50" : "hover:bg-neutral-50/50")}>
                          <td className="px-6 py-4">
                            <button onClick={() => toggleSelect(p.id)} className="p-1 rounded-md hover:bg-neutral-200/50 transition-colors">
                              {selected.has(p.id) ? <CheckSquare className="size-4.5 text-blue-600" /> : <Square className="size-4.5 text-neutral-400" />}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {p.image ? (
                                <img src={p.image} alt={p.name} className="size-12 rounded-xl object-cover border border-neutral-200/60 shadow-sm" loading="lazy" />
                              ) : (
                                <div className="size-12 rounded-xl bg-[#F6F8FA] border border-neutral-200/60 shadow-sm flex items-center justify-center">
                                  <Package className="size-5 text-neutral-400" strokeWidth={1.5} />
                                </div>
                              )}
                              <span className="font-bold text-neutral-900 truncate max-w-[200px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase ${
                              p.status === "published"
                                ? "bg-emerald-50 text-emerald-600"
                                : p.status === "archived"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-600"
                            }`}>
                              {p.status === "published" ? "Published" : p.status === "archived" ? "Archived" : "Draft"}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-neutral-900">{formatPrice(p.price)}</td>
                          <td className="px-6 py-4">
                            <span className={cn("text-xs font-bold tracking-wide uppercase", p.inStock ? "text-emerald-600" : "text-red-500")}>{p.inStock ? "In Stock" : "Out of Stock"}</span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="ghost" size="icon" className="size-8 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-50" onClick={() => handleEnrich(p.id)} disabled={enrichingId === p.id} title="Auto-Enrich with AI">
                                {enrichingId === p.id ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" strokeWidth={2} />}
                              </Button>
                              <Button variant="ghost" size="icon" className="size-8 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100" onClick={() => handleClone(p.id)} title="Clone">
                                <Copy className="size-4" strokeWidth={2} />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-bold gap-1.5 text-neutral-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => setModal({ mode: "edit", product: p })}>
                                <Edit className="size-4" strokeWidth={2} /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 rounded-full text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setDeleteId(p.id)}>
                                <X className="size-4" strokeWidth={2} />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="product" onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Bulk Edit Modal */}
      {bulkModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setBulkModal(false) }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 0 }} className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-[#0F172A]">Bulk Edit ({selected.size} products)</h2>
                <p className="text-xs text-[#64748B] mt-0.5">Fields left blank won't be changed.</p>
              </div>
              <button onClick={() => setBulkModal(false)} className="rounded-lg p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]"><X className="size-4" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Stock Status</Label>
                <select
                  value={bulkForm.inStock === undefined ? "" : String(bulkForm.inStock)}
                  onChange={(e) => setBulkForm({ ...bulkForm, inStock: e.target.value === "" ? undefined : e.target.value === "true" })}
                  className="flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#0F172A] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— No change —</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Featured</Label>
                <select
                  value={bulkForm.featured === undefined ? "" : String(bulkForm.featured)}
                  onChange={(e) => setBulkForm({ ...bulkForm, featured: e.target.value === "" ? undefined : e.target.value === "true" })}
                  className="flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#0F172A] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— No change —</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <select
                  value={bulkForm.category || ""}
                  onChange={(e) => setBulkForm({ ...bulkForm, category: e.target.value || undefined })}
                  className="flex h-9 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#0F172A] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">— No change —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setBulkModal(false)}>Cancel</Button>
              <Button size="sm" className="gap-1.5" onClick={handleBulkEdit} disabled={Object.keys(bulkForm).length === 0}>
                <Check className="size-3.5" /> Apply
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {modal && (
        <ProductFormModal
          mode={modal.mode}
          product={modal.product}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete product?"
        message="This will permanently remove this product from your catalog. This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={deleteAllOpen}
        title="Delete all products?"
        message={`Are you sure you want to delete all ${products.length} products? This action cannot be undone.`}
        confirmLabel="Delete All"
        variant="danger"
        onConfirm={handleDeleteAll}
        onCancel={() => setDeleteAllOpen(false)}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        title={`Delete ${selected.size} product${selected.size !== 1 ? "s" : ""}?`}
        message={`This will permanently remove ${selected.size} product${selected.size !== 1 ? "s" : ""} from your catalog. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  )
}
