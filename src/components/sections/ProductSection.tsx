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
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-200 bg-neutral-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-900 mb-4"
          >
            <Sparkles className="size-2.5 text-neutral-400" /> {data.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-neutral-950"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-4 text-[15px] leading-relaxed text-neutral-500 max-w-2xl"
            >
              {data.description}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sorted.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded bg-neutral-950 px-10 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-neutral-800 hover:scale-105"
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
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#FAFAFA] relative border-t border-b border-neutral-100">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        {/* Centered header */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-900 mb-4 shadow-sm"
          >
            <Sparkles className="size-2.5 text-neutral-400" /> {data.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-neutral-950"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mt-4 text-[15px] leading-relaxed text-neutral-500 max-w-2xl"
            >
              {data.description}
            </motion.p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {sorted.length > 0 && (
          <div className="mt-16 flex justify-center">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded bg-white border border-neutral-200 px-10 py-4 text-[13px] font-bold uppercase tracking-[0.1em] text-neutral-950 transition-all hover:bg-neutral-50 hover:scale-105 shadow-sm"
            >
              View All Products <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        )}
      </div>
    </AnimatedSection>
  )
}
