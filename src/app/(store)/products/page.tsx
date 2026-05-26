"use client"

import { useState, useMemo } from "react"
import { Search, X, SlidersHorizontal, FilterX, Sparkles, Loader2 } from "lucide-react"
import { SITE_URL } from "@/lib/constants"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { PageMeta } from "@/components/PageMeta"
import { JsonLd } from "@/components/JsonLd"
import { EmptyState } from "@/components/EmptyState"
import { PageTransition } from "@/components/PageTransition"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { useProducts } from "@/lib/products-context"
import { ProductCardSkeleton } from "@/components/storefront/product-skeleton"

const PER_PAGE = 12

export default function ProductsPage() {
  const { products, hydrated } = useProducts()
  const [search, setSearch] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [aiMatchedIds, setAiMatchedIds] = useState<string[] | null>(null)
  const [isAiSearching, setIsAiSearching] = useState(false)

  const published = useMemo(
    () => products.filter((p) => p.status !== "draft" && p.status !== "archived"),
    [products]
  )

  const filtered = useMemo(() => {
    let result = [...published]
    
    if (aiMatchedIds !== null) {
      // AI Search overrides normal search
      result = result.filter(p => aiMatchedIds.includes(p.id))
    } else if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }
    if (minPrice) result = result.filter((p) => p.price >= Number(minPrice))
    if (maxPrice) result = result.filter((p) => p.price <= Number(maxPrice))
    if (inStockOnly) result = result.filter((p) => p.inStock)
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "newest":
        result.sort((a, b) => b.id.localeCompare(a.id))
        break
    }
    return result
  }, [published, search, minPrice, maxPrice, inStockOnly, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasFilters =
    search || minPrice || maxPrice || inStockOnly || sortBy !== "newest"

  const clearFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setInStockOnly(false)
    setSortBy("newest")
    setPage(1)
  }

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value)
    if (setter === setSearch) setAiMatchedIds(null) // Reset AI search on typing
    setPage(1)
  }

  const handleSmartSearch = async () => {
    if (!search.trim()) return
    setIsAiSearching(true)
    setPage(1)
    try {
      const res = await fetch("/api/search/smart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: search })
      })
      if (res.ok) {
        const data = await res.json()
        setAiMatchedIds(data.productIds || [])
      } else {
        setAiMatchedIds(null)
      }
    } catch (e) {
      console.error(e)
      setAiMatchedIds(null)
    } finally {
      setIsAiSearching(false)
    }
  }

  const productsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "All Products — SMARTWEAR",
    url: `${SITE_URL}/products`,
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/products/${p.id}`,
    })),
  }

  return (
    <>
      <PageMeta
        title="All Products"
        description="Explore the latest smart watches, fitness trackers, and tech accessories at SMARTWEAR. Shop the freshest wearables."
        ogImage="/og-default.jpg"
      />
      <JsonLd data={productsJsonLd} />
      <PageTransition>
        <div className="min-h-screen bg-[#FAFAFA]">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl lg:text-6xl">
                All Products
              </h1>
              <p className="mt-4 text-sm font-medium text-[#0A0A0A]/60">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-10 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-sm flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0A0A]/40 pointer-events-none" />
                    <input
                      placeholder="Search products..."
                      value={search}
                      onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSmartSearch()}
                      className="h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl pl-11 pr-11 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"
                    />
                    {search && (
                      <button
                        onClick={() => { setSearch(""); setAiMatchedIds(null); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={handleSmartSearch}
                    disabled={isAiSearching || !search.trim()}
                    className="h-[48px] px-4 bg-[#0A0A0A] text-white text-sm font-medium rounded-2xl hover:bg-neutral-800 disabled:opacity-50 transition-colors flex items-center gap-2 flex-shrink-0 shadow-sm"
                    title="Smart Search with AI"
                  >
                    {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300" />}
                    <span className="hidden sm:inline">Smart</span>
                  </button>
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Rs"
                    value={minPrice}
                    onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
                    className="h-[48px] w-24 bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"
                    min={0}
                  />
                  <span className="text-[#0A0A0A]/30 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="Max Rs"
                    value={maxPrice}
                    onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                    className="h-[48px] w-24 bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl px-4 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"
                    min={0}
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setPage(1)
                      }}
                      className="h-[48px] appearance-none bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl px-4 pr-10 text-sm font-medium text-[#0A0A0A] outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <SlidersHorizontal className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-[#0A0A0A]/40" />
                  </div>

                  {/* In Stock Toggle */}
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-[#0A0A0A] cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked)
                        setPage(1)
                      }}
                      className="h-5 w-5 rounded-md border-[#E5E5E5] text-[#0A0A0A] focus:ring-[#0A0A0A] cursor-pointer"
                    />
                    In Stock
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <div className="flex">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
                  >
                    <X className="size-3" strokeWidth={2} />
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid or Empty State */}
            {!hydrated && products.length === 0 ? (
              <div className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={FilterX}
                title="No products found"
                description="Try adjusting your filters or search terms to find what you're looking for."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            ) : (
              <>
                <StaggerGrid className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
                
                {/* Minimal Pagination */}
                <div className="mt-16">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  )
}
