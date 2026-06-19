import { NextResponse } from 'next/server'
import { getProduct } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params
    
    if (isSupabaseConfigured() && supabase) {
      const { data: product, error } = await supabase.from('products').select('*').eq('slug', slug).single()
      if (!error && product) {
        return NextResponse.json(product)
      }
    }

    const product = await getProduct(slug)
    if (!product) {
      return NextResponse.json({ error: 'Product Not Found' }, { status: 404 })
    }
    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
