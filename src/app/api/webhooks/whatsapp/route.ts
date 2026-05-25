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

// Receive Incoming Messages/Status Updates
export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Incoming WhatsApp Webhook Payload:", JSON.stringify(body, null, 2))

    // Just acknowledge receipt to Meta within 3 seconds
    // You can process `body.entry[0].changes[0].value.messages` here
    
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
