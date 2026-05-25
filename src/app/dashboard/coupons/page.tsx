"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { StatCards, StatCard } from "@/components/dashboard/stat-card"
import { FilterPills } from "@/components/dashboard/filter-pills"
import { EmptyState } from "@/components/dashboard/empty-state"
import { Pagination } from "@/components/dashboard/pagination"
import { Search, Tag, Plus, Copy, Check, X, Power } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const STORAGE_KEY = "smartwear-coupons"

interface Coupon {
  id: string
  code: string
  type: "percentage" | "fixed" | "free_shipping"
  value: number
  minOrder: number | null
  usageLimit: number
  usedCount: number
  expiresAt: string | null
  active: boolean
  description: string
}

const defaults: Coupon[] = [
  { id: "1", code: "WELCOME20", type: "percentage", value: 20, minOrder: 2000, usageLimit: 100, usedCount: 45, expiresAt: "2026-12-31", active: true, description: "New customer welcome discount" },
  { id: "2", code: "SAVE500", type: "fixed", value: 500, minOrder: 5000, usageLimit: 50, usedCount: 12, expiresAt: "2026-08-15", active: true, description: "Save Rs. 500 on orders above Rs. 5,000" },
  { id: "3", code: "FREESHIP", type: "free_shipping", value: 0, minOrder: 3000, usageLimit: 200, usedCount: 78, expiresAt: "2026-06-30", active: true, description: "Free shipping on orders above Rs. 3,000" },
  { id: "4", code: "SUMMER25", type: "percentage", value: 25, minOrder: 10000, usageLimit: 30, usedCount: 8, expiresAt: "2026-09-01", active: true, description: "Summer sale — 25% off" },
  { id: "5", code: "FLAT1000", type: "fixed", value: 1000, minOrder: 8000, usageLimit: 25, usedCount: 3, expiresAt: "2026-07-15", active: true, description: "Rs. 1,000 off on orders above Rs. 8,000" },
  { id: "6", code: "VIP15", type: "percentage", value: 15, minOrder: 15000, usageLimit: 10, usedCount: 2, expiresAt: "2026-11-01", active: false, description: "VIP customer discount" },
  { id: "7", code: "FESTIVE10", type: "percentage", value: 10, minOrder: 1000, usageLimit: 500, usedCount: 234, expiresAt: "2026-05-01", active: true, description: "Festive season discount" },
  { id: "8", code: "SPL200", type: "fixed", value: 200, minOrder: 1500, usageLimit: 0, usedCount: 0, expiresAt: "2026-04-01", active: false, description: "Special Rs. 200 off" },
]

const API = "/api/coupons"

function loadLocal(): Coupon[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || defaults } catch { return defaults }
}

function saveLocal(c: Coupon[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)) }

function toPrisma(c: Coupon) {
  return {
    code: c.code,
    discount: c.type === "percentage" ? c.value : c.value,
    type: c.type === "free_shipping" ? "fixed" : c.type,
    minOrder: c.minOrder || null,
    expiresAt: c.expiresAt || null,
    active: c.active,
    usageCount: c.usedCount,
  }
}

function fromPrisma(p: any): Coupon {
  return {
    id: p.id,
    code: p.code,
    type: p.type === "fixed" && p.discount === 0 ? "free_shipping" : (p.type as any),
    value: p.discount,
    minOrder: p.minOrder,
    usageLimit: 999,
    usedCount: p.usageCount || 0,
    expiresAt: p.expiresAt || null,
    active: p.active,
    description: "",
  }
}

