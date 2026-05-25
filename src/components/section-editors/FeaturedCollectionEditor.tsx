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

export function FeaturedCollectionEditor({ sectionKey, data, onUpdate }: Props) {
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
          {renderTextField("Badge", "featuredCollection.badge", data, onUpdate, "New Drop")}
          {renderTextField("Title", "featuredCollection.title", data, onUpdate, "The Chrono Collection")}
          {renderTextarea("Description", "featuredCollection.description", data, onUpdate, "Describe the collection...", { charLimit: 200, rows: 3 })}
          {renderImageField("Image URL", "featuredCollection.image", data, onUpdate)}
          {renderTextField("Button Text", "featuredCollection.buttonText", data, onUpdate, "Explore Collection")}
          {renderUrlField("Button URL", "featuredCollection.buttonUrl", data, onUpdate)}
        </div>
      </div>
    </div>
  )
}
