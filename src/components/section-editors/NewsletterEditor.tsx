"use client"

import {
  renderTextField, renderImageField, renderColorPicker,
  sectionLabels, renderActiveToggle,
} from "./editor-fields"
import type { SectionData } from "@/lib/sections"

interface Props {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
}

export function NewsletterEditor({ sectionKey, data, onUpdate }: Props) {
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
          <div className="space-y-4">
            {renderTextField("Title", "newsletter.title", data, onUpdate, "Stay in the Loop")}
            {renderTextField("Description", "newsletter.description", data, onUpdate, "Subscribe for exclusive deals")}
            {renderTextField("Placeholder", "newsletter.placeholder", data, onUpdate, "Enter your email")}
            {renderTextField("Button Text", "newsletter.buttonText", data, onUpdate, "Subscribe")}
          </div>
          <div className="space-y-4">
            {renderColorPicker("Background Color", "newsletter.bgColor", data, onUpdate)}
            {renderImageField("Background Image (optional)", "newsletter.bgImage", data, onUpdate)}
          </div>
        </div>
        <div className="rounded-xl p-6 text-center shadow-sm"
          style={{ backgroundColor: data.newsletter.bgColor }}>
          <p className="mb-1 text-base font-bold text-white">{data.newsletter.title || "Title"}</p>
          <p className="mb-3 text-xs text-white/70">{data.newsletter.description}</p>
          <div className="mx-auto flex max-w-xs gap-2">
            <div className="flex-1 rounded-lg bg-white/20 px-3 py-2 text-left text-xs text-white/50">{data.newsletter.placeholder}</div>
            <span className="rounded-lg bg-white px-4 py-2 text-xs font-medium text-slate-900">{data.newsletter.buttonText}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
