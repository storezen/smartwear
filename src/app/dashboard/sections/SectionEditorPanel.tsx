"use client"

import { useState } from "react"
import { FileText, Palette, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SectionData, SectionStyle } from "@/lib/sections"
import { SectionEditor } from "./SectionEditor"
import { SectionStyleControls } from "./SectionStyleControls"
import { EmptyEditorState } from "./EmptyEditorState"

const sectionDescriptions: Record<string, string> = {
  hero: "Customize your hero banner — title, description, buttons, and background image.",
  categories: "Manage category tiles shown on the homepage.",
  newArrivals: "Edit the heading for your newest products section.",
  bestSellers: "Edit the heading for your top-selling products section.",
  features: "Configure trust badges and feature highlights.",
  promoBanner: "Edit the promotional banner text, colors, and link.",
  newsletter: "Customize the email signup form and background.",
  testimonials: "Add and edit customer reviews and ratings.",
  faq: "Manage frequently asked questions.",
  brandStory: "Tell your brand story with text and an image.",
  instagram: "Link your Instagram feed and photos.",
  featuredCollection: "Showcase a featured product collection.",
  brandLogos: "Display partner or press logos.",
  stats: "Show key metrics and numbers.",
  lookbook: "Create a visual lookbook gallery.",
  process: "Explain how your service works step by step.",
  press: "Display press mentions and quotes.",
}

type TabKey = "content" | "design" | "settings"

interface SectionEditorPanelProps {
  sectionKey: string | null
  data: SectionData
  onUpdate: (path: string, value: string | boolean) => void
  onPushUndo: () => void
  onSetData: (updater: (prev: SectionData) => SectionData) => void
  onUpdateStyle: (key: string, style: SectionStyle) => void
}

export function SectionEditorPanel({ sectionKey, data, onUpdate, onPushUndo, onSetData, onUpdateStyle }: SectionEditorPanelProps) {
  const [tab, setTab] = useState<TabKey>("content")

  if (!sectionKey) return <EmptyEditorState />

  const style = data.sectionStyles[sectionKey]
  const isActive = data[`${sectionKey}Active` as keyof SectionData] as boolean

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "content", label: "Content", icon: FileText },
    { key: "design", label: "Design", icon: Palette },
    { key: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex size-6 items-center justify-center rounded-md text-[10px] font-bold",
            isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
          )}>
            {sectionKey.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-sm font-semibold text-foreground capitalize">{sectionKey} Section</h2>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sectionDescriptions[sectionKey] || "Edit this section's content and settings."}</p>
      </div>

      <div className="flex border-b border-border px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-medium transition-all",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {tab === "content" && (
          <SectionEditor
            sectionKey={sectionKey}
            data={data}
            onUpdate={onUpdate}
            onPushUndo={onPushUndo}
            onSetData={onSetData}
          />
        )}

        {tab === "design" && style && (
          <SectionStyleControls
            style={style}
            onChange={(s) => onUpdateStyle(sectionKey, s)}
          />
        )}

        {tab === "settings" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Show on homepage</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Display this section on the storefront.</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => onUpdate(`${sectionKey}Active`, e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-muted-foreground/30 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-card after:shadow-xs after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-5" />
              </label>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="flex items-start gap-2">
                <HelpCircle className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-xs font-medium text-foreground">About this section</p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{sectionDescriptions[sectionKey] || ""}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
