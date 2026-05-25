"use client"

import {
  renderTextField, renderArrayItems,
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

export function StatsEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Section Title", "stats.title", data, onUpdate, "By the Numbers")}
          {renderTextField("Section Description", "stats.description", data, onUpdate, "SMARTWEAR in numbers")}
        </div>
        {renderArrayItems("Stats", "stats.items", data.stats.items as any[],
          [{ key: "value", label: "Value" }, { key: "label", label: "Label" }, { key: "prefix", label: "Prefix" }, { key: "suffix", label: "Suffix" }],
          { value: "", label: "", prefix: "", suffix: "" },
          onPushUndo, onSetData, onUpdate, 4,
        )}
      </div>
    </div>
  )
}
