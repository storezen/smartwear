"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/ProductCard"
import { AnimatedSection } from "@/components/AnimatedSection"
import { Sparkles, Award, ArrowRight } from "lucide-react"
import type { SectionStyle, ProductSectionData } from "@/lib/sections"
import { getBgStyle, paddingVals } from "./section-utils"
import { useProducts } from "@/lib/products-context"

function SectionHeader({ badge, title, description }: { badge: string; title: string; description: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
      <div>
        <Badge className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3 shadow-none hover:bg-blue-50">
          <Sparkles className="size-2.5" /> {badge}
        </Badge>
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">{title}</h2>
        <p className="mt-2 text-sm text-neutral-500 max-w-md leading-relaxed">{description}</p>
      </div>
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent/80 transition-colors shrink-0"
      >
        View All <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function NewArrivalsSection({ data, style }: { data: ProductSectionData; style: SectionStyle }) {
  const { products } = useProducts()
  const sorted = [...products]
    .filter((p) => p.status !== "draft" && p.status !== "archived")
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 4)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#F6F8FA] relative">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <SectionHeader badge={data.badge} title={data.title} description={data.description} />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
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
    .slice(0, 4)

  if (sorted.length === 0) return null

  return (
    <AnimatedSection style={{ paddingTop: paddingVals[style.padding], paddingBottom: paddingVals[style.padding] }} className="bg-[#F6F8FA] relative">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <Badge className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 mb-3 shadow-none hover:bg-blue-50">
              <Award className="size-2.5" /> {data.badge}
            </Badge>
            <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.05]">{data.title}</h2>
            <p className="mt-2 text-sm text-neutral-500 max-w-md leading-relaxed">{data.description}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
