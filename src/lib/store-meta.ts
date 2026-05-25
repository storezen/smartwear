export interface StoreMeta {
  siteName: string
  siteTagline: string
  logo: string
}

const STORAGE_KEY = "smartwear-store-meta"
const LEGACY_KEY = "smartwear-sections"

const DEFAULT_META: StoreMeta = {
  siteName: "SMARTWEAR",
  siteTagline: "Commerce",
  logo: "",
}

export function getStoreMeta(): StoreMeta {
  if (typeof window === "undefined") return { ...DEFAULT_META }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.siteName === "string") {
        return { ...DEFAULT_META, ...parsed }
      }
    }
    const legacyRaw = localStorage.getItem(LEGACY_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw)
      if (legacy && typeof legacy.siteName === "string") {
        return {
          siteName: legacy.siteName || DEFAULT_META.siteName,
          siteTagline: legacy.siteTagline || DEFAULT_META.siteTagline,
          logo: legacy.logo || DEFAULT_META.logo,
        }
      }
    }
  } catch {}
  return { ...DEFAULT_META }
}

const META_SETTINGS_KEY = "store-meta"

export function saveStoreMeta(data: StoreMeta): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  fetch(`/api/settings/${META_SETTINGS_KEY}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value: JSON.stringify(data) }),
  }).catch(() => {})
}

export async function initMetaFromApi(): Promise<void> {
  try {
    const res = await fetch(`/api/settings/${META_SETTINGS_KEY}`)
    if (!res.ok) return
    const { value } = await res.json()
    if (!value) return
    const existing = localStorage.getItem(STORAGE_KEY)
    if (!existing) {
      localStorage.setItem(STORAGE_KEY, value)
    }
  } catch {}
}
