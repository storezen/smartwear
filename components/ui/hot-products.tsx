"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface HotProduct {
  name: string
  views: number
  rank: number
  trend: "up" | "down" | "stable"
}

interface HotProductsProps {
  products: HotProduct[]
}

function TrendBadge({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up")
    return (
      <span className="flex items-center gap-0.5 text-emerald-400">
        <TrendingUp className="w-3 h-3" />
      </span>
    )
  if (trend === "down")
    return (
      <span className="flex items-center gap-0.5 text-red-400">
        <TrendingDown className="w-3 h-3" />
      </span>
    )
  return <Minus className="w-3 h-3 text-white/20" />
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="url(#goldGrad)" stroke="rgba(184,134,11,0.4)" strokeWidth="0.5" />
        <text x="10" y="13" textAnchor="middle" fill="#0C0F14" fontSize="11" fontWeight="800" fontFamily="system-ui">1</text>
        <defs>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5C842" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
      </svg>
    )
  if (rank === 2)
    return (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="url(#silverGrad)" stroke="rgba(180,180,190,0.3)" strokeWidth="0.5" />
        <text x="10" y="13" textAnchor="middle" fill="#0C0F14" fontSize="11" fontWeight="800" fontFamily="system-ui">2</text>
        <defs>
          <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D1D5DB" />
            <stop offset="100%" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
      </svg>
    )
  if (rank === 3)
    return (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="url(#bronzeGrad)" stroke="rgba(180,120,60,0.3)" strokeWidth="0.5" />
        <text x="10" y="13" textAnchor="middle" fill="#0C0F14" fontSize="11" fontWeight="800" fontFamily="system-ui">3</text>
        <defs>
          <linearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4875E" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>
        </defs>
      </svg>
    )
  return (
    <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white/20 bg-white/[0.02] rounded-full border border-white/5">#{rank}</span>
  )
}

export const HotProducts = memo(function HotProducts({ products }: HotProductsProps) {
  if (!products.length) {
    return (
      <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Hot Products</h3>
        </div>
        <div className="h-44 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">No trending products yet</p>
            <p className="text-[8px] text-white/15 mt-1">Products appear as they get views</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Hot Products</h3>
        </div>
        <span className="text-[9px] text-white/25">Last 30 min</span>
      </div>

      <div className="space-y-3">
        {products.map((product, i) => {
          const barWidth =
            product.rank === 1
              ? 100
              : Math.max((product.views / products[0].views) * 100, 12)

          return (
            <motion.div
              key={product.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <RankBadge rank={product.rank} />
                <span className="text-[12px] font-medium text-white/80 truncate flex-1 group-hover:text-white transition-colors">
                  {product.name}
                </span>
                <TrendBadge trend={product.trend} />
                <span className="text-[12px] font-bold text-white/90 tabular-nums shrink-0 min-w-[2.5ch] text-right">
                  {product.views}
                </span>
              </div>
              <div className="relative h-2.5 bg-white/[0.04] rounded-full overflow-hidden ml-8">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className={`h-full rounded-full ${
                    product.rank === 1
                      ? "bg-gradient-to-r from-[#B8860B] via-[#D4A017] to-[#F5C842]"
                      : product.rank === 2
                        ? "bg-gradient-to-r from-[#6B7280] to-[#9CA3AF]"
                        : product.rank === 3
                          ? "bg-gradient-to-r from-[#92400E] to-[#D4875E]"
                          : "bg-white/15"
                  }`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {products.length > 0 && (
        <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center gap-3 text-[9px] text-white/20">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> Rising
          </span>
          <span className="flex items-center gap-1">
            <TrendingDown className="w-2.5 h-2.5 text-red-400" /> Falling
          </span>
          <span className="flex items-center gap-1">
            <Minus className="w-2.5 h-2.5 text-white/20" /> Stable
          </span>
        </div>
      )}

    </motion.div>
  )
})