"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageField } from "@/components/page-builder/ImageField"
import { cn } from "@/lib/utils"
import { Plus, X, Palette } from "lucide-react"

export const sectionLabels: Record<string, string> = {
  hero: "Hero Section", categories: "Categories", newArrivals: "New Arrivals",
  bestSellers: "Best Sellers", features: "Trust Badges", promoBanner: "Promo Banner",
  newsletter: "Newsletter", brandStory: "Brand Story", testimonials: "Testimonials",
  instagram: "Instagram Feed", featuredCollection: "Featured Collection",
  brandLogos: "Brand Logos", faq: "FAQ", stats: "Stats", lookbook: "Lookbook",
  process: "How It Works", press: "Press",
}

export function isValidUrl(str: string): boolean {
  if (!str) return true
  try { new URL(str); return true } catch { return str.startsWith("/") }
}

export function addItem(onPushUndo: () => void, onSetData: (updater: (prev: any) => any) => void, path: string, emptyItem: any) {
  onSetData((prev: any) => {
    const newData = JSON.parse(JSON.stringify(prev))
    const keys = path.split(".")
    let obj = newData
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]]
    }
    obj.push(emptyItem)
    return newData
  })
}

export function removeItem(onPushUndo: () => void, onSetData: (updater: (prev: any) => any) => void, path: string, index: number) {
  onSetData((prev: any) => {
    const newData = JSON.parse(JSON.stringify(prev))
    const keys = path.split(".")
    let obj = newData
    for (let i = 0; i < keys.length; i++) {
      obj = obj[keys[i]]
    }
    obj.splice(index, 1)
    return newData
  })
}

export function getValue(data: any, path: string): any {
  const keys = path.split(".")
  let obj = data
  for (const k of keys) {
    if (obj == null) return ""
    obj = obj[k]
  }
  return obj ?? ""
}

export function renderTextField(
  label: string,
  path: string,
  data: any,
  onUpdate: (path: string, value: string | boolean) => void,
  placeholder?: string,
  opts?: { charLimit?: number; className?: string },
) {
  const value = getValue(data, path) as string
  return (
    <div className="space-y-1.5">
      {opts?.charLimit ? (
        <div className="flex items-center justify-between">
          <Label className="text-xs">{label}</Label>
          <span className={cn("text-[10px] tabular-nums", value.length > opts.charLimit - 20 ? "text-amber-600" : "text-muted-foreground")}>
            {value.length}/{opts.charLimit}
          </span>
        </div>
      ) : (
        <Label className="text-xs">{label}</Label>
      )}
      <Input
        value={value}
        onChange={(e) => {
          if (opts?.charLimit && e.target.value.length > opts.charLimit) return
          onUpdate(path, e.target.value)
        }}
        placeholder={placeholder}
        className={cn("h-8 text-sm", opts?.className)}
      />
    </div>
  )
}

export function renderTextarea(
  label: string,
  path: string,
  data: any,
  onUpdate: (path: string, value: string | boolean) => void,
  placeholder?: string,
  opts?: { charLimit?: number; rows?: number },
) {
  const value = getValue(data, path) as string
  return (
    <div className="space-y-1.5">
      {opts?.charLimit ? (
        <div className="flex items-center justify-between">
          <Label className="text-xs">{label}</Label>
          <span className={cn("text-[10px] tabular-nums", value.length > opts.charLimit - 20 ? "text-amber-600" : "text-muted-foreground")}>
            {value.length}/{opts.charLimit}
          </span>
        </div>
      ) : (
        <Label className="text-xs">{label}</Label>
      )}
      <Textarea
        value={value}
        onChange={(e) => {
          if (opts?.charLimit && e.target.value.length > opts.charLimit) return
          onUpdate(path, e.target.value)
        }}
        rows={opts?.rows || 3}
        placeholder={placeholder}
        className="text-sm"
      />
    </div>
  )
}

export function renderImageField(
  label: string,
  path: string,
  data: any,
  onUpdate: (path: string, value: string | boolean) => void,
) {
  const value = getValue(data, path) as string
  return (
    <ImageField value={value} onChange={(v) => onUpdate(path, v)} label={label} />
  )
}

export function renderColorPicker(
  label: string,
  path: string,
  data: any,
  onUpdate: (path: string, value: string | boolean) => void,
) {
  const value = getValue(data, path) as string
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onUpdate(path, e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background">
            <Palette className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <Input value={value} onChange={(e) => onUpdate(path, e.target.value)} className="h-8 w-28 font-mono text-xs" />
      </div>
    </div>
  )
}

export function renderUrlField(
  label: string,
  path: string,
  data: any,
  onUpdate: (path: string, value: string | boolean) => void,
) {
  const value = getValue(data, path) as string
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onUpdate(path, e.target.value)}
        placeholder="https://..."
        className={cn("h-8 text-xs", !isValidUrl(value) && value ? "border-red-300" : "")}
      />
      {!isValidUrl(value) && value && <p className="text-[10px] text-red-500">Invalid URL format</p>}
    </div>
  )
}

export function renderArrayItems<T extends Record<string, string>>(
  label: string,
  path: string,
  items: T[],
  fields: { key: string; label: string; type?: "textarea" }[],
  emptyItem: T,
  onPushUndo: () => void,
  onSetData: (updater: (prev: any) => any) => void,
  onUpdate: (path: string, value: string | boolean) => void,
  maxItems?: number,
) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label} ({items.length})</p>
        {(!maxItems || items.length < maxItems) && (
          <Button variant="outline" size="sm" onClick={() => addItem(onPushUndo, onSetData, path, emptyItem as any)} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border/60 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">#{i + 1}</span>
              <Button variant="ghost" size="icon" onClick={() => removeItem(onPushUndo, onSetData, path, i)} className="h-6 w-6 text-muted-foreground hover:text-red-500">
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {fields.map((f) => (
                f.type === "textarea" ? (
                  <div key={f.key} className={cn(fields.length > 2 ? "sm:col-span-2" : "")}>
                    <Label className="text-[10px]">{f.label}</Label>
                    <Textarea
                      value={item[f.key] ?? ""}
                      onChange={(e) => onUpdate(`${path}.${i}.${f.key}`, e.target.value)}
                      rows={2}
                      className="text-xs mt-0.5"
                      placeholder={f.label}
                    />
                  </div>
                ) : (
                  <div key={f.key}>
                    <Label className="text-[10px]">{f.label}</Label>
                    <Input
                      value={item[f.key] ?? ""}
                      onChange={(e) => onUpdate(`${path}.${i}.${f.key}`, e.target.value)}
                      className="h-7 text-xs mt-0.5"
                      placeholder={f.label}
                    />
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6">
            <p className="text-xs text-muted-foreground">No items yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function renderStringArray(
  label: string,
  path: string,
  items: string[],
  onPushUndo: () => void,
  onSetData: (updater: (prev: any) => any) => void,
  onUpdate: (path: string, value: string | boolean) => void,
  maxItems?: number,
  placeholder?: string,
) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label} ({items.length})</p>
        {(!maxItems || items.length < maxItems) && (
          <Button variant="outline" size="sm" onClick={() => addItem(onPushUndo, onSetData, path, "")} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border/60 p-2">
            <Input
              value={item}
              onChange={(e) => onUpdate(`${path}.${i}`, e.target.value)}
              placeholder={placeholder || "Enter value"}
              className="h-8 text-sm flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeItem(onPushUndo, onSetData, path, i)} className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500">
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-6">
            <p className="text-xs text-muted-foreground">No items yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function renderActiveToggle(sectionKey: string, data: any, onUpdate: (path: string, value: string | boolean) => void) {
  const isActive = data[`${sectionKey}Active`] as boolean
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={isActive}
        onChange={(e) => onUpdate(`${sectionKey}Active`, e.target.checked)}
        className="h-4 w-4 rounded border-border text-blue-600"
      />
      <span className="text-xs font-medium text-muted-foreground">Active</span>
    </label>
  )
}
