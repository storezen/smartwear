import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { productId, tone } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    // 1. Fetch product from DB
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        name: true,
        price: true,
        originalPrice: true,
        description: true,
        category: true,
        specs: true,
        tags: true,
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // 2. Build discount info if available
    const discountLine =
      product.originalPrice && product.originalPrice > product.price
        ? `Original price Rs. ${product.originalPrice}, now only Rs. ${product.price} (Save Rs. ${Math.round(product.originalPrice - product.price)}!)`
        : `Price: Rs. ${product.price}`

    // 3. Map tone to instruction
    const toneInstructions: Record<string, string> = {
      casual: "Write in a friendly, casual Roman Urdu tone. Use conversational language like 'yaar', 'bhai'. Add fun emojis.",
      urgent: "Write an URGENT sale message in Roman Urdu. Use urgency words like 'sirf aaj', 'stock khatam ho raha hai', 'jaldi karo'. Use fire and clock emojis 🔥⏰.",
      premium: "Write a premium, luxurious message in polished Roman Urdu mixed with English. Highlight exclusivity and quality. Use sophisticated emojis 👑✨.",
    }
    const selectedTone = toneInstructions[tone] || toneInstructions.casual

    // 4. Call AI
    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 })
    }

    const prompt = `You are an expert WhatsApp marketing copywriter for a Pakistani smartwatch e-commerce store called "Smartwear Store".

Product Details:
- Name: ${product.name}
- Category: ${product.category}
- ${discountLine}
- Description: ${product.description?.substring(0, 200)}
- Tags: ${Array.isArray(product.tags) ? (product.tags as string[]).join(", ") : ""}

Task: Write a single WhatsApp broadcast marketing message for this product.

Tone instructions: ${selectedTone}

Rules:
- Maximum 300 characters (WhatsApp message length)
- Include the price clearly
- Include a call to action (e.g., "Order karo: [store link]" or "Reply YES for details")
- Use emojis naturally
- NO markdown formatting (no **bold** or *italic*)
- Write in Roman Urdu primarily, simple English words are fine
- Return ONLY the message text, nothing else`

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a WhatsApp marketing expert. Return only the marketing message text with no extra commentary.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.8, // Higher creativity for marketing
        max_tokens: 300,
      }),
    })

    if (!aiRes.ok) {
      console.error("AI Marketing API Error:", await aiRes.text())
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const aiJson = await aiRes.json()
    const message = aiJson.choices?.[0]?.message?.content?.trim()

    if (!message) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 })
    }

    return NextResponse.json({
      message,
      productName: product.name,
      characterCount: message.length,
    })
  } catch (error) {
    console.error("Generate Marketing Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
