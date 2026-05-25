"use client"

import {
  renderTextField, renderTextarea, renderImageField, renderUrlField,
  sectionLabels, renderActiveToggle,
} from "./editor-fields"
import type { SectionData } from "@/lib/sections"

interface Props {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
}

export function BrandStoryEditor({ sectionKey, data, onUpdate }: Props) {
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
          {renderTextField("Title", "brandStory.title", data, onUpdate, "Our Story")}
          {renderTextarea("Description", "brandStory.description", data, onUpdate, "Tell your brand story...", { charLimit: 300, rows: 4 })}
          {renderImageField("Image URL", "brandStory.image", data, onUpdate)}
          {renderTextField("Button Text", "brandStory.buttonText", data, onUpdate, "Learn More")}
          {renderUrlField("Button URL", "brandStory.buttonUrl", data, onUpdate)}
        </div>
      </div>
    </div>
  )
}
