"use client"

import {
  renderTextField, renderUrlField, renderColorPicker,
  sectionLabels, renderActiveToggle,
} from "./editor-fields"
import type { SectionData } from "@/lib/sections"

interface Props {
  sectionKey: string
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
}

export function PromoBannerEditor({ sectionKey, data, onUpdate }: Props) {
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
            {renderTextField("Banner Text", "promoBanner.text", data, onUpdate, "Free shipping on all orders")}
            {renderTextField("Button Text", "promoBanner.buttonText", data, onUpdate, "Shop Now")}
            {renderUrlField("Button URL", "promoBanner.buttonUrl", data, onUpdate)}
          </div>
          <div className="space-y-4">
            {renderColorPicker("Background Color", "promoBanner.bgColor", data, onUpdate)}
            {renderColorPicker("Text Color", "promoBanner.textColor", data, onUpdate)}
            {renderColorPicker("Button Background", "promoBanner.buttonBgColor", data, onUpdate)}
            {renderColorPicker("Button Text Color", "promoBanner.buttonTextColor", data, onUpdate)}
          </div>
        </div>
        <div className="rounded-xl p-5" style={{ backgroundColor: data.promoBanner.bgColor, color: data.promoBanner.textColor }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">{data.promoBanner.text || "Banner text"}</p>
            <span className="rounded-lg px-4 py-2 text-xs font-medium shadow-sm"
              style={{ backgroundColor: data.promoBanner.buttonBgColor, color: data.promoBanner.buttonTextColor }}>
              {data.promoBanner.buttonText || "Button"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
