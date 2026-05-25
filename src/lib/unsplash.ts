export interface UnsplashPhoto {
  id: string
  slug: string
  description: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    html: string
  }
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
  width: number
  height: number
  color: string
  blur_hash: string
}

export interface UnsplashSearchResult {
  photos: UnsplashPhoto[]
  total: number
  total_pages: number
}

export function photoUrl(photo: UnsplashPhoto, size: "thumb" | "small" | "regular" = "small"): string {
  return photo.urls[size]
}

export function photoCredit(photo: UnsplashPhoto): string {
  return `Photo by ${photo.user.name} on Unsplash`
}

export function photoAttribution(photo: UnsplashPhoto): { name: string; url: string } {
  return {
    name: photo.user.name,
    url: `${photo.links.html}?utm_source=smartwear&utm_medium=referral`,
  }
}
