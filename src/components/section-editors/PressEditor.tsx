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

export function PressEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Section Title", "press.title", data, onUpdate, "In the Press")}
          {renderTextField("Section Description", "press.description", data, onUpdate, "What the media says")}
        </div>
        {renderArrayItems("Mentions", "press.items", data.press.items as any[],
          [{ key: "quote", label: "Quote", type: "textarea" }, { key: "source", label: "Source" }, { key: "logo", label: "Logo URL" }],
          { quote: "", source: "", logo: "" },
          onPushUndo, onSetData, onUpdate, 4,
        )}
      </div>
    </div>
  )
}
