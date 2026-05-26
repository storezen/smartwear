import { NextResponse } from "next/server"
import { verifyPostExSignature } from "@/lib/integrations/postex"
import { SITE_URL } from "@/lib/constants"
import { prisma } from "@/lib/db/prisma"
import { queueWhatsAppMessage } from "@/lib/db/message-queue"
import { financialService } from "@/services/financialService"

export async function POST(req: Request) {
  try {
    const payloadText = await req.text()
    // PostEx lets you define a custom Header Key and Value. 
    // We will use 'x-postex-secret' as the key.
    const secretHeader = req.headers.get("x-postex-secret")
    const secret = process.env.POSTEX_WEBHOOK_SECRET

    if (!secretHeader || secretHeader !== secret) {
      return NextResponse.json({ error: "Invalid or missing secret header" }, { status: 403 })
    }

    const payload = JSON.parse(payloadText)
    const orderId = payload.order_id
    const status = payload.status // SHIPPED, OUT_FOR_DELIVERY, DELIVERED, FAILED, DELAYED

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const history = Array.isArray(order.statusHistory) ? order.statusHistory : []
    history.push({ status, timestamp: new Date().toISOString(), location: payload.location, description: payload.description })

    await prisma.order.update({
      where: { id: orderId },
      data: { status, statusHistory: history }
    })

    // Prepare WhatsApp Message payload
    let messageType = ""
    let templatePayload: any = null

    // Domain root for tracking link
    const domain = SITE_URL
    const trackingUrl = `${domain}/track?orderId=${order.id}&phone=${order.phone}`

    switch (status) {
      case "SHIPPED":
      case "DISPATCHED":
        messageType = "order_shipped"
        templatePayload = {
          to: order.phone,
          type: "template",
          template: {
            name: "order_shipped",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.customerName },
                  { type: "text", text: order.id },
                  { type: "text", text: payload.tracking_id },
                ]
              },
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [
                  { type: "text", text: trackingUrl }
                ]
              }
            ]
          }
        }
        break
      
      case "OUT_FOR_DELIVERY":
        messageType = "out_for_delivery"
        templatePayload = {
          to: order.phone,
          type: "template",
          template: {
            name: "out_for_delivery",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.customerName },
                  { type: "text", text: payload.location || "your local hub" },
                ]
              }
            ]
          }
        }
        break

      case "DELIVERED":
        // Trigger financial engine
        await financialService.calculateOrderProfit(order.id)
        
        messageType = "order_delivered"
        templatePayload = {
          to: order.phone,
          type: "template",
          template: {
            name: "order_delivered",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.customerName },
                ]
              },
              {
                type: "button",
                sub_type: "url",
                index: 0,
                parameters: [
                  { type: "text", text: `${domain}/reviews?orderId=${order.id}` }
                ]
              }
            ]
          }
        }
        break

      case "FAILED":
      case "RTO":
        // Trigger loss recovery logging
        await financialService.recordRtoLoss(order.id)
        
        messageType = "delivery_failed"
        templatePayload = {
          to: order.phone,
          type: "template",
          template: {
            name: "delivery_failed",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.customerName },
                  { type: "text", text: order.id },
                ]
              },
              {
                type: "button",
                sub_type: "quick_reply",
                index: 0,
                parameters: [
                  { type: "payload", payload: `RESCHEDULE_${order.id}` }
                ]
              }
            ]
          }
        }
        break
        
      case "DELAYED":
        messageType = "delivery_delayed"
        templatePayload = {
          to: order.phone,
          type: "template",
          template: {
            name: "delivery_delayed",
            language: { code: "en" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: order.customerName },
                  { type: "text", text: order.id },
                ]
              }
            ]
          }
        }
        break
    }

    // Check Auto-Tracking Switch before sending
    const autoTrackingSetting = await prisma.storeSetting.findUnique({
      where: { key: "WHATSAPP_AUTO_TRACKING" }
    })
    const isAutoTrackingEnabled = autoTrackingSetting?.value === "true"

    if (templatePayload && isAutoTrackingEnabled) {
      await queueWhatsAppMessage(order.phone, messageType, templatePayload, order.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PostEx Webhook Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
