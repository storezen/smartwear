"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Save, Globe, Search, X, ImageOff, Trash2 } from "lucide-react"
import { getStoreMeta, saveStoreMeta, type StoreMeta } from "@/lib/store-meta"
import { getSeoData, saveSeoData } from "@/lib/seo"
import type { SeoData } from "@/lib/sections"

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

function ImagePreview({ src, onRemove }: { src: string; onRemove: () => void }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  return (
    <div className="group relative mt-2 overflow-hidden rounded-lg bg-muted">
      {!loaded && !error && (
        <div className="flex h-28 items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      )}
      {error ? (
        <div className="flex h-28 items-center justify-center gap-2 text-muted-foreground">
          <ImageOff className="h-4 w-4" />
          <span className="text-xs">Invalid URL</span>
        </div>
      ) : (
        <img
          src={src}
          alt=""
          className={cn("h-28 w-full object-cover transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      )}
      <button
        onClick={onRemove}
        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [meta, setMeta] = useState<StoreMeta>(getStoreMeta)
  const [seo, setSeo] = useState<SeoData>(getSeoData)
  const [savedMeta, setSavedMeta] = useState("")
  const [savedSeo, setSavedSeo] = useState("")

  useEffect(() => {
    setSavedMeta(JSON.stringify(meta))
    setSavedSeo(JSON.stringify(seo))
  }, [])

  const hasChanges = JSON.stringify(meta) !== savedMeta || JSON.stringify(seo) !== savedSeo

  function updateMeta(path: string, value: string) {
    setMeta((prev) => {
      const newData = JSON.parse(JSON.stringify(prev))
      const keys = path.split(".")
      let obj: Record<string, unknown> = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]] as Record<string, unknown>
      }
      obj[keys[keys.length - 1]] = value
      return newData
    })
  }

  function updateSeo(path: string, value: string) {
    setSeo((prev: SeoData) => {
      const newData = JSON.parse(JSON.stringify(prev))
      const keys = path.split(".")
      let obj: Record<string, unknown> = newData
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {}
        obj = obj[keys[i]] as Record<string, unknown>
      }
      obj[keys[keys.length - 1]] = value
      return newData
    })
  }

  function handleSave() {
    if (!meta.siteName?.trim()) {
      toast.error("Store name is required")
      return
    }
    if (!seo.metaTitle?.trim()) {
      toast.error("Meta title is required for SEO")
      return
    }
    if (meta.logo?.trim() && !/^https?:\/\/.+/.test(meta.logo)) {
      toast.error("Logo URL must be a valid URL")
      return
    }
    saveStoreMeta(meta)
    saveSeoData(seo)
    setSavedMeta(JSON.stringify(meta))
    setSavedSeo(JSON.stringify(seo))
    toast.success("Store settings saved!")
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-start justify-between flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Store Settings</h1>
          <p className="mt-1 text-sm font-medium text-neutral-500">Manage your store name, logo, and SEO configuration.</p>
        </div>
        <Button onClick={handleSave} className="gap-2 rounded-full h-[40px] px-6 font-bold shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed" disabled={!hasChanges}>
          <Save className="size-4" strokeWidth={2} /> {hasChanges ? "Save Changes" : "Saved"}
        </Button>
      </div>

      {/* SEO Preview */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/30 border border-blue-100/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="p-6">
          <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2 mb-4">
            <Search className="size-4" strokeWidth={2} /> SEO Preview
          </h3>
          <div className="space-y-1">
            <p className="text-base font-bold text-blue-700 truncate">{seo.metaTitle || `${meta.siteName} — ${meta.siteTagline}`}</p>
            <p className="text-sm font-medium text-emerald-700 truncate">{typeof window !== "undefined" ? window.location.origin : ""}/</p>
            <p className="text-sm font-medium text-neutral-600 line-clamp-2">{seo.metaDescription}</p>
          </div>
        </div>
      </div>

      {/* Store Identity */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="p-8 pb-6 border-b border-neutral-200/60">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-blue-50 text-blue-600 shadow-sm border border-blue-100">
              <Globe className="size-5" strokeWidth={2} />
            </span>
            Store Identity
          </h3>
        </div>
        <div className="p-8 grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Store Name</Label>
            <Input value={meta.siteName} onChange={(e) => updateMeta("siteName", e.target.value)} placeholder="Your store name" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900" />
            <p className="text-[11px] font-bold text-neutral-400">Shown in browser tab, SEO title & branding</p>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Store Tagline</Label>
            <Input value={meta.siteTagline} onChange={(e) => updateMeta("siteTagline", e.target.value)} placeholder="Short description" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner" />
            <p className="text-[11px] font-bold text-neutral-400">Appears under site name in header & search results</p>
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Logo URL</Label>
            <div className="relative">
              <Input
                value={meta.logo}
                onChange={(e) => updateMeta("logo", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner pr-10 text-sm font-mono"
              />
              {meta.logo && (
                <button onClick={() => updateMeta("logo", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X className="size-5" strokeWidth={2} />
                </button>
              )}
            </div>
            {meta.logo && (
              <div className="flex items-center gap-4 rounded-[16px] border border-neutral-200/60 bg-neutral-50 p-4 mt-3">
                <div className="bg-white rounded-lg p-2 border border-neutral-200 shadow-sm">
                  <img src={meta.logo} alt="" className="h-10 w-auto object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }} />
                </div>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Logo preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="p-8 pb-6 border-b border-neutral-200/60">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
              <Search className="size-5" strokeWidth={2} />
            </span>
            SEO Settings
          </h3>
        </div>
        <div className="p-8 grid gap-8 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Meta Title</Label>
            <Input value={seo.metaTitle} onChange={(e) => updateSeo("metaTitle", e.target.value)} placeholder="Page title for search results" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Meta Description</Label>
            <Textarea
              value={seo.metaDescription}
              onChange={(e) => updateSeo("metaDescription", e.target.value)}
              placeholder="Search result description"
              rows={2}
              className="resize-none rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner text-sm py-3"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Keywords (comma-separated)</Label>
            <Input value={seo.keywords} onChange={(e) => updateSeo("keywords", e.target.value)} placeholder="watches, premium, smart" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">Favicon URL</Label>
            <Input value={seo.favicon} onChange={(e) => updateSeo("favicon", e.target.value)} placeholder="https://example.com/favicon.ico" className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner text-sm font-mono" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wider">OG Image URL</Label>
            <div className="relative">
              <Input
                value={seo.ogImage}
                onChange={(e) => updateSeo("ogImage", e.target.value)}
                placeholder="https://example.com/og-image.jpg"
                className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner pr-10 text-sm font-mono"
              />
              {seo.ogImage && (
                <button onClick={() => updateSeo("ogImage", "")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X className="size-5" strokeWidth={2} />
                </button>
              )}
            </div>
            {seo.ogImage && <ImagePreview src={seo.ogImage} onRemove={() => updateSeo("ogImage", "")} />}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
