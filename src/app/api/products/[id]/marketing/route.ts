import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    
    // 1. Fetch Product
    const product = await prisma.product.findUnique({
      where: { id }
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // 2. Fetch AI from Opencode Zen
    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"
    
    if (!apiKey) {
      return NextResponse.json({ error: "AI API key not configured" }, { status: 500 })
    }

    const prompt = `
    You are an expert Social Media Marketer and Copywriter for a smartwatch e-commerce store.
    Write an engaging, exciting, and persuasive WhatsApp broadcast/marketing message for the following product:
    
    Product Name: "${product.name}"
    Category: "${product.category}"
    Price: Rs. ${product.price}
    Description: "${product.description || 'A premium smartwatch'}"
    
    The message should:
    - Include relevant emojis.
    - Highlight key features (like battery, health tracking, design).
    - Create a sense of urgency.
    - End with a call to action.
    - Be written in Roman Urdu mixed with English (e.g., "Bohat hi zabardast smartwatch!").
    - NOT contain any markdown formatting (like ** or \`\`\`), just plain text for WhatsApp.
    `

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    })

    if (!aiRes.ok) {
      console.error("AI API Error:", await aiRes.text())
      return NextResponse.json({ error: "Failed to connect to AI service" }, { status: 502 })
    }

    const aiJson = await aiRes.json()
    const aiText = aiJson.choices?.[0]?.message?.content?.trim()

    if (!aiText) {
      return NextResponse.json({ error: "AI returned empty response" }, { status: 500 })
    }

    return NextResponse.json({ success: true, marketingCopy: aiText })
    
  } catch (error) {
    console.error("AI Marketing Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
