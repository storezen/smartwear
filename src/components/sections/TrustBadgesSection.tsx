"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Truck, RefreshCw, Headphones, Star, Gift, Check, Heart, Zap, Banknote, Clock, Smartphone, Watch, Gem, ShoppingBag, Sparkles } from "lucide-react"
import { AnimatedSection } from "@/components/AnimatedSection"
import type { FeaturesData, SectionStyle } from "@/lib/sections"
import { paddingVals } from "./section-utils"

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  truck: Truck, shield: ShieldCheck, refresh: RefreshCw, headphones: Headphones,
  star: Star, gift: Gift, check: Check, heart: Heart, zap: Zap, banknote: Banknote,
  clock: Clock, smartphone: Smartphone, watch: Watch, gem: Gem, "shopping-bag": ShoppingBag,
  sparkles: Sparkles,
}

export function TrustBadgesSection({ data, style }: { data: FeaturesData; style: SectionStyle }) {
  const py = paddingVals[style.padding]
  
  // To avoid overflowing the UI, let's limit to 4 items and use the divide-x style
  const items = data.items.slice(0, 4)

  return (
    <AnimatedSection style={{ paddingTop: py, paddingBottom: py }} className="w-full bg-[#FAFAFA] border-y border-[#E5E5E5]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold tracking-tight text-[#0A0A0A]"
          >
            {data.title}
          </motion.h2>
          {data.description && (
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-3 text-[#0A0A0A]/60 font-medium max-w-md mx-auto text-sm"
            >
              {data.description}
            </motion.p>
          )}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-${items.length} gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-[#E5E5E5]`}>
          {items.map((feat, i) => {
            const Icon = iconMap[feat.icon] || Truck
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex flex-col items-center text-center pt-6 md:pt-0 first:pt-0 group"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A0A0A]/5 text-[#0A0A0A] transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-6" strokeWidth={1.5} />
                </div>
                <h3 className="mb-1 text-sm font-bold tracking-tight text-[#0A0A0A]">
                  {feat.title}
                </h3>
                <p className="text-sm text-[#0A0A0A]/60 font-medium max-w-[200px]">
                  {feat.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </AnimatedSection>
  )
}

