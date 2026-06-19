import { NextResponse } from 'next/server'
import { calculateDiscount } from '@/lib/promotions'

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json()
    
    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const promoResult = await calculateDiscount(subtotal, code)

    if (promoResult.error) {
      return NextResponse.json({ error: promoResult.error }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      discount: promoResult.discountAmount 
    })

  } catch (error) {
    console.error("Promo API Error", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