const PAGE_SIZE = 8

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [page, setPage] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch(API).then((res) => {
      if (res.ok) return res.json()
      throw new Error()
    }).then((data) => {
      if (data && data.length > 0) {
        const mapped = data.map(fromPrisma)
        setCoupons(mapped)
        saveLocal(mapped)
        return
      }
      setCoupons(loadLocal())
    }).catch(() => setCoupons(loadLocal()))
  }, [])

  useEffect(() => { if (coupons.length) saveLocal(coupons) }, [coupons])

  const filtered = useMemo(() => {
    let result = coupons
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((c) => c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    }
    if (filter === "active") result = result.filter((c) => c.active)
    if (filter === "inactive") result = result.filter((c) => !c.active)
    return result
  }, [coupons, search, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function toggleActive(id: string) {
    setCoupons((prev) => {
      const target = prev.find((c) => c.id === id)
      if (!target) return prev
      const updated = { ...target, active: !target.active }
      fetch(`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPrisma(updated)),
      }).catch(() => {})
      return prev.map((c) => c.id === id ? updated : c)
    })
    toast.success("Coupon status toggled")
  }

  function addCoupon(c: Coupon) {
    const newId = `c-${Date.now()}`
    const created = { ...c, id: newId }
    setCoupons((prev) => [created, ...prev])
    setShowModal(false)
    toast.success("Coupon created")
    fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPrisma(c)),
    }).then(async (res) => {
      if (res.ok) {
        const saved = await res.json()
        setCoupons((prev) => prev.map((p) => p.id === newId ? fromPrisma(saved) : p))
      }
    }).catch(() => {})
  }

  const activeCoupons = coupons.filter((c) => c.active).length
  const totalUsed = coupons.reduce((s, c) => s + c.usedCount, 0)

  return (
    <div className="space-y-6">
      <DashboardHeader title="Coupons" description="Create and manage discount coupons.">
        <Button size="sm" className="gap-2 rounded-full h-9 bg-neutral-950 text-white hover:bg-neutral-800 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)]" onClick={() => setShowModal(true)}>
          <Plus className="size-4" strokeWidth={2} /> Add Coupon
        </Button>
      </DashboardHeader>

      <StatCards items={[
        { label: "Total Coupons", value: coupons.length, icon: Tag, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
        { label: "Active", value: activeCoupons, icon: Check, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
        { label: "Total Used", value: totalUsed, icon: Tag, iconBg: "bg-purple-50", iconColor: "text-purple-600" },
        { label: "Inactive", value: coupons.length - activeCoupons, icon: Tag, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
      ]} />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Tag className="size-5 text-neutral-500" strokeWidth={2} /> All Coupons
              </h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-neutral-400" strokeWidth={2} />
                <input placeholder="Search by code or description..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="h-[48px] w-full rounded-full border border-neutral-200/60 bg-neutral-50/50 pl-11 text-sm sm:w-64 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-inner text-neutral-900 placeholder:text-neutral-400" />
              </div>
            </div>
          </div>
          <FilterPills options={["all", "active", "inactive"] as const} selected={filter} onChange={(v) => { setFilter(v as typeof filter); setPage(1) }} />
          <div>
            {filtered.length === 0 ? (
              <EmptyState icon={Tag} title="No coupons found" description={search ? `No coupons matching "${search}"` : "No coupons in this filter"} />
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200/60 bg-neutral-50/50 text-left text-xs font-bold uppercase tracking-wider text-neutral-500">
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Description</th>
                        <th className="px-6 py-4">Discount</th>
                        <th className="px-6 py-4">Min. Order</th>
                        <th className="px-6 py-4">Usage</th>
                        <th className="px-6 py-4">Expires</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((c, idx) => {
                        const isExpired = c.expiresAt ? new Date(c.expiresAt) < new Date() : false
                        return (
                          <motion.tr key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: idx * 0.03 }} className="border-b border-neutral-200/60 last:border-0 hover:bg-neutral-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <code className="rounded-md bg-neutral-100 border border-neutral-200 px-2 py-0.5 text-sm font-mono font-bold text-neutral-900 shadow-sm">{c.code}</code>
                                <button onClick={() => handleCopy(c.code, c.id)} className="text-neutral-400 hover:text-blue-600 transition-colors ml-1">{copiedId === c.id ? <Check className="size-4 text-emerald-500" strokeWidth={2} /> : <Copy className="size-4" strokeWidth={2} />}</button>
                                <button onClick={() => toggleActive(c.id)} className="text-neutral-400 hover:text-neutral-900 transition-colors ml-1"><Power className="size-4" strokeWidth={2} /></button>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500 max-w-[200px] truncate">{c.description}</td>
                            <td className="px-6 py-4 font-bold text-neutral-900">{c.type === "percentage" ? `${c.value}%` : c.type === "free_shipping" ? "Free Shipping" : `Rs. ${c.value.toLocaleString()}`}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500">Rs. {(c.minOrder || 0).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500">{c.usedCount}/{c.usageLimit || "∞"}</td>
                            <td className="px-6 py-4 text-sm font-medium text-neutral-500 whitespace-nowrap">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-PK") : "—"}</td>
                            <td className="px-6 py-4">
                              <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide uppercase",
                                isExpired ? "bg-red-50 text-red-600 border border-red-100" : c.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                              )}>
                                {isExpired ? "Expired" : c.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-border md:hidden">
                  {paginated.map((c, idx) => (
                    <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: idx * 0.03 }} className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="rounded-md bg-secondary px-2 py-0.5 text-xs font-mono font-semibold text-foreground">{c.code}</code>
                          <button onClick={() => handleCopy(c.code, c.id)} className="text-muted-foreground hover:text-foreground">{copiedId === c.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}</button>
                        </div>
                        <Badge variant={c.active ? "primary" : "secondary"} className="text-[10px]">{c.active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground">{c.type === "percentage" ? `${c.value}% off` : c.type === "free_shipping" ? "Free Shipping" : `Rs. ${c.value} off`}</span>
                        <span className="text-muted-foreground text-xs">Used: {c.usedCount}/{c.usageLimit || "∞"} · Exp: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-PK") : "—"}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} label="coupon" onPageChange={setPage} />
              </>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && <AddCouponModal onAdd={addCoupon} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  )
}

function AddCouponModal({ onAdd, onClose }: { onAdd: (c: Coupon) => void; onClose: () => void }) {
  const [form, setForm] = useState<Omit<Coupon, "id" | "usedCount">>({ code: "", type: "percentage", value: 10, minOrder: 0, usageLimit: 100, expiresAt: "", active: true, description: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.code.trim()) errs.code = "Coupon code is required"
    if (form.value <= 0) errs.value = "Value must be greater than 0"
    if (form.type === "percentage" && form.value > 100) errs.value = "Percentage cannot exceed 100"
    if (form.expiresAt && new Date(form.expiresAt) < new Date(new Date().toDateString())) errs.expiresAt = "Expiry must be in the future"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgb(0,0,0,0.1)] border border-neutral-200/60" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-neutral-900">Add Coupon</h2>
          <button onClick={onClose} className="rounded-full p-2 bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors"><X className="size-4" strokeWidth={2} /></button>
        </div>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Code</Label>
            <Input value={form.code} onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); setErrors((prev) => ({ ...prev, code: "" })) }} placeholder="SUMMER50" className={cn("h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-bold text-neutral-900", errors.code ? "border-red-500 focus-visible:ring-red-500" : "")} />
            {errors.code && <p className="text-xs font-bold text-red-500 mt-1">{errors.code}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Description</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What this coupon does" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-medium text-neutral-900" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Type</Label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Coupon["type"] })} className="h-[48px] w-full rounded-xl border border-neutral-200/60 bg-neutral-50/50 shadow-inner px-3 text-sm font-bold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Value</Label>
              <Input type="number" value={form.value} onChange={(e) => { setForm({ ...form, value: Number(e.target.value) }); setErrors((prev) => ({ ...prev, value: "" })) }} placeholder="10" className={cn("h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900", errors.value ? "border-red-500 focus-visible:ring-red-500" : "")} />
              {errors.value && <p className="text-xs font-bold text-red-500 mt-1">{errors.value}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Min. Order (Rs)</Label>
              <Input type="number" value={form.minOrder ?? ""} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) || null })} placeholder="0" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Usage Limit</Label>
              <Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} placeholder="100" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Expiry Date</Label>
            <Input type="date" value={form.expiresAt ?? ""} onChange={(e) => { setForm({ ...form, expiresAt: e.target.value || null }); setErrors((prev) => ({ ...prev, expiresAt: "" })) }} className={cn("h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900", errors.expiresAt ? "border-red-500 focus-visible:ring-red-500" : "")} />
            {errors.expiresAt && <p className="text-xs font-bold text-red-500 mt-1">{errors.expiresAt}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-neutral-200/60">
          <Button variant="outline" className="rounded-full h-[40px] px-6 font-bold border-neutral-200/60 text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900" onClick={onClose}>Cancel</Button>
          <Button className="rounded-full h-[40px] px-6 font-bold bg-neutral-950 text-white hover:bg-neutral-800 gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)]" onClick={() => { if (validate()) onAdd({ ...form, id: "", usedCount: 0 }) }}><Check className="size-4" strokeWidth={2} /> Create Coupon</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}
