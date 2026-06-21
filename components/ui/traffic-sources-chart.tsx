"use client"

import { memo } from "react"
import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { BarChart3 } from "lucide-react"

interface TrafficSource {
  name: string
  count: number
  percentage: number
  color: string
}

interface TrafficSourcesChartProps {
  sources: TrafficSource[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-[#141B24]/98 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
      <p className="text-[11px] font-semibold text-white">{d.name}</p>
      <p className="text-[10px] text-white/50 mt-0.5">{d.count} events · {d.percentage}%</p>
    </div>
  )
}

export const TrafficSourcesChart = memo(function TrafficSourcesChart({ sources }: TrafficSourcesChartProps) {
  if (!sources.length) {
    return (
      <div className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow h-full flex flex-col">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <h3 className="text-[13px] font-semibold text-white/70">Traffic Sources</h3>
        </div>
        <div className="h-44 flex items-center justify-center">
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

  const total = sources.reduce((sum, s) => sum + s.count, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-b from-[#141B24] to-[#0F1923] rounded-xl border border-white/[0.06] p-5 card-glow h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
          <h3 className="text-[13px] font-semibold text-white/70">Traffic Sources</h3>
        </div>
        <span className="text-[9px] text-white/25 font-mono tabular-nums">{total} total</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5 mt-auto mb-auto">
        <div className="w-32 h-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={56}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                stroke="none"
                animationBegin={100}
                animationDuration={800}
              >
                {sources.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-1.5 min-w-0">
          {sources.map((source, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center justify-between group py-0.5"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-[11px] text-white/60 truncate group-hover:text-white/90 transition-colors">
                  {source.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-semibold text-white/80 tabular-nums">{source.count}</span>
                <span className="text-[9px] text-white/30 w-10 text-right tabular-nums">{source.percentage}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
})
