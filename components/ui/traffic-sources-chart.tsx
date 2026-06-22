"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { BarChart3, Globe, ExternalLink } from "lucide-react"

interface TrafficSource {
  name: string
  count: number
  percentage: number
  color: string
}

interface TrafficSourcesChartProps {
  sources: TrafficSource[]
}

const MAX_VISIBLE = 5

export const TrafficSourcesChart = memo(function TrafficSourcesChart({ sources }: TrafficSourcesChartProps) {
  const { topSources, otherCount, otherPct } = useMemo(() => {
    if (sources.length <= MAX_VISIBLE) return { topSources: sources, otherCount: 0, otherPct: 0 }
    const top = sources.slice(0, MAX_VISIBLE)
    const other = sources.slice(MAX_VISIBLE)
    return {
      topSources: top,
      otherCount: other.reduce((s, x) => s + x.count, 0),
      otherPct: other.reduce((s, x) => s + x.percentage, 0),
    }
  }, [sources])

  const total = sources.reduce((sum, s) => sum + s.count, 0)
  const top1 = topSources[0]
  const top1Pct = top1 ? Math.round((top1.count / total) * 100) : 0

  if (!sources.length) {
    return (
      <div className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Traffic Sources</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">No traffic data yet</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Traffic Sources</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/25 font-mono tabular-nums">{total} events</span>
          <div className="w-px h-3 bg-white/5" />
          <span className="text-[9px] font-medium" style={{ color: top1?.color || "#888" }}>{top1?.name} {top1Pct}%</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {topSources.map((source, i) => {
          const barPct = total > 0 ? (source.count / total) * 100 : 0
          const isTop = i === 0

          return (
            <div key={source.name} className="space-y-1 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: source.color }} />
                  <span className={`text-[11px] truncate ${isTop ? 'text-white font-semibold' : 'text-white/60 group-hover:text-white/90'} transition-colors`}>
                    {source.name}
                  </span>
                  {isTop && (
                    <span className="text-[7px] font-bold text-[#B8860B] tracking-widest bg-[#B8860B]/10 px-1.5 py-0.5 rounded">TOP</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[12px] font-bold tabular-nums ${isTop ? 'text-white' : 'text-white/80'}`}>
                    {source.count.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-white/30 w-9 text-right tabular-nums">{source.percentage}%</span>
                </div>
              </div>
              <div className="relative h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${barPct}%` }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${source.color}, ${source.color}66)` }}
                />
              </div>
            </div>
          )
        })}

        {otherCount > 0 && (
          <div className="space-y-1 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
                <span className="text-[11px] text-white/40">Other ({sources.length - MAX_VISIBLE} sources)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-white/40 tabular-nums">{otherCount.toLocaleString()}</span>
                <span className="text-[9px] text-white/20 w-9 text-right tabular-nums">{Math.round(otherPct)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {topSources.length > 0 && (
        <div className="mt-2 pt-2.5 border-t border-white/[0.04] flex items-center gap-2 text-[8px] text-white/20">
          <Globe className="w-2.5 h-2.5" />
          <span>Top source: <span className="text-white/40 font-medium">{top1?.name}</span></span>
          <span className="ml-auto">{sources.length} channels</span>
        </div>
      )}
    </motion.div>
  )
})
