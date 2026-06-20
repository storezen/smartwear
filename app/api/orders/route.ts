export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createOrder, getOrders, updateOrderStatus, getProducts } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { OrderCreationSchema, OrderStatusUpdateSchema } from '@/lib/validations/orders'
import { calculateDiscount } from '@/lib/promotions'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

// In-memory stores for Rate Limiting & Idempotency (For Serverless, use Redis instead)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const idempotencyMap = new Map<string, any>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// Helper to get real product prices
async function getRealProductPrice(productId: string): Promise<number | null> {
  const products = await getProducts()
  const p = products.find((x: any) => x.id === productId)
  return p ? p.price : null
}

// Helper to hash user data for TikTok CAPI
function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  // TikTok expects lowercase, whitespace trimmed, sha256 hash
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// Helper for TikTok Server-Side Tracking (CAPI)
async function fireTikTokCAPI(orderData: any, req: Request) {
  if (orderData.tiktok_capi_fired) return // Deduplication check
  
  const settings = await getSettings();
  const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
  const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID
  
  if (!accessToken || !pixelId) return // Skip if not configured

  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    // Ensure we have a strictly defined event_id for deduplication
    const event_id = orderData.id;

    const payload = {
      pixel_code: pixelId,
      event: 'CompletePayment',
      event_id,
      timestamp: new Date().toISOString(),
      context: {
        ad_features: {},
        ip: ip,
        user_agent: userAgent,
        user: {
          phone_number: hashSHA256(orderData.phone)
        }
      },
      properties: {
        contents: orderData.items.map((i: any) => ({
          content_id: i.id,
          content_type: 'product',
          content_name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        currency: 'PKR',
        value: orderData.total
      }
    }

    await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Access-Token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    console.log('[TikTok CAPI] Fired CompletePayment event')
  } catch (err) {
    console.error('[TikTok CAPI] Error:', err)
  }
}

export async function GET() {
  try {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (!error && data) return NextResponse.json(data)
    }
    
    // Fallback to local DB
    const orders = await getOrders()
    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    
    // 1. Rate Limiting
    const now = Date.now()
    const rateRecord = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    if (now > rateRecord.resetAt) {
      rateRecord.count = 0
      rateRecord.resetAt = now + RATE_LIMIT_WINDOW_MS
    }
    rateRecord.count++
    rateLimitMap.set(ip, rateRecord)
    
    if (rateRecord.count > MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const rawData = await req.json()
    
    // 2. Zod Validation
    const validation = OrderCreationSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid order data', details: validation.error.errors }, { status: 400 })
    }

    const payload = validation.data
    
    // 3. Idempotency Check
    if (payload.idempotency_key && idempotencyMap.has(payload.idempotency_key)) {
      return NextResponse.json({ success: true, order: idempotencyMap.get(payload.idempotency_key), cached: true }, { status: 200 })
    }

    // 4. Server-Side Cart Validation
    let calculatedSubtotal = 0;
    for (const item of payload.items) {
      const realPrice = await getRealProductPrice(item.id)
      if (realPrice === null) {
        return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 400 })
      }
      if (realPrice !== item.price) {
        console.warn(`Price mismatch for ${item.name}. Client: ${item.price}, Server: ${realPrice}`)
        // We could reject, or just override. Let's reject for security.
        return NextResponse.json({ error: `Price mismatch for product: ${item.name}. Please refresh your cart.` }, { status: 400 })
      }
      calculatedSubtotal += (realPrice * item.quantity)
    }

    // Assume flat shipping for now, but in future calculate dynamically
    const expectedShipping = payload.shipping_fee;
    
    // Promo calculation
    let discountAmount = 0;
    if (payload.promo_code) {
      const promoResult = await calculateDiscount(calculatedSubtotal, payload.promo_code)
      if (promoResult.error) {
        return NextResponse.json({ error: promoResult.error }, { status: 400 })
      }
      discountAmount = promoResult.discountAmount || 0
    }

    const expectedTotal = calculatedSubtotal + expectedShipping - discountAmount;
    if (payload.total !== expectedTotal) {
      return NextResponse.json({ error: `Total mismatch. Expected ${expectedTotal}, got ${payload.total}` }, { status: 400 })
    }

    const { idempotency_key, ...payloadWithoutIdempotency } = payload;
    const finalPayload = { ...payloadWithoutIdempotency, discount: discountAmount }
    const initialHistory = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]

    if (isSupabaseConfigured() && supabase) {
      const { data: supabaseOrder, error } = await supabase.from('orders').insert({
        ...finalPayload,
        status: 'Pending',
        history: initialHistory,
        notes: "",
        created_at: new Date().toISOString()
      }).select().single()
      
      if (!error && supabaseOrder) {
        await fireTikTokCAPI(supabaseOrder, req)
        await supabase.from('orders').update({ tiktok_capi_fired: true }).eq('id', supabaseOrder.id)
        if (payload.idempotency_key) idempotencyMap.set(payload.idempotency_key, supabaseOrder)
        return NextResponse.json({ success: true, order: supabaseOrder }, { status: 201 })
      } else {
        // Log the error to see why it failed (e.g. inventory constraint)
        return NextResponse.json({ error: 'Failed to create order', details: error?.message }, { status: 400 })
      }
    }

    // Fallback to local DB (which now includes stock deduction logic)
    try {
      const localOrder = await createOrder({
        ...finalPayload
      })
      
      await fireTikTokCAPI(localOrder, req)
      localOrder.tiktok_capi_fired = true // Mock deduplication
      
      if (payload.idempotency_key) idempotencyMap.set(payload.idempotency_key, localOrder)
      return NextResponse.json({ success: true, order: localOrder }, { status: 201 })
    } catch (dbError: any) {
      return NextResponse.json({ error: dbError.message || 'Failed to create order' }, { status: 400 })
    }
  } catch (error) {
    console.error("Order POST Error", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const rawData = await req.json()
    
    // Zod Validation
    const validation = OrderStatusUpdateSchema.safeParse(rawData)
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid update data', details: validation.error.errors }, { status: 400 })
    }

    const { id, status, postexId, note } = validation.data
    
    // Identify the admin
    let adminName = "System"
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/smartwear_admin_token=([^;]+)/)
    if (match) {
      try {
        const { jwtVerify } = await import('jose')
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-for-development")
        const { payload } = await jwtVerify(match[1], secret)
        if (payload.username) adminName = String(payload.username)
      } catch(e) { /* ignore */ }
    }

    const auditNote = note || `Status updated to ${status} by ${adminName}`

    // PostEx Cancellation Logic (mocked call since we don't have full credentials)
    if (status === 'Cancelled' || status === 'Returned') {
      try {
        // Ideally we would fetch the order first to get the existing postex tracking ID
        // For now, we simulate a cancellation hit
        // await fetch('https://api.postex.pk/services/integration/api/order/v1/cancel-order/...', {...})
        console.log(`[PostEx] Attempting to cancel shipment for order ${id}`)
      } catch (e) {
        console.error('Failed to cancel PostEx shipment', e)
      }
    }

    if (isSupabaseConfigured() && supabase) {
      // First get current order to append history
      const { data: currentOrder } = await supabase.from('orders').select('history, notes, status').eq('id', id).single()
      
      let newHistory = currentOrder?.history || []
      if (currentOrder?.status !== status || note) {
        newHistory = [...newHistory, { status, timestamp: new Date().toISOString(), note: auditNote }]
      }

      let newNotes = currentOrder?.notes || ""
      if (note) newNotes = newNotes ? `${newNotes}\n${note}` : note

      const { data: order, error } = await supabase.from('orders')
        .update({ status, postex: postexId, history: newHistory, notes: newNotes })
        .eq('id', id)
        .select()
        .single()
        
      if (!error && order) return NextResponse.json({ success: true, order })
    }

    const updatedLocalOrder = await updateOrderStatus(id, status, postexId || undefined, auditNote)
    if (updatedLocalOrder) {
      return NextResponse.json({ success: true, order: updatedLocalOrder })
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (error) {
    console.error("Order PUT Error", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
