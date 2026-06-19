import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { bulkImportProducts } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { products, overwrite = false } = await req.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 })
    }

    // Ensure all products have the required structure
    const formattedProducts = products.map((p: any) => ({
      ...p,
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0,
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      is_active: p.is_active !== undefined ? p.is_active : true,
      is_featured: p.is_featured !== undefined ? p.is_featured : false,
      images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? [p.images] : []),
      tags: Array.isArray(p.tags) ? p.tags : [],
      specifications: typeof p.specifications === 'object' && p.specifications !== null ? p.specifications : {},
      created_at: new Date().toISOString()
    }))

    if (isSupabaseConfigured()) {
      const { data: existingData } = await supabase!.from('products').select('slug')
      const existingSlugs = new Set(existingData?.map(row => row.slug) || [])

      const productsToInsert = overwrite 
        ? formattedProducts 
        : formattedProducts.filter(p => !existingSlugs.has(p.slug))

      if (productsToInsert.length === 0) {
        return NextResponse.json({ success: true, message: `0 products imported. Skipped ${formattedProducts.length} existing products.` })
      }

      const { error } = await supabase!
        .from('products')
        .upsert(productsToInsert, { onConflict: 'slug' })
      
      if (error) throw error
      
      return NextResponse.json({ success: true, message: `Imported ${productsToInsert.length} products to Supabase. ${!overwrite ? `Skipped ${formattedProducts.length - productsToInsert.length} existing.` : 'Overwrote existing.'}` })
    } else {
      // Fallback to local JSON database
      const result = await bulkImportProducts(formattedProducts, overwrite)
      return NextResponse.json({ 
        success: true, 
        message: `Successfully processed ${formattedProducts.length} products. Added: ${result.added}, Updated: ${result.updated}, Skipped: ${result.skipped || 0}.` 
      })
    }

  } catch (error: any) {
    console.error('CSV Import Error:', error)
    return NextResponse.json(
      { error: 'Failed to import products', details: error.message },
      { status: 500 }
    )
  }
}
