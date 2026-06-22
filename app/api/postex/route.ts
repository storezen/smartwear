import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'

/**
 * Fetch wrapper with exponential backoff retry logic.
 */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url, options)
      if (res.ok || res.status === 400) {
        return res
      }
      if (i === maxRetries - 1) return res
    } catch (err) {
      if (i === maxRetries - 1) throw err
    }
    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
  }
  throw new Error("Max retries reached")
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { orderId, customerName, phone, address, city, amount } = data

    // Required fields for PostEx
    if (!orderId || !customerName || !phone || !address || !city) {
      return NextResponse.json({ error: 'Missing required order details for PostEx' }, { status: 400 })
    }

    const settings = await getSettings();
    const postexToken = decrypt(settings.postex_api_token) || process.env.POSTEX_API_TOKEN

    // If no token is provided, mock the response for local development
    if (!postexToken) {
      console.log(`[POSTEX MOCK] Booking parcel for ${orderId}...`)
      return NextResponse.json({ 
        success: true, 
        trackingNumber: `PEX-${Math.floor(100000 + Math.random() * 900000)}`,
        message: "Mock booked successfully (No API Token)"
      }, { status: 200 })
    }

    // Actual PostEx API Integration (v2/v3 endpoint example)
    const postexPayload = {
      orderRefNumber: orderId,
      customerName,
      customerPhone: phone,
      deliveryAddress: address,
      cityName: city,
      invoiceDivision: 1,
      orderType: 1,
      invoicePayment: amount,
      items: 1,
    }

    console.log(`[POSTEX] Attempting to book parcel for Order ${orderId}...`)
    const response = await fetchWithRetry('https://api.postex.pk/services/integration/api/order/v2/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': postexToken
      },
      body: JSON.stringify(postexPayload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[POSTEX ERROR] Booking failed for ${orderId}:`, errorText)
      return NextResponse.json({ error: 'PostEx API Error', details: errorText }, { status: response.status })
    }

    const result = await response.json()
    console.log(`[POSTEX SUCCESS] Order ${orderId} booked with Tracking ID: ${result.distTrackingNumber}`)

    // Store the PostEx tracking ID into Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('orders').update({ postex_tracking: result.distTrackingNumber }).eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      trackingNumber: result.distTrackingNumber, // Example response key
      message: "Order booked on PostEx successfully"
    }, { status: 200 })

  } catch (error: any) {
    console.error('PostEx Booking Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
