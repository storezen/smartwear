"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, Eye, ShoppingCart, DollarSign, Flame } from "lucide-react"

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
  return (
    <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
      trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-white/20"
    }`}>
      {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      {trend === "up" ? "Rising" : trend === "down" ? "Falling" : "Flat"}
    </span>
  )
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="relative w-6 h-6 shrink-0">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="url(#g1)" stroke="rgba(184,134,11,0.4)" strokeWidth="0.5" />
          <text x="12" y="15.5" textAnchor="middle" fill="#0C0F14" fontSize="12" fontWeight="900" fontFamily="system-ui">1</text>
          <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#F5C842" /><stop offset="100%" stopColor="#B8860B" /></linearGradient></defs>
        </svg>
        <Flame className="absolute -top-1 -right-1 w-3 h-3 text-[#B8860B]" />
      </div>
    )
  if (rank === 2)
    return (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="url(#g2)" stroke="rgba(180,180,190,0.3)" strokeWidth="0.5" />
        <text x="12" y="15.5" textAnchor="middle" fill="#0C0F14" fontSize="12" fontWeight="900" fontFamily="system-ui">2</text>
        <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#D1D5DB" /><stop offset="100%" stopColor="#9CA3AF" /></linearGradient></defs>
      </svg>
    )
  if (rank === 3)
    return (
      <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="url(#g3)" stroke="rgba(180,120,60,0.3)" strokeWidth="0.5" />
        <text x="12" y="15.5" textAnchor="middle" fill="#0C0F14" fontSize="12" fontWeight="900" fontFamily="system-ui">3</text>
        <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#D4875E" /><stop offset="100%" stopColor="#92400E" /></linearGradient></defs>
      </svg>
    )
  return (
    <span className="w-6 h-6 shrink-0 flex items-center justify-center text-[10px] font-bold text-white/20 bg-white/[0.02] rounded-full border border-white/5">#{rank}</span>
  )
}

export const HotProducts = memo(function HotProducts({ products }: HotProductsProps) {
  if (!products.length) {
    return (
      <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Hot Products</h3>
        </div>
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)]" />
          <div className="text-center relative z-10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#B8860B]/5 border border-[#B8860B]/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border border-[#B8860B]/20 animate-ping opacity-20" />
              <TrendingUp className="w-6 h-6 text-[#B8860B]/60" />
            </div>
            <p className="text-[12px] font-medium text-white/50 mb-1">No trending products yet</p>
            <p className="text-[9px] text-white/30 max-w-[160px] mx-auto leading-relaxed">Products will appear here automatically as visitors view them.</p>
          </div>
        </div>
      </div>
    )
  }

  const totalViews = useMemo(() => products.reduce((s, p) => s + p.views, 0), [products])
  const top1Views = products[0].views

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Hot Products</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25 font-mono tabular-nums">{totalViews} views</span>
          <div className="w-px h-3 bg-white/5" />
          <span className="text-[8px] text-white/20">Last 30 min</span>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {products.map((product, i) => {
          const barPct = top1Views > 0 ? Math.max((product.views / top1Views) * 100, 5) : 0
          const sharePct = totalViews > 0 ? Math.round((product.views / totalViews) * 100) : 0
          const estCarts = Math.round(product.views * 0.12)
          const estRevenue = estCarts * 8500

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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium text-white/80 truncate group-hover:text-white transition-colors">
                      {product.name}
                    </span>
                    <TrendBadge trend={product.trend} />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-[8px] text-white/25">
                      <Eye className="w-2.5 h-2.5" /> {product.views}
                    </span>
                    <span className="text-[8px] text-white/25">•</span>
                    <span className="flex items-center gap-0.5 text-[8px] text-white/25">
                      <ShoppingCart className="w-2.5 h-2.5" /> ~{estCarts}
                    </span>
                    <span className="text-[8px] text-white/25">•</span>
                    <span className="flex items-center gap-0.5 text-[8px] text-emerald-400/40">
                      <DollarSign className="w-2.5 h-2.5" /> ₨{estRevenue.toLocaleString()}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-white/40 font-mono tabular-nums shrink-0">{sharePct}%</span>
              </div>
              <div className="relative h-2 bg-white/[0.04] rounded-full overflow-hidden ml-[34px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
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
        <div className="mt-auto pt-2.5 border-t border-white/[0.04] flex items-center justify-between text-[8px] text-white/20">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5 text-emerald-400" /> Rising</span>
            <span className="flex items-center gap-1"><TrendingDown className="w-2.5 h-2.5 text-red-400" /> Falling</span>
            <span className="flex items-center gap-1"><Minus className="w-2.5 h-2.5 text-white/20" /> Stable</span>
          </div>
          <span className="text-white/15">{products.length} products tracked</span>
        </div>
      )}
    </motion.div>
  )
})
