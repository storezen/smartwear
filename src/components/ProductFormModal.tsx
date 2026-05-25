"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageField } from "@/components/page-builder/ImageField"
import { X, Plus, GripVertical, Check, ImageIcon, Package, Minus, AlertTriangle, Tag, Globe, Eye, Save, Send, Clock } from "lucide-react"
import type { Product, Spec, ProductVariant } from "@/lib/products"
import { useCategories } from "@/lib/categories-context"

interface ProductFormModalProps {
  mode: "add" | "edit"
  product: Product
  onSave: (product: Product) => void
  onClose: () => void
}

const emptyProduct: Omit<Product, "id"> = {
  name: "", price: 0, image: "", images: [], category: "Clothing",
  description: "", inStock: true, featured: false, specs: [],
  sku: "", quantity: 100, lowStockThreshold: 10,
  originalPrice: undefined, rating: undefined, reviews: undefined,
  metaTitle: "", metaDescription: "", variants: [], tags: [],
  status: "draft",
}

const sections = [
  { id: "basic", label: "Basic Info" },
  { id: "media", label: "Media" },
  { id: "pricing", label: "Pricing" },
  { id: "inventory", label: "Inventory" },
  { id: "variants", label: "Variants" },
  { id: "specs", label: "Specifications" },
  { id: "tags", label: "Tags" },
  { id: "seo", label: "SEO" },
] as const

