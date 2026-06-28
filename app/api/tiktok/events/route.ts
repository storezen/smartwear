import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import crypto from 'crypto'

const TIKTOK_EVENT_KEYS = new Set([
  'ViewContent','AddToCart','AddToWishlist','InitiateCheckout',
  'AddPaymentInfo','CompletePayment','Purchase','PlaceAnOrder',
  'Search','Subscribe','CompleteRegistration'
])

function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value) return undefined
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function normalizePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) cleaned = '92' + cleaned.slice(1)
  else if (!cleaned.startsWith('92')) cleaned = '92' + cleaned
  return cleaned
}

export async function POST(req: Request) {
  try {
    const { event, event_id, content_id, content_type, content_category, description, content_name, value, contents, phone, email, name, test_event_code, url, ttclid } = await req.json()
    if (!event || !TIKTOK_EVENT_KEYS.has(event)) return NextResponse.json({ error: 'invalid event' }, { status: 400 })

    const settings = await getSettings()
    const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
    const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID
    const testEventCode = settings.tiktok_test_event_code || undefined

    if (!accessToken || !pixelId) {
      return NextResponse.json({ error: 'TikTok not configured' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    const eventPayload: Record<string, unknown> = {
      event,
      event_id: event_id || `${event}_${crypto.randomUUID()}`,
      event_time: Math.floor(Date.now() / 1000),
      ...(testEventCode ? { test_event_code: testEventCode } : {}),
      ...(url ? { event_source_url: url } : {}),
      context: {
        ip,
        user_agent: userAgent,
        user: {
          email: hashSHA256(email),
          phone_number: hashSHA256(normalizePhone(phone)),
          external_id: hashSHA256(name),
        },
        ...(ttclid ? { ad: { callback: ttclid } } : {}),
      },
      properties: {
        currency: 'PKR',
        value: Math.max(1, Number(value) || 1),
      },
    }

    if (contents && Array.isArray(contents)) {
      eventPayload.properties = {
        ...(eventPayload.properties as Record<string, unknown>),
        contents: contents.map((i: Record<string, unknown>) => ({
          content_id: i.content_id || i.id,
          content_type: i.content_type || 'product',
          content_category: i.content_category || content_category || '',
          content_name: i.content_name || i.name,
          price: i.price,
          quantity: i.quantity || 1,
        })),
      }
    } else if (content_id) {
      eventPayload.properties = {
        ...(eventPayload.properties as Record<string, unknown>),
        content_id,
        content_type: content_type || 'product',
        content_category: content_category || '',
        content_name: content_name || '',
      }
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

    const responseData = await res.json()
    if (!res.ok) {
      console.error(`[TikTok CAPI] ${event} failed:`, JSON.stringify(responseData))
    }

    return NextResponse.json({ success: res.ok, event, event_id, data: responseData })
  } catch (error) {
    console.error('[TikTok CAPI] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
