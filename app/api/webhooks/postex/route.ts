import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  try {
    // 1. Verify Webhook Secret (from settings or env)
    const signature = req.headers.get('x-postex-secret') || req.headers.get('x-postex-signature') || req.headers.get('authorization')
    
    // Try settings first, fallback to env
    const settings = await getSettings()
    const webhookSecret = decrypt(settings.postex_webhook_secret) || env.POSTEX_WEBHOOK_SECRET
    
    if (webhookSecret && signature !== webhookSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook request' }, { status: 401 })
    }

    const data = await req.json()
    // PostEx v2 sends orderRefNumber; fallback to orderRef for older versions
    const orderRef = data.orderRefNumber || data.orderRef
    const { distTrackingNumber, status } = data

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
    const webhookNote = `Auto-updated by PostEx Webhook (${status})`

    if (isSupabaseConfigured() && supabase) {
      const { data: currentOrder } = await supabase.from('orders').select('history, status, postex').eq('id', orderRef).single()
      
      if (!currentOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Save tracking number if not already saved
      const updates: any = {}
      if (distTrackingNumber && !currentOrder.postex) {
        updates.postex = distTrackingNumber
      }

      if (currentOrder.status !== mappedStatus) {
        updates.status = mappedStatus
        updates.history = [...(currentOrder.history || []), {
          status: mappedStatus,
          timestamp: new Date().toISOString(),
          note: webhookNote
        }]
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from('orders').update(updates).eq('id', orderRef)
      }
    } else {
      const { updateOrderStatus } = await import('@/lib/db')
      // Save tracking number + status
      await updateOrderStatus(orderRef, mappedStatus, distTrackingNumber || undefined, webhookNote)
    }

    return NextResponse.json({ success: true, mappedStatus }, { status: 200 })
  } catch (error) {
    console.error("PostEx Webhook Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
