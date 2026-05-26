import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { pageData } = await req.json()
    
    if (!pageData) {
      return NextResponse.json({ error: "Missing pageData" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
    }

    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    const systemPrompt = `You are an SEO Expert. Analyze the provided website page builder JSON data.
Identify SEO issues (e.g. missing keywords, poor headings, lack of descriptions) and provide 3-5 actionable recommendations to improve Google ranking.
Keep it concise and practical. Output only the advice in plain text.`

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(pageData) }
        ],
        temperature: 0.5
      })
    })

    if (!response.ok) {
      throw new Error(`AI API Error: ${await response.text()}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content.trim()

    return NextResponse.json({ advice: content })

  } catch (err: any) {
    console.error("SEO API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
