"use client"

import { CalendarDays } from "lucide-react"

export interface DateRange {
  label: string
  from: Date
  to: Date
}

interface DateRangeSelectorProps {
  value: string
  onChange: (key: string, range: DateRange) => void
}

const PRESETS = [
  { key: "live", label: "Live" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
]

function getRange(key: string): DateRange {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  switch (key) {
    case "live":
      return {
        label: "Live (2h)",
        from: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        to: now,
      }
    case "today":
      return { label: "Today", from: start, to: now }
    case "yesterday": {
      const yes = new Date(start)
      yes.setDate(yes.getDate() - 1)
      return {
        label: "Yesterday",
        from: yes,
        to: new Date(start),
      }
    }
    case "7d": {
      const d7 = new Date(start)
      d7.setDate(d7.getDate() - 6)
      return { label: "Last 7 Days", from: d7, to: now }
    }
    case "30d": {
      const d30 = new Date(start)
      d30.setDate(d30.getDate() - 29)
      return { label: "Last 30 Days", from: d30, to: now }
    }
    default:
      return {
        label: "Live (2h)",
        from: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        to: now,
      }
  }
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-1 bg-[#0F1923] rounded-lg border border-white/[0.06] p-0.5">
      <CalendarDays className="w-3 h-3 text-white/30 ml-1.5" />
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          onClick={() => onChange(preset.key, getRange(preset.key))}
          className={`px-2 py-1 rounded-md text-[9px] font-medium transition-all ${
            value === preset.key
              ? "bg-[#B8860B]/15 text-[#B8860B]"
              : "text-white/25 hover:text-white/50"
          }`}
        >
          {preset.label}
        </button>
      ))}
    </div>
  )
}
