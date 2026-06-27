export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getProducts, addProduct, updateProduct, deleteProduct, bulkUpdateProducts } from '@/lib/db'
import { ProductCreationSchema, ProductUpdateSchema } from '@/lib/validations/products'

export async function GET() {
  try {
    const products = await getProducts()
    return NextResponse.json(products, {
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
