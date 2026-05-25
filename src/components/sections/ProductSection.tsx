"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/ProductCard"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Sparkles, ArrowRight } from "lucide-react"
import type { SectionStyle, ProductSectionData } from "@/lib/sections"
import { paddingVals } from "./section-utils"
import { useProducts } from "@/lib/products-context"

export function NewArrivalsSection({ data, style }: { data: ProductSectionData; style: SectionStyle }) {
  const { products } = useProducts()
  const sorted = [...products]
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-white relative">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Centered header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3"
          >
            <Sparkles className="size-2.5" /> {data.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900"
          >
            {data.title}
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {sorted.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-sm bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              View All Products <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}

export function BestSellersSection({ data, style }: { data: ProductSectionData; style: SectionStyle }) {
  const { products } = useProducts()
  const sorted = [...products]
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#FAFAFA] relative">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Centered header */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3"
          >
            <Sparkles className="size-2.5" /> {data.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900"
          >
            {data.title}
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

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {sorted.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-sm bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            >
              View All Products <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}
