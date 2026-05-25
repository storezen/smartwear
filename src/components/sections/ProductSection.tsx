"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ProductCard } from "@/components/ProductCard"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { SectionStyle, ProductSectionData } from "@/lib/sections"
import { paddingVals } from "./section-utils"
import { useProducts } from "@/lib/products-context"

export function NewArrivalsSection({ data, style }: { data: ProductSectionData; style: SectionStyle }) {
  const { products } = useProducts()
  const sorted = [...products]
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#FAFAFA] relative border-t border-[#E5E5E5]">
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 mb-12 flex items-end justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-[#0A0A0A]"
            >
              {data.title}
            </motion.h2>
            {data.description && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-[#0A0A0A]/60 mt-2 font-medium"
              >
                {data.description}
              </motion.p>
            )}
          </div>
          <Link href="/products" className="hidden sm:flex text-sm font-bold uppercase tracking-wider text-[#0A0A0A] hover:opacity-70 transition-opacity items-center gap-2">
            View All <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 sm:px-6 lg:px-8 gap-6 md:gap-8">
          {sorted.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[320px] w-full max-w-[320px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

export function BestSellersSection({ data, style }: { data: ProductSectionData; style: SectionStyle }) {
  const { products } = useProducts()
  const sorted = [...products]
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#FAFAFA] relative border-t border-[#E5E5E5]">
      <div className="max-w-[1600px] mx-auto relative z-10">
        <div className="px-4 sm:px-6 lg:px-8 mb-12 flex items-end justify-between">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl font-bold tracking-tight text-[#0A0A0A]"
            >
              {data.title}
            </motion.h2>
            {data.description && (
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="text-[#0A0A0A]/60 mt-2 font-medium"
              >
                {data.description}
              </motion.p>
            )}
          </div>
          <Link href="/products" className="hidden sm:flex text-sm font-bold uppercase tracking-wider text-[#0A0A0A] hover:opacity-70 transition-opacity items-center gap-2">
            View All <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 sm:px-6 lg:px-8 gap-6 md:gap-8">
          {sorted.map((product) => (
            <div key={product.id} className="min-w-[280px] md:min-w-[320px] w-full max-w-[320px] shrink-0 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

