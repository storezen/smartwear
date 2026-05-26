import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    // 1. Fetch active products
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true, price: true, description: true, category: true }
    })

    if (products.length === 0) {
      return NextResponse.json({ productIds: [] })
    }

    // 2. Format products for AI context (minify to save tokens)
    const productCatalog = products.map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      category: p.category,
      desc: p.description?.substring(0, 150) // First 150 chars
    }))

    // 3. Call AI Model
    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 })
    }

    const prompt = `You are a smart product search engine for a Pakistani e-commerce smartwatch store.

User's search query: "${query}"

Product catalog (JSON):
${JSON.stringify(productCatalog)}

Instructions:
- Understand the user's INTENT, not just keywords.
- "sasti" or "cheap" or "kam daam" = low price products
- "mahenga" or "premium" = high price products
- "calling wali" = smartwatch with bluetooth calling feature
- "battery" = long battery life
- "under X" or "X se kam" = price below X
- "above X" or "X se zyada" = price above X
- If query is in Urdu/Roman Urdu, translate intent and match accordingly.
- Return ONLY a raw JSON array of matching product id strings.
- Example of valid response: ["abc123", "def456"]
- If nothing matches, return: []
- DO NOT include any explanation, markdown, or code blocks. ONLY the array.`

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: "You are a product search engine. Always respond with ONLY a raw JSON array of product ID strings. No markdown, no explanation, just the array." },
          { role: "user", content: prompt }
        ],
        temperature: 0.1 // Low temperature for consistent, deterministic results
      })
    })

    if (!aiRes.ok) {
      console.error("AI Search API Error:", await aiRes.text())
      return NextResponse.json({ error: "Failed to connect to AI service" }, { status: 502 })
    }

    const aiJson = await aiRes.json()
    let aiText = aiJson.choices?.[0]?.message?.content?.trim()
    
    if (!aiText) {
      return NextResponse.json({ productIds: [] })
    }

    // Clean up any accidental markdown code blocks
    aiText = aiText.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim()

    // Parse safely — handle array or object wrapping
    let matchedIds: string[] = []
    try {
      const parsed = JSON.parse(aiText)
      if (Array.isArray(parsed)) {
        matchedIds = parsed.filter((x: unknown) => typeof x === "string")
      } else if (parsed && typeof parsed === "object") {
        // AI wrapped it in an object — extract first array found
        const firstArray = Object.values(parsed).find((v) => Array.isArray(v))
        if (firstArray) {
          matchedIds = (firstArray as unknown[]).filter((x) => typeof x === "string") as string[]
        }
      }
    } catch (e) {
      console.error("Failed to parse AI search response:", aiText)
      // Last resort: regex extract cuid-like IDs from response
      const idMatches = aiText.match(/[a-z0-9]{20,30}/g)
      if (idMatches) matchedIds = idMatches
    }

    // Validate that returned IDs actually exist in our product list
    const validProductIds = new Set(products.map((p) => p.id))
    matchedIds = matchedIds.filter((id) => validProductIds.has(id))

    return NextResponse.json({ productIds: matchedIds })

  } catch (error) {
    console.error("Smart Search Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
