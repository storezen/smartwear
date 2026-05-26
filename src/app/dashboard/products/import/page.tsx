"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { CSVUploadBox } from "@/components/import/CSVUploadBox"
import { ImportStats } from "@/components/import/ImportStats"
import { ImportErrorPanel } from "@/components/import/ImportErrorPanel"
import { ImportPreviewTable } from "@/components/import/ImportPreviewTable"
import { CategoryReviewPanel } from "@/components/import/CategoryReviewPanel"
import { TagReviewPanel } from "@/components/import/TagReviewPanel"
import { ImportProgress } from "@/components/import/ImportProgress"
import { parseCsvText, groupRowsByHandle } from "@/lib/import/csvParser"
import { mapGroupsToProducts } from "@/lib/import/productMapper"
import { collectCategories, slugify } from "@/lib/import/categoryDetector"
import { validateProduct } from "@/lib/import/importValidator"
import { useProducts } from "@/lib/products-context"
import { useCategories } from "@/lib/categories-context"
import {
  Upload, ArrowRight, Check, Download, AlertTriangle,
  FileText, HelpCircle, ChevronDown, ChevronRight,
  Eye, Database, ListOrdered, Tags, FolderTree, Info, Sparkles, Loader2,
} from "lucide-react"
import { toast } from "sonner"
import type { CsvRow, ParsedProduct, ImportSummary, DuplicateStrategy } from "@/lib/import/types"
import type { Product, ProductVariant } from "@/lib/products"

type Step = "upload" | "preview" | "importing" | "complete"

const SAMPLE_CSV = `Handle,Title,Body HTML,Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Option2 Name,Option2 Value,Variant SKU,Variant Inventory Qty,Variant Price,Variant Compare At Price,Image Src,Image Position,SEO Title,SEO Description,Status
sport-watch,ProSport Smart Watch,"<p>Water-resistant fitness smart watch with heart rate monitor, GPS, and 7-day battery life.</p>",SMARTWEAR,Clothing,Watch,smartwatch;fitness;waterproof,TRUE,Color,Black,Size,M,SPRT-BLK-M,50,12499,15999,https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85,1,ProSport Smart Watch,<p>Premium fitness smart watch</p>,active
sport-watch,,,,,,,,Color,Black,Size,L,SPRT-BLK-L,30,12499,15999,,,,
sport-watch,,,,,,,,Color,Black,Size,XL,SPRT-BLK-XL,20,13499,16999,,,,
air-buds,AirBuds Pro,"<p>Premium wireless earbuds with active noise cancellation and 24h battery life.</p>",SMARTWEAR,Shoes,Earbuds,earbuds;wireless;noise-cancelling,TRUE,Color,White,Size,One,AB-WHT-01,100,8999,,https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=800&q=85,1,,,active
air-buds,,,,,,,,Color,White,Size,One,AB-WHT-01,80,8999,,,,,,`

const COLUMN_GUIDE = [
  { csv: "Handle", mapsTo: "Product URL slug", required: false, note: "Auto-generated from Title if empty" },
  { csv: "Title", mapsTo: "Product Name", required: true, note: "Main product name" },
  { csv: "Body HTML", mapsTo: "Description", required: false, note: "HTML product description" },
  { csv: "Vendor", mapsTo: "Brand", required: false, note: "Used for auto-tagging" },
  { csv: "Product Category", mapsTo: "Category", required: false, note: "Auto-detected from Type/Title if empty" },
  { csv: "Type", mapsTo: "Product Type", required: false, note: "Helps detect category" },
  { csv: "Tags", mapsTo: "Tags", required: false, note: "Semicolon or comma separated" },
  { csv: "Option1/2/3 Name", mapsTo: "Variant Names", required: false, note: "e.g. Color, Size, Material" },
  { csv: "Option1/2/3 Value", mapsTo: "Variant Values", required: false, note: "e.g. Black, Large, Leather" },
  { csv: "Variant SKU", mapsTo: "SKU", required: false, note: "Unique identifier per variant" },
  { csv: "Variant Price", mapsTo: "Price", required: true, note: "Product or variant price" },
  { csv: "Variant Compare At Price", mapsTo: "Original Price", required: false, note: "Shows strikethrough price" },
  { csv: "Variant Inventory Qty", mapsTo: "Stock Quantity", required: false, note: "0 = out of stock" },
  { csv: "Image Src", mapsTo: "Product Images", required: false, note: "Image URL, sorted by Position" },
  { csv: "SEO Title", mapsTo: "Meta Title", required: false, note: "Browser tab title" },
  { csv: "SEO Description", mapsTo: "Meta Description", required: false, note: "Search result description" },
  { csv: "Status", mapsTo: "Published", required: false, note: "active/draft = published/unpublished" },
]

