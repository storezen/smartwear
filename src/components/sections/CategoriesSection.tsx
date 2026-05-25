"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { useCategories } from "@/lib/categories-context"
import { useProducts } from "@/lib/products-context"
import { AnimatedSection } from "@/components/AnimatedSection"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import type { CategoriesData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"

export function CategoriesSection({ data, style }: { data: CategoriesData; style: SectionStyle }) {
  const { activeCategories } = useCategories()
  const { products } = useProducts()
  const py = paddingVals[style.padding]

  const displayCount = data.displayCount || 4
  const displayCats = activeCategories.slice(0, displayCount)

  const productCounts: Record<string, number> = {}
  for (const p of products) {
    const key = p.category?.toLowerCase().replace(/\s+/g, "-")
    productCounts[key] = (productCounts[key] || 0) + 1
  }

  if (displayCats.length === 0) return null

  return (
    <AnimatedSection
      style={{ paddingTop: py, paddingBottom: py }}
      className="relative overflow-hidden bg-white"
    >
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header - Centered like Shopify Impulse */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900"
          >
            {data.title || "Shop by Category"}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-3 text-base text-neutral-500 max-w-2xl"
            >
              {data.description}
            </motion.p>
          )}
        </div>

        <StaggerGrid className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          {displayCats.map((cat) => {
            const count = productCounts[cat.slug] || 0
            return (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/products/category/${cat.slug}`}
                  className="group relative block w-full overflow-hidden focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:outline-none"
                >
                  <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-neutral-100">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-[0.25,0.46,0.45,0.94] group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-neutral-200" />
                    )}

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-5 flex flex-col items-center justify-end text-center">
                      <h3 className="text-lg sm:text-xl font-semibold text-white tracking-wide">
                        {cat.name}
                      </h3>
                      <div className="mt-2 flex items-center justify-center opacity-0 transform translate-y-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                        <span className="inline-flex items-center gap-1 text-[13px] font-medium text-white/90 uppercase tracking-widest border-b border-white/40 pb-0.5">
                          View collection <ArrowRight className="size-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGrid>

        <div className="mt-10 flex justify-center">
          <Link
            href="/categories"
            className="inline-flex items-center justify-center rounded-sm bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            View All Categories
          </Link>
        </div>
      </div>
    </AnimatedSection>
  )
}
