import { NextResponse } from 'next/server'
import { bulkImportProducts } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { products, overwrite = false } = await req.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    const formattedProducts = products.map((p: any) => ({
      id: p.id || crypto.randomUUID(),
      name: p.name || p.slug,
      slug: p.slug,
      description: p.description || '',
      price: Number(p.price) || 0,
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? [p.images] : []),
      category_slug: p.category_slug || 'uncategorized',
      brand: p.brand || 'Smartwear',
      stock: p.stock != null ? Number(p.stock) : 100,
      rating: Number(p.rating) || 4.8,
      reviews_count: Number(p.reviews_count) || 0,
      specifications: typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : {},
      is_featured: p.is_featured !== undefined ? p.is_featured : false,
      is_active: p.is_active !== undefined ? p.is_active : true,
      upsell_accessories: Array.isArray(p.upsell_accessories) ? p.upsell_accessories : [],
      created_at: new Date().toISOString()
    }))

    const result = await bulkImportProducts(formattedProducts, overwrite)
    return NextResponse.json({
      success: true,
      message: `Processed ${formattedProducts.length} products. Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped || 0}.`
    })
  } catch (error: any) {
    console.error('CSV Import Error:', error)
    return NextResponse.json(
      { error: 'Failed to import products', details: error.message },
      { status: 500 }
    )
  }
}
