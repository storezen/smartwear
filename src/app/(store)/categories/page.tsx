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
        <div className="min-h-screen bg-[#FAFAFA]">
          <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 lg:py-12">
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Categories" }]} className="mb-6" />
            <div className="mb-6">

            {/* Header */}
            <div className="mb-8">
              <h1 className="font-heading text-4xl font-extrabold tracking-tight text-[#0A0A0A] sm:text-5xl leading-[1.05] uppercase">Collections</h1>
              <p className="mt-2 text-sm font-semibold tracking-wider uppercase text-[#0A0A0A]/50">Explore our curated collections</p>
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
                        className="group block h-full focus-visible:outline-none"
                      >
                        <div className="relative flex h-full flex-col border border-[#E5E5E5] bg-transparent p-0 transition-all duration-500 ease-out hover:border-[#0A0A0A] overflow-hidden">
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-[#E5E5E5]/20 flex items-center justify-center">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Tags className="h-8 w-8 text-[#0A0A0A]/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div className="absolute bottom-4 left-4">
                              <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#0A0A0A] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#FAFAFA]">
                                <Package className="size-3" />
                                {count}
                              </span>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex items-center justify-between p-5 bg-[#FAFAFA]">
                            <div className="min-w-0">
                              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] group-hover:text-[#0A0A0A] transition-colors duration-300">
                                {cat.name}
                              </h3>
                              {cat.description && (
                                <p className="mt-1 truncate text-xs font-semibold text-[#0A0A0A]/50">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#0A0A0A] bg-transparent transition-all duration-300 group-hover:bg-[#0A0A0A] group-hover:text-white ml-2">
                              <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
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
