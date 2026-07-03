export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createOrder, getOrders, updateOrderStatus, getProducts, incrementPromoUsage } from '@/lib/db'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { OrderCreationSchema, OrderStatusUpdateSchema } from '@/lib/validations/orders'
import { calculateDiscount } from '@/lib/promotions'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { jwtVerify } from 'jose'

// In-memory stores for Rate Limiting & Idempotency (For Serverless, use Redis instead)
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();
const idempotencyMap = new Map<string, any>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCancelledOrReturned(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'cancelled' || s === 'returned' || s === 'rto' || s === 'rto delivered' || s.includes('return to origin') || s === 'lost' || s === 'stolen' || s === 'damage'
}

// Batch load products once for price/cost lookups
let _productMap: Map<string, any> | null = null
async function getProductMap(): Promise<Map<string, any>> {
  if (_productMap) return _productMap
  const products = await getProducts()
  _productMap = new Map(products.map((p: any) => [p.id, p]))
  return _productMap
}

async function getRealProductPrice(productId: string): Promise<number | null> {
  const map = await getProductMap()
  const p = map.get(productId)
  return p ? p.price : null
}
async function getProductCostPrice(productId: string): Promise<number | null> {
  const map = await getProductMap()
  const p = map.get(productId)
  return p && p.cost_price ? p.cost_price : null
}

// Helper to hash user data for TikTok CAPI
function hashSHA256(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function normalizePhone(phone: string | undefined | null): string | undefined {
  if (!phone) return undefined
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (cleaned.startsWith('0')) cleaned = '92' + cleaned.slice(1)
  else if (!cleaned.startsWith('92')) cleaned = '92' + cleaned
  return cleaned
}

// Helper for TikTok Offline Conversion — fires when COD is marked Delivered
async function fireTikTokOfflineConversion(orderData: any) {
  const settings = await getSettings();
  const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
  const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID
  const testEventCode = settings.tiktok_test_event_code || undefined
  if (!accessToken || !pixelId) return

  try {
    const totalValue = Math.max(1, orderData.total > 0 ? orderData.total
      : (orderData.items || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0))

    await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_source_id: pixelId,
        event_source: 'web',
        data: [{
          event: 'CompletePayment',
          event_id: `${orderData.id}_delivered`,
          event_time: Math.floor(Date.now() / 1000),
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
          context: {
            user: {
              email: hashSHA256(orderData.email),
              phone_number: hashSHA256(normalizePhone(orderData.phone)),
              external_id: hashSHA256(orderData.customer_name),
            }
          },
          properties: {
            contents: (orderData.items || []).map((i: any) => ({
              content_id: i.id,
              content_type: 'product',
              content_name: i.name,
              price: i.price,
              quantity: i.quantity,
            })),
            currency: 'PKR',
            value: totalValue,
          },
        }]
      }),
    })
  } catch (err) {
    console.error('[TikTok Offline] Error:', err)
  }
}

// Helper for TikTok Server-Side Tracking (CAPI)
async function fireTikTokCAPI(orderData: any, req: Request) {
  if (orderData.tiktok_capi_fired) return // Deduplication check
  
  const settings = await getSettings();
  const accessToken = decrypt(settings.tiktok_access_token) || process.env.TIKTOK_ACCESS_TOKEN
  const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID
  const testEventCode = settings.tiktok_test_event_code || undefined
  
  if (!accessToken || !pixelId) return // Skip if not configured

  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const userAgent = req.headers.get('user-agent') || ''

    // Ensure we have a strictly defined event_id for deduplication
    const event_id = orderData.id;

    const totalValue = Math.max(1, orderData.total > 0 ? orderData.total
      : (orderData.items || []).reduce((s: number, i: any) => s + (i.price || 0) * (i.quantity || 1), 0))

    await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: { 'Access-Token': accessToken, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_source_id: pixelId,
        event_source: 'web',
        data: [{
          event: 'CompletePayment',
          event_id,
          event_time: Math.floor(Date.now() / 1000),
          ...(testEventCode ? { test_event_code: testEventCode } : {}),
          context: {
            ip,
            user_agent: userAgent,
            user: {
              email: hashSHA256(orderData.email),
              phone_number: hashSHA256(normalizePhone(orderData.phone)),
              external_id: hashSHA256(orderData.customer_name),
            }
          },
          properties: {
            contents: (orderData.items || []).map((i: any) => ({
              content_id: i.id,
              content_type: 'product',
              content_name: i.name,
              price: i.price,
              quantity: i.quantity
            })),
            currency: 'PKR',
            value: totalValue,
          },
        }]
      }),
    })
  } catch (err) {
    console.error('[TikTok CAPI] Error:', err)
  }
}

