import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { from, body } = await req.json()

    if (!from || !body) {
      return NextResponse.json({ error: "from and body are required" }, { status: 400 })
    }

    // Format phone number to clean format
    const cleanPhone = from.replace("@c.us", "")

    // 1. Log the incoming message in database
    await prisma.messageLog.create({
      data: {
        recipient: cleanPhone,
        messageType: "incoming",
        status: "received",
        responsePayload: body,
      },
    })

    // 2. Fetch keyword responders from database settings
    const keywordsSetting = await prisma.storeSetting.findUnique({
      where: { key: "WHATSAPP_BOT_KEYWORDS" },
    })

    let replyText: string | null = null

    if (keywordsSetting?.value) {
      try {
        const keywordResponders: { keyword: string; reply: string }[] = JSON.parse(keywordsSetting.value)
        const lowerBody = body.toLowerCase().trim()

        // Find matching keyword responder
        const match = keywordResponders.find(kr => 
          lowerBody.includes(kr.keyword.toLowerCase().trim())
        )

        if (match) {
          replyText = match.reply
          
          // Log the outgoing auto-reply in database
          await prisma.messageLog.create({
            data: {
              recipient: cleanPhone,
              messageType: "auto_reply",
              status: "sent",
              responsePayload: replyText,
            },
          })
        }
      } catch (err) {
        console.error("Error parsing keyword responders:", err)
      }
    }

    return NextResponse.json({ reply: replyText })
  } catch (err: any) {
    console.error("Webhook on-message error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
