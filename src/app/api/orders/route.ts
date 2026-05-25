import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { sendTextMessage, parseWhatsAppTemplate, DEFAULT_WHATSAPP_NOTIFICATION_CONFIG } from "@/lib/integrations/whatsapp"
import type { WhatsAppNotificationConfig } from "@/lib/integrations/whatsapp"

export async function GET() {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const order = await prisma.order.create({ data })
    
    // Asynchronous WhatsApp Notification Engine
    ;(async () => {
      try {
        const [tokenSetting, idSetting, configSetting] = await Promise.all([
          prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_ACCESS_TOKEN" } }),
          prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_PHONE_NUMBER_ID" } }),
          prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_CONFIG" } })
        ])

        const accessToken = tokenSetting?.value || process.env.WHATSAPP_ACCESS_TOKEN
        const phoneNumberId = idSetting?.value || process.env.WHATSAPP_PHONE_NUMBER_ID

        if (accessToken && phoneNumberId && order.phone) {
          const config: WhatsAppNotificationConfig = configSetting?.value 
            ? JSON.parse(configSetting.value) 
            : DEFAULT_WHATSAPP_NOTIFICATION_CONFIG

          if (config.orderPlaced.enabled) {
            const messageBody = parseWhatsAppTemplate(config.orderPlaced.template, {
              name: order.customerName,
              order_id: order.id,
              total: `Rs. ${order.total.toLocaleString()}`
            })
            await sendTextMessage(
              { to: order.phone, type: "text", text: { body: messageBody } },
              { accessToken, phoneNumberId }
            )
          }
        }
      } catch (err) {
        console.error("Failed to send automated WhatsApp message:", err)
      }
    })()

    return NextResponse.json(order, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

// BULK operations: PATCH /api/orders
export async function PATCH(req: Request) {
  try {
    const { orderIds, action, newStatus } = await req.json()

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 })
    }

    if (action === "bulk_status" && newStatus) {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: newStatus, updatedAt: new Date() }
      })
      return NextResponse.json({ success: true, updated: orderIds.length })
    }

    if (action === "bulk_delete") {
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
      return NextResponse.json({ success: true, deleted: orderIds.length })
    }

    if (action === "postex_push") {
      // Push orders to PostEx in batch
      const apiKeySetting = await prisma.storeSetting.findUnique({ where: { key: "POSTEX_API_KEY" } })
      const apiKey = apiKeySetting?.value || process.env.POSTEX_API_KEY

      if (!apiKey) {
        return NextResponse.json({ error: "PostEx API key not configured" }, { status: 400 })
      }

      const orders = await prisma.order.findMany({ where: { id: { in: orderIds } } })
      const results = []

      for (const order of orders) {
        try {
          const res = await fetch("https://api.postex.pk/services/integration/api/order/v3/create-order", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "token": apiKey
            },
            body: JSON.stringify({
              orderRefNumber: order.id,
              orderTypeName: "Normal",
              paymentTypeName: "COD",
              cityName: order.city,
              customerName: order.customerName,
              customerPhone: order.phone,
              deliveryAddress: order.address,
              items: order.productName,
              totalAmount: order.total.toString(),
              orderWeight: "0.5"
            })
          })
          const data = await res.json()
          if (data.statusCode === "200") {
            // Save tracking ID to the order
            await prisma.order.update({
              where: { id: order.id },
              data: { status: "processing" }
            })
            results.push({ orderId: order.id, success: true, trackingId: data.dist?.trackingNumber })
          } else {
            results.push({ orderId: order.id, success: false, error: data.statusMessage })
          }
        } catch (err: any) {
          results.push({ orderId: order.id, success: false, error: err.message })
        }
      }

      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (err) {
    console.error("Bulk order action error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
