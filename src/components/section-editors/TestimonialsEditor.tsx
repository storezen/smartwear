"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Plus, X, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  renderTextField, addItem, removeItem,
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

export function TestimonialsEditor({ sectionKey, data, onUpdate, onPushUndo, onSetData }: Props) {
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
          {renderTextField("Section Title", "testimonials.title", data, onUpdate, "What Our Customers Say")}
          {renderTextField("Section Description", "testimonials.description", data, onUpdate, "Real reviews from real people")}
        </div>
        <TestimonialItemsEditor
          items={data.testimonials.items}
          onUpdate={onUpdate}
          onAdd={() => addItem(onPushUndo, onSetData, "testimonials.items", { name: "", role: "", avatar: "", text: "", rating: "5" })}
          onRemove={(i) => removeItem(onPushUndo, onSetData, "testimonials.items", i)}
        />
      </div>
    </div>
  )
}

function TestimonialItemsEditor({ items, onUpdate, onAdd, onRemove }: {
  items: { name: string; role: string; avatar: string; text: string; rating: number }[]
  onUpdate: (path: string, value: string | boolean) => void
  onAdd: () => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Testimonials ({items.length})</p>
        <Button variant="outline" size="sm" onClick={onAdd} className="gap-1 h-7 text-xs">
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => onRemove(i)} className="h-6 w-6 text-muted-foreground hover:text-red-500">
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label className="text-[10px]">Name</Label>
                <Input value={item.name} onChange={(e) => onUpdate(`testimonials.items.${i}.name`, e.target.value)} placeholder="Customer name" className="h-7 text-xs mt-0.5" />
              </div>
              <div>
                <Label className="text-[10px]">Role</Label>
                <Input value={item.role} onChange={(e) => onUpdate(`testimonials.items.${i}.role`, e.target.value)} placeholder="Verified Buyer" className="h-7 text-xs mt-0.5" />
              </div>
            </div>
            <div>
              <Label className="text-[10px]">Avatar URL</Label>
              <Input value={item.avatar} onChange={(e) => onUpdate(`testimonials.items.${i}.avatar`, e.target.value)} placeholder="https://..." className="h-7 text-xs mt-0.5" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px]">Review</Label>
                <span className="text-[10px] text-muted-foreground">{item.text.length}/200</span>
              </div>
              <Textarea
                value={item.text}
                onChange={(e) => { if (e.target.value.length <= 200) onUpdate(`testimonials.items.${i}.text`, e.target.value) }}
                rows={2} className="text-xs mt-0.5" placeholder="What they said..."
              />
            </div>
            <div>
              <Label className="text-[10px]">Rating</Label>
              <div className="flex items-center gap-1 mt-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => onUpdate(`testimonials.items.${i}.rating`, String(star))}
                    className={cn("h-6 w-6 rounded-md flex items-center justify-center transition-all",
                      star <= item.rating ? "text-amber-400" : "text-muted-foreground/30")}
                  >
                    <Star className={cn("h-3.5 w-3.5", star <= item.rating ? "fill-amber-400" : "")} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6">
            <p className="text-xs text-muted-foreground">No testimonials yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
