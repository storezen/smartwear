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
    const { orderId, total, items, phone, email, name, eventId, test_event_code } = await req.json()
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 })

    const settings = await getSettings()
    const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
    const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID

    if (!accessToken || !pixelId) {
      return NextResponse.json({ error: 'TikTok not configured' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const totalValue = Math.max(1, total > 0 ? total
      : (items || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0))

    const eventPayload = {
      event: 'CompletePayment',
      event_id: eventId || orderId,
      event_time: Math.floor(Date.now() / 1000),
      ...(test_event_code ? { test_event_code } : {}),
      context: {
        ip,
        user_agent: userAgent,
        user: {
          phone_number: hashSHA256(phone),
          email: hashSHA256(email),
          external_id: hashSHA256(name),
        },
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
        value: totalValue,
      },
    }

    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_source_id: pixelId,
        event_source: 'web',
        data: [eventPayload],
      }),
    })

    const data = await res.json()
    return NextResponse.json({ success: res.ok, data })
  } catch (error) {
    console.error('[TikTok CAPI] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
