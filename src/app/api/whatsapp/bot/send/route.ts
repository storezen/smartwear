import { NextRequest, NextResponse } from "next/server"
import { WHATSAPP_BOT_URL } from "@/lib/constants"

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 })
    }

    const res = await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, message }),
    })

    if (!res.ok) {
      const errData = await res.json()
      return NextResponse.json({ error: errData.error || "Failed to send message via bot server" }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: `Bot server offline: ${err.message}` }, { status: 503 })
  }
}
