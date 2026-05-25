import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SITE_URL } from "@/lib/constants"

const API = process.env.NEXT_PUBLIC_API_URL || SITE_URL

interface ProductData {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  metaTitle?: string
  metaDescription?: string
}

async function getProduct(id: string): Promise<ProductData | null> {
  try {
    const res = await fetch(`${API}/api/products/${id}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    }
  }
  const title = product.metaTitle || `${product.name} — SMARTWEAR`
  const description = product.metaDescription || product.description.slice(0, 160)
  const url = `${SITE_URL}/products/${id}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "SMARTWEAR",
      url,
      title,
      description,
      images: product.image ? [{ url: product.image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  return children
}
