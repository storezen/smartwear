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

export function FAQEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Section Title", "faq.title", data, onUpdate, "Frequently Asked Questions")}
          {renderTextField("Section Description", "faq.description", data, onUpdate, "Everything you need to know")}
        </div>
        {renderArrayItems("Q&A", "faq.items", data.faq.items as any[],
          [{ key: "question", label: "Question" }, { key: "answer", label: "Answer", type: "textarea" }],
          { question: "", answer: "" },
          onPushUndo, onSetData, onUpdate,
        )}
      </div>
    </div>
  )
}
