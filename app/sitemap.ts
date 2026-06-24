import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/db'

const STATIC_PAGES = [
  '', '/products', '/cart', '/checkout',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL
    || process.env.NEXT_PUBLIC_VERCEL_URL
    || 'https://smartwear.pk'

  const storeUrl = `https://${baseUrl.replace(/^https?:\/\//, '')}`

  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map(path => ({
    url: `${storeUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' as const : 'daily' as const,
    priority: path === '' ? 1.0 : 0.7,
  }))

  try {
    const products = await getProducts()
    const slugs = new Set<string>()

    for (const p of products) {
      const slug = p.slug || p.id
      if (slugs.has(slug)) continue
      slugs.add(slug)
      entries.push({
        url: `${storeUrl}/products/${encodeURIComponent(slug)}`,
        lastModified: new Date(p.updated_at || p.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })
    }
  } catch (e) {
    console.error('[Sitemap] Error fetching products:', e)
  }

  return entries
}