export default function ProductImportPage() {
  const { products: existingProducts, addProduct, updateProduct } = useProducts()
  const { categories: existingCategories, addCategory } = useCategories()

  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [csvText, setCsvText] = useState("")
  const [parseError, setParseError] = useState<string | null>(null)
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [productErrors, setProductErrors] = useState<Map<string, string[]>>(new Map())
  const [productWarnings, setProductWarnings] = useState<Map<string, string[]>>(new Map())
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>("skip")
  const [skipInvalid, setSkipInvalid] = useState(true)
  const [showGuide, setShowGuide] = useState(false)
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0, currentProduct: "", imported: 0, failed: 0, skipped: 0 })
  const [importComplete, setImportComplete] = useState(false)
  const [importError, setImportError] = useState(false)
  const [newCategoryItems, setNewCategoryItems] = useState<{ name: string; slug: string }[]>([])
  const [aiEnhancing, setAiEnhancing] = useState(false)

  const existingHandleSet = useMemo(() => new Set(existingProducts.map((p) => p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))), [existingProducts])
  const existingSkuSet = useMemo(() => new Set(existingProducts.map((p) => p.sku).filter(Boolean)), [existingProducts])

  function handleFileSelected(f: File, text: string) {
    setFile(f)
    setCsvText(text)
    setParseError(null)
    setStep("upload")

    const { rows, errors } = parseCsvText(text)

    if (rows.length === 0) {
      setParseError(errors[0]?.message || "No data rows found in CSV")
      return
    }

    setCsvRows(rows)

    const groups = groupRowsByHandle(rows)
    const { products, categoryDetections, warnings } = mapGroupsToProducts(groups, existingHandleSet, existingSkuSet)

    const errors_map = new Map<string, string[]>()
    const warnings_map = new Map<string, string[]>()
    let totalErrors = 0
    let totalWarnings = 0

    for (const p of products) {
      const validation = validateProduct(p, existingHandleSet, existingSkuSet, 0)
      if (validation.errors.length > 0) {
        errors_map.set(p.handle, validation.errors.map((e) => e.message))
        totalErrors += validation.errors.length
      }
      if (validation.warnings.length > 0) {
        warnings_map.set(p.handle, validation.warnings.map((w) => w.message))
        totalWarnings += validation.warnings.length
      }
    }

    const totalVariants = products.reduce((s, p) => s + p.variants.length, 0)
    const totalImages = products.reduce((s, p) => s + p.images.length, 0)

    const { newCategories } = collectCategories(existingCategories, categoryDetections)

    // Auto-create categories as active
    for (const c of newCategories) {
      addCategory({ name: c.name, slug: c.slug, active: true })
    }

    setParsedProducts(products)
    setProductErrors(errors_map)
    setProductWarnings(warnings_map)
    setNewCategoryItems([])
    setSummary({
      totalCsvRows: rows.length,
      totalProducts: products.length,
      totalVariants,
      totalImages,
      categoriesToCreate: newCategories.map((c) => c.name),
      tagsToCreate: [],
      products,
      errors: validationErrors(products, existingHandleSet, existingSkuSet),
      warnings,
    })

    setStep("preview")
  }

  function clearFile() {
    setFile(null)
    setCsvText("")
    setCsvRows([])
    setParsedProducts([])
    setSummary(null)
    setProductErrors(new Map())
    setProductWarnings(new Map())
    setParseError(null)
    setStep("upload")
  }

  function handleApproveCategories(items: { name: string; slug: string }[]) {
    for (const c of items) {
      addCategory({ name: c.name, slug: c.slug })
    }
    toast.success(`${items.length} categor${items.length === 1 ? "y" : "ies"} created`)
    setNewCategoryItems([])
  }

  function handleUpdateTags(handle: string, tags: string[]) {
    setParsedProducts((prev) => prev.map((p) => (p.handle === handle ? { ...p, tags } : p)))
  }

  async function handleAiEnhanceCategories() {
    const uncategorized = parsedProducts
      .map((p, i) => ({ index: i, name: p.title, description: p.description }))
      .filter((_, i) => parsedProducts[i].category === "Uncategorized" || !parsedProducts[i].category)

    if (uncategorized.length === 0) {
      toast.info("Saray products already categorized hain!")
      return
    }

    setAiEnhancing(true)
    try {
      const availableCategories = [...new Set([
        ...existingCategories.map((c) => c.name),
        ...parsedProducts.map((p) => p.category).filter(Boolean),
      ])].filter((c) => c !== "Uncategorized")

      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: uncategorized, availableCategories }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const results: { index: number; category: string }[] = data.results || []
      if (results.length === 0) {
        toast.warning("AI koi category suggest nahi kar saka")
        return
      }

      setParsedProducts((prev) => {
        const updated = [...prev]
        for (const r of results) {
          if (updated[r.index]) updated[r.index] = { ...updated[r.index], category: r.category }
        }
        return updated
      })
      toast.success(`✨ AI ne ${results.length} products ko categorize kar diya!`)
    } catch (e: any) {
      toast.error(e.message || "AI categorization fail ho gayi")
    } finally {
      setAiEnhancing(false)
    }
  }

  function downloadSampleCsv() {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "shopify-sample-import.csv"
    a.click(); URL.revokeObjectURL(url)
  }

  async function handleImport() {
    setStep("importing")
    setImportComplete(false)
    setImportError(false)

    const validProducts = parsedProducts.filter((p) => {
      const errs = productErrors.get(p.handle) || []
      return errs.length === 0 || !skipInvalid
    })

    const invalidCount = parsedProducts.length - validProducts.length
    setImportProgress({ current: 0, total: validProducts.length, currentProduct: "", imported: 0, failed: 0, skipped: invalidCount })

    let imported = 0; let failed = 0; let skipped = invalidCount

    for (let i = 0; i < validProducts.length; i++) {
      const p = validProducts[i]
      setImportProgress((prev) => ({ ...prev, current: i + 1, currentProduct: p.title || p.handle }))

      const handle = p.handle || slugify(p.title)
      const exists = existingHandleSet.has(handle) || existingProducts.some(
        (ep) => ep.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === handle
      )

      if (exists && duplicateStrategy === "skip") {
        skipped++; setImportProgress((prev) => ({ ...prev, skipped })); continue
      }

      await new Promise((r) => setTimeout(r, 50))

      try {
        const productData = buildProductData(p, p.price || (p.variants[0]?.price || 0))

        if (exists && (duplicateStrategy === "update" || duplicateStrategy === "replace")) {
          const existing = existingProducts.find(
            (ep) => ep.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === handle
          )
          if (existing) updateProduct(existing.id, { ...existing, ...productData })
          else addProduct(productData)
        } else if (exists && duplicateStrategy === "merge") {
          const existing = existingProducts.find(
            (ep) => ep.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") === handle
          )
          if (existing) {
            const mergedImages = [...new Set([...(existing.images || []), ...(productData.images || [])])]
            updateProduct(existing.id, { ...existing, ...productData, images: mergedImages })
          }
        } else {
          addProduct(productData)
        }

        imported++; setImportProgress((prev) => ({ ...prev, imported }))
      } catch {
        failed++; setImportProgress((prev) => ({ ...prev, failed }))
      }
    }

    setImportProgress((prev) => ({ ...prev, current: prev.total }))
    setImportComplete(true)
    if (failed > 0) setImportError(true)
    setStep("complete")
    toast.success(`Import complete: ${imported} imported, ${skipped} skipped, ${failed} failed`)
  }

  const invalidProducts = useMemo(() => {
    const handles = new Set(productErrors.keys())
    return parsedProducts.filter((p) => handles.has(p.handle))
  }, [parsedProducts, productErrors])

  const validProductsCount = parsedProducts.length - invalidProducts.length

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="Import Products"
        description="Upload a Shopify-style CSV to import products, variants, and images."
      />

      {/* 4-Step Progress Indicator */}
      <div className="flex items-center gap-0">
        {[
          { key: "upload", label: "Upload CSV" },
          { key: "preview", label: "Preview Data" },
          { key: "importing", label: "Import" },
          { key: "complete", label: "Complete" },
        ].map((s, i) => {
          const steps: Step[] = ["upload", "preview", "importing", "complete"]
          const currentIdx = steps.indexOf(step)
          const thisIdx = steps.indexOf(s.key as Step)
          const isActive = thisIdx === currentIdx
          const isDone = thisIdx < currentIdx

          return (
            <div key={s.key} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive ? "bg-[#2563EB] text-white shadow-sm" : isDone ? "bg-emerald-50 text-emerald-700" : "bg-[#F8FAFC] text-[#94A3B8] border border-[#E2E8F0]"
              }`}>
                <span className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : isDone ? "bg-emerald-200 text-emerald-700" : "bg-[#E2E8F0] text-[#94A3B8]"
                }`}>
                  {isDone ? "✓" : i + 1}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-px mx-2 ${isDone ? "bg-emerald-300" : "bg-[#E2E8F0]"}`} />}
            </div>
          )
        })}
      </div>

      {/* STEP 1: Upload */}
      {step === "upload" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#EFF6FF]">
              <Upload className="size-7 text-[#2563EB]" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#0F172A]">Upload Your Product CSV</h2>
            <p className="mt-1 text-sm text-[#64748B] max-w-md mx-auto">
              Upload a Shopify-style product export. Products sharing the same <strong>Handle</strong> are grouped together with their variants and images.
            </p>
          </div>

          <CSVUploadBox
            onFileSelected={handleFileSelected}
            onClear={clearFile}
            fileName={file?.name || null}
            fileSize={file?.size || null}
            error={parseError}
          />

          {/* Tips */}
          {!file && (
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Info className="size-4 text-[#2563EB]" />
                How CSV Import Works
              </div>
              <div className="grid gap-3 sm:grid-cols-2 text-xs text-[#64748B]">
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">1</span>
                  <span>Each <strong>Handle</strong> = one product. Multiple rows with same Handle are merged.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">2</span>
                  <span>Rows with <strong>Option Values</strong> become product variants (Color, Size, etc.).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">3</span>
                  <span>Rows with <strong>Image Src</strong> add photos to the product gallery.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] text-[10px] font-bold text-[#2563EB]">4</span>
                  <span><strong>Categories & Tags</strong> are auto-detected. You can review before importing.</span>
                </div>
              </div>
              <button
                onClick={downloadSampleCsv}
                className="flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-blue-700 transition-colors"
              >
                <Download className="size-3.5" /> Download Sample CSV
              </button>
            </div>
          )}

          {/* CSV Column Guide */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white overflow-hidden">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              {showGuide ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              <HelpCircle className="size-4 text-[#64748B]" />
              <span>CSV Column Reference</span>
              <span className="text-[10px] text-[#94A3B8] font-normal">({COLUMN_GUIDE.length} columns)</span>
            </button>
            {showGuide && (
              <div className="border-t border-[#E2E8F0]">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[10px] font-medium text-[#64748B]">
                        <th className="px-4 py-2 text-left font-medium">CSV Column</th>
                        <th className="px-4 py-2 text-left font-medium">Maps To</th>
                        <th className="px-4 py-2 text-left font-medium">Required</th>
                        <th className="px-4 py-2 text-left font-medium">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      {COLUMN_GUIDE.map((col) => (
                        <tr key={col.csv} className="border-b border-[#E2E8F0]/50 last:border-0 hover:bg-[#F8FAFC]">
                          <td className="px-4 py-2 font-mono text-[#0F172A] font-medium">{col.csv}</td>
                          <td className="px-4 py-2 text-[#64748B]">{col.mapsTo}</td>
                          <td className="px-4 py-2">
                            {col.required ? (
                              <span className="text-red-500 font-medium">Required</span>
                            ) : (
                              <span className="text-[#94A3B8]">Optional</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-[#94A3B8]">{col.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {csvRows.length > 0 && (
            <div className="flex justify-center pt-2">
              <Button size="lg" className="gap-2 px-8 shadow-sm" onClick={() => setStep("preview")}>
                <Eye className="size-4" /> Preview Import
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {/* STEP 2: Preview */}
      {step === "preview" && summary && (
        <AnimatePresence mode="wait">
          <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Parsing Summary */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <Database className="size-4 text-[#2563EB]" />
                CSV Parsing Summary
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-lg px-3 py-2">
                  <FileText className="size-4 text-[#64748B]" />
                  <span><strong className="text-[#0F172A]">{summary.totalCsvRows}</strong> CSV rows</span>
                </div>
                <div className="flex items-center gap-2 bg-[#EFF6FF] rounded-lg px-3 py-2">
                  <ListOrdered className="size-4 text-[#2563EB]" />
                  <span><strong className="text-[#2563EB]">{summary.totalProducts}</strong> products</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F3E8FF] rounded-lg px-3 py-2">
                  <Tags className="size-4 text-[#7C3AED]" />
                  <span><strong className="text-[#7C3AED]">{summary.totalVariants}</strong> variants</span>
                </div>
                <div className="flex items-center gap-2 bg-[#ECFDF5] rounded-lg px-3 py-2">
                  <FolderTree className="size-4 text-[#059669]" />
                  <span><strong className="text-[#059669]">{summary.totalImages}</strong> images</span>
                </div>
                <div className="flex items-center gap-2 bg-[#FFFBEB] rounded-lg px-3 py-2">
                  <FileText className="size-4 text-[#D97706]" />
                  <span><strong className="text-[#D97706]">{parsedProducts.reduce((s, p) => s + p.specs.length, 0)}</strong> specs</span>
                </div>
              </div>
            </div>

            <ImportStats summary={summary} />
            <ImportErrorPanel errors={summary.errors} warnings={summary.warnings} />
            <TagReviewPanel products={parsedProducts} onUpdateTags={handleUpdateTags} />

            {/* Duplicate Strategy */}
            <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
                <AlertTriangle className="size-4 text-amber-500" />
                Duplicate Product Handling
              </div>
              <p className="text-xs text-[#64748B]">
                {existingProducts.length > 0
                  ? `${parsedProducts.filter((p) => existingHandleSet.has(p.handle)).length} product(s) already exist in your catalog. Choose how to handle them:`
                  : "No existing products found. All products will be imported as new."}
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "skip", label: "Skip existing", desc: "Keep current products, add only new ones" },
                  { value: "update", label: "Update existing", desc: "Overwrite fields on matching products" },
                  { value: "replace", label: "Replace existing", desc: "Completely replace matching products" },
                  { value: "merge", label: "Merge variants/images", desc: "Add new variants & images to existing" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuplicateStrategy(opt.value as DuplicateStrategy)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                      duplicateStrategy === opt.value
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB]"
                        : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"
                    }`}
                  >
                    <span className="block font-medium">{opt.label}</span>
                    <span className="block text-[10px] mt-0.5 opacity-70">{opt.desc}</span>
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skipInvalid}
                  onChange={(e) => setSkipInvalid(e.target.checked)}
                  className="size-3.5 rounded border-[#CBD5E1] accent-[#2563EB]"
                />
                <span className="text-xs text-[#64748B]">Skip products with errors and import only valid ones</span>
              </label>
            </div>

            {/* Preview Actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="text-sm font-medium text-[#0F172A]">
                {validProductsCount} valid product{validProductsCount !== 1 ? "s" : ""} ready to import
                {invalidProducts.length > 0 && (
                  <span className="text-amber-600 font-normal"> · {invalidProducts.length} with errors</span>
                )}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {/* AI Enhance Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={handleAiEnhanceCategories}
                  disabled={aiEnhancing}
                >
                  {aiEnhancing ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5 text-amber-500" />
                  )}
                  {aiEnhancing ? "AI categorize kar raha hai..." : "AI Enhance Categories"}
                </Button>
                <Button variant="outline" size="sm" onClick={clearFile}>Cancel</Button>
                <Button size="sm" className="gap-1.5 shadow-sm" onClick={handleImport} disabled={validProductsCount === 0}>
                  <Upload className="size-3.5" /> Import {validProductsCount} Product{validProductsCount !== 1 ? "s" : ""}
                </Button>
              </div>
            </div>

            <ImportPreviewTable products={parsedProducts} errors={productErrors} warnings={productWarnings} />
          </motion.div>
        </AnimatePresence>
      )}

      {/* STEP 3: Importing */}
      {step === "importing" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
          <ImportProgress
            current={importProgress.current}
            total={importProgress.total}
            currentProduct={importProgress.currentProduct}
            imported={importProgress.imported}
            failed={importProgress.failed}
            skipped={importProgress.skipped}
            isComplete={importComplete}
            hasError={importError}
          />
        </motion.div>
      )}

      {/* STEP 4: Complete */}
      {step === "complete" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-6">
          <ImportProgress
            current={importProgress.total}
            total={importProgress.total}
            currentProduct=""
            imported={importProgress.imported}
            failed={importProgress.failed}
            skipped={importProgress.skipped}
            isComplete={true}
            hasError={importError}
          />
          <div className="flex justify-center gap-3">
            <Button variant="outline" className="gap-1.5" onClick={clearFile}>
              <Upload className="size-3.5" /> Import Another File
            </Button>
            <Button className="gap-1.5 shadow-sm" onClick={() => window.location.href = "/dashboard/products"}>
              <Check className="size-3.5" /> View Products
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function validationErrors(
  products: ParsedProduct[],
  existingHandles: Set<string>,
  existingSkus: Set<string>,
) {
  const allErrors: { row: number; handle: string; field: string; message: string }[] = []
  for (const p of products) {
    const v = validateProduct(p, existingHandles, existingSkus, 0)
    allErrors.push(...v.errors)
  }
  return allErrors
}

function buildProductData(p: ParsedProduct, price: number): Omit<Product, "id"> {
  return {
    name: p.title || p.handle,
    price,
    originalPrice: p.compareAtPrice,
    image: p.image || "",
    images: p.images,
    category: p.category || "Uncategorized",
    description: p.description || "",
    inStock: p.inventory > 0 || p.inventory === undefined,
    featured: false,
    specs: p.specs || [],
    sku: p.sku || "",
    quantity: p.inventory || 100,
    lowStockThreshold: Math.max(1, Math.round((p.inventory || 0) * 0.1)),
    metaTitle: p.seoTitle,
    metaDescription: p.seoDescription,
    optionNames: p.optionNames.length > 0 ? p.optionNames : undefined,
    variants: p.variants
      .filter((v) => v.option1 || v.option2 || v.option3)
      .map((v) => ({
        name: p.optionNames[0] || "Variant",
        value: v.option1 || v.option2 || v.option3 || "",
        option1: v.option1 || undefined,
        option2: v.option2 || undefined,
        option3: v.option3 || undefined,
        option1Name: p.optionNames[0] || undefined,
        option2Name: p.optionNames[1] || undefined,
        option3Name: p.optionNames[2] || undefined,
        priceAdjustment: v.price > 0 ? v.price - price : undefined,
        inStock: v.inventory > 0,
        sku: v.sku || undefined,
        image: v.image || undefined,
      } as ProductVariant)),
    tags: p.tags || [],
    handle: p.handle,
  } as unknown as Omit<Product, "id">
}
