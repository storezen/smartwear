"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Truck, RefreshCw, Headphones, Star, Gift, Check, Heart, Zap, Banknote, Clock, Smartphone, Watch, Gem, ShoppingBag, Sparkles } from "lucide-react"
import { AnimatedSection } from "@/components/AnimatedSection"
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid"
import type { FeaturesData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  truck: Truck, shield: ShieldCheck, refresh: RefreshCw, headphones: Headphones,
  star: Star, gift: Gift, check: Check, heart: Heart, zap: Zap, banknote: Banknote,
  clock: Clock, smartphone: Smartphone, watch: Watch, gem: Gem, "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
}

const hinglishMap: Record<string, string> = {
  "Free Delivery": "Pure Pakistan mein muft delivery",
  "Cash on Delivery": "Ghar pe dekhein, phir paise dein",
  "7-Day Warranty": "7 din mein warranty return",
  "24/7 Support": "Hamesha haazir customer support",
  "Secure Payment": "100% secure aur safe payment",
}

const iconGlowMap: Record<string, string> = {
  truck: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  shield: "group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]",
  banknote: "group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]",
  headphones: "group-hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]",
}

export function TrustBadgesSection({ data, style }: { data: FeaturesData; style: SectionStyle }) {
  const py = paddingVals[style.padding]
  return (
    <AnimatedSection style={{ paddingTop: py, paddingBottom: py, background: "#F4F6F8" }}>
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.span
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-50/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-4"
          >
            <ShieldCheck className="size-3" strokeWidth={2} /> {data.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="mt-3 text-neutral-500 max-w-md mx-auto text-sm"
            >
              {data.description}
            </motion.p>
          )}
        </div>

        <StaggerGrid className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {data.items.slice(0, 8).map((feat, i) => {
            const Icon = iconMap[feat.icon] || Truck
            const glowClass = iconGlowMap[feat.icon] || "group-hover:shadow-[0_0_20px_rgba(37,99,235,0.25)]"
            const hinglish = hinglishMap[feat.title] || feat.description
            return (
              <StaggerItem key={i}>
                <div className="group relative rounded-2xl border border-neutral-200/60 bg-white p-5 sm:p-6 text-center transition-all duration-350 hover:border-blue-500/20 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08),0_0_30px_-6px_rgba(37,99,235,0.06)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  {/* Icon container */}
                  <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border border-blue-500/20 text-blue-600 transition-all duration-300 group-hover:scale-110 ${glowClass}`}>
                    <Icon className="size-6" strokeWidth={1.5} />
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">{feat.title}</h3>
                  <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">{feat.description}</p>
                  {hinglish !== feat.description && (
                    <p className="mt-1 text-[11px] text-blue-600/70 font-medium italic">{hinglish}</p>
                  )}

                  {/* Hover glow dot */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-2xl bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </StaggerItem>
            )
          })}
        </StaggerGrid>
      </div>
    </AnimatedSection>
  )
}
