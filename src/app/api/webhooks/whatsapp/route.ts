import { NextResponse } from "next/server"

// Required for Meta/WhatsApp Webhook Verification
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const mode = searchParams.get("hub.mode")
    const token = searchParams.get("hub.verify_token")
    const challenge = searchParams.get("hub.challenge")

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN

    if (mode === "subscribe" && token === verifyToken) {
      console.log("WhatsApp Webhook Verified!")
      return new NextResponse(challenge, { status: 200 })
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// Receive Incoming Messages — now connected to AI Bot
export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Must respond to Meta within 3 seconds
    const entry = body?.entry?.[0]
    const change = entry?.changes?.[0]?.value
    const messages = change?.messages

    // Only process actual incoming messages (ignore status updates)
    if (!messages || messages.length === 0) {
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const incomingMsg = messages[0]

    // Only handle text messages for now
    if (incomingMsg.type !== "text" || !incomingMsg.text?.body) {
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const from = incomingMsg.from       // e.g. "923001234567"
    const messageBody = incomingMsg.text.body

    console.log(`[WhatsApp] Incoming from ${from}: "${messageBody}"`)

    // 1. Call the AI bot handler to get a reply
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const botRes = await fetch(`${siteUrl}/api/whatsapp/bot/on-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${from}@c.us`, body: messageBody }),
    })

    if (!botRes.ok) {
      console.error("[WhatsApp] Bot handler failed:", await botRes.text())
      return NextResponse.json({ status: "ok" }, { status: 200 })
    }

    const { reply } = await botRes.json()

    // 2. Send AI reply back to the customer via WhatsApp Cloud API
    if (reply) {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

      if (accessToken && phoneNumberId) {
        await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: from,
              type: "text",
              text: { body: reply },
            }),
          }
        )
        console.log(`[WhatsApp] AI reply sent to ${from}`)
      } else {
        console.warn("[WhatsApp] Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID — reply not sent")
      }
    }

    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (err) {
    console.error("[WhatsApp Webhook] Error:", err)
    // Always return 200 to Meta — prevents retry storms
    return NextResponse.json({ status: "ok" }, { status: 200 })
  }
}
