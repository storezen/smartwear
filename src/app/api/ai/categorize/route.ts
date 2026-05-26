import { NextResponse } from "next/server"

// AI-powered category detection for products that regex couldn't classify
export async function POST(req: Request) {
  try {
    const { products, availableCategories } = await req.json()
    // products: Array of { name: string, description: string, index: number }
    // availableCategories: string[] of existing category names

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "products array is required" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 })
    }

    // Build category options string
    const categoryList = (availableCategories as string[]).join(", ")

    const prompt = `You are a product categorization expert for a Pakistani smartwatch and electronics store.

Available categories: ${categoryList}
If none fit, suggest a NEW category name (2-3 words max, Title Case).

Classify each product below. Return ONLY a JSON array where each item has:
- "index": the product's index number
- "category": the best matching category name (from the list above, or a new one)

Products to classify:
${products.map((p: { index: number; name: string; description?: string }) =>
  `${p.index}. Name: "${p.name}"${p.description ? ` | Desc: "${p.description.substring(0, 100)}"` : ""}`
).join("\n")}

Return ONLY the JSON array, no explanation. Example:
[{"index": 0, "category": "Smart Watches"}, {"index": 1, "category": "Phone Cases"}]`

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
            content: "You are a product classifier. Return only valid JSON arrays. No markdown or explanation.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
      }),
    })

    if (!aiRes.ok) {
      console.error("AI Categorization Error:", await aiRes.text())
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const aiJson = await aiRes.json()
    let aiText = aiJson.choices?.[0]?.message?.content?.trim() ?? ""

    // Strip markdown if present
    aiText = aiText.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim()

    let results: { index: number; category: string }[] = []
    try {
      const parsed = JSON.parse(aiText)
      results = Array.isArray(parsed) ? parsed : []
    } catch {
      console.error("Failed to parse AI categorization:", aiText)
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("AI Categorize Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
