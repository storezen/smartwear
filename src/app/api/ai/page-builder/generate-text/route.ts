import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, tone, originalText } = await req.json()
    
    if (!prompt && !originalText) {
      return NextResponse.json({ error: "Missing prompt or original text" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
    }

    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    let systemPrompt = "You are an expert e-commerce copywriter. Keep responses short, catchy, and directly output the requested text without quotes or markdown."
    let userPrompt = prompt

    if (originalText && tone) {
      systemPrompt = `You are an expert copywriter. Rewrite the following text in a "${tone}" tone. Output ONLY the raw rewritten text.`
      userPrompt = `Original text: ${originalText}`
    } else if (prompt) {
      userPrompt = `Generate a short text for a website section. Request: ${prompt}`
    }

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`AI API Error: ${await response.text()}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content.trim()

    // Clean up quotes if AI wrapped them
    if (content.startsWith('"') && content.endsWith('"')) {
      content = content.substring(1, content.length - 1)
    }

    return NextResponse.json({ text: content })

  } catch (err: any) {
    console.error("Generate text error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
