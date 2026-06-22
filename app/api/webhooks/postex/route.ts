import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { env } from '@/lib/env'
import { fetchPostexCharges } from '@/lib/postex'

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

    const postexStatusLower = status.toLowerCase()

    // Map PostEx status → our OMS status
    let mappedStatus = "Shipped"
    if (postexStatusLower.includes('delivered')) mappedStatus = "Delivered"
    else if (postexStatusLower.includes('returned') || postexStatusLower.includes('cancelled') || postexStatusLower.includes('rto') || postexStatusLower.includes('return to origin')) mappedStatus = "Returned"
    else if (postexStatusLower.includes('transit') || postexStatusLower.includes('dispatched') || postexStatusLower.includes('out for delivery')) mappedStatus = "In Transit"

    // 2. Update Database
    const webhookNote = `PostEx: ${status}`

    // Build PostEx tracking history entry
    const historyEntry = {
      status: mappedStatus,
      postexStatus: status,
      timestamp: new Date().toISOString(),
      note: webhookNote
    }

    if (isSupabaseConfigured() && supabase) {
      const { data: currentOrder } = await supabase.from('orders').select('*').eq('id', orderRef).single()
      
      if (!currentOrder) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      const updates: Record<string, unknown> = {}

      // Save tracking number if not already saved
      if (distTrackingNumber && !currentOrder.postex) {
        updates.postex = distTrackingNumber
      }

      // Update status if changed
      if (currentOrder.status !== mappedStatus) {
        updates.status = mappedStatus
        updates.history = [...(currentOrder.history || []), historyEntry]
      }

      // Always save raw PostEx status & status history
      updates.postex_status = status
      const prevTimeline = Array.isArray(currentOrder.postex_timeline) ? currentOrder.postex_timeline : []
      updates.postex_timeline = [...prevTimeline, {
        status,
        timestamp: new Date().toISOString(),
      }]

      if (Object.keys(updates).length > 0) {
        await supabase.from('orders').update(updates).eq('id', orderRef)
      }

      // Fetch actual charges in background
      const trackId = distTrackingNumber || currentOrder.postex
      if (trackId && settings.postex_api_token) {
        const token = decrypt(settings.postex_api_token) || env.POSTEX_API_TOKEN
        if (token) {
          fetchPostexCharges(trackId, token).then(charges => {
            if (charges) {
              supabase.from('orders').update({ postex_charges: charges }).eq('id', orderRef).then()
            }
          })
        }
      }
    } else {
      const { updateOrderStatus } = await import('@/lib/db')
      const token = decrypt(settings.postex_api_token) || env.POSTEX_API_TOKEN
      const trackId = distTrackingNumber
      const charges = trackId && token ? await fetchPostexCharges(trackId, token) : undefined
      await updateOrderStatus(orderRef, mappedStatus, trackId || undefined, webhookNote, charges || undefined)
    }

    return NextResponse.json({ success: true, mappedStatus }, { status: 200 })
  } catch (error) {
    console.error("PostEx Webhook Error:", error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
