"use client"

import { cn } from "@/lib/utils"

export function FilterPills<T extends string>({
  options,
  selected,
  onChange,
}: {
  options: readonly T[]
  selected: T
  onChange: (v: T) => void
}) {
  return (
    <div className="flex gap-1.5 px-5 pt-4 pb-2 overflow-x-auto">
      {options.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200",
            selected === s
              ? "bg-neutral-900 text-white shadow-md"
              : "bg-neutral-100 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60"
          )}
        >
          {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  )
}
