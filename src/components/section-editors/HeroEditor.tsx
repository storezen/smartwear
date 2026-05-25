"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { GripVertical, Plus, X, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  renderTextField, renderTextarea, renderImageField, renderUrlField,
  addItem, removeItem, sectionLabels, renderActiveToggle,
} from "./editor-fields"
import type { SectionData } from "@/lib/sections"

const trustIcons = [
  { value: "truck", label: "Shipping" },
  { value: "shield", label: "Security" },
  { value: "banknote", label: "Payment" },
  { value: "clock", label: "Timing" },
  { value: "headphones", label: "Support" },
  { value: "star", label: "Quality" },
  { value: "gift", label: "Offer" },
  { value: "check", label: "Verified" },
  { value: "heart", label: "Love" },
  { value: "zap", label: "Speed" },
]

interface Props {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
  onPushUndo: () => void
  onSetData: (updater: (prev: SectionData) => SectionData) => void
}

function moveTrustFeature(data: SectionData, onPushUndo: () => void, onSetData: (updater: (prev: SectionData) => SectionData) => void, from: number, to: number) {
  onSetData((prev) => {
    const features = [...prev.hero.trustFeatures]
    const [moved] = features.splice(from, 1)
    features.splice(to, 0, moved)
    return { ...prev, hero: { ...prev.hero, trustFeatures: features } }
  })
}

export function HeroEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">{sectionLabels[sectionKey] || sectionKey}</h2>
        </div>
        {renderActiveToggle(sectionKey, data, onUpdate)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Layout Style</Label>
            <select
              value={data.hero.layout || "bento"}
              onChange={(e) => onUpdate("hero.layout", e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="bento">Bento (Rounded & Playful)</option>
              <option value="centered">Centered (Minimal & Clean)</option>
              <option value="split">Split (50/50 Image & Text)</option>
              <option value="fullscreen">Fullscreen (Immersive)</option>
            </select>
          </div>
          {renderTextField("Badge Text", "hero.badge", data, onUpdate, "New Collection 2026")}
          {renderTextField("Title", "hero.title", data, onUpdate, "Smart technology at a")}
          {renderTextField("Highlighted Word", "hero.highlightedWord", data, onUpdate, "smart price.", { className: "pr-16" })}
          {renderTextarea("Description", "hero.description", data, onUpdate, "Describe your brand...", { charLimit: 200, rows: 3 })}
        </div>
        <div className="space-y-4">
          {renderTextField("Primary Button", "hero.primaryButtonText", data, onUpdate, "Contact Us")}
          {renderUrlField("Primary URL", "hero.primaryButtonUrl", data, onUpdate)}
          {renderTextField("Secondary Button", "hero.secondaryButtonText", data, onUpdate, "View Products")}
          {renderUrlField("Secondary URL", "hero.secondaryButtonUrl", data, onUpdate)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {renderImageField("Background Image", "hero.bgImage", data, onUpdate)}
        {renderImageField("Featured Image", "hero.featuredImage", data, onUpdate)}
      </div>
      <TrustFeatureEditor
        features={data.hero.trustFeatures}
        onAdd={() => addItem(onPushUndo, onSetData, "hero.trustFeatures", { label: "", icon: "truck" })}
        onRemove={(i) => removeItem(onPushUndo, onSetData, "hero.trustFeatures", i)}
        onMove={(from, to) => moveTrustFeature(data, onPushUndo, onSetData, from, to)}
        onUpdate={(i, field, val) => onUpdate(`hero.trustFeatures.${i}.${field}`, val)}
      />
    </div>
  )
}

function TrustFeatureEditor({ features, onAdd, onRemove, onMove, onUpdate }: {
  features: { label: string; icon: string }[]
  onAdd: () => void
  onRemove: (i: number) => void
  onMove: (from: number, to: number) => void
  onUpdate: (i: number, field: string, value: string) => void
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Trust Features ({features.length})</p>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1 h-7 text-xs">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      <div className="space-y-2">
        {features.map((f, i) => (
          <div key={i}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(i) }}
            onDragEnd={() => {
              if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) onMove(dragIdx, overIdx)
              setDragIdx(null); setOverIdx(null)
            }}
            className="flex items-center gap-2 rounded-lg border p-2 transition-all hover:border-blue-200"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing" />
            <select
              value={f.icon}
              onChange={(e) => onUpdate(i, "icon", e.target.value)}
              className="h-8 w-24 rounded-md border border-border bg-background px-2 text-xs"
            >
              {trustIcons.map((ic) => (
                <option key={ic.value} value={ic.value}>{ic.label}</option>
              ))}
            </select>
            <Input
              value={f.label}
              onChange={(e) => onUpdate(i, "label", e.target.value)}
              placeholder="Feature name"
              className="h-8 text-sm flex-1 min-w-0"
            />
            <Button variant="ghost" size="icon" onClick={() => onRemove(i)} className="h-8 w-8 shrink-0">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        {features.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6">
            <p className="text-xs text-muted-foreground">No trust features</p>
          </div>
        )}
      </div>
    </div>
  )
}
