import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findMany({
      where: {
        key: {
          in: ["WHATSAPP_AUTO_CONFIRM", "WHATSAPP_AUTO_TRACKING", "WHATSAPP_BOT_KEYWORDS"]
        }
      }
    })

    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value
      return acc;
    }, {} as Record<string, string>)

    return NextResponse.json({
      autoConfirm: settingsMap["WHATSAPP_AUTO_CONFIRM"] === "true",
      autoTracking: settingsMap["WHATSAPP_AUTO_TRACKING"] === "true",
      keywords: settingsMap["WHATSAPP_BOT_KEYWORDS"] ? JSON.parse(settingsMap["WHATSAPP_BOT_KEYWORDS"]) : []
    })
  } catch (err: any) {
    console.error("Failed to fetch WhatsApp automation settings:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { autoConfirm, autoTracking, keywords } = await req.json()

    if (typeof autoConfirm !== "boolean" || typeof autoTracking !== "boolean" || !Array.isArray(keywords)) {
      return NextResponse.json({ error: "Invalid payload parameters" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.storeSetting.upsert({
        where: { key: "WHATSAPP_AUTO_CONFIRM" },
        update: { value: String(autoConfirm) },
        create: { key: "WHATSAPP_AUTO_CONFIRM", value: String(autoConfirm) }
      }),
      prisma.storeSetting.upsert({
        where: { key: "WHATSAPP_AUTO_TRACKING" },
        update: { value: String(autoTracking) },
        create: { key: "WHATSAPP_AUTO_TRACKING", value: String(autoTracking) }
      }),
      prisma.storeSetting.upsert({
        where: { key: "WHATSAPP_BOT_KEYWORDS" },
        update: { value: JSON.stringify(keywords) },
        create: { key: "WHATSAPP_BOT_KEYWORDS", value: JSON.stringify(keywords) }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Failed to update WhatsApp automation settings:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
