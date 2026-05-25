"use client"

import { useState } from "react"
import { DndContext, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { ChevronDown, ChevronRight, Layers, Layout, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SectionData, SectionKey } from "@/lib/sections"
import { SectionListItem, iconMap, labelMap } from "./SectionListItem"

const PRIMARY_KEYS: SectionKey[] = ["hero", "categories", "newArrivals", "bestSellers", "features", "promoBanner", "newsletter", "testimonials", "faq"]
const ADVANCED_KEYS: SectionKey[] = ["brandStory", "instagram", "featuredCollection", "brandLogos", "stats", "lookbook", "process", "press"]

interface SectionSidebarProps {
  data: SectionData
  selectedKey: string | null
  onSelect: (key: string) => void
  onToggle: (key: string, active: boolean) => void
  onMove: (from: number, to: number) => void
  onToggleAll: (val: boolean) => void
  onUpdate?: (path: string, value: string | boolean) => void
  onPushUndo?: () => void
}

export function SectionSidebar({ data, selectedKey, onSelect, onToggle, onMove, onToggleAll, onUpdate, onPushUndo }: SectionSidebarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const primaryKeys = PRIMARY_KEYS.filter(k => data.sectionOrder.includes(k))
  const advancedKeys = ADVANCED_KEYS.filter(k => data.sectionOrder.includes(k))

  const allActive = data.sectionOrder.every(k => data[`${k}Active` as keyof SectionData])
  const noneActive = data.sectionOrder.every(k => !data[`${k}Active` as keyof SectionData])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: any) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const fromIdx = data.sectionOrder.indexOf(active.id as string)
    const toIdx = data.sectionOrder.indexOf(over.id as string)
    if (fromIdx !== -1 && toIdx !== -1) onMove(fromIdx, toIdx)
  }

  const OverlayIcon = activeId ? (iconMap[activeId] || Layout) : Layout
  const OverlayLabel = activeId ? (labelMap[activeId] || activeId) : ""

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sections</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onToggleAll(true)} disabled={allActive}
            className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            All On
          </button>
          <button onClick={() => onToggleAll(false)} disabled={noneActive}
            className="rounded px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors">
            All Off
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={data.sectionOrder} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
            {primaryKeys.map(key => (
              <SectionListItem
                key={key}
                sectionKey={key}
                isActive={data[`${key}Active` as keyof SectionData] as boolean}
                isSelected={selectedKey === key}
                onSelect={() => onSelect(key)}
                onToggle={(v) => onToggle(key, v)}
              />
            ))}
          </div>

          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
            >
              {showAdvanced ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              Advanced Sections ({advancedKeys.length})
            </button>
            <div className={cn(
              "mt-1.5 space-y-1.5 overflow-hidden transition-all",
              showAdvanced ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
            )}>
              <div className="border-l-2 border-border pl-2 space-y-1.5">
                {advancedKeys.map(key => (
                  <SectionListItem
                    key={key}
                    sectionKey={key}
                    isActive={data[`${key}Active` as keyof SectionData] as boolean}
                    isSelected={selectedKey === key}
                    onSelect={() => onSelect(key)}
                    onToggle={(v) => onToggle(key, v)}
                  />
                ))}
              </div>
            </div>
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-primary/30 bg-card shadow-lg px-3 py-2.5 w-[260px]">
              <GripVertical className="size-4 text-muted-foreground/40" />
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <OverlayIcon className="size-3.5" />
              </div>
              <span className="text-sm font-medium text-foreground">{OverlayLabel}</span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="pt-6 mt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="size-4 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Global Design</span>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Product Card Layout</label>
          <select
            value={data.productCardLayout || "bento"}
            onChange={(e) => onUpdate?.("productCardLayout", e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="bento">Bento (Rounded & Shadows)</option>
            <option value="minimal">Minimal (Borderless)</option>
            <option value="bordered">Bordered (Technical)</option>
            <option value="glass">Glass (Translucent & Blur)</option>
          </select>
        </div>
      </div>
    </div>
  )
}
