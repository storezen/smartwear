import { NextResponse } from "next/server"
import { verifyPostExSignature } from "@/lib/integrations/postex"
import { prisma } from "@/lib/db/prisma"
import { queueWhatsAppMessage } from "@/lib/db/message-queue"
import { financialService } from "@/services/financialService"

export async function POST(req: Request) {
  try {
    const payloadText = await req.text()
    const signature = req.headers.get("x-postex-signature")
    const secret = process.env.POSTEX_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 401 })
    }

    const isValid = await verifyPostExSignature(payloadText, signature, secret)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
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

    // Update order status in DB
    const history = JSON.parse(order.statusHistory as string || "[]")
    history.push({ status, timestamp: new Date().toISOString(), location: payload.location, description: payload.description })
    
    await prisma.order.update({
      where: { id: orderId },
      data: { status, statusHistory: JSON.stringify(history) }
    })

    // Prepare WhatsApp Message payload
    let messageType = ""
    let templatePayload: any = null

    // Domain root for tracking link
    const domain = process.env.NEXT_PUBLIC_APP_URL || "https://your-store.com"
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

    if (templatePayload) {
      await queueWhatsAppMessage(order.phone, messageType, templatePayload, order.id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("PostEx Webhook Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
