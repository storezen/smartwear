"use client"

import { motion } from "framer-motion"
import { Star, MessageSquare, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { TestimonialsData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"
import { resolveMediaUrl } from "@/lib/media/utils"

export function TestimonialsSection({ data, style }: { data: TestimonialsData; style: SectionStyle }) {
  const py = paddingVals[style.padding]
  const items = data.items.slice(0, 6)
  // Row 1: standard → loop. Row 2: reversed → loop
  const trackA = [...items, ...items, ...items]
  const trackB = [...items, ...items, ...items].reverse()

  return (
    <AnimatedSection
      style={{ paddingTop: py, paddingBottom: py }}
      className="relative overflow-hidden bg-white"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[700px] rounded-full bg-blue-500/4 blur-[120px]" />

      <div className="mx-auto max-w-[1600px] px-4 lg:px-8 mb-12">
        {/* Section Header */}
        <div className="text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded border border-neutral-200 bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-900 mb-4 shadow-sm"
          >
            <MessageSquare className="size-2.5 text-neutral-400" /> Customer Reviews
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-neutral-950"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-4 text-[15px] leading-relaxed text-neutral-500 max-w-2xl mx-auto"
            >
              {data.description}
            </motion.p>
          )}
        </div>
      </div>

      {/* Row A — scrolls left */}
      <div className="overflow-hidden mb-4" aria-hidden="true">
        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-ltr 42s linear infinite" }}
        >
          {trackA.map((item, i) => (
            <ReviewCard key={`a-${i}`} item={item} />
          ))}
        </div>
      </div>

      {/* Row B — scrolls right (reversed direction) */}
      <div className="overflow-hidden" aria-hidden="true">
        <div
          className="flex gap-4 w-max"
          style={{ animation: "marquee-rtl 38s linear infinite" }}
        >
          {trackB.map((item, i) => (
            <ReviewCard key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}

function ReviewCard({ item }: { item: { rating: number; text: string; name: string; role?: string; avatar?: string } }) {
  return (
    <div className="relative w-72 sm:w-80 shrink-0 rounded-2xl border border-neutral-200/60 bg-white p-5 shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_-4px_rgb(0,0,0,0.08)] transition-shadow duration-300">
      {/* Decorative quote */}
      <Quote className="absolute top-4 right-4 size-8 text-neutral-100" strokeWidth={1} />

      {/* Stars */}
      <div className="flex items-center gap-0.5 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              "size-3.5",
              s <= item.rating ? "fill-amber-400 text-amber-400" : "fill-neutral-100 text-neutral-200"
            )}
          />
        ))}
      </div>

      <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{item.text}&rdquo;</p>

      <div className="mt-4 flex items-center gap-3 pt-3 border-t border-neutral-100">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 border border-blue-500/15 text-xs font-bold text-blue-600 shrink-0 overflow-hidden">
          {item.avatar ? (
            <img src={resolveMediaUrl(item.avatar)} alt={item.name} className="h-full w-full object-cover rounded-full" loading="lazy" />
          ) : (
            item.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900">{item.name || "Customer"}</p>
          {item.role && <p className="text-xs text-neutral-400">{item.role}</p>}
        </div>
      </div>
    </div>
  )
}
