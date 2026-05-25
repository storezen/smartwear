"use client"

import { useState, useMemo, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronLeft, Search, X, SlidersHorizontal, Package } from "lucide-react"
import { SITE_URL } from "@/lib/constants"
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
        { label: "Products", href: "/products" },
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
      { "@type": "ListItem", position: 2, name: "Products", item: `${SITE_URL}/products` },
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
        <div className="min-h-screen bg-[#FAFAFA]">
          <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
            <Breadcrumbs items={breadcrumbItems} className="mb-6" />

            {category?.image && (
              <div className="relative mb-12 overflow-hidden rounded-2xl aspect-[3/1] sm:aspect-[4/1] bg-neutral-200">
                <Image src={category.image} alt={category.name} fill className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 to-transparent" />
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10">
                  <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">{category.name}</h1>
                  {category.description && <p className="mt-2 text-white/80 max-w-xl">{category.description}</p>}
                </div>
              </div>
            )}

            {!category?.image && (
              <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-[#0A0A0A] sm:text-5xl lg:text-6xl">
                  {category?.name || "Category"}
                </h1>
                {category?.description && (
                  <p className="mt-4 text-[#0A0A0A]/60 font-medium max-w-2xl">
                    {category.description}
                  </p>
                )}
                <p className="mt-4 text-sm font-medium text-[#0A0A0A]/60">
                  {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </p>
              </div>
            )}

            {/* Filters */}
            <div className="mb-10 space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A0A0A]/40 pointer-events-none" />
                  <input
                    placeholder="Search in this category..."
                    value={search}
                    onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                    className="h-[48px] w-full bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl pl-11 pr-11 text-sm text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 outline-none transition-all duration-200"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#0A0A0A]/40 hover:text-[#0A0A0A] transition-colors"
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

                {/* Sort & Clear */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                      className="h-[48px] appearance-none bg-white border border-[#E5E5E5] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] rounded-2xl px-4 pr-10 text-sm font-medium text-[#0A0A0A] outline-none transition-all duration-200 cursor-pointer"
                    >
                      <option value="default">Latest</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                    <SlidersHorizontal className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-[#0A0A0A]/40" />
                  </div>
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors"
                    >
                      <X className="size-3" strokeWidth={2} />
                      Clear filters
                    </button>
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
                <StaggerGrid className="grid gap-6 sm:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {paginated.map((product) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))}
                </StaggerGrid>
                
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
