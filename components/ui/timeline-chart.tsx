"use client"

import { useMemo, useState, memo } from "react"
import { motion } from "framer-motion"
import { BarChart3, Activity } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface TimelinePoint {
  time: string
  count: number
  sessions: number
}

interface TimelineChartProps {
  data: TimelinePoint[]
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#141B24]/98 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2.5 shadow-2xl">
      <p className="text-[10px] text-white/40 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-[13px] font-bold tabular-nums" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export const TimelineChart = memo(function TimelineChart({ data }: TimelineChartProps) {
  const [metric, setMetric] = useState<"count" | "sessions">("count")
  const peak = useMemo(() => Math.max(...data.map((d) => d[metric]), 1), [data, metric])
  const hasData = useMemo(() => data.some((d) => d.count > 0 || d.sessions > 0), [data])

  if (!hasData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col"
      >
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-0.5 h-3.5 bg-white/10 rounded-full" />
          <div>
            <h3 className="text-[13px] font-semibold text-white/70">Traffic Timeline</h3>
            <p className="text-[9px] text-white/25 mt-0.5">Last 2 hours · per minute</p>
          </div>
        </div>
        <div className="h-52 flex items-center justify-center mt-auto mb-auto">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[11px] text-white/25">Waiting for traffic data</p>
            <p className="text-[8px] text-white/15 mt-1">Real-time chart updates as events arrive</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0F1923] rounded-xl border border-white/5 p-4 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-0.5 h-3.5 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.3)]" />
            <h3 className="text-[13px] font-semibold text-white/70">Traffic Timeline</h3>
            <div className="bg-[#0C0F14] rounded-lg border border-white/5 p-0.5 flex">
              <button
                onClick={() => setMetric("count")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  metric === "count" ? "bg-[#B8860B]/15 text-[#B8860B] shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setMetric("sessions")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                  metric === "sessions" ? "bg-[#B8860B]/15 text-[#B8860B] shadow-sm" : "text-white/40 hover:text-white/60"
                }`}
              >
                Sessions
              </button>
            </div>
          </div>
          <p className="text-[9px] text-white/25 mt-1 ml-3.5">Last 2 hours · per minute</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-emerald-500/8 border border-emerald-500/15 px-2 py-1 rounded-full">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[8px] text-emerald-400/60 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="h-52 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -16 }}>
            <defs>
              <linearGradient id="tlEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B8860B" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#B8860B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tlSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="2 2" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={48}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.2)", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              domain={[0, "auto"]}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.05)", strokeWidth: 1 }} />
            {metric === "sessions" && (
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#6366F1"
                strokeWidth={2}
                fill="url(#tlSessions)"
                animationDuration={600}
                dot={false}
                activeDot={{ r: 3, fill: "#6366F1", stroke: "#0F1923", strokeWidth: 2 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="count"
              name="Events"
              stroke="#B8860B"
              strokeWidth={2}
              fill="url(#tlEvents)"
              animationDuration={600}
              dot={false}
              activeDot={{ r: 3, fill: "#B8860B", stroke: "#0F1923", strokeWidth: 2 }}
              filter="url(#glow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2.5 border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B8860B] shadow-[0_0_6px_rgba(184,134,11,0.4)]" />
            <span className="text-[9px] text-white/30">Events</span>
          </div>
          {metric === "sessions" && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6366F1] shadow-[0_0_6px_rgba(99,102,241,0.4)]" />
              <span className="text-[9px] text-white/30">Sessions</span>
            </div>
          )}
        </div>
        <span className="text-[9px] text-white/20 font-medium tabular-nums">Peak: {peak} /min</span>
      </div>
    </motion.div>
  )
})