export async function GET(req: Request) {
  try {
    const token = req.headers.get('cookie')?.match(/smartwear_admin_token=([^;]+)/)?.[1]
    if (token) {
      try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
        await jwtVerify(token, secret)
      } catch {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
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
    _productMap = null
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

    // 4. Server-Side Cart Validation + COGS Calculation
    let calculatedSubtotal = 0;
    let cogs = 0;
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
      const costPrice = await getProductCostPrice(item.id)
      if (costPrice !== null) {
        cogs += costPrice * item.quantity
      }
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
    const finalPayload = { ...payloadWithoutIdempotency, discount: discountAmount, cogs }
    const initialHistory = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]

    if (isSupabaseConfigured() && supabase) {
      const orderId = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
      const deductedItems: { id: string; quantity: number }[] = []

      // Batch fetch all products for stock deduction
      const itemIds = payload.items.map((i: any) => i.id)
      const { data: productsForStock } = await supabase
        .from('products')
        .select('id, stock')
        .in('id', itemIds)

      const stockMap = new Map((productsForStock || []).map((p: any) => [p.id, p]))
      for (const item of payload.items) {
        const product = stockMap.get(item.id)
        if (product && (product.stock || 0) >= item.quantity) {
          await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.id)
          deductedItems.push({ id: item.id, quantity: item.quantity })
        }
      }
      const { data: supabaseOrder, error } = await supabase.from('orders').insert({
        ...finalPayload,
        id: orderId,
        status: 'Pending',
        history: initialHistory,
        notes: "",
        created_at: new Date().toISOString()
      }).select().single()
      
      if (!error && supabaseOrder) {
        await fireTikTokCAPI(supabaseOrder, req)
        await supabase.from('orders').update({ tiktok_capi_fired: true }).eq('id', supabaseOrder.id)
        if (payload.idempotency_key) idempotencyMap.set(payload.idempotency_key, supabaseOrder)
        if (payload.promo_code) {
          incrementPromoUsage(payload.promo_code)
        }
        return NextResponse.json({ success: true, order: supabaseOrder }, { status: 201 })
      } else {
        console.warn("Supabase create order failed, falling back to local DB:", error?.message)
        // Rollback: fetch all products once, restore stock
        if (deductedItems.length > 0) {
          const deductIds = deductedItems.map(d => d.id)
          const { data: rollbackProducts } = await supabase
            .from('products')
            .select('id, stock')
            .in('id', deductIds)
          const rollbackMap = new Map((rollbackProducts || []).map((p: any) => [p.id, p]))
          for (const item of deductedItems) {
            const product = rollbackMap.get(item.id)
            if (product) await supabase.from('products').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.id)
          }
        }
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
    if (isCancelledOrReturned(status)) {
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
      // Fire TikTok offline conversion when COD order is delivered
      if (status === 'Delivered' && updatedLocalOrder.total > 0) {
        fireTikTokOfflineConversion(updatedLocalOrder)
      }
      return NextResponse.json({ success: true, order: updatedLocalOrder })
    }
    
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (error) {
    console.error("Order PUT Error", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const rawData = await req.json()
    const { ids } = rawData
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid or missing order IDs' }, { status: 400 })
    }

    const { deleteOrders } = await import('@/lib/db')
    await deleteOrders(ids)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order DELETE Error", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
