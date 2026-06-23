import { NextResponse } from 'next/server'
import { getSettings, getOrderById } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url, 'http://n')
    const orderId = url.searchParams.get('orderId')

    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

    // Get order to find tracking number
    let order: any = null
    if (isSupabaseConfigured() && supabase) {
      const { data } = await supabase.from('orders').select('*').eq('id', orderId).single()
      order = data
    }
    if (!order) order = await getOrderById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const trackingNumber = order.postex
    if (!trackingNumber) {
      return NextResponse.json({ order, postexTracking: null })
    }

    // Fetch live tracking from PostEx API
    const settings = await getSettings()
    const token = decrypt(settings.postex_api_token) || process.env.POSTEX_API_TOKEN
    if (!token) {
      return NextResponse.json({ order, postexTracking: null, error: 'PostEx not configured' })
    }

    const res = await fetch(
      `https://api.postex.pk/services/integration/api/order/v1/track-order/${encodeURIComponent(trackingNumber)}`,
      { headers: { token } }
    )

    if (!res.ok) {
      return NextResponse.json({ order, postexTracking: null, error: 'PostEx API error' })
    }

    const data = await res.json()
    if (data.statusCode !== "200" || !data.dist) {
      return NextResponse.json({ order, postexTracking: null })
    }

    const { dist } = data

    return NextResponse.json({
      order,
      postexTracking: {
        trackingNumber: dist.trackingNumber,
        status: dist.transactionStatus || dist.orderStatus,
        customerName: dist.customerName,
        cityName: dist.cityName,
        invoicePayment: dist.invoicePayment,
        transactionFee: dist.transactionFee,
        transactionTax: dist.transactionTax,
        upfrontPayment: dist.upfrontPayment,
        balancePayment: dist.balancePayment,
        timeline: (dist.transactionStatusHistory || []).map((s: any) => ({
          status: s.transactionStatusMessage || s.status,
          code: s.transactionStatusMessageCode,
          date: s.transactionDate || s.timestamp,
        })),
        deliveryDate: dist.deliveryDate || dist.transactionDate,
      }
    })
  } catch (error) {
    console.error('PostEx track error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
