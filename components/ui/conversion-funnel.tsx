"use client"

import { useMemo, memo } from "react"
import { motion } from "framer-motion"
import { Eye, Search, ShoppingCart, FileText, CreditCard, ArrowDown, AlertCircle } from "lucide-react"

interface FunnelStage {
  key: string
  label: string
  count: number
  conversionRate: number
  dropOffRate: number
}

interface ConversionFunnelProps {
  funnel: FunnelStage[]
  abandonmentRate: number
}

const STAGE_META = [
  { Icon: Eye, color: "#6B7280", desc: "Total visits" },
  { Icon: Search, color: "#6366F1", desc: "Product detail views" },
  { Icon: ShoppingCart, color: "#F59E0B", desc: "Added to cart" },
  { Icon: FileText, color: "#EC4899", desc: "Started checkout" },
  { Icon: CreditCard, color: "#10B981", desc: "Completed purchase" },
]

export const ConversionFunnel = memo(function ConversionFunnel({ funnel, abandonmentRate }: ConversionFunnelProps) {
  const maxCount = useMemo(() => funnel[0]?.count || 1, [funnel])

  if (!funnel.length) {
    return (
      <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Conversion Funnel</h3>
        </div>
        <div className="h-52 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">Funnel data will appear here</p>
            <p className="text-[8px] text-white/15 mt-1">as visitors move through checkout</p>
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
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Conversion Funnel</h3>
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${abandonmentRate <= 20 ? 'bg-emerald-500/10 border-emerald-500/20' : abandonmentRate <= 50 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${abandonmentRate <= 20 ? 'bg-emerald-400' : abandonmentRate <= 50 ? 'bg-yellow-400' : 'bg-red-400'}`} />
          <span className={`text-[10px] font-semibold tabular-nums ${abandonmentRate <= 20 ? 'text-emerald-400' : abandonmentRate <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
            {abandonmentRate}% Abandoned
          </span>
        </div>
      </div>

      <div className="relative">
        {funnel.map((stage, i) => {
          const barWidth = Math.max((stage.count / maxCount) * 100, 2)
          const meta = STAGE_META[i] || STAGE_META[0]
          const prevStage = i > 0 ? funnel[i - 1] : null
          const stepToPrevRate =
            prevStage && prevStage.count > 0
              ? Math.round((stage.count / prevStage.count) * 100)
              : 100
          const dropSeverity =
            stage.dropOffRate > 50 ? "high" : stage.dropOffRate > 20 ? "medium" : "low"

          return (
            <div key={stage.key} className="relative group">
              {i > 0 && (
                <div className="absolute -top-4 left-[18px] flex flex-col items-center">
                  <ArrowDown className="w-3 h-3 text-white/15" />
                </div>
              )}

              <div className="flex items-center gap-3 py-2 group-hover:bg-white/[0.01] rounded-lg transition-colors px-1 -mx-1">
                <div
                  className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-white/10 transition-colors"
                  style={{ color: meta.color }}
                >
                  <meta.Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[12px] font-medium text-white/80 truncate group-hover:text-white transition-colors">{stage.label}</span>
                      {i > 0 && (
                        <span className="text-[10px] font-medium text-emerald-400/60 shrink-0">
                          {stepToPrevRate}% →
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-[14px] font-bold text-white tabular-nums">{stage.count.toLocaleString()}</span>
                      {i > 0 && (
                        <span
                          className={`text-[10px] font-semibold w-12 text-right tabular-nums ${
                            dropSeverity === "high"
                              ? "text-red-400"
                              : dropSeverity === "medium"
                                ? "text-yellow-400"
                                : "text-emerald-400"
                          }`}
                        >
                          -{stage.dropOffRate}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="relative h-4 bg-white/[0.04] rounded-full overflow-hidden shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.8, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="h-full rounded-full relative overflow-hidden"
                      style={{
                        background:
                          i === funnel.length - 1
                            ? "linear-gradient(90deg, #B8860B, #10B981)"
                            : `linear-gradient(90deg, ${meta.color}, ${meta.color}88)`,
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent animate-[shimmer_2.5s_infinite]" />
                    </motion.div>
                  </div>

                  <div className="flex justify-between mt-1">
                    <span className="text-[8px] text-white/20">{stage.conversionRate}% of visitors</span>
                    <span className="text-[8px] text-white/20">{meta.desc}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3.5 border-t border-white/[0.04] flex items-center justify-between text-[10px]">
        <span className="text-white/25">Cart abandonment rate</span>
        <span className={`font-bold tabular-nums ${abandonmentRate <= 20 ? 'text-emerald-400' : abandonmentRate <= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{abandonmentRate}%</span>
      </div>
    </motion.div>
  )
})
