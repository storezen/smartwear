import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { getSettings } from '@/lib/db'
import { decrypt } from '@/lib/encryption'
import { fetchPostexCharges } from '@/lib/postex'

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
    const { orderId, customerName, phone, address, city, amount, orderDetail, pickupAddressCode, bookingWeight, orderType } = data

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

    const postexPayload = {
      orderRefNumber: orderId,
      customerName,
      customerPhone: phone,
      deliveryAddress: address,
      cityName: city,
      invoicePayment: amount,
      orderDetail: orderDetail || "",
      orderType: orderType || "Normal",
      pickupAddressCode: pickupAddressCode || "001",
      bookingWeight: bookingWeight || 0.3,
      transactionNotes: "",
    }

    console.log(`[POSTEX] Booking parcel for Order ${orderId}...`)
    const response = await fetchWithRetry('https://api.postex.pk/services/integration/api/order/v3/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'token': postexToken
      },
      body: JSON.stringify(postexPayload)
    })

    const result = await response.json()

    if (result.statusCode !== "200") {
      console.error(`[POSTEX ERROR] Booking failed for ${orderId}:`, result.statusMessage)
      return NextResponse.json({ error: result.statusMessage || 'PostEx API Error' }, { status: 400 })
    }

    const trackingNumber = result.dist?.trackingNumber
    console.log(`[POSTEX SUCCESS] Order ${orderId} booked with Tracking ID: ${trackingNumber}`)

    // Fetch actual charges from PostEx (runs in background)
    if (trackingNumber && postexToken) {
      fetchPostexCharges(trackingNumber, postexToken).then(charges => {
        if (charges) {
          console.log(`[POSTEX] Charges for ${orderId}:`, charges)
          if (isSupabaseConfigured() && supabase) {
            supabase.from('orders').update({ postex_charges: charges }).eq('id', orderId).then()
          }
        }
      })
    }

    // Store tracking ID in Supabase
    if (trackingNumber && isSupabaseConfigured() && supabase) {
      await supabase.from('orders').update({ postex: trackingNumber }).eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      trackingNumber,
      message: "Order booked on PostEx successfully"
    }, { status: 200 })

  } catch (error: any) {
    console.error('PostEx Booking Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
