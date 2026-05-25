"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import type { ProductVariant } from "@/lib/products"

interface VariantSelectorProps {
  variants: ProductVariant[]
  selected: Record<string, string>
  onChange: (variants: Record<string, string>) => void
  className?: string
}

function isColorOption(name: string, values?: string[]): boolean {
  if (/color|colour|shade|finish|tint|hue/i.test(name)) return true
  if (values) {
    const colorKeywords = /black|white|silver|gold|blue|red|green|pink|purple|orange|yellow|titanium|midnight|starlight/i
    // If more than half the values sound like colors, treat the whole group as colors
    const colorCount = values.filter(v => colorKeywords.test(v)).length
    if (colorCount > 0 && colorCount >= values.length / 2) return true
  }
  return false
}

function getColorHex(value: string): string {
  const colorMap: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    silver: "#C0C0C0",
    gold: "#FFD700",
    rose: "#FF007F",
    rosegold: "#B76E79",
    "rose-gold": "#B76E79",
    blue: "#0000FF",
    navy: "#000080",
    "navy-blue": "#000080",
    sky: "#87CEEB",
    "sky-blue": "#87CEEB",
    red: "#FF0000",
    green: "#008000",
    "olive-green": "#556B2F",
    lime: "#00FF00",
    grey: "#808080",
    gray: "#808080",
    pink: "#FFC0CB",
    "hot-pink": "#FF69B4",
    purple: "#800080",
    midnight: "#1A1A2E",
    "midnight-blue": "#191970",
    starlight: "#F5F5DC",
    graphite: "#41424C",
    spacegray: "#717378",
    "space-gray": "#717378",
    brown: "#A52A2A",
    beige: "#F5F5DC",
    cream: "#FFFDD0",
    yellow: "#FFFF00",
    orange: "#FFA500",
    coral: "#FF7F50",
    teal: "#008080",
    mint: "#98FB98",
    "mint-green": "#98FB98",
    turquoise: "#40E0D0",
    lavender: "#E6E6FA",
    charcoal: "#36454F",
    titanium: "#8A8C91",
    "titanium-black": "#2C2C2E",
    "titanium-white": "#E0E0E0",
    "titanium-natural": "#8A8C91",
    "titanium-blue": "#4A6FA5",
    transparent: "#F0F0F0",
    clear: "#F0F0F0",
    matte: "#D0D0D0",
    glossy: "#E8E8E8",
    leather: "#8B4513",
    silicone: "#4682B4",
    "deep-purple": "#673AB7",
    "midnight-green": "#004953",
    "sierra-blue": "#9DB4C0",
    "alpine-green": "#228B22",
    "deep-red": "#8B0000",
    burgundy: "#800020",
    maroon: "#800000",
    "desert-tan": "#C3B091",
    espresso: "#6F4E37",
    emerald: "#50C878",
    "glacier-blue": "#A5C9CA",
    indigo: "#4B0082",
    ivory: "#FFFFF0",
    jade: "#00A86B",
    khaki: "#C3B091",
    lilac: "#C8A2C8",
    magenta: "#FF00FF",
    "matte-black": "#1C1C1E",
    "matte-navy": "#2C3E50",
    "matte-rose": "#C48B90",
    olive: "#808000",
    peach: "#FFCBA4",
    "powder-blue": "#B0E0E6",
    sage: "#BCB88A",
    salmon: "#FA8072",
    "sand": "#C2B280",
    "sea-green": "#2E8B57",
    slate: "#708090",
    "slate-gray": "#708090",
    taupe: "#483C32",
    "wine": "#722F37",
    "forest-green": "#228B22",
    "steel-blue": "#4682B4",
    champagne: "#F7E7CE",
    copper: "#B87333",
    bronze: "#CD7F32",
    pewter: "#899499",
  }

  const key = value.toLowerCase().replace(/\s+/g, "")
  return colorMap[key] || colorMap[value.toLowerCase()] || `hsl(${value.length * 50 % 360}, 70%, 60%)`
}

export function VariantSelector({ variants, selected, onChange, className }: VariantSelectorProps) {
  const groups = useMemo(() => {
    if (!variants || variants.length === 0) return []

    const nameSet = new Set(variants.map((v) => v.name))
    return Array.from(nameSet).map((name) => ({
      name,
      values: Array.from(new Set(
        variants.filter((v) => v.name === name).map((v) => v.value)
      )),
    }))
  }, [variants])

  const validGroups = groups.filter(g => !isColorOption(g.name, g.values))

  if (validGroups.length === 0) return null

  return (
    <div className={cn("space-y-4", className)}>
      {validGroups.map((group) => {
        const selectedValue = selected[group.name]

        return (
          <div key={group.name} className="flex flex-col gap-2.5 w-full">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">
                {group.name}
                {selectedValue && (
                  <span className="text-foreground font-medium ml-1 normal-case">
                    — {selectedValue}
                  </span>
                )}
              </p>
            <div className="flex flex-row flex-wrap items-center gap-3">
              {group.values.map((value) => {
                const isSelected = selectedValue === value
                const isDisabled = !variants.some((v) => {
                  const matchesValue = v.value === value
                  if (!matchesValue) return false

                  const otherSelections = Object.entries(selected).filter(([k]) => k !== group.name)
                  if (otherSelections.length === 0) return v.inStock !== false

                  return otherSelections.every(([k, vv]) => {
                    return variants.some((alt) => {
                      const sameGroup = alt.name === k && alt.value === vv
                      const sameValue = alt.name === group.name && alt.value === value
                      return sameGroup && sameValue && alt.inStock !== false
                    })
                  })
                })

                return (
                  <button
                    key={value}
                    onClick={() => {
                      const next = { ...selected, [group.name]: isSelected ? "" : value }
                      onChange(next)
                    }}
                    disabled={!isSelected && !isDisabled}
                    className={cn(
                      "relative transition-all duration-150 font-medium select-none flex items-center justify-center",
                      "px-3.5 py-1.5 rounded-full text-xs border",
                      isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                      !isDisabled && !isSelected && "opacity-30 cursor-not-allowed",
                    )}
                    aria-label={`${group.name}: ${value}${isSelected ? " (selected)" : ""}${!isDisabled ? " (unavailable)" : ""}`}
                    title={!isDisabled ? "Currently unavailable" : value}
                  >
                    {value}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
