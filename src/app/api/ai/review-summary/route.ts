import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { productId } = await req.json()

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    // Fetch product name + all its reviews
    const [product, reviews] = await Promise.all([
      prisma.product.findUnique({ where: { id: productId }, select: { name: true } }),
      prisma.review.findMany({ where: { productId }, orderBy: { createdAt: "desc" } }),
    ])

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (reviews.length === 0) {
      return NextResponse.json({ error: "Is product ka koi review nahi hai abhi" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    if (!apiKey) {
      return NextResponse.json({ error: "AI not configured" }, { status: 500 })
    }

    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    const reviewsText = reviews
      .map((r) => `Rating: ${r.rating}/5 — "${r.comment}"`)
      .join("\n")

    const prompt = `You are a product review analyst for a Pakistani e-commerce store.

Product: "${product.name}"
Total Reviews: ${reviews.length}
Average Rating: ${avgRating.toFixed(1)}/5

Customer Reviews:
${reviewsText}

Analyze these reviews and return a JSON object with these exact keys:
{
  "summary": "2-3 sentence overall summary in English",
  "sentiment": "positive" | "mixed" | "negative",
  "positives": ["top 3 things customers liked, short phrases"],
  "negatives": ["top 3 complaints or issues, short phrases"],
  "recommendation": "One actionable suggestion for the store owner in English"
}

Return ONLY the JSON object, no markdown, no explanation.`

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
            content: "You are a review analyst. Return only valid JSON objects, no markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
      }),
    })

    if (!aiRes.ok) {
      console.error("AI Review Summary Error:", await aiRes.text())
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const aiJson = await aiRes.json()
    let aiText = aiJson.choices?.[0]?.message?.content?.trim() ?? ""
    aiText = aiText.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim()

    let analysis = {
      summary: "Reviews ka analysis available nahi hai.",
      sentiment: "mixed" as "positive" | "mixed" | "negative",
      positives: [] as string[],
      negatives: [] as string[],
      recommendation: "",
    }

    try {
      const parsed = JSON.parse(aiText)
      analysis = { ...analysis, ...parsed }
    } catch {
      console.error("Failed to parse AI review summary:", aiText)
    }

    return NextResponse.json({
      productName: product.name,
      totalReviews: reviews.length,
      avgRating: Math.round(avgRating * 10) / 10,
      ...analysis,
    })
  } catch (error) {
    console.error("AI Review Summary Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
