import { NextResponse } from "next/server"
import { WHATSAPP_BOT_URL } from "@/lib/constants"

export async function POST() {
  try {
    const res = await fetch(`${WHATSAPP_BOT_URL}/restart`, {
      method: "POST",
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to restart bot server" }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: `Bot server offline: ${err.message}` }, { status: 503 })
  }
}
