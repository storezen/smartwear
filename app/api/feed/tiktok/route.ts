import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'

export const dynamic = 'force-dynamic'

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function getStoreUrl(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_STORE_URL || process.env.NEXT_PUBLIC_VERCEL_URL
  if (envUrl) return `https://${envUrl.replace(/^https?:\/\//, '')}`
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'smartwear.pk'
  return `https://${host}`
}

export async function GET(req: Request) {
  try {
    const products = await getProducts()
    const baseUrl = getStoreUrl(req)
    const active = products.filter((p: any) => p.is_active !== false)

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
  <channel>
    <title>Smartwear Pakistan</title>
    <link>${xmlEscape(baseUrl)}</link>
    <description>Premium Watches & Accessories Product Feed for TikTok Dynamic Ads</description>
`

    for (const p of active) {
      const link = `${baseUrl}/products/${encodeURIComponent(p.slug || p.id)}`
      const image = Array.isArray(p.images) && p.images[0] ? p.images[0] : ''
      const desc = (p.description || p.name || '').substring(0, 5000)
      const price = `${p.price} PKR`
      const avail = (p.stock ?? 0) > 0 ? 'in_stock' : 'out_of_stock'
      const brand = p.brand || 'Smartwear'
      const category = p.category?.name || p.category_name || ''

      xml += `    <item>
      <g:id>${xmlEscape(p.id)}</g:id>
      <g:title>${xmlEscape(p.name || '')}</g:title>
      <g:description>${xmlEscape(desc)}</g:description>
      <g:link>${xmlEscape(link)}</g:link>
      <g:image_link>${xmlEscape(image)}</g:image_link>
      <g:price>${xmlEscape(price)}</g:price>
      <g:availability>${avail}</g:availability>
      <g:brand>${xmlEscape(brand)}</g:brand>
      <g:condition>new</g:condition>
      <g:product_category>${xmlEscape(category)}</g:product_category>
    </item>
`
    }

    xml += `  </channel>
</rss>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  } catch (error) {
    console.error('[TikTok Feed] Error:', error)
    return new NextResponse('<error>Internal Server Error</error>', {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    })
  }
}
