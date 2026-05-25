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
}

export function BestSellersEditor({ sectionKey, data, onUpdate }: Props) {
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
          {renderTextField("Badge Text", "bestSellers.badge", data, onUpdate, "Best Sellers")}
          {renderTextField("Title", "bestSellers.title", data, onUpdate, "Most Loved by Customers")}
          {renderTextarea("Description", "bestSellers.description", data, onUpdate, "Our top-rated products...", { rows: 2 })}
        </div>
      </div>
    </div>
  )
}
