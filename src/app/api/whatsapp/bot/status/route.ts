import { NextResponse } from "next/server"
import { WHATSAPP_BOT_URL } from "@/lib/constants"

export async function GET() {
  try {
    const res = await fetch(`${WHATSAPP_BOT_URL}/status`, {
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ status: "DISCONNECTED", qr: null })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    // If bot server is offline, gracefully return disconnected state
    return NextResponse.json({ status: "DISCONNECTED", qr: null })
  }
}
