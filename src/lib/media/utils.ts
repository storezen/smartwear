import type { MediaAsset } from "./types"

const MEDIA_PREFIX = "media://"

export function encodeMediaAsset(asset: MediaAsset): string {
  return MEDIA_PREFIX + JSON.stringify(asset)
}

export function parseMediaValue(value: string): MediaAsset | null {
  if (!value) return null
  if (value.startsWith(MEDIA_PREFIX)) {
    try {
      return JSON.parse(value.slice(MEDIA_PREFIX.length)) as MediaAsset
    } catch {
      return null
    }
  }
  return null
}

export function toMediaAsset(url: string): MediaAsset {
  const parsed = parseMediaValue(url)
  if (parsed) return parsed
  return {
    id: `url-${Date.now()}`,
    source: "url",
    url,
    alt: "",
  }
}

export function resolveMediaUrl(value: string): string {
  if (!value) return ""
  const asset = parseMediaValue(value)
  return asset ? asset.url : value
}

export function getMediaAttribution(value: string): { name?: string; url?: string } {
  const asset = parseMediaValue(value)
  if (!asset || asset.source !== "unsplash") return {}
  return { name: asset.photographerName, url: asset.photographerUrl }
}
