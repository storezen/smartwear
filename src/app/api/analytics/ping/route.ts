import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionId, source, currentStep, cartData, customerName, phone } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
    }

    // Upsert the session
    await prisma.liveSession.upsert({
      where: { id: sessionId },
      update: {
        currentStep,
        source: source || "organic",
        cartData: cartData ? JSON.stringify(cartData) : undefined,
        customerName,
        phone,
        lastPingAt: new Date()
      },
      create: {
        id: sessionId,
        currentStep,
        source: source || "organic",
        cartData: cartData ? JSON.stringify(cartData) : null,
        customerName,
        phone,
        lastPingAt: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Analytics Ping Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
