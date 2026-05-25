import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendTemplateMessage } from "@/lib/integrations/whatsapp"
import { logMessage } from "@/lib/db/message-queue"

const RETRY_BACKOFFS = [
  5 * 60 * 1000,   // 5 minutes
  15 * 60 * 1000,  // 15 minutes
  60 * 60 * 1000   // 1 hour
]

export async function GET(req: Request) {
  try {
    // Optional: Protect cron route using a secret header
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pendingMessages = await prisma.messageQueue.findMany({
      where: {
        status: "pending",
        nextRetryAt: {
          lte: new Date()
        }
      },
      take: 50 // Process in batches
    })

    if (pendingMessages.length === 0) {
      return NextResponse.json({ message: "No pending messages" })
    }

    const tokenSetting = await prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_ACCESS_TOKEN" } })
    const idSetting = await prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_PHONE_NUMBER_ID" } })
    
    const accessToken = tokenSetting?.value || process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = idSetting?.value || process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "WhatsApp credentials not configured" }, { status: 500 })
    }

    for (const msg of pendingMessages) {
      try {
        const payload = JSON.parse(msg.payload)
        
        const result = await sendTemplateMessage(payload, { accessToken, phoneNumberId })

        // Success
        await prisma.messageQueue.update({
          where: { id: msg.id },
          data: { status: "completed", updatedAt: new Date() }
        })

        await logMessage(msg.recipient, msg.messageType, "sent", result, msg.orderId || undefined)

      } catch (err: any) {
        console.error(`Failed to send message ${msg.id}:`, err)
        
        const newRetryCount = msg.retryCount + 1
        
        if (newRetryCount <= RETRY_BACKOFFS.length) {
          // Schedule next retry
          const backoff = RETRY_BACKOFFS[newRetryCount - 1]
          await prisma.messageQueue.update({
            where: { id: msg.id },
            data: {
              retryCount: newRetryCount,
              nextRetryAt: new Date(Date.now() + backoff),
              updatedAt: new Date()
            }
          })
        } else {
          // Max retries reached, mark as failed
          await prisma.messageQueue.update({
            where: { id: msg.id },
            data: { status: "failed", updatedAt: new Date() }
        })
          
          await logMessage(
            msg.recipient, 
            msg.messageType, 
            "failed", 
            { error: err.message }, 
            msg.orderId || undefined
          )
        }
      }
    }

    return NextResponse.json({ processed: pendingMessages.length })

  } catch (err) {
    console.error("Cron Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
