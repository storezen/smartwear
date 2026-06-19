import { NextResponse } from 'next/server'
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { ProductCreationSchema, ProductUpdateSchema } from '@/lib/validations/products'

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('products').select('*')
      if (!error && data) return NextResponse.json(data)
    }

    const products = await getProducts()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const rawData = await req.json()
    
    // Zod Validation
    const validation = ProductCreationSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid product data', details: validation.error.errors }, { status: 400 })
    }

    const payload = validation.data

    if (isSupabaseConfigured() && supabase) {
      const { data: product, error } = await supabase.from('products').insert({
        ...payload,
        created_at: new Date().toISOString()
      }).select().single()
      
      if (!error && product) return NextResponse.json({ success: true, product }, { status: 201 })
    }

    const product = await addProduct({
      ...payload,
      created_at: new Date().toISOString()
    })
    return NextResponse.json({ success: true, product }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const rawData = await req.json()
    
    // Zod Validation
    const validation = ProductUpdateSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    const { id, ...updates } = validation.data

    if (isSupabaseConfigured() && supabase) {
      const { data: product, error } = await supabase.from('products')
        .update(updates)
        .eq('id', id)
        .select().single()
      
      if (!error && product) return NextResponse.json({ success: true, product })
    }

    const product = await updateProduct(id, updates)
    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (!error) return NextResponse.json({ success: true })
    }
    
    await deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
