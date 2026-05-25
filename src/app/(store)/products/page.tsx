"use client"

import { useState, useMemo } from "react"
import { Search, X, SlidersHorizontal, FilterX } from "lucide-react"
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

  const published = useMemo(
    () => products.filter((p) => p.status !== "draft" && p.status !== "archived"),
    [products]
  )

  const filtered = useMemo(() => {
    let result = [...published]
    if (search.trim()) {
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
    setPage(1)
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
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            {/* Header */}
            <div className="mb-8">
              <p className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">
                Collection
              </p>
              <h1 className="font-heading mt-2 text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl leading-[1.05]">
                All Products
              </h1>
              <div className="mt-3 h-px w-12 bg-accent/40" />
              <p className="mt-3 text-sm text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                  <input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    className="h-[48px] w-full bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl pl-10 pr-9 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Rs"
                    value={minPrice}
                    onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
                    className="h-[48px] w-24 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"
                    min={0}
                  />
                  <span className="text-neutral-300 text-sm">—</span>
                  <input
                    type="number"
                    placeholder="Max Rs"
                    value={maxPrice}
                    onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                    className="h-[48px] w-24 bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-3 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-150"
                    min={0}
                  />
                </div>

                {/* Sort */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value)
                        setPage(1)
                      }}
                      className="h-[48px] appearance-none bg-neutral-50 border border-neutral-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 rounded-xl px-4 pr-9 text-sm text-neutral-900 outline-none transition-all duration-150 cursor-pointer"
                    >
                      <option value="newest">Newest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <SlidersHorizontal className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>

                  {/* In Stock Toggle */}
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => {
                        setInStockOnly(e.target.checked)
                        setPage(1)
                      }}
                      className="h-4 w-4 rounded border-border text-accent focus:ring-accent/30 focus:ring-offset-0"
                    />
                    In Stock Only
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              {hasFilters && (
                <div className="flex">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors px-3 py-1.5"
                  >
                    <X className="size-3" strokeWidth={2} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Product Grid or Empty State */}
            {!hydrated && products.length === 0 ? (
              <div className="grid gap-5 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <StaggerGrid className="grid gap-5 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  )
}
