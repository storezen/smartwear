import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Secret (if configured)
    const signature = req.headers.get('x-postex-signature') || req.headers.get('authorization')
    if (env.POSTEX_WEBHOOK_SECRET && signature !== env.POSTEX_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
    }

    const data = await req.json()
    // Expected Payload structure (varies by PostEx API version, assuming a generic structure)
    // { "orderRef": "ORD-123456", "distTrackingNumber": "PEX-123", "status": "Delivered", "timestamp": "..." }

    const { orderRef, distTrackingNumber, status } = data

    if (!orderRef || !status) {
      return NextResponse.json({ error: 'Missing required webhook fields' }, { status: 400 })
    }

    // Map PostEx status to our OMS Status
    let mappedStatus = "Shipped" // Default fallback
    const postexStatus = status.toLowerCase()
    
    if (postexStatus.includes('delivered')) mappedStatus = "Delivered"
    else if (postexStatus.includes('returned') || postexStatus.includes('cancelled')) mappedStatus = "Returned"
    else if (postexStatus.includes('transit') || postexStatus.includes('dispatched')) mappedStatus = "In Transit"

    // 2. Update Database
    if (isSupabaseConfigured() && supabase) {
      // Fetch current to append history
      const { data: currentOrder } = await supabase.from('orders').select('history, status').eq('id', orderRef).single()
      
      if (currentOrder && currentOrder.status !== mappedStatus) {
        const newHistory = [...(currentOrder.history || []), { 
          status: mappedStatus, 
          timestamp: new Date().toISOString(), 
          note: `Auto-updated by PostEx Webhook (${status})` 
        }]

        await supabase.from('orders')
          .update({ status: mappedStatus, history: newHistory })
          .eq('id', orderRef)
      }
    } else {
      // Local DB fallback note: since lib/db.ts is running in-memory for the mock, 
      // webhook updates from external servers might hit a different lambda instance in production. 
      // But for this mock setup, we'll import and use updateOrderStatus.
      const { updateOrderStatus } = await import('@/lib/db')
      await updateOrderStatus(orderRef, mappedStatus, undefined, `Auto-updated by PostEx Webhook (${status})`)
    }

    return NextResponse.json({ success: true, mappedStatus }, { status: 200 })
  } catch (error) {
    console.error("PostEx Webhook Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
