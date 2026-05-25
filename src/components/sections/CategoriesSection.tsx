"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useCategories } from "@/lib/categories-context"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { CategoriesData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"

export function CategoriesSection({ data, style }: { data: CategoriesData; style: SectionStyle }) {
  const { activeCategories } = useCategories()
  const py = paddingVals[style.padding]

  const displayCount = data.displayCount || 4
  const displayCats = activeCategories.slice(0, displayCount)

  if (displayCats.length === 0) return null

  // Ensure we have exactly 4 items for the specific bento layout (or handle less gracefully)
  const bentoItems = displayCats.slice(0, 4)

  return (
    <AnimatedSection
      style={{ paddingTop: py, paddingBottom: py }}
      className="relative overflow-hidden w-full"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">
              {data.title || "Explore by Category"}
            </h2>
            {data.description && (
              <p className="text-[#0A0A0A]/60 mt-2 font-medium">{data.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px]">
          {bentoItems.map((cat, idx) => {
            // Main Large Box for the first item
            if (idx === 0) {
              return (
                <Link key={cat.id} href={`/products/category/${cat.slug}`} className="group relative rounded-2xl overflow-hidden md:col-span-2 md:row-span-2 bg-[#F0F0F0] border border-[#E5E5E5]">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{cat.name}</h3>
                    <span className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2">
                      Shop Now <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              )
            }
            
            // Second item (wide)
            if (idx === 1) {
              return (
                <Link key={cat.id} href={`/products/category/${cat.slug}`} className="group relative rounded-2xl overflow-hidden md:col-span-2 bg-[#F0F0F0] border border-[#E5E5E5]">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="text-xl font-bold text-white mb-1">{cat.name}</h3>
                    <span className="text-xs font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2">
                      Shop Now <span className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </Link>
              )
            }

            // Remaining small boxes
            return (
              <Link key={cat.id} href={`/products/category/${cat.slug}`} className="group relative rounded-2xl overflow-hidden md:col-span-1 bg-[#F0F0F0] border border-[#E5E5E5]">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 bg-neutral-200" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}

