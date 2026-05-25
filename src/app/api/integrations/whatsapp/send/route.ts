import { NextRequest, NextResponse } from "next/server"
import { sendTextMessage } from "@/lib/integrations/whatsapp"

interface SendRequest {
  to: string
  message: string
}

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/

export async function POST(req: NextRequest) {
  try {
    const body: SendRequest = await req.json()
    const { to, message } = body

    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 })
    }

    if (!PHONE_REGEX.test(to)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
    }

    if (message.length > 4096) {
      return NextResponse.json({ error: "Message exceeds 4096 character limit" }, { status: 400 })
    }

    let accessToken = process.env.WHATSAPP_ACCESS_TOKEN
    let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    // Fallback to database settings
    if (!accessToken || !phoneNumberId) {
      const { prisma } = await import("@/lib/db/prisma")
      const [tokenSetting, idSetting] = await Promise.all([
        prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_ACCESS_TOKEN" } }),
        prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_PHONE_NUMBER_ID" } }),
      ])
      if (tokenSetting?.value) accessToken = tokenSetting.value
      if (idSetting?.value) phoneNumberId = idSetting.value
    }

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "WhatsApp API not configured" }, { status: 400 })
    }

    const result = await sendTextMessage(
      { to, type: "text", text: { body: message } },
      { accessToken, phoneNumberId }
    )

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("WhatsApp send error:", error)
    const msg = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
