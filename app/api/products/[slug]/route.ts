import { NextResponse } from 'next/server'
import { getProduct } from '@/lib/db'

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    const product = await getProduct(slug)

    if (!product) {
      return NextResponse.json({ error: 'Product Not Found' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
