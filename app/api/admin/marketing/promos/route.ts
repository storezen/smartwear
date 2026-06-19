import { NextResponse } from 'next/server'
import { getPromos, createPromo } from '@/lib/db'

export async function GET() {
  try {
    const promos = await getPromos()
    return NextResponse.json(promos)
  } catch (error) {
    console.error("Promos GET Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Validate body
    if (!body.code || !body.discount_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const newPromo = {
      code: body.code.toUpperCase().trim(),
      discount_type: body.discount_type,
      discount_value: body.discount_value ? Number(body.discount_value) : 0,
      min_order_value: body.min_order_value ? Number(body.min_order_value) : null,
      max_uses: body.max_uses ? Number(body.max_uses) : null,
      max_discount: body.max_discount ? Number(body.max_discount) : null,
      is_active: true
    }

    const created = await createPromo(newPromo)
    return NextResponse.json(created)
  } catch (error) {
    console.error("Promos POST Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
