"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Palette, Maximize2, Minus, Square } from "lucide-react"
import type { SectionStyle, PaddingPreset } from "@/lib/sections"

const bgPresets = [
  { value: "#FFFFFF", label: "Default" },
  { value: "#F8FAFC", label: "Soft" },
  { value: "#1E3A5F", label: "Brand" },
  { value: "#0F172A", label: "Dark" },
]

const spacingOptions: { value: PaddingPreset; label: string; icon: React.ElementType }[] = [
  { value: "compact", label: "Compact", icon: Minus },
  { value: "comfortable", label: "Normal", icon: Square },
  { value: "luxury", label: "Spacious", icon: Maximize2 },
]

export function SectionStyleControls({ style, onChange }: { style: SectionStyle; onChange: (s: SectionStyle) => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <Palette className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Design</span>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">Background</Label>
        <div className="grid grid-cols-4 gap-2">
          {bgPresets.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange({ ...style, backgroundColor: p.value })}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-all",
                style.backgroundColor.toLowerCase() === p.value.toLowerCase()
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
              )}
            >
              <div className="size-6 rounded-full border border-border" style={{ backgroundColor: p.value }} />
              <span className="text-[10px] font-medium text-muted-foreground">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <input
            type="color"
            value={style.backgroundColor}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            className="h-7 w-7 cursor-pointer rounded border border-border bg-transparent p-0.5"
          />
          <Input
            value={style.backgroundColor}
            onChange={(e) => onChange({ ...style, backgroundColor: e.target.value })}
            className="h-7 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">Spacing</Label>
        <div className="flex rounded-lg border border-border bg-card p-0.5 w-fit">
          {spacingOptions.map((p) => (
            <button
              key={p.value}
              onClick={() => onChange({ ...style, padding: p.value })}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                style.padding === p.value
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <p.icon className="size-3.5" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

    
    </div>
  )
}
