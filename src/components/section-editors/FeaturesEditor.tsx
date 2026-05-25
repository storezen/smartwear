"use client"

import {
  renderTextField, renderTextarea, renderArrayItems,
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

export function FeaturesEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Badge Text", "features.badge", data, onUpdate, "Why Choose Us")}
          {renderTextField("Title", "features.title", data, onUpdate, "Trusted by Thousands")}
          {renderTextarea("Description", "features.description", data, onUpdate, "We make your shopping experience smooth...", { rows: 2 })}
        </div>
        {renderArrayItems("Features", "features.items", data.features.items as any[],
          [{ key: "icon", label: "Icon" }, { key: "title", label: "Title" }, { key: "description", label: "Description" }],
          { icon: "truck", title: "", description: "" },
          onPushUndo, onSetData, onUpdate, 8,
        )}
      </div>
    </div>
  )
}
