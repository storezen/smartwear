"use client"

import {
  renderTextField, renderStringArray,
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

export function BrandLogosEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">{sectionLabels[sectionKey] || sectionKey}</h2>
        </div>
        {renderActiveToggle(sectionKey, data, onUpdate)}
      </div>
      <div className="space-y-4">
        {renderTextField("Section Title", "brandLogos.title", data, onUpdate, "As Featured In")}
        {renderStringArray("Logos", "brandLogos.logos", data.brandLogos.logos,
          onPushUndo, onSetData, onUpdate, undefined, "Logo URL",
        )}
      </div>
    </div>
  )
}
