"use client"

import { useMemo, memo } from "react"
import { motion } from "framer-motion"
import { Eye, Search, ShoppingCart, FileText, CreditCard, TrendingDown, AlertTriangle, AlertCircle, Zap } from "lucide-react"

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
  { Icon: Eye, color: "#6B7280", desc: "Total visits", tip: "" },
  { Icon: Search, color: "#6366F1", desc: "Product detail views", tip: "Improve product imagery & descriptions" },
  { Icon: ShoppingCart, color: "#F59E0B", desc: "Added to cart", tip: "Check pricing & shipping clarity" },
  { Icon: FileText, color: "#EC4899", desc: "Started checkout", tip: "Simplify checkout form" },
  { Icon: CreditCard, color: "#10B981", desc: "Completed purchase", tip: "Review payment options" },
]

export const ConversionFunnel = memo(function ConversionFunnel({ funnel, abandonmentRate }: ConversionFunnelProps) {
  const maxCount = useMemo(() => funnel[0]?.count || 1, [funnel])

  const biggestLeakIndex = useMemo(() => {
    let maxDrop = -1
    let maxIdx = -1
    for (let i = 1; i < funnel.length; i++) {
      if (funnel[i].dropOffRate > maxDrop) {
        maxDrop = funnel[i].dropOffRate
        maxIdx = i
      }
    }
    return maxIdx
  }, [funnel])

  const overallConversion = useMemo(() => {
    if (!funnel.length) return 0
    const last = funnel[funnel.length - 1]
    const first = funnel[0]
    return first.count > 0 ? Math.round((last.count / first.count) * 1000) / 10 : 0
  }, [funnel])

  if (!funnel.length) {
    return (
      <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Conversion Funnel</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
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

  const FirstIcon = STAGE_META[0].Icon
  const LastIcon = STAGE_META[STAGE_META.length - 1].Icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Conversion Funnel</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[18px] font-bold text-white tabular-nums leading-none">{overallConversion}%</div>
            <div className="text-[8px] text-white/25 tracking-wider uppercase mt-0.5">Overall CR</div>
          </div>
          <div className="w-px h-8 bg-white/5" />
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border ${
            abandonmentRate <= 20 ? 'bg-emerald-500/10 border-emerald-500/20' :
            abandonmentRate <= 50 ? 'bg-yellow-500/10 border-yellow-500/20' :
            'bg-red-500/10 border-red-500/20'
          }`}>
            {abandonmentRate <= 20 ? <Zap className="w-3 h-3 text-emerald-400" /> :
             abandonmentRate <= 50 ? <AlertTriangle className="w-3 h-3 text-yellow-400" /> :
             <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-[10px] font-semibold tabular-nums ${
              abandonmentRate <= 20 ? 'text-emerald-400' :
              abandonmentRate <= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>{abandonmentRate}%</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-0.5">
        {funnel.map((stage, i) => {
          const widthPct = Math.max((stage.count / maxCount) * 100, 3)
          const meta = STAGE_META[i] || STAGE_META[0]
          const prevStage = i > 0 ? funnel[i - 1] : null
          const stepToPrevRate = prevStage && prevStage.count > 0
            ? Math.round((stage.count / prevStage.count) * 100) : 100
          const isBiggestLeak = i === biggestLeakIndex && i > 0
          const isLast = i === funnel.length - 1

          return (
            <div key={stage.key} className="relative group">
              {i > 0 && (
                <div className="flex justify-center mb-0.5">
                  <motion.div
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-semibold ${
                      isBiggestLeak
                        ? 'bg-red-500/15 text-red-300 border border-red-500/20'
                        : 'text-white/20'
                    }`}
                  >
                    {isBiggestLeak && <TrendingDown className="w-2.5 h-2.5" />}
                    <span className="tabular-nums">-{stage.dropOffRate}%</span>
                    {isBiggestLeak && <span className="tracking-wider ml-0.5">BIGGEST LEAK</span>}
                  </motion.div>
                </div>
              )}

              <div className={`
                flex items-center gap-3 p-2 rounded-xl transition-all duration-300
                ${isBiggestLeak ? 'bg-red-500/5 border border-red-500/10' : 'hover:bg-white/[0.015]'}
              `}>
                <div className={`
                  w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300
                  ${isBiggestLeak
                    ? 'bg-red-500/15 border border-red-500/20 text-red-300'
                    : 'bg-white/[0.03] border border-white/5 text-white/40 group-hover:border-white/10 group-hover:text-white/60'
                  }`}
                >
                  <meta.Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`
                      text-[11px] font-semibold tracking-wide
                      ${isBiggestLeak ? 'text-red-200' : 'text-white/70 group-hover:text-white/90'}
                    `}>{stage.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-white tabular-nums">{stage.count.toLocaleString()}</span>
                      <span className="text-[9px] text-white/30 font-mono w-10 text-right">
                        {stage.conversionRate}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="h-full rounded-full relative"
                        style={{
                          background: isLast
                            ? 'linear-gradient(90deg, #B8860B, #10B981)'
                            : isBiggestLeak
                              ? 'linear-gradient(90deg, #EF4444, #EF444444)'
                              : `linear-gradient(90deg, ${meta.color}, ${meta.color}44)`,
                        }}
                      />
                    </div>
                    {i > 0 && (
                      <span className={`text-[8px] font-mono tabular-nums ${
                        stepToPrevRate > 70 ? 'text-emerald-500/60' :
                        stepToPrevRate > 40 ? 'text-yellow-500/60' : 'text-red-500/60'
                      }`}>{stepToPrevRate}%</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <meta.Icon className="w-2 h-2 text-white/15" />
                      <span className="text-[7px] text-white/15">{meta.desc}</span>
                    </div>
                    {isBiggestLeak && (
                      <span className="text-[7px] text-red-400/60 truncate max-w-[140px]">
                        {meta.tip}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-2 pt-2.5 border-t border-white/[0.04] space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-white/25">Abandonment Rate</span>
          <div className="flex items-center gap-2">
            <div className={`
              w-1.5 h-1.5 rounded-full animate-pulse
              ${abandonmentRate <= 20 ? 'bg-emerald-400' :
                abandonmentRate <= 50 ? 'bg-yellow-400' : 'bg-red-400'}
            `} />
            <span className={`
              font-bold tabular-nums text-[11px]
              ${abandonmentRate <= 20 ? 'text-emerald-400' :
                abandonmentRate <= 50 ? 'text-yellow-400' : 'text-red-400'}
            `}>{abandonmentRate}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[8px] text-white/15">
          <span className="flex items-center gap-1">
            <FirstIcon className="w-2.5 h-2.5" />
            {funnel[0]?.count.toLocaleString()} entered
          </span>
          <span>→</span>
          <span className="flex items-center gap-1">
            <LastIcon className="w-2.5 h-2.5" />
            {funnel[funnel.length - 1]?.count.toLocaleString()} converted
          </span>
          <span className="text-white/25 ml-auto">• {overallConversion}% overall</span>
        </div>
      </div>
    </motion.div>
  )
})
