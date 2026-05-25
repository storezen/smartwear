import { NextRequest, NextResponse } from "next/server"
import { trackShipment } from "@/lib/integrations/postex"

interface TrackRequest {
  trackingId: string
  apiKey?: string
}

export async function POST(req: NextRequest) {
  try {
    const body: TrackRequest = await req.json()
    const { trackingId } = body

    if (!trackingId) {
      return NextResponse.json({ error: "trackingId is required" }, { status: 400 })
    }

    const apiKey = body.apiKey || process.env.POSTEX_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "PostEx API key not configured" }, { status: 400 })
    }

    const shipment = await trackShipment(trackingId, { apiKey })
    return NextResponse.json({ success: true, shipment })
  } catch (error) {
    console.error("PostEx track error:", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
