"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { format, startOfDay, endOfDay, subDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const prevCustomKeyRef = useRef<string | null>(null)

  const handlePreset = useCallback((key: string) => {
    onChange(key, getRange(key))
  }, [onChange])

  const handleCustomSelect = useCallback((r: { from?: Date; to?: Date } | undefined) => {
    if (!r?.from || !r?.to) {
      setRange({ from: r?.from, to: r?.to })
      return
    }
    const from = startOfDay(r.from)
    const to = endOfDay(r.to)
    const days = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const key = `custom_${Date.now()}`
    prevCustomKeyRef.current = key
    onChange(key, {
      label: `${days}d Custom`,
      from,
      to,
    })
    setOpen(false)
  }, [onChange])

  const isCustom = !["live", "today", "yesterday", "7d", "30d"].includes(value)

  return (
    <div className="flex items-center gap-1 bg-card rounded-lg border border-white/[0.06] p-0.5">
      <CalendarDays className="w-3 h-3 text-foreground/30 ml-1.5 shrink-0" />
      {PRESETS.map((preset) => (
        <button
          key={preset.key}
          onClick={() => handlePreset(preset.key)}
          className={cn(
            "px-2 py-1 rounded-md text-[9px] font-medium transition-all whitespace-nowrap",
            value === preset.key
              ? "bg-[#B8860B]/15 text-[#B8860B]"
              : "text-foreground/50 hover:text-foreground/80"
          )}
        >
          {preset.label}
        </button>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "px-2 py-1 rounded-md text-[9px] font-medium transition-all flex items-center gap-1",
              isCustom
                ? "bg-[#B8860B]/15 text-[#B8860B]"
                : "text-foreground/50 hover:text-foreground/80"
            )}
          >
            {isCustom ? (
              <span className="truncate max-w-[60px]">{value.replace("custom_", "")}</span>
            ) : (
              <>
                <span>Custom</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={range}
            onSelect={handleCustomSelect}
            numberOfMonths={2}
            defaultMonth={new Date()}
          />
          {range?.from && range?.to && (
            <div className="p-3 border-t border-border text-[10px] text-foreground/50 text-center">
              {format(range.from, "MMM d, yyyy")} — {format(range.to, "MMM d, yyyy")}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
