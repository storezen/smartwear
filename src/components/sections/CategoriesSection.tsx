"use client"

import Link from "next/link"
import { ChevronRight, Package, ArrowRight, Sparkles } from "lucide-react"
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
      className="relative overflow-hidden bg-[#F6F8FA]"
    >
      {/* Subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.8) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Background glow accents */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-80 w-96 rounded-full bg-blue-500/5 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-96 rounded-full bg-emerald-500/4 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3"
            >
              <Sparkles className="size-2.5" />
              {data.badge || "Shop By Category"}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]"
            >
              {data.title}
            </motion.h2>
            {data.description && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mt-2 text-sm text-neutral-500 max-w-md leading-relaxed"
              >
                {data.description}
              </motion.p>
            )}
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors shrink-0"
          >
            View All{" "}
            <ArrowRight className="h-4 w-4 transition-all duration-300 group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </div>

        <StaggerGrid className="grid gap-5 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          {displayCats.map((cat) => {
            const count = productCounts[cat.slug] || 0
            return (
              <StaggerItem key={cat.id}>
                <Link
                  href={`/products/category/${cat.slug}`}
                  className="group block h-full focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none rounded-2xl"
                >
                <div className="relative flex h-full flex-col rounded-[24px] border border-neutral-200/60 bg-white p-3 shadow-[0_8px_30px_rgb(0,0,0,0.03)] transition-all duration-500 ease-out hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] group-hover:border-neutral-300/60">

                    {/* Image */}
                    <div className="relative aspect-[16/9] rounded-[16px] overflow-hidden bg-[#F6F8FA]">
                      {cat.image ? (
                        <>
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08]"
                            loading="lazy"
                          />
                          {/* Light sheen on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-blue-500/0 group-hover:from-white/5 group-hover:to-blue-500/8 transition-all duration-500" />
                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Package className="h-10 w-10 text-neutral-300" strokeWidth={1} />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />

                      {/* Product count pill */}
                      <div className="absolute inset-x-3 bottom-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-neutral-700 border border-neutral-200/60 shadow-sm transition-all duration-300 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-500/20">
                          <Package className="size-2.5" strokeWidth={2} />
                          {count} item{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Category Info */}
                    <div className="relative flex items-center justify-between p-4">
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-neutral-900 group-hover:text-blue-600 transition-colors duration-300 truncate">
                          {cat.name}
                        </h3>
                        {cat.description && (
                          <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-neutral-200/60 bg-neutral-50 transition-all duration-300 group-hover:border-blue-500/30 group-hover:bg-blue-50 ml-2">
                        <ChevronRight className="h-3.5 w-3.5 text-neutral-400 transition-all duration-300 group-hover:text-blue-600 group-hover:translate-x-0.5" strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Bottom glow line on hover */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </Link>
              </StaggerItem>
            )
          })}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}
