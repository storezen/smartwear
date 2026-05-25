import { prisma } from "@/lib/db/prisma"
import { queueWhatsAppMessage } from "@/lib/db/message-queue"

export const automationService = {
  async processAbandonedCarts() {
    // Find sessions that have been stuck at Checkout_Initiated for > 20 mins
    // but < 24 hours (so we don't spam ancient sessions)
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const abandonedSessions = await prisma.liveSession.findMany({
      where: {
        currentStep: "Checkout_Initiated",
        lastPingAt: {
          lte: twentyMinsAgo,
          gte: oneDayAgo
        },
        phone: { not: null } // We need a phone number to send WhatsApp
      }
    })

    const processed = []

    for (const session of abandonedSessions) {
      if (!session.phone) continue

      // Check if there is already an order associated with this phone recently
      // to avoid sending false abandoned cart messages if they used a different session ID
      const recentOrder = await prisma.order.findFirst({
        where: {
          phone: session.phone,
          createdAt: {
            gte: session.createdAt
          }
        }
      })

      if (recentOrder) {
        // They actually completed the purchase, update session
        await prisma.liveSession.update({
          where: { id: session.id },
          data: { currentStep: "Purchase_Complete" }
        })
        continue
      }

      // Ensure we haven't already queued an abandoned cart message for this session
      // We can check MessageQueue or MessageLog
      const existingMessage = await prisma.messageQueue.findFirst({
        where: {
          recipient: session.phone,
          messageType: "abandoned_cart"
        }
      })

      if (existingMessage) continue

      // Extract product info
      let productName = "your items"
      if (session.cartData) {
        try {
          const parsed = JSON.parse(session.cartData)
          if (parsed.state && parsed.state.items && parsed.state.items.length > 0) {
            productName = parsed.state.items[0].product.name
            if (parsed.state.items.length > 1) {
              productName += ` and ${parsed.state.items.length - 1} other item(s)`
            }
          }
        } catch (e) {}
      }

      const domain = process.env.NEXT_PUBLIC_APP_URL || "https://your-store.com"
      const checkoutUrl = `${domain}/checkout?recover=${session.id}`

      const templatePayload = {
        to: session.phone,
        type: "template",
        template: {
          name: "abandoned_cart_recovery",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: session.customerName || "there" },
                { type: "text", text: productName }
              ]
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                { type: "text", text: checkoutUrl }
              ]
            }
          ]
        }
      }

      await queueWhatsAppMessage(session.phone, "abandoned_cart", templatePayload)
      processed.push(session.id)
    }

    return processed
  }
}
