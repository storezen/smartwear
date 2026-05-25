"use client"

import {
  renderTextField, renderUrlField, renderStringArray,
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

export function InstagramEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Title", "instagram.title", data, onUpdate, "Follow Us")}
          {renderTextField("Description", "instagram.description", data, onUpdate, "Tag us to get featured")}
          {renderTextField("Link Text", "instagram.linkText", data, onUpdate, "@smartwear")}
          {renderUrlField("Link URL", "instagram.link", data, onUpdate)}
        </div>
        {renderStringArray("Images", "instagram.images", data.instagram.images,
          onPushUndo, onSetData, onUpdate, 8, "Image URL",
        )}
      </div>
    </div>
  )
}
