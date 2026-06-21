"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"

interface LiveStatsCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  trend?: number
  trendLabel?: string
  icon?: React.ReactNode
  accentColor?: string
  isInverseTrend?: boolean
}

function TrendIcon({ value: trend }: { value: number }) {
  if (trend > 0) return <TrendingUp className="w-3 h-3" />
  if (trend < 0) return <TrendingDown className="w-3 h-3" />
  return (
    <span className="w-3 h-3 flex items-center justify-center">
      <span className="w-1.5 h-0.5 rounded-full bg-current" />
    </span>
  )
}

export function LiveStatsCard({
  title,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  trend,
  trendLabel,
  icon,
  accentColor = "#B8860B",
  isInverseTrend = false,
}: LiveStatsCardProps) {
  const [flash, setFlash] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true)
      prevValue.current = value
      const t = setTimeout(() => setFlash(false), 700)
      return () => clearTimeout(t)
    }
  }, [value])

  const trendColor =
    trend === undefined || trend === 0
      ? "text-white/40"
      : (trend > 0 && !isInverseTrend) || (trend < 0 && isInverseTrend)
        ? "text-emerald-400"
        : "text-red-400"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group h-full"
    >
      <div
        className="relative bg-[#0F1923] rounded-xl border border-white/5 overflow-hidden transition-all duration-500 ease-out h-full flex flex-col"
        style={{
          padding: "clamp(1rem, 2vw, 1.5rem)",
          borderColor: flash ? `${accentColor}50` : undefined,
          boxShadow: flash ? `0 0 30px ${accentColor}20` : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none rounded-xl" />

        <div
          className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-xl pointer-events-none transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-110"
          style={{
            background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
          }}
        />

        {flash && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 pointer-events-none rounded-xl"
            style={{ backgroundColor: `${accentColor}08` }}
          />
        )}

        <div className="flex items-start justify-between mb-3 relative z-[1]">
          <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.12em]">{title}</span>
          {icon && (
            <div
              className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center transition-all duration-300 group-hover:bg-white/[0.06] group-hover:border-white/10 group-hover:scale-105 group-hover:shadow-lg"
              style={{ color: `${accentColor}cc` }}
            >
              {icon}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 relative z-[1]">
          <span className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight tabular-nums leading-none">
            {prefix}<AnimatedCounter value={value} decimals={decimals} />{suffix}
          </span>
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${trendColor} self-center`}
              title={`${trend > 0 ? "+" : ""}${trend}% vs previous period`}
            >
              <TrendIcon value={trend} />
              {Math.abs(trend)}%
            </span>
          )}
        </div>

        {trendLabel && (
          <p className="text-[9px] text-white/20 mt-1.5 relative z-[1]">{trendLabel}</p>
        )}

        <div
          className="mt-auto pt-3 h-px w-full bg-gradient-to-r from-[var(--accent)]/20 via-[var(--accent)]/5 to-transparent"
          style={{ "--accent": accentColor } as React.CSSProperties}
        />
      </div>
    </motion.div>
  )
}
