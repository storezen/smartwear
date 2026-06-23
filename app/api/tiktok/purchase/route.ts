import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import crypto from 'crypto'

function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function POST(req: Request) {
  try {
    const { orderId, total, items, phone, eventId } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const settings = await getSettings()
    const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
    const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID

    if (!accessToken || !pixelId) {
      return NextResponse.json({ error: 'TikTok not configured' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const payload = {
      pixel_code: pixelId,
      event: 'CompletePayment',
      event_id: eventId || orderId,
      timestamp: new Date().toISOString(),
      context: {
        ip,
        user_agent: userAgent,
        user: { phone_number: hashSHA256(phone) },
      },
      properties: {
        contents: (items || []).map((i: any) => ({
          content_id: i.id || i.product_id,
          content_type: 'product',
          content_name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        currency: 'PKR',
        value: total,
      },
    }

    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    return NextResponse.json({ success: res.ok, data })
  } catch (error) {
    console.error('[TikTok CAPI] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
