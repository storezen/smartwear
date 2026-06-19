"use client"

import { Suspense, useState, useEffect, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, X, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { ProductCardGrid } from "@/components/store/premium-product-card"
import { categories, formatPrice } from "@/lib/mock-data"

const sortOpts = [
  { value: "featured", label: "Featured" },
  { value: "newest",   label: "Newest" },
  { value: "price-lo", label: "Price ↑" },
  { value: "price-hi", label: "Price ↓" },
]

function Skeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="rounded-[18px] overflow-hidden">
          <div className="aspect-square skeleton" />
          <div className="p-3.5 space-y-2">
            <div className="h-2 w-12 skeleton rounded-full" />
            <div className="h-3.5 w-full skeleton rounded" />
            <div className="h-3.5 w-2/3 skeleton rounded" />
            <div className="h-4.5 w-20 skeleton rounded mt-1" />
          </div>
        </div>
      ))}
    </div>
  )
}

function FilterPanel({
  priceRange, setPriceRange,
  selected, setSelected,
  onApply, onClear,
}: {
  priceRange: [number, number]; setPriceRange: (v: [number, number]) => void
  selected: string[]; setSelected: (v: string[]) => void
  onApply: () => void; onClear: () => void
}) {
  const toggle = (slug: string) =>
    selected.includes(slug)
      ? setSelected(selected.filter(s => s !== slug))
      : setSelected([...selected, slug])

  return (
    <div className="space-y-6">
      {/* Price */}
      <div>
        <p className="sw-label text-[10px] text-[#B8860B] mb-3">Price Range</p>
        <Slider
          value={priceRange}
          onValueChange={v => setPriceRange([v[0], v[1]])}
          min={0} max={500000} step={5000}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm font-semibold text-white">
          <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs">{formatPrice(priceRange[0])}</span>
          <span className="text-white/35 text-xs">—</span>
          <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs">{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button onClick={onApply} className="sw-btn-gold w-full" style={{ height: 44, fontSize: "0.75rem" }}>
          Apply Filters
        </button>
        <button onClick={onClear} className="sw-btn-ghost-white w-full rounded-xl" style={{ height: 44, fontSize: "0.75rem" }}>
          Clear All
        </button>
      </div>
    </div>
  )
}

function ProductsContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [sort, setSort] = useState("featured")
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500000])
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const catSlug = params.get("category")
  const saleOnly = params.get("sale")
  const q = params.get("search")

  useEffect(() => { 
    if (catSlug) setSelected([catSlug]) 
    setPage(1)
  }, [catSlug])

  useEffect(() => { setPage(1) }, [q, saleOnly, sort, priceRange, selected])

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(d => { setAllProducts(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const products = useMemo(() => {
    let r = [...allProducts]
    if (q) { const lq = q.toLowerCase(); r = r.filter(p => p.name.toLowerCase().includes(lq) || p.brand.toLowerCase().includes(lq)) }
    if (catSlug) {
      r = r.filter(p => {
        const c = (p.category_slug || '').toLowerCase();
        const cat = catSlug.toLowerCase();
        
        if (cat === 'accessories') {
          return ['accessories', 'strap', 'charger', 'case', 'band', 'protector', 'cable'].some(k => c.includes(k));
        }
        if (cat === 'analog-watches' || cat === 'analog') {
          return ['analog', 'classic', 'luxury', 'mechanic', 'quartz', 'automatic'].some(k => c.includes(k));
        }
        if (cat === 'smart-watches' || cat === 'smartwatches') {
          return ['smart', 'digital', 'fitness', 'tracker', 'apple', 'samsung', 'huawei'].some(k => c.includes(k)) || c === 'watch' || c === 'watches' || c === 'smartwatches' || c === 'smart-watches';
        }
        
        return c === cat || c.includes(cat);
      });
    }
    if (saleOnly === "true") r = r.filter(p => p.compare_price)
    r = r.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === "newest") r.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    if (sort === "price-lo") r.sort((a, b) => a.price - b.price)
    if (sort === "price-hi") r.sort((a, b) => b.price - a.price)
    return r
  }, [q, catSlug, saleOnly, sort, allProducts, priceRange])

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE)
  const paginatedProducts = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const activeCat = catSlug ? categories.find(c => c.slug === catSlug) : null

  const applyFilters = () => {
    const p = new URLSearchParams()
    if (selected.length) p.set("category", selected[0])
    if (saleOnly) p.set("sale", saleOnly)
    if (q) p.set("search", q)
    router.push(`/products?${p.toString()}`)
  }
  const clearFilters = () => { setSelected([]); setPriceRange([0, 500000]); router.push("/products") }

  const filterProps = { priceRange, setPriceRange, selected, setSelected, onApply: applyFilters, onClear: clearFilters }

  const pageTitle = q ? `"${q}"` : activeCat ? activeCat.name : saleOnly === "true" ? "Sale" : "All Watches"

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">

      {/* Hero */}
      <div className="relative overflow-hidden text-white pt-20 pb-16 md:pt-32 md:pb-24">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B, transparent)" }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-white/70 mb-6 justify-center uppercase tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span>Products</span>
            {activeCat && (
              <>
                <ChevronRight className="w-3 h-3 text-[#B8860B]" />
                <span className="text-[#B8860B]">{activeCat.name}</span>
              </>
            )}
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            {pageTitle}
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            {!loading 
              ? `Explore our curated collection of ${products.length} exquisite ${products.length === 1 ? "timepiece" : "timepieces"}.`
              : "Discovering exceptional timepieces..."}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative z-30 bg-[#0C0F14] border-b border-white/5 py-2">
        <div className="sw-container">
          <div className="flex items-center gap-3 min-h-[52px]">
            {/* Mobile filter */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center lg:hidden h-8 px-3 rounded-xl gap-1.5 text-xs font-medium border border-white/10 bg-white/5 text-white">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filter
                  {selected.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#B8860B] text-black text-[9px] font-bold flex items-center justify-center">
                      {selected.length}
                    </span>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-[#0F1923] border-r border-white/5 text-white">
                <SheetHeader className="p-5 border-b border-white/5">
                  <SheetTitle className="text-base text-white">Filter Products</SheetTitle>
                </SheetHeader>
                <div className="p-5 overflow-y-auto" style={{ height: "calc(100% - 72px)" }}>
                  <FilterPanel {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <button
                onClick={() => { const p = new URLSearchParams(params.toString()); p.delete("category"); router.push(`/products?${p.toString()}`) }}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border"
                style={{
                  background: !catSlug ? "linear-gradient(135deg, #B8860B, #D4A017)" : "rgba(255,255,255,0.03)",
                  color: !catSlug ? "#000" : "rgba(255,255,255,0.6)",
                  borderColor: !catSlug ? "transparent" : "rgba(255,255,255,0.05)",
                }}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => { const p = new URLSearchParams(params.toString()); p.set("category", c.slug); router.push(`/products?${p.toString()}`) }}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all border"
                  style={{
                    background: catSlug === c.slug ? "linear-gradient(135deg, #B8860B, #D4A017)" : "rgba(255,255,255,0.03)",
                    color: catSlug === c.slug ? "#000" : "rgba(255,255,255,0.6)",
                    borderColor: catSlug === c.slug ? "transparent" : "rgba(255,255,255,0.05)",
                  }}
                >
                  {c.name}
                </button>
              ))}
              {saleOnly === "true" && (
                <button
                  onClick={() => { const p = new URLSearchParams(params.toString()); p.delete("sale"); router.push(`/products?${p.toString()}`) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 border border-red-500/20 ml-2"
                  style={{ background: "#E63946", color: "#fff" }}
                >
                  Sale <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {sortOpts.map(o => (
                <button
                  key={o.value}
                  onClick={() => setSort(o.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border"
                  style={{
                    background: sort === o.value ? "linear-gradient(135deg, #B8860B, #D4A017)" : "rgba(255,255,255,0.03)",
                    color: sort === o.value ? "#000" : "rgba(255,255,255,0.6)",
                    borderColor: sort === o.value ? "transparent" : "rgba(255,255,255,0.05)",
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="sm:hidden h-8 px-2 rounded-xl text-xs outline-none border border-white/10 bg-[#0F1923] text-white"
            >
              {sortOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="sw-container py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block shrink-0" style={{ width: 260 }}>
            <div className="sticky top-[calc(60px+52px+24px)] rounded-[24px] border border-white/5 p-6 bg-white/[0.02] backdrop-blur-xl">
              <h2 className="sw-label text-[10px] text-[#B8860B] mb-5">Filter By</h2>
              <FilterPanel {...filterProps} />
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <Skeleton count={8} />
            ) : paginatedProducts.length > 0 ? (
              <>
                <ProductCardGrid products={paginatedProducts as any} />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </button>
                    
                    <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                      {[...Array(totalPages)]
                        .map((_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
                        .map((p, index, array) => (
                          <div key={p} className="flex items-center gap-1">
                            {index > 0 && array[index - 1] !== p - 1 && (
                              <span className="text-white/30 px-1">...</span>
                            )}
                            <button
                              onClick={() => setPage(p)}
                              className={`w-10 h-10 rounded-xl text-sm font-medium transition-all shrink-0 ${
                                page === p 
                                  ? 'bg-[#B8860B] text-black border-transparent' 
                                  : 'border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-white/60" />
                </div>
                <h3 className="text-base font-semibold text-white mb-1.5">No watches found</h3>
                <p className="text-sm text-white/60 mb-6">Try adjusting your filters.</p>
                <button onClick={clearFilters} className="sw-btn-ghost-white rounded-xl h-10 px-6 text-sm">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="sw-container py-12"><Skeleton count={8} /></div>}>
      <ProductsContent />
    </Suspense>
  )
}