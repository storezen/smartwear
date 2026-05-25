"use client"

import { useState, useMemo, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Search, X, SlidersHorizontal, Package } from "lucide-react"
import { SITE_URL } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/ProductCard"
import { Pagination } from "@/components/Pagination"
import { PageMeta } from "@/components/PageMeta"
import { JsonLd } from "@/components/JsonLd"
import { EmptyState } from "@/components/EmptyState"
import { PageTransition } from "@/components/PageTransition"
import { Breadcrumbs } from "@/components/Breadcrumbs"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import { useProducts } from "@/lib/products-context"
import { useCategories } from "@/lib/categories-context"

const PER_PAGE = 12

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const { categories, getCategoryBySlug } = useCategories()
  const { products } = useProducts()
  const category = getCategoryBySlug(slug)
  const published = products.filter(
    (p) => p.status !== "draft" && p.status !== "archived"
  )

  const [search, setSearch] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState("default")

  const filtered = useMemo(() => {
    let result = category
      ? published.filter(
          (p) =>
            p.category === category.name ||
            p.category.toLowerCase().replace(/\s+/g, "-") === category.slug
        )
      : [...published]

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

    if (sortBy === "price-low") result.sort((a, b) => a.price - b.price)
    else if (sortBy === "price-high")
      result.sort((a, b) => b.price - a.price)
    else if (sortBy === "name")
      result.sort((a, b) => a.name.localeCompare(b.name))
    else result.reverse()

    return result
  }, [published, category, search, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasFilters = search || minPrice || maxPrice || sortBy !== "default"

  const clearFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("default")
  }

  const breadcrumbItems = category
    ? [
        { label: "Home", href: "/" },
        { label: "Categories", href: "/categories" },
        { label: category.name },
      ]
    : [
        { label: "Home", href: "/" },
        { label: "Category" },
      ]

  function handleFilterChange(setter: (v: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  const categoryJsonLd = category ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${category.name} Products`,
    url: `${SITE_URL}/products/category/${slug}`,
    numberOfItems: filtered.length,
    itemListElement: filtered.slice(0, 20).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/products/${p.id}`,
    })),
  } : null

  const breadcrumbJsonLd = category ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${SITE_URL}/categories` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/products/category/${slug}` },
    ],
  } : null

  return (
    <>
      <PageMeta
        title={category?.name || "Products"}
        description={`Browse our ${category?.name?.toLowerCase() || ""} collection.`}
      />
      {categoryJsonLd && <JsonLd data={categoryJsonLd} />}
      {breadcrumbJsonLd && <JsonLd data={breadcrumbJsonLd} />}
      <PageTransition>
        <div className="min-h-screen bg-background">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            {category?.image && (
              <div className="relative mb-8 overflow-hidden rounded-2xl aspect-[3/1] sm:aspect-[4/1] bg-muted shadow-sm">
                <Image src={category.image} alt={category.name} fill className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            )}

            <div className="mb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">{category?.name || "Category"}</h1>
                {category?.description && <p className="text-base text-muted-foreground">{category.description}</p>}
              </div>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search in this category..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    className="pl-9 pr-8"
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
                  <Input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => handleFilterChange(setMinPrice, e.target.value)}
                    className="w-22 h-10 text-sm"
                    min={0}
                  />
                  <span className="text-muted-foreground/50 text-sm">—</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => handleFilterChange(setMaxPrice, e.target.value)}
                    className="w-22 h-10 text-sm"
                    min={0}
                  />
                </div>

                {/* Sort & Clear */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                      className="h-10 appearance-none rounded-lg border border-border bg-card px-3 pr-8 text-sm text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
                    >
                      <option value="default">Latest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <SlidersHorizontal className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none text-muted-foreground" />
                  </div>
                  {hasFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Product Grid or Empty State */}
            {filtered.length === 0 ? (
              <EmptyState
                icon={Package}
                title="Nothing here yet"
                description="This category doesn't have any products right now. Check back later."
                actionLabel="Browse All Products"
                actionHref="/products"
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
