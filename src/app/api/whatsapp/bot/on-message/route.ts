import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { from, body } = await req.json()

    if (!from || !body) {
      return NextResponse.json({ error: "from and body are required" }, { status: 400 })
    }

    // Format phone number to clean format
    const cleanPhone = from.replace("@c.us", "")

    // 1. Log the incoming message in database
    await prisma.messageLog.create({
      data: {
        recipient: cleanPhone,
        messageType: "incoming",
        status: "received",
        responsePayload: body,
      },
    })

    let replyText: string | null = null
    let replySource: "KEYWORD" | "AI" = "KEYWORD"

    // 2. Fetch keyword responders from database settings
    const keywordsSetting = await prisma.storeSetting.findUnique({
      where: { key: "WHATSAPP_BOT_KEYWORDS" },
    })

    if (keywordsSetting?.value) {
      try {
        const keywordResponders: { keyword: string; reply: string }[] = JSON.parse(keywordsSetting.value)
        const lowerBody = body.toLowerCase().trim()

        // Find matching keyword responder
        const match = keywordResponders.find(kr => 
          lowerBody.includes(kr.keyword.toLowerCase().trim())
        )

        if (match) {
          replyText = match.reply
          replySource = "KEYWORD"
        }
      } catch (err) {
        console.error("Error parsing keyword responders:", err)
      }
    }

    // 3. If no keyword matched, use AI to generate a reply
    if (!replyText) {
      try {
        const apiKey = process.env.OPENCODE_API_KEY
        const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
        const model = process.env.AI_MODEL || "deepseek-v4-flash-free"
        
        if (apiKey) {
          // Fetch last 5 messages for context (including the one just saved)
          const historyLogs = await prisma.messageLog.findMany({
            where: { recipient: cleanPhone },
            orderBy: { createdAt: 'desc' },
            take: 6 
          })

          historyLogs.reverse() // chronological order
          
          const messages: {role: string, content: string}[] = []
          
          // Fetch up to 15 active products for context
          const products = await prisma.product.findMany({
            where: { status: "ACTIVE" },
            select: { name: true, price: true, category: true },
            take: 15
          })
          
          let productContext = "Available Products in Store:\n"
          if (products.length === 0) productContext += "Currently out of stock.\n"
          products.forEach(p => {
             productContext += `- ${p.name} (${p.category}) - Rs. ${p.price}\n`
          })

          // Fetch customer's recent orders for tracking context
          const recentOrders = await prisma.order.findMany({
            where: { 
              OR: [
                { phone: cleanPhone },
                { phone: cleanPhone.replace(/^92/, '0') },
                { phone: `+${cleanPhone}` }
              ]
            },
            orderBy: { createdAt: 'desc' },
            take: 3
          })
          
          let orderContext = ""
          if (recentOrders.length > 0) {
            orderContext = "\nCustomer's Recent Orders:\n"
            recentOrders.forEach(o => {
              orderContext += `- Order ID: ${o.id} | Item: ${o.productName} | Status: ${o.status.toUpperCase()} | Total: Rs. ${o.total}\n`
            })
            orderContext += "If the customer asks 'where is my order' or about order tracking, use the info above to answer them specifically and accurately.\n"
          }

          messages.push({
            role: "system",
            content: `You are a helpful, friendly, and professional WhatsApp customer support agent for "Smartwear Store".
Your goal is to assist customers with product inquiries, recommendations, order tracking, and basic questions.
Be concise, as this is a WhatsApp conversation.
Reply in Roman Urdu mixed with simple English by default, unless the user specifically speaks pure English.
Use emojis where appropriate. Do not use complex markdown (like **bold** or bullet points), just basic plain text spacing.
If the user asks for products, recommend from the available list below.
If a user asks a question you don't know, politely say you don't have that information right now and a human agent will contact them.

${productContext}
${orderContext}`
          })
          
          // Inject history
          for (const log of historyLogs) {
             if (log.messageType === "incoming") {
               messages.push({ role: "user", content: log.responsePayload || "" })
             } else {
               messages.push({ role: "assistant", content: log.responsePayload || "" })
             }
          }
          
          const aiRes = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: model,
              messages: messages
            })
          })

          if (aiRes.ok) {
            const aiJson = await aiRes.json()
            const aiText = aiJson.choices?.[0]?.message?.content?.trim()
            if (aiText) {
              replyText = aiText
              replySource = "AI"
            }
          } else {
            console.error("AI API Error in Bot:", await aiRes.text())
          }
        }
      } catch (e) {
        console.error("AI Bot integration error:", e)
      }
    }

    // 4. Log the outgoing auto-reply in database and send response
    if (replyText) {
      await prisma.messageLog.create({
        data: {
          recipient: cleanPhone,
          messageType: "auto_reply",
          status: "sent",
          responsePayload: replyText,
        },
      })
    }

    return NextResponse.json({ reply: replyText })
  } catch (err: any) {
    console.error("Webhook on-message error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
