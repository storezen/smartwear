import type { Metadata } from "next"

interface SEOHeadProps {
  title: string
  description: string
  path: string
  ogImage?: string
  noindex?: boolean
}

export function buildMetadata({ title, description, path, ogImage, noindex }: SEOHeadProps): Metadata {
  const baseUrl = "https://smartwear.com"
  const url = `${baseUrl}${path}`
  const image = ogImage || "/og-default.jpg"
  const imageUrl = image.startsWith("http") ? image : `${baseUrl}${image}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "SMARTWEAR",
      title: `${title} — SMARTWEAR`,
      description,
      url,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — SMARTWEAR`,
      description,
      images: [imageUrl],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
