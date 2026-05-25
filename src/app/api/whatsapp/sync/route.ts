import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const [platformOrderCount, whatsappSentCount, realtimeLogs] = await Promise.all([
      // Count total orders in the store
      prisma.order.count(),
      
      // Count total successfully sent automated messages
      prisma.messageLog.count({
        where: {
          status: "sent",
          messageType: {
            in: ["order_confirmation", "order_shipped", "order_delivered", "abandoned_cart", "auto_reply"]
          }
        }
      }),

      // Fetch the latest 20 message logs (real-time logs)
      prisma.messageLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20
      })
    ])

    return NextResponse.json({
      platformOrderCount,
      whatsappSentCount,
      realtimeLogs
    })
  } catch (err: any) {
    console.error("Sync stats retrieval error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
