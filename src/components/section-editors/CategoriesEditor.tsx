"use client"

import {
  renderTextField, renderTextarea,
  sectionLabels, renderActiveToggle,
} from "./editor-fields"
import type { SectionData } from "@/lib/sections"

interface Props {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
  onPushUndo: () => void
  onSetData: (updater: (prev: SectionData) => SectionData) => void
}

export function CategoriesEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">{sectionLabels[sectionKey] || sectionKey}</h2>
        </div>
        {renderActiveToggle(sectionKey, data, onUpdate)}
      </div>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {renderTextField("Badge Text", "categories.badge", data, onUpdate, "Browse")}
          {renderTextField("Title", "categories.title", data, onUpdate, "All Categories")}
          {renderTextarea("Description", "categories.description", data, onUpdate, "Find your perfect match...", { rows: 2 })}
        </div>
        {renderTextField("Categories to Show", "categories.displayCount", data, onUpdate, "4")}
        <p className="text-[10px] text-muted-foreground">Controls how many categories appear in the grid. Actual categories come from your category management.</p>
      </div>
    </div>
  )
}
