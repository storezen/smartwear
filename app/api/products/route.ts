import { NextResponse } from 'next/server'
import { getProducts, addProduct, updateProduct, deleteProduct, bulkUpdateProducts } from '@/lib/db'
import { ProductCreationSchema, ProductUpdateSchema } from '@/lib/validations/products'
import { normalizeCategorySlug } from '@/lib/normalize-product'

let productsCache: { data: any[]; timestamp: number } | null = null
const PRODUCTS_CACHE_TTL = 5000

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const category = url.searchParams.get('category')
    const search = url.searchParams.get('search')
    const limitParam = url.searchParams.get('limit')
    const offsetParam = url.searchParams.get('offset')
    const noCache = url.searchParams.get('no-cache') === '1'

    let products: any[]
    if (noCache) productsCache = null
    if (productsCache && Date.now() - productsCache.timestamp < PRODUCTS_CACHE_TTL) {
      products = productsCache.data
    } else {
      products = await getProducts()
      productsCache = { data: products, timestamp: Date.now() }
    }

    let filtered = products
    if (category) {
      const cat = normalizeCategorySlug(category)
      filtered = filtered.filter((p: any) => normalizeCategorySlug(p.category_slug) === cat)
    }
    if (search) {
      const lq = search.toLowerCase()
      filtered = filtered.filter((p: any) =>
        p.name?.toLowerCase().includes(lq) || p.brand?.toLowerCase().includes(lq)
      )
    }

    // Support pagination via query params
    const offset = parseInt(offsetParam || '0')
    const limit = parseInt(limitParam || '0')
    const result = (limit > 0) ? filtered.slice(offset, offset + limit) : filtered

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const rawData = await req.json()
    const validation = ProductCreationSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 })
    }

    const product = await addProduct({
      ...validation.data,
      created_at: new Date().toISOString()
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const rawData = await req.json()
    const validation = ProductUpdateSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    const { id, ...updates } = validation.data
    const product = await updateProduct(id, updates)
    return NextResponse.json({ success: true, product })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const rawData = await req.json()
    const updates = Array.isArray(rawData) ? rawData : [rawData]
    await bulkUpdateProducts(updates)
    return NextResponse.json({ success: true, count: updates.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Bulk update failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url, 'http://n')
    const id = url.searchParams.get('id')
    const deleteAll = url.searchParams.get('deleteAll') === 'true'

    if (deleteAll) {
      const db = await getProducts()
      for (const p of db) {
        if (p.id) await deleteProduct(p.id)
      }
      return NextResponse.json({ success: true })
    }

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 })
  }
}
