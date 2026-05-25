"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Eye, Monitor, Tablet, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SectionData } from "@/lib/sections"
import { getSectionStyle } from "@/lib/sections"
import { RenderSection } from "@/components/sections/RenderSection"

const sectionMeta: Record<string, string> = {
  hero: "Hero", categories: "Categories", newArrivals: "New Arrivals",
  bestSellers: "Best Sellers", features: "Features", promoBanner: "Promo Banner",
  newsletter: "Newsletter", testimonials: "Testimonials", faq: "FAQ",
  brandStory: "Brand Story", instagram: "Instagram Feed",
  featuredCollection: "Featured Collection", brandLogos: "Brand Logos",
  stats: "Stats", lookbook: "Lookbook", process: "How It Works", press: "Press",
}

type DeviceView = "desktop" | "tablet" | "mobile"

const devices: { key: DeviceView; icon: React.ElementType; label: string }[] = [
  { key: "desktop", icon: Monitor, label: "Desktop" },
  { key: "tablet", icon: Tablet, label: "Tablet" },
  { key: "mobile", icon: Smartphone, label: "Mobile" },
]

const deviceWidths: Record<DeviceView, number> = {
  desktop: 1200, tablet: 480, mobile: 320,
}

function ScaledContent({ children, scale, targetWidth }: { children: React.ReactNode; scale: number; targetWidth: number }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(200)
  const scaleRef = useRef(scale)
  scaleRef.current = scale
  const scaledWidth = Math.round(targetWidth * scale)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const h = e.contentRect.height
        if (h > 0) {
          setHeight((prev) => {
            const next = Math.round(h * scaleRef.current)
            return Math.abs(prev - next) > 1 ? next : prev
          })
        }
      }
    })
    requestAnimationFrame(() => { if (el) ro.observe(el) })
    return () => ro.disconnect()
  }, [])

  return (
    <div style={{ width: scaledWidth, height, overflow: "hidden", position: "relative", margin: "0 auto" }}>
      <div ref={innerRef} style={{ width: targetWidth, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {children}
      </div>
    </div>
  )
}

interface LivePreviewProps {
  data: SectionData
  activeCount: number
  totalCount: number
}

export function LivePreview({ data, activeCount, totalCount }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceView>("desktop")
  const panelRef = useRef<HTMLDivElement>(null)
  const [panelWidth, setPanelWidth] = useState(700)

  const updateWidth = useCallback(() => {
    if (panelRef.current) setPanelWidth(panelRef.current.clientWidth)
  }, [])

  useEffect(() => {
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    if (panelRef.current) ro.observe(panelRef.current)
    return () => ro.disconnect()
  }, [updateWidth])

  const targetWidth = deviceWidths[device]
  const scale = panelWidth > 0 ? Math.min((panelWidth - 32) / targetWidth, 1) : 1

  const activeSections = data.sectionOrder.filter((key: string) => {
    const activeKey = `${key}Active` as keyof SectionData
    return data[activeKey]
  })

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-xs overflow-hidden h-full">
      <div className="flex items-center gap-3 border-b border-border px-5 py-3">
        <Eye className="size-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Preview</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60 tabular-nums">{activeCount}/{totalCount} active</span>
        <div className="flex rounded-lg border border-border bg-card p-0.5">
          {devices.map((d) => (
            <button
              key={d.key}
              onClick={() => setDevice(d.key)}
              className={cn(
                "rounded-md px-2 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                device === d.key
                  ? "bg-secondary text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={d.label}
            >
              <d.icon className="size-3.5" />
              <span className="hidden sm:inline">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div ref={panelRef} className="flex-1 overflow-y-auto bg-muted/30">
        {activeSections.length > 0 ? (
          <ScaledContent scale={scale} targetWidth={targetWidth}>
            <div className="bg-card">
              {activeSections.map((key: string) => (
                <div key={key} className="relative border-b border-border last:border-b-0">
                  <div className="flex items-center gap-1.5 border-b border-border/50 bg-card/90 px-3 py-1.5 text-[10px] font-medium text-muted-foreground sticky top-0 z-10 backdrop-blur-sm">
                    <Eye className="size-3" />
                    {sectionMeta[key] || key}
                  </div>
                  <div className="pointer-events-none select-none">
                    <RenderSection sectionKey={key} sections={data} style={getSectionStyle(data, key)} />
                  </div>
                </div>
              ))}
            </div>
          </ScaledContent>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted ring-1 ring-border">
              <Eye className="size-6 text-muted-foreground/60" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No active sections</p>
            <p className="mt-1.5 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
              Enable sections from the sidebar to see a live preview of your storefront.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
