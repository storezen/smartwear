import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { WHATSAPP_BOT_URL } from "@/lib/constants"
import { sendTextMessage, parseWhatsAppTemplate, DEFAULT_WHATSAPP_NOTIFICATION_CONFIG } from "@/lib/integrations/whatsapp"
import type { WhatsAppNotificationConfig } from "@/lib/integrations/whatsapp"

const ALLOWED_ORDER_FIELDS = [
  "productId", "productName", "productPrice", "productImage",
  "quantity", "total", "customerName", "phone", "address", "city", "notes",
] as const

function pickOrderFields(data: Record<string, unknown>) {
  const picked: Record<string, unknown> = {}
  for (const key of ALLOWED_ORDER_FIELDS) {
    if (key in data) picked[key] = data[key]
  }
  return picked
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")))
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.order.count(),
    ])
    return NextResponse.json({ orders, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

async function sendWhatsAppNotification(order: { id: string; phone: string; customerName: string; total: number }) {
  try {
    const [autoConfirmSetting, tokenSetting, idSetting, configSetting] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_AUTO_CONFIRM" } }),
      prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_ACCESS_TOKEN" } }),
      prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_PHONE_NUMBER_ID" } }),
      prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_CONFIG" } })
    ])

    const isAutoConfirmEnabled = autoConfirmSetting?.value === "true"
    const accessToken = tokenSetting?.value || process.env.WHATSAPP_ACCESS_TOKEN
    const phoneNumberId = idSetting?.value || process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!isAutoConfirmEnabled || !order.phone) return

    const config: WhatsAppNotificationConfig = configSetting?.value 
      ? JSON.parse(configSetting.value) 
      : DEFAULT_WHATSAPP_NOTIFICATION_CONFIG

    if (!config.orderPlaced.enabled) return

    const messageBody = parseWhatsAppTemplate(config.orderPlaced.template, {
      name: order.customerName,
      order_id: order.id,
      total: `Rs. ${order.total.toLocaleString()}`
    })

    let sentSuccess = false

    try {
      const botUrl = `${WHATSAPP_BOT_URL}/send-message`
      const botRes = await fetch(botUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: order.phone, message: messageBody }),
        signal: AbortSignal.timeout(3000)
      })

      if (botRes.ok) {
        sentSuccess = true
        await prisma.messageLog.create({
          data: {
            orderId: order.id,
            recipient: order.phone,
            messageType: "order_confirmation",
            status: "sent",
            responsePayload: messageBody
          }
        })
        console.log(`WhatsApp confirmation sent via bot for order #${order.id}`)
      }
    } catch {
      console.warn("Local WhatsApp Bot offline/failed, falling back to Meta Cloud API...")
    }

    if (!sentSuccess && accessToken && phoneNumberId) {
      try {
        await sendTextMessage(
          { to: order.phone, type: "text", text: { body: messageBody } },
          { accessToken, phoneNumberId }
        )
        await prisma.messageLog.create({
          data: {
            orderId: order.id,
            recipient: order.phone,
            messageType: "order_confirmation",
            status: "sent",
            responsePayload: messageBody
          }
        })
        console.log(`WhatsApp confirmation sent via Meta Cloud API for order #${order.id}`)
      } catch (metaErr: unknown) {
        const metaMsg = metaErr instanceof Error ? metaErr.message : String(metaErr)
        console.error("Meta Cloud API also failed:", metaMsg)
        await prisma.messageLog.create({
          data: {
            orderId: order.id,
            recipient: order.phone,
            messageType: "order_confirmation",
            status: "failed",
            responsePayload: JSON.stringify({ error: metaMsg, message: messageBody })
          }
        })
      }
    }
  } catch (err) {
    console.error("Failed to send automated WhatsApp message:", err)
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const productId = data.productId as string | undefined
    const quantity = (data.quantity as number) || 1

    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } })
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }
      if (product.quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock. Only ${product.quantity} left.` },
          { status: 409 }
        )
      }
      await prisma.product.update({
        where: { id: productId },
        data: { quantity: { decrement: quantity } },
      })
    }

    const order = await prisma.order.create({ data: pickOrderFields(data) as any })

    sendWhatsAppNotification(order)

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
          const postexUrl = process.env.POSTEX_API_URL || "https://api.postex.pk/services/integration/api/order/v3/create-order"
          const res = await fetch(postexUrl, {
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
        } catch (err: unknown) {
          results.push({ orderId: order.id, success: false, error: err instanceof Error ? err.message : String(err) })
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