export function ProductFormModal({ mode, product: initial, onSave, onClose }: ProductFormModalProps) {
  const { categories, addCategory } = useCategories()
  const [form, setForm] = useState<Product>({ ...emptyProduct, ...initial, status: initial.status || "draft" })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeSection, setActiveSection] = useState<string>("basic")
  const [tagInput, setTagInput] = useState("")

  const completeness = useMemo(() => {
    let score = 0
    const total = 7
    const missing: string[] = []

    if (form.name.trim()) score++
    else missing.push("Product name")

    if (form.price > 0) score++
    else missing.push("Price")

    if (form.image.trim()) score++
    else missing.push("Main image")

    if (form.category.trim()) score++
    else missing.push("Category")

    if (form.description.trim()) score++
    else missing.push("Description")

    if (form.quantity > 0) score++
    else missing.push("Inventory quantity")

    if (form.specs.length > 0) score++
    else missing.push("Specifications")

    return { score, total, percent: Math.round((score / total) * 100), missing }
  }, [form])

  function setField<K extends keyof Product>(key: K, value: Product[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: "" }))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Name is required"
    if (!form.price || form.price <= 0) errs.price = "Price must be greater than 0"
    if (!form.category.trim()) errs.category = "Category is required"
    if (!form.image.trim()) errs.image = "Image is required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function addTag(tag: string) {
    const t = tag.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/^-|-$/g, "")
    if (!t) return
    setForm((prev) => ({
      ...prev,
      tags: prev.tags?.includes(t) ? prev.tags : [...(prev.tags || []), t],
    }))
    setTagInput("")
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: (prev.tags || []).filter((t) => t !== tag) }))
  }

  function addSpec() {
    setForm((prev) => ({ ...prev, specs: [...prev.specs, { label: "", value: "" }] }))
  }

  function removeSpec(i: number) {
    setForm((prev) => ({ ...prev, specs: prev.specs.filter((_, idx) => idx !== i) }))
  }

  function updateSpec(i: number, field: keyof Spec, value: string) {
    setForm((prev) => {
      const specs = [...prev.specs]
      specs[i] = { ...specs[i], [field]: value }
      return { ...prev, specs }
    })
  }

  function addVariant() {
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { name: "", value: "", priceAdjustment: 0, inStock: true, sku: "" }],
    }))
  }

  function removeVariant(i: number) {
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, idx) => idx !== i),
    }))
  }

  function updateVariant(i: number, field: keyof ProductVariant, value: string | number | boolean) {
    setForm((prev) => {
      const variants = [...(prev.variants || [])]
      variants[i] = { ...variants[i], [field]: value }
      return { ...prev, variants }
    })
  }

  function addImage() {
    setForm((prev) => ({ ...prev, images: [...(prev.images || []), ""] }))
  }

  function removeImage(i: number) {
    setForm((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, idx) => idx !== i),
    }))
  }

  function updateImage(i: number, value: string) {
    setForm((prev) => {
      const images = [...(prev.images || [])]
      images[i] = value
      return { ...prev, images }
    })
  }

  function handleSave(as: "draft" | "published") {
    if (as === "published" && !validate()) {
      setActiveSection("basic")
      return
    }
    onSave({ ...form, status: as })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-4 pb-20 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#0F172A]">
                {mode === "add" ? "New Product" : "Edit Product"}
              </h2>
              <p className="mt-0.5 text-xs text-[#64748B]">
                {mode === "add" ? "Create a new product for your store." : "Update product details."}
              </p>
            </div>
            {/* Completeness Score */}
            <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2">
              <div className="flex items-center gap-1.5">
                <div
                  className={`h-2 w-16 rounded-full ${completeness.percent === 100 ? "bg-emerald-400" : "bg-amber-400"}`}
                  style={{ width: `${Math.max(16, completeness.percent)}%` }}
                />
                <span className={`text-xs font-semibold ${completeness.percent === 100 ? "text-emerald-700" : "text-amber-700"}`}>
                  {completeness.percent}%
                </span>
              </div>
              {completeness.missing.length > 0 && completeness.percent < 100 && (
                <span className="text-[10px] text-[#64748B] hidden sm:inline">
                  Missing: {completeness.missing.slice(0, 2).join(", ")}
                  {completeness.missing.length > 2 && ` +${completeness.missing.length - 2}`}
                </span>
              )}
            </div>
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium border ${
              form.status === "published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : form.status === "archived"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}>
              {form.status === "published" ? <><Globe className="size-3" /> Published</> :
               form.status === "archived" ? <><Clock className="size-3" /> Archived</> :
               <><Clock className="size-3" /> Draft</>}
            </span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
            <X className="size-4" />
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Nav */}
          <div className="hidden sm:flex flex-col gap-1 w-36 shrink-0 sticky top-0 self-start">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === s.id
                    ? "bg-[#2563EB] text-white"
                    : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 space-y-6 max-h-[65vh] overflow-y-auto pr-1">
            {/* Basic Information */}
            <div id="basic" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Basic Information</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-medium">Product Name <span className="text-red-400">*</span></Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setField("name", e.target.value)}
                    placeholder="Urban Hoodie"
                    className={errors.name ? "border-red-400" : ""}
                  />
                  {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Category <span className="text-red-400">*</span></Label>
                  <div className="flex gap-2">
                    <select
                      value={form.category}
                      onChange={(e) => {
                        if (e.target.value === "__add__") return
                        setField("category", e.target.value)
                      }}
                      className="flex-1 h-9 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm text-[#0F172A] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                      <option value="__add__" disabled>── Quick add ──</option>
                    </select>
                    <input
                      value={form.category && !categories.some((c) => c.name === form.category) ? form.category : ""}
                      onChange={(e) => setField("category", e.target.value)}
                      placeholder="Or type new..."
                      className="h-9 w-36 rounded-lg border border-[#E2E8F0] bg-white px-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  {errors.category && <p className="text-[10px] text-red-500">{errors.category}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">SKU</Label>
                  <Input value={form.sku} onChange={(e) => setField("sku", e.target.value)}                     placeholder="SW-0001" className="font-mono text-xs h-9" />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-xs font-medium">Description <span className="text-red-400">*</span></Label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={3}
                  className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="Premium quality smart watch with fitness tracking, heart rate monitor, and 7-day battery life..."
                />
              </div>
            </div>

            {/* Media */}
            <div id="media" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Media / Images</p>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Main Image <span className="text-red-400">*</span></Label>
                  <div className="mt-1.5">
                    <ImageField value={form.image} onChange={(v) => setField("image", v)} />
                  </div>
                  {errors.image && <p className="text-[10px] text-red-500 mt-1">{errors.image}</p>}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Gallery Images</Label>
                    <Button variant="outline" size="sm" onClick={addImage} className="h-7 text-xs gap-1">
                      <Plus className="size-3" /> Add Image
                    </Button>
                  </div>
                  {(form.images || []).length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] py-6">
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="size-4 text-[#94A3B8]" />
                        <p className="text-xs text-[#94A3B8]">No gallery images</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(form.images || []).map((img, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-1">
                            <ImageField value={img} onChange={(v) => updateImage(i, v)} />
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeImage(i)} className="mt-0 size-7 shrink-0 text-[#64748B] hover:text-red-500">
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div id="pricing" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Pricing</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Price (Rs.) <span className="text-red-400">*</span></Label>
                  <Input
                    type="number"
                    value={form.price || ""}
                    onChange={(e) => setField("price", Number(e.target.value))}
                    placeholder="32000"
                    className={errors.price ? "border-red-400" : ""}
                  />
                  {errors.price && <p className="text-[10px] text-red-500">{errors.price}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Compare at Price <span className="text-[#94A3B8]">(optional)</span></Label>
                  <Input
                    type="number"
                    value={form.originalPrice || ""}
                    onChange={(e) => setField("originalPrice", e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="38000"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div id="inventory" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                <Package className="size-3.5 inline mr-1" /> Inventory
              </p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Quantity</Label>
                  <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <button type="button" onClick={() => setField("quantity", Math.max(0, form.quantity - 1))}
                      className="flex h-9 w-9 items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors border-r border-[#E2E8F0]">
                      <Minus className="size-3.5" />
                    </button>
                    <input type="number" value={form.quantity}
                      onChange={(e) => setField("quantity", Math.max(0, Number(e.target.value)))}
                      className="h-9 w-full border-0 bg-transparent text-center text-sm font-semibold text-[#0F172A] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button type="button" onClick={() => setField("quantity", form.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors border-l border-[#E2E8F0]">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Low Stock Alert</Label>
                  <div className="flex items-center rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
                    <button type="button" onClick={() => setField("lowStockThreshold", Math.max(1, form.lowStockThreshold - 1))}
                      className="flex h-9 w-9 items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors border-r border-[#E2E8F0]">
                      <Minus className="size-3.5" />
                    </button>
                    <input type="number" value={form.lowStockThreshold}
                      onChange={(e) => setField("lowStockThreshold", Math.max(1, Number(e.target.value)))}
                      className="h-9 w-full border-0 bg-transparent text-center text-sm font-semibold text-[#0F172A] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                    <button type="button" onClick={() => setField("lowStockThreshold", form.lowStockThreshold + 1)}
                      className="flex h-9 w-9 items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors border-l border-[#E2E8F0]">
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Stock Status</Label>
                  <div className="mt-1.5">
                    {form.quantity === 0 ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200">
                        <AlertTriangle className="size-3.5" /> Out of Stock
                      </span>
                    ) : form.quantity <= form.lowStockThreshold ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 border border-amber-200">
                        <AlertTriangle className="size-3.5" /> Low Stock ({form.quantity})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                        <Package className="size-3.5" /> In Stock ({form.quantity})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div id="variants" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Variants <span className="text-[#94A3B8] font-normal normal-case">(Color, Size, etc.)</span>
                </p>
                <Button variant="outline" size="sm" onClick={addVariant} className="h-7 text-xs gap-1">
                  <Plus className="size-3" /> Add Variant
                </Button>
              </div>
              {(form.variants || []).length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] py-6">
                  <p className="text-xs text-[#94A3B8]">No variants — single-option product</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(form.variants || []).map((v, i) => (
                    <div key={i} className="rounded-lg border border-[#E2E8F0]/60 bg-white p-3 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Input value={v.name} onChange={(e) => updateVariant(i, "name", e.target.value)}
                          placeholder="Name (e.g. Color)" className="h-8 w-28 text-xs" />
                        <Input value={v.value} onChange={(e) => updateVariant(i, "value", e.target.value)}
                          placeholder="Value (e.g. Black)" className="h-8 w-28 text-xs" />
                        <Input type="number" value={v.priceAdjustment || 0}
                          onChange={(e) => updateVariant(i, "priceAdjustment", Number(e.target.value))}
                          placeholder="Price adj." className="h-8 w-20 text-xs" />
                        <Input value={v.sku || ""} onChange={(e) => updateVariant(i, "sku", e.target.value)}
                          placeholder="SKU" className="h-8 w-24 text-xs" />
                        <label className="flex items-center gap-1 text-xs text-[#64748B] cursor-pointer whitespace-nowrap">
                          <input type="checkbox" checked={v.inStock !== false}
                            onChange={(e) => updateVariant(i, "inStock", e.target.checked)} className="size-3" />
                          In Stock
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => removeVariant(i)} className="size-7 shrink-0 text-[#64748B] hover:text-red-500">
                          <X className="size-3.5" />
                        </Button>
                      </div>
                      <Input value={v.image || ""} onChange={(e) => updateVariant(i, "image", e.target.value)}
                        placeholder="Variant image URL (optional)" className="h-7 text-[11px] w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Specifications */}
            <div id="specs" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">Specifications</p>
                <Button variant="outline" size="sm" onClick={addSpec} className="h-7 text-xs gap-1">
                  <Plus className="size-3" /> Add Spec
                </Button>
              </div>
              {form.specs.length === 0 ? (
                <div className="flex items-center justify-center rounded-lg border border-dashed border-[#E2E8F0] py-6">
                  <p className="text-xs text-[#94A3B8]">No specifications</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {form.specs.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-[#E2E8F0]/60 bg-white p-2.5">
                      <GripVertical className="size-4 shrink-0 text-[#CBD5E1]" />
                      <Input value={spec.label} onChange={(e) => updateSpec(i, "label", e.target.value)}
                        placeholder="Label (e.g. Display)" className="h-8 w-36 text-xs" />
                      <Input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                        placeholder="Value (e.g. 1.43 AMOLED)" className="h-8 flex-1 text-xs" />
                      <Button variant="ghost" size="icon" onClick={() => removeSpec(i)} className="size-7 shrink-0 text-[#64748B] hover:text-red-500">
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div id="tags" className="border-b border-[#E2E8F0] pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                <Tag className="size-3.5 inline mr-1" /> Tags
              </p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(form.tags || []).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-[#F1F5F9] border border-[#E2E8F0] px-2.5 py-1 text-[11px] font-medium text-[#475569]">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput) } }}
                  placeholder="Type a tag and press Enter"
                  className="h-8 text-xs flex-1"
                />
                <Button variant="outline" size="sm" onClick={() => addTag(tagInput)} className="h-8 text-xs gap-1">
                  <Plus className="size-3" /> Add
                </Button>
              </div>
            </div>

            {/* SEO */}
            <div id="seo" className="pb-5 scroll-mt-4">
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
                SEO
              </p>
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Meta Title</Label>
                  <Input value={form.metaTitle || ""} onChange={(e) => setField("metaTitle", e.target.value)}
                    placeholder="Urban Hoodie - Premium Streetwear | SMARTWEAR" className="text-xs h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Meta Description</Label>
                  <textarea value={form.metaDescription || ""} onChange={(e) => setField("metaDescription", e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Premium quality smart watch with fitness tracking, heart rate monitor, and 7-day battery life..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured || false}
                onChange={(e) => setField("featured", e.target.checked)}
                className="size-4 rounded border-[#CBD5E1] text-[#2563EB] accent-[#2563EB]" />
              <span className="text-sm text-[#0F172A]">Featured</span>
            </label>
            {form.status === "published" && form.id && (
              <a href={`/products/${form.id}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-blue-700 transition-colors">
                <Eye className="size-3.5" /> View on Store
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleSave("draft")}>
              <Save className="size-3.5" /> Save Draft
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => handleSave("published")}>
              <Send className="size-3.5" /> {form.status === "published" ? "Update" : "Publish"} Product
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
