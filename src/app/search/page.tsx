"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, SearchX, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { PageMeta } from "@/components/PageMeta"
import { PageTransition } from "@/components/PageTransition"
import { EmptyState } from "@/components/EmptyState"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { useProducts } from "@/lib/products-context"
import { cn } from "@/lib/utils"

const PER_PAGE = 12

type SortOption = "name" | "price-asc" | "price-desc"

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "name", label: "Name" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
]

export default function SearchPage() {
  const { products } = useProducts()
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<SortOption>("name")

  const published = useMemo(
    () => products.filter((p) => p.status !== "draft" && p.status !== "archived"),
    [products],
  )

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    let result = published.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q),
    )
    result.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price
      if (sort === "price-desc") return b.price - a.price
      return a.name.localeCompare(b.name)
    })
    return result
  }, [published, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <>
       <PageMeta title="Search" description="Search for your favorite smart watches and accessories." ogImage="/og-default.jpg" />
      <PageTransition>
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-neutral-200/60 shadow-sm">
                <ArrowLeft className="size-4" strokeWidth={2} />
              </div>
              Back to Store
            </Link>

          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl mb-8">Search</h1>

            <div className="relative mb-10 max-w-2xl mx-auto group">
              <Search className="absolute left-6 top-1/2 size-5 -translate-y-1/2 text-neutral-400 group-focus-within:text-blue-500 transition-colors" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1) }}
                placeholder="Search products..."
                className="h-[64px] w-full rounded-full border border-neutral-200/60 bg-white pl-14 pr-14 text-lg text-neutral-900 placeholder:text-neutral-400 transition-all focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => { setQuery(""); setPage(1) }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="size-5" strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {query && filtered.length > 0 && (
            <div className="mb-8 flex items-center justify-between">
              <p className="text-sm font-medium text-neutral-500">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for <span className="text-neutral-900 font-bold">&ldquo;{query}&rdquo;</span>
              </p>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortOption); setPage(1) }}
                className="h-[40px] rounded-full border border-neutral-200/60 bg-white px-4 text-sm font-semibold text-neutral-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none pr-8 cursor-pointer bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20stroke%3D%22%23737373%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px_16px]"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {query && filtered.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No results found"
              description={query ? `We couldn't find anything for "${query}". Try a different search term.` : "Enter a search term to discover products."}
              actionLabel="Browse All Products"
              actionHref="/products"
            />
          )}

          {filtered.length > 0 && (
            <>
              <StaggerGrid className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
          </div>
        </div>
      </PageTransition>
    </>
  )
}
