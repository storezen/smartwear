import { prisma } from "@/lib/db/prisma"
import { type Product } from "@/lib/products"
import ProductDetailClient from "./ProductDetailClient"
import type { Metadata } from "next"
import { ChevronRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const dbProduct = await prisma.product.findUnique({ where: { id } })
    if (dbProduct) {
      return {
        title: dbProduct.metaTitle || `${dbProduct.name} — SMARTWEAR`,
        description: dbProduct.metaDescription || dbProduct.description || "Product details...",
        openGraph: {
          title: dbProduct.metaTitle || `${dbProduct.name} — SMARTWEAR`,
          description: dbProduct.metaDescription || dbProduct.description || "Product details...",
          images: dbProduct.image ? [{ url: dbProduct.image }] : [{ url: "/og-default.jpg" }],
        }
      }
    }
  } catch (err) {
    console.error("Failed to load product metadata:", err)
  }
  return {
    title: "Product Not Found — SMARTWEAR",
    description: "The requested product could not be found.",
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const dbProduct = await prisma.product.findUnique({ where: { id } })
  if (!dbProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background px-4 sm:px-6">
        <div className="text-center max-w-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ShoppingBag className="h-7 w-7 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-semibold text-foreground">Product not found</p>
          <p className="mt-1.5 text-sm text-muted-foreground">This product may have been removed or is no longer available.</p>
          <Link href="/products">
            <Button className="mt-7 gap-2">
              <ChevronRight className="h-4 w-4 rotate-180" /> Back to Shop
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const product: Product = {
    ...dbProduct,
    originalPrice: dbProduct.originalPrice ?? undefined,
    rating: dbProduct.rating ?? undefined,
    reviews: dbProduct.reviews ?? undefined,
    metaTitle: dbProduct.metaTitle ?? undefined,
    metaDescription: dbProduct.metaDescription ?? undefined,
    handle: dbProduct.handle ?? undefined,
    featured: dbProduct.featured ?? undefined,
    status: (dbProduct.status as any) || "published",
    images: parseJsonField(dbProduct.images, []),
    specs: parseJsonField(dbProduct.specs, []),
    variants: parseJsonField(dbProduct.variants, []),
    optionNames: parseJsonField(dbProduct.optionNames, []),
    tags: parseJsonField(dbProduct.tags, []),
  }

  // Fetch related products
  const dbRelated = await prisma.product.findMany({
    where: {
      category: product.category,
      NOT: { id: product.id },
      status: "published",
    },
    take: 4,
  })

  const related: Product[] = dbRelated.map((p) => ({
    ...p,
    originalPrice: p.originalPrice ?? undefined,
    rating: p.rating ?? undefined,
    reviews: p.reviews ?? undefined,
    metaTitle: p.metaTitle ?? undefined,
    metaDescription: p.metaDescription ?? undefined,
    handle: p.handle ?? undefined,
    featured: p.featured ?? undefined,
    status: (p.status as any) || "published",
    images: parseJsonField(p.images, []),
    specs: parseJsonField(p.specs, []),
    variants: parseJsonField(p.variants, []),
    optionNames: parseJsonField(p.optionNames, []),
    tags: parseJsonField(p.tags, []),
  }))

  return <ProductDetailClient product={product} related={related} />
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback
  if (Array.isArray(value)) return value as T
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed as T : fallback
    } catch { return fallback }
  }
  return fallback
}
