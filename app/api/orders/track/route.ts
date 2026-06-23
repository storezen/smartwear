import { NextResponse } from 'next/server'
import { getOrderById } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://n')
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing Order ID' }, { status: 400 })

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (!error && data) return NextResponse.json({ order: data })
    }

    const order = await getOrderById(id)
    if (order) {
      return NextResponse.json({ order })
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
