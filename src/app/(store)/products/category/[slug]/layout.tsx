import type { Metadata } from "next"
import type { ReactNode } from "react"

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

interface CategoryData {
  name: string
  description?: string
  image?: string
}

async function getCategory(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${API}/api/categories`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const all: CategoryData[] = await res.json()
    const found = all.find((c: any) => c.slug === slug || c.id === slug)
    return found || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  const name = category?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  const description = category?.description || `Shop ${name} at SMARTWEAR.`
  const url = `https://smartwear.com/products/category/${slug}`
  const ogImage = category?.image || "/og-default.jpg"
  return {
    title: `${name} — SMARTWEAR`,
    description,
    alternates: { canonical: url },
    openGraph: {
      locale: "en_US",
      siteName: "SMARTWEAR",
      url,
      title: `${name} — SMARTWEAR`,
      description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — SMARTWEAR`,
      description,
      images: [ogImage],
    },
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
