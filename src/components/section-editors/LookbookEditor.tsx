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

export function LookbookEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Section Title", "lookbook.title", data, onUpdate, "The Lookbook")}
          {renderTextField("Section Description", "lookbook.description", data, onUpdate, "Curated styles")}
        </div>
        {renderArrayItems("Images", "lookbook.items", data.lookbook.items as any[],
          [{ key: "image", label: "Image URL" }, { key: "title", label: "Title" }],
          { image: "", title: "" },
          onPushUndo, onSetData, onUpdate, 8,
        )}
      </div>
    </div>
  )
}
