"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Search,
  ChevronRight,
  SlidersHorizontal,
  Tags,
  Package,
  ArrowLeft,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageMeta } from "@/components/PageMeta"
import { EmptyState } from "@/components/EmptyState"
import { PageTransition } from "@/components/PageTransition"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { useCategories } from "@/lib/categories-context"
import { useProducts } from "@/lib/products-context"

type SortType = "popular" | "newest" | "az" | "count"

export default function AllCategoriesPage() {
  const { activeCategories } = useCategories()
  const { products } = useProducts()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortType>("popular")

  const productCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      const key = p.category?.toLowerCase().replace(/\s+/g, "-")
      counts[key] = (counts[key] || 0) + 1
    }
    return counts
  }, [products])

  const categories = useMemo(() => {
    let result = [...activeCategories]

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      )
    }

    switch (sort) {
      case "az":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "count":
        result.sort(
          (a, b) =>
            (productCounts[b.slug] || 0) - (productCounts[a.slug] || 0)
        )
        break
      case "newest":
        result.reverse()
        break
      case "popular":
      default:
        result.sort(
          (a, b) => (a.sortOrder || 99) - (b.sortOrder || 99)
        )
        break
    }

    return result
  }, [activeCategories, search, sort, productCounts])

  if (activeCategories.length === 0) {
    return (
      <>
        <PageMeta
          title="All Categories"
          description="Explore our curated collection of smart watches, fitness trackers, and accessories at SMARTWEAR."
          ogImage="/og-default.jpg"
        />
        <PageTransition>
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Categories are coming soon. Check back to explore our collection."
            actionLabel="Browse Products"
            actionHref="/products"
          />
        </PageTransition>
      </>
    )
  }

  return (
    <>
        <PageMeta
          title="All Categories"
          description="Explore our curated collection of smart watches, fitness trackers, and accessories at SMARTWEAR."
          ogImage="/og-default.jpg"
        />
      <PageTransition>
        <div className="min-h-screen bg-[#F6F8FA]">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} className="mb-6" />
            <div className="mb-6">

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl leading-[1.05]">Categories</h1>
              <p className="mt-2 text-base text-neutral-500">Explore our product categories</p>
            </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search categories..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 w-48 pl-9 pr-3 text-sm sm:w-56"
                  />
                </div>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortType)}
                    className="h-10 appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-sm font-medium text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
                  >
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                    <option value="az">A to Z</option>
                    <option value="count">Product Count</option>
                  </select>
                  <SlidersHorizontal className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Grid or Empty Search State */}
            {categories.length === 0 ? (
              <EmptyState
                icon={Tags}
                title="No categories yet"
                description="Categories are coming soon. Check back to explore our collection."
                actionLabel="Browse Products"
                actionHref="/products"
              />
            ) : (
              <StaggerGrid className="grid gap-5 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories.map((cat) => {
                  const count = productCounts[cat.slug] || 0
                  return (
                    <StaggerItem key={cat.id}>
                      <Link
                        href={`/products/category/${cat.slug}`}
                        className="group block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
                      >
                        <div className="relative flex h-full flex-col rounded-[24px] border border-neutral-200/60 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 ease-out hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group-hover:border-neutral-300/60">
                          {/* Image */}
                          <div className="relative aspect-[16/9] rounded-[16px] overflow-hidden bg-[#F6F8FA] flex items-center justify-center">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Tags className="h-8 w-8 text-muted-foreground/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute bottom-3 left-3">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
                                <Package className="size-3" />
                                {count} product{count !== 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex items-center justify-between p-4">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors duration-300">
                                {cat.name}
                              </h3>
                              {cat.description && (
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200/60 bg-neutral-50 transition-all duration-300 group-hover:border-blue-500/30 group-hover:bg-blue-50 ml-2">
                              <ChevronRight className="h-3.5 w-3.5 text-neutral-400 transition-all duration-300 group-hover:text-blue-600 group-hover:translate-x-0.5" strokeWidth={2.5} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </StaggerItem>
                  )
                })}
              </StaggerGrid>
            )}
          </div>
        </div>
      </PageTransition>
    </>
  )
}
