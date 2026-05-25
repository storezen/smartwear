import type { SeoData } from "@/lib/sections"

const STORAGE_KEY = "smartwear-seo"
const LEGACY_KEY = "smartwear-sections"

const DEFAULT_SEO: SeoData = {
  metaTitle: "SMARTWEAR — Premium Smart Watches & Accessories",
  metaDescription: "Premium smart watches and accessories curated for those who demand more from their tech. Shop the latest wearables at SMARTWEAR.",
  ogImage: "/og-default.jpg",
  keywords: "smart watches, wearables, fitness trackers, smartwear, tech accessories, lifestyle brand",
  favicon: "/favicon.ico",
}

export function getSeoData(): SeoData {
  if (typeof window === "undefined") return { ...DEFAULT_SEO }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.metaTitle === "string") {
        return { ...DEFAULT_SEO, ...parsed }
      }
    }
    const legacyRaw = localStorage.getItem(LEGACY_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw)
      if (legacy && legacy.seo && typeof legacy.seo.metaTitle === "string") {
        return { ...DEFAULT_SEO, ...legacy.seo }
      }
    }
  } catch {}
  return { ...DEFAULT_SEO }
}

const SEO_SETTINGS_KEY = "seo"

export function saveSeoData(data: SeoData): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  fetch(`/api/settings/${SEO_SETTINGS_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(data) }),
  }).catch(() => {})
}

export async function initSeoFromApi(): Promise<void> {
  try {
    const res = await fetch(`/api/settings/${SEO_SETTINGS_KEY}`)
    if (!res.ok) return
    const { value } = await res.json()
    if (!value) return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, value)
    }
  } catch {}
}
