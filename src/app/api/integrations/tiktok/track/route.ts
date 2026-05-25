import { NextRequest, NextResponse } from "next/server"

interface TikTokTrackRequest {
  pixelId: string
  event: string
  params?: Record<string, unknown>
}

export async function POST(req: NextRequest) {
  try {
    const body: TikTokTrackRequest = await req.json()
    const { pixelId, event, params } = body

    if (!pixelId || !event) {
      return NextResponse.json({ error: "pixelId and event are required" }, { status: 400 })
    }

    const accessToken = process.env.TIKTOK_ACCESS_TOKEN
    if (!accessToken) {
      return NextResponse.json({ error: "TIKTOK_ACCESS_TOKEN not configured" }, { status: 500 })
    }

    const tiktokApiUrl = `https://business-api.tiktok.com/open_api/v1.3/pixel/track/`
    const payload = {
      pixel_code: pixelId,
      event,
      event_time: Math.floor(Date.now() / 1000),
      user: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "",
        user_agent: req.headers.get("user-agent") || "",
      },
      properties: params || {},
    }

    const tiktokRes = await fetch(tiktokApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Access-Token": accessToken },
      body: JSON.stringify(payload),
    })

    if (!tiktokRes.ok) {
      const errText = await tiktokRes.text()
      console.error("TikTok API error:", errText)
      return NextResponse.json({ error: "TikTok API error" }, { status: tiktokRes.status })
    }

    const data = await tiktokRes.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("TikTok track error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
