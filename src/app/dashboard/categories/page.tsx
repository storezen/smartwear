"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { EmptyState } from "@/components/dashboard/empty-state"
import { useCategories, type ProductCategory } from "@/lib/categories-context"
import { useProducts } from "@/lib/products-context"
import { ImageField } from "@/components/page-builder/ImageField"
import { Plus, Tags, Edit, X, Check, AlertTriangle, Menu, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function CategoriesPage() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategories()
  const { products } = useProducts()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", description: "", image: "", slug: "", active: true, showInNavbar: false, showOnHomepage: false })
  const [tab, setTab] = useState<"all" | "navbar" | "homepage">("all")

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      const key = p.category?.toLowerCase().replace(/\s+/g, "-")
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [products])

  const navbarCats = categories.filter((c) => c.active !== false && c.showInNavbar)
  const homepageCats = categories.filter((c) => c.active !== false && c.showOnHomepage)
  const tabOptions = [
    { id: "all" as const, label: `All (${categories.length})` },
    { id: "navbar" as const, label: `Navbar (${navbarCats.length}/4)` },
    { id: "homepage" as const, label: `Homepage (${homepageCats.length}/4)` },
  ]

  function resetForm() {
    setForm({ name: "", description: "", image: "", slug: "", active: true, showInNavbar: false, showOnHomepage: false })
    setShowAdd(false)
    setEditingId(null)
  }

  function handleAdd() {
    if (!form.name.trim()) { toast.error("Category name is required"); return }
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    addCategory({ name: form.name, slug, description: form.description, image: form.image, active: form.active, showInNavbar: form.showInNavbar, showOnHomepage: form.showOnHomepage })
    toast.success("Category created")
    resetForm()
  }

  function startEdit(cat: ProductCategory) {
    setEditingId(cat.id)
    setForm({
      name: cat.name, slug: cat.slug, description: cat.description || "", image: cat.image || "",
      active: cat.active !== false, showInNavbar: cat.showInNavbar || false, showOnHomepage: cat.showOnHomepage || false,
    })
    setShowAdd(true)
  }

  function handleEdit(id: string) {
    if (!form.name.trim()) { toast.error("Category name is required"); return }
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    updateCategory(id, { ...cat, name: form.name, slug, description: form.description, image: form.image, active: form.active, showInNavbar: form.showInNavbar, showOnHomepage: form.showOnHomepage })
    toast.success("Category updated")
    resetForm()
  }

  function handleDelete(id: string) {
    const count = productCounts[categories.find((c) => c.id === id)?.slug || ""] || 0
    if (count > 0) { toast.error(`Cannot delete — ${count} product(s) use this category`); return }
    deleteCategory(id)
    toast.success("Category deleted")
    if (editingId === id) resetForm()
  }

  function toggleNavbar(id: string) {
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    const target = !cat.showInNavbar
    if (target && navbarCats.length >= 4) { toast.error("Only 4 categories can be shown in navbar. Remove one first."); return }
    updateCategory(id, { ...cat, showInNavbar: target })
    toast.success(target ? "Added to navbar" : "Removed from navbar")
  }

  function toggleHomepage(id: string) {
    const cat = categories.find((c) => c.id === id)
    if (!cat) return
    const target = !cat.showOnHomepage
    if (target && homepageCats.length >= 4) { toast.error("Only 4 categories can be shown on homepage. Remove one first."); return }
    updateCategory(id, { ...cat, showOnHomepage: target })
    toast.success(target ? "Added to homepage" : "Removed from homepage")
  }

  const displayedCats = tab === "navbar" ? navbarCats : tab === "homepage" ? homepageCats : categories
  const showWarning = (tab === "navbar" || tab === "homepage") &&
    (tab === "navbar" ? navbarCats : homepageCats).length < 4 &&
    categories.filter((c) => c.active !== false).length > (tab === "navbar" ? navbarCats : homepageCats).length

  return (
    <div className="space-y-8">
      <DashboardHeader title="Categories" description="Organize products and manage visibility.">
        <Button size="sm" className="gap-2 rounded-full h-9 bg-neutral-950 text-white hover:bg-neutral-800 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)]" onClick={() => { resetForm(); setShowAdd(true) }}>
          <Plus className="size-4" strokeWidth={2} /> Add Category
        </Button>
      </DashboardHeader>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200/60 pb-4">
        {tabOptions.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-5 py-2 rounded-full text-sm font-bold transition-all duration-200",
              tab === t.id ? "bg-neutral-900 text-white shadow-md" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80"
            )}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Limit warning */}
      {showWarning && (
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 text-sm font-medium text-amber-800">
          <AlertTriangle className="size-5 shrink-0" strokeWidth={2} />
          Select up to 4 categories to show{tab === "navbar" ? " in the navigation menu" : " on the homepage"}. Currently {(tab === "navbar" ? navbarCats : homepageCats).length}/4 selected.
        </div>
      )}

      {/* Add / Edit Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-neutral-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.03)] p-8 space-y-6">
          <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">{editingId ? "Edit Category" : "New Category"}</p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Clothing" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Slug</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono text-sm" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Category description for storefront" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Image</Label>
              <div className="rounded-xl border border-neutral-200/60 p-4 bg-neutral-50/50">
                <ImageField value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
              </div>
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-6 pt-4">
              {[
                { key: "active" as const, label: "Active (visible on storefront)" },
                { key: "showInNavbar" as const, label: "Show in Navbar" },
                { key: "showOnHomepage" as const, label: "Show on Homepage" },
              ].map((opt) => (
                <label key={opt.key} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" checked={form[opt.key]}
                    onChange={(e) => {
                      if (opt.key !== "active" && e.target.checked) {
                        const limit = opt.key === "showInNavbar" ? navbarCats : homepageCats
                        if (limit.length >= 4 && !editingId) { toast.error("Maximum 4 categories for this section"); return }
                      }
                      setForm({ ...form, [opt.key]: e.target.checked })
                    }}
                    className="size-5 rounded-md border-neutral-300 text-neutral-900 focus:ring-neutral-900" />
                  <span className="text-sm font-bold text-neutral-700 group-hover:text-neutral-900 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200/60 mt-6">
            <Button variant="outline" className="rounded-full h-10 px-6 font-bold text-neutral-500 border-neutral-200/60 hover:bg-neutral-100/80" onClick={resetForm}>Cancel</Button>
            <Button className="rounded-full h-10 px-6 font-bold bg-neutral-950 text-white hover:bg-neutral-800 gap-2" onClick={() => editingId ? handleEdit(editingId) : handleAdd()}>
              <Check className="size-4" strokeWidth={2} /> {editingId ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Category Grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Tags className="size-5 text-neutral-500" strokeWidth={2} />
              {tab === "navbar" ? "Navbar" : tab === "homepage" ? "Homepage" : "All"} Categories ({displayedCats.length})
            </h3>
          </div>
          <div className="p-6">
            {displayedCats.length === 0 ? (
              <EmptyState icon={Tags} title={`No ${tab === "navbar" ? "navbar" : tab === "homepage" ? "homepage" : ""} categories`}
                description={tab !== "all" ? "Mark categories to show here." : "Add your first category to organize products."} />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {displayedCats.map((cat) => {
                  const count = productCounts[cat.slug] || 0
                  return (
                    <div key={cat.id} className={cn("group rounded-[24px] border bg-white overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1",
                      cat.active === false ? "border-red-200 opacity-80" : "border-neutral-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"
                    )}>
                      <div className="aspect-[3/1] overflow-hidden bg-[#F6F8FA] relative">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-neutral-300">
                            <Tags className="size-8" strokeWidth={1} />
                          </div>
                        )}
                        {cat.active === false && (
                          <div className="absolute top-3 right-3 rounded-full bg-red-50 px-3 py-1 text-[11px] font-bold tracking-wide uppercase text-red-600 border border-red-200 shadow-sm backdrop-blur-sm">
                            Hidden
                          </div>
                        )}
                      </div>
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-base font-bold text-neutral-900">{cat.name}</p>
                            <p className="text-xs font-mono text-neutral-500 mt-0.5">/{cat.slug}</p>
                          </div>
                          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-8 rounded-full text-neutral-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => startEdit(cat)}>
                              <Edit className="size-4" strokeWidth={2} />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(cat.id)}>
                              <X className="size-4" strokeWidth={2} />
                            </Button>
                          </div>
                        </div>

                        {cat.description && (
                          <p className="text-sm font-medium text-neutral-600 line-clamp-2">{cat.description}</p>
                        )}

                        <div className="flex items-center gap-3 text-sm text-neutral-500 font-bold">
                          <span>{count} product{count !== 1 ? "s" : ""}</span>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-100">
                          <button onClick={() => toggleNavbar(cat.id)}
                            className={cn("flex items-center justify-center flex-1 gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tracking-wide uppercase border transition-all duration-200",
                              cat.showInNavbar && cat.active !== false
                                ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm"
                                : "border-neutral-200/60 bg-neutral-50/50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                            )}>
                            <Menu className="size-3.5" strokeWidth={2} /> Navbar
                          </button>
                          <button onClick={() => toggleHomepage(cat.id)}
                            className={cn("flex items-center justify-center flex-1 gap-1.5 rounded-xl px-3 py-2 text-[11px] font-bold tracking-wide uppercase border transition-all duration-200",
                              cat.showOnHomepage && cat.active !== false
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                                : "border-neutral-200/60 bg-neutral-50/50 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                            )}>
                            <Home className="size-3.5" strokeWidth={2} /> Homepage
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
