export type MediaSource = "upload" | "unsplash" | "url"

export interface MediaAsset {
  id: string
  source: MediaSource
  url: string
  thumb?: string
  alt?: string
  width?: number
  height?: number
  photographerName?: string
  photographerUrl?: string
  unsplashUrl?: string
  downloadLocation?: string
}

export interface UnsplashImageResult {
  id: string
  url: string
  thumb: string
  alt: string
  width: number
  height: number
  photographerName: string
  photographerUrl: string
  unsplashUrl: string
  downloadLocation: string
}
