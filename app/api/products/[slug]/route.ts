export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getProduct } from '@/lib/db'
import { decodeProductSlug } from '@/lib/product-url'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: rawSlug } = await context.params
    const slug = decodeProductSlug(rawSlug)
    const product = await getProduct(slug)

    if (!product) {
      return NextResponse.json({ error: 'Product Not Found' }, { status: 404 })
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
