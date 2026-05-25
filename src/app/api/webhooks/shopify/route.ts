import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/db/prisma"
import { WHATSAPP_BOT_URL } from "@/lib/constants"
import { parseWhatsAppTemplate, DEFAULT_WHATSAPP_NOTIFICATION_CONFIG } from "@/lib/integrations/whatsapp"
import type { WhatsAppNotificationConfig } from "@/lib/integrations/whatsapp"

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-shopify-hmac-sha256")
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET

    if (signature) {
      if (!secret) {
        console.warn("SHOPIFY_WEBHOOK_SECRET not configured")
        return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
      }
      const hash = crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("base64")

      if (signature !== hash) {
        console.warn("Shopify webhook signature verification failed!")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    } else {
      console.log("No Shopify signature header found, bypassing signature check (development mode).")
    }

    const orderData = JSON.parse(rawBody)

    // 2. Parse Shopify order data
    const id = String(orderData.id || orderData.order_number || Math.floor(Math.random() * 100000))
    const lineItem = orderData.line_items?.[0]
    const productId = String(lineItem?.product_id || "shopify-prod-1")
    const productName = lineItem?.title || "Premium Smartwatch"
    const productPrice = parseFloat(lineItem?.price || orderData.total_price || "0")
    const productImage = lineItem?.image || ""
    const quantity = lineItem?.quantity || 1
    const total = parseFloat(orderData.total_price || "0")
    
    const customerName = [
      orderData.customer?.first_name || orderData.shipping_address?.first_name || "",
      orderData.customer?.last_name || orderData.shipping_address?.last_name || ""
    ].join(" ").trim() || "Shopify Customer"

    const phone = orderData.customer?.phone || orderData.phone || orderData.shipping_address?.phone || ""
    const address = orderData.shipping_address?.address1 || orderData.shipping_address?.address2 || "No address"
    const city = orderData.shipping_address?.city || "Unknown City"
    const notes = orderData.note || ""

    const statusHistory = JSON.stringify([
      {
        status: "pending",
        timestamp: new Date().toISOString(),
        description: "Order synced from Shopify"
      }
    ])

    // 3. Save order to database (Upsert to avoid duplicates)
    const order = await prisma.order.upsert({
      where: { id },
      update: {
        total,
        customerName,
        phone,
        address,
        city,
        notes,
      },
      create: {
        id,
        productId,
        productName,
        productPrice,
        productImage,
        quantity,
        total,
        customerName,
        phone,
        address,
        city,
        notes,
        status: "pending",
        statusHistory,
      }
    })

    console.log(`Shopify Order #${id} successfully synced in database.`)

    // 4. Check Auto-Confirmation Switch
    const autoConfirmSetting = await prisma.storeSetting.findUnique({
      where: { key: "WHATSAPP_AUTO_CONFIRM" }
    })
    const isAutoConfirmEnabled = autoConfirmSetting?.value === "true"

    if (isAutoConfirmEnabled && phone) {
      // Fetch confirmation template
      const configSetting = await prisma.storeSetting.findUnique({ where: { key: "WHATSAPP_CONFIG" } })
      const config: WhatsAppNotificationConfig = configSetting?.value 
        ? JSON.parse(configSetting.value) 
        : DEFAULT_WHATSAPP_NOTIFICATION_CONFIG

      const messageBody = parseWhatsAppTemplate(config.orderPlaced.template, {
        name: customerName,
        order_id: id,
        total: `Rs. ${total.toLocaleString()}`
      })

      try {
        const botRes = await fetch(`${WHATSAPP_BOT_URL}/send-message`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: phone, message: messageBody })
        })

        if (!botRes.ok) {
          const errData = await botRes.json()
          throw new Error(errData.error || "Bot server responded with error")
        }

        // Log successful send
        await prisma.messageLog.create({
          data: {
            orderId: id,
            recipient: phone,
            messageType: "order_confirmation",
            status: "sent",
            responsePayload: messageBody
          }
        })
        console.log(`WhatsApp confirmation sent to ${phone} for Order #${id}.`)
      } catch (err: any) {
        console.error(`Failed to send WhatsApp confirmation via bot: ${err.message}`)
        
        // Log failure in MessageLog
        await prisma.messageLog.create({
          data: {
            orderId: id,
            recipient: phone,
            messageType: "order_confirmation",
            status: "failed",
            responsePayload: JSON.stringify({ error: err.message, message: messageBody })
          }
        })
      }
    }

    return NextResponse.json({ success: true, orderId: id })
  } catch (err: any) {
    console.error("Shopify Webhook Sync Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
