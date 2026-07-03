"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Info } from "lucide-react"
import { AnimatedCounter } from "@/components/ui/animated-counter"
import { SpotlightCard } from "@/components/ui/spotlight-card"

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
  info?: string
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
  info,
}: LiveStatsCardProps) {
  const [showInfo, setShowInfo] = useState(false)
  const trendColor =
    trend === undefined || trend === 0
      ? "text-foreground/40"
      : (trend > 0 && !isInverseTrend) || (trend < 0 && isInverseTrend)
        ? "text-emerald-400"
        : "text-red-400"

  return (
    <SpotlightCard className="p-4 h-full" style={{ borderLeft: `2px solid ${accentColor}` }}>
      <div className="flex items-start justify-between h-full">
        <div className="flex flex-col justify-between h-full min-h-[72px]">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[9px] tracking-[1.5px] text-foreground/60 font-medium uppercase mb-1">{title}</p>
              {info && (
                <div className="relative mb-1">
                  <button
                    onMouseEnter={() => setShowInfo(true)}
                    onMouseLeave={() => setShowInfo(false)}
                    onClick={() => setShowInfo(!showInfo)}
                    className="text-foreground/20 hover:text-foreground/60 transition-colors"
                  >
                    <Info className="w-2.5 h-2.5" />
                  </button>
                  {showInfo && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-popover border border-border rounded-lg shadow-lg min-w-[160px] z-50">
                      <p className="text-[9px] text-foreground/70 whitespace-normal leading-relaxed">{info}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold tracking-tight text-foreground leading-none tabular-nums">
                {prefix}<AnimatedCounter value={value} decimals={decimals} />{suffix}
              </span>
              {trend !== undefined && (
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${trendColor} self-center`}>
                  <TrendIcon value={trend} />
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
          </div>
          {trendLabel && (
            <p className="text-[9px] text-foreground/40 mt-1.5">{trendLabel}</p>
          )}
        </div>
        {icon && (
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ml-3"
            style={{ background: `${accentColor}15` }}
          >
            <div style={{ color: `${accentColor}cc` }}>{icon}</div>
          </div>
        )}
      </div>
    </SpotlightCard>
  )
}
