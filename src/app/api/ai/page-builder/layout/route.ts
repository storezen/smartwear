import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt, currentOrder } = await req.json()
    
    if (!prompt || !currentOrder) {
      return NextResponse.json({ error: "Missing prompt or currentOrder" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
    }

    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    const systemPrompt = `You are a Conversion Rate Optimization (CRO) and Web Design Expert.
A user will provide a marketing goal, and a list of available website sections.
Reorder the sections to best achieve the goal.
Available sections: ${currentOrder.join(", ")}
The output MUST be a JSON array of strings containing EXACTLY these section names, just reordered.
Output strictly JSON without markdown wrappers.`

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
          { role: "user", content: `Goal: ${prompt}` }
        ],
        temperature: 0.5
      })
    })

    if (!response.ok) {
      throw new Error(`AI API Error: ${await response.text()}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content.trim()

    // Strip markdown
    content = content.replace(/```json/g, "").replace(/```/g, "").trim()

    const newOrder = JSON.parse(content)

    return NextResponse.json({ order: newOrder })

  } catch (err: any) {
    console.error("Layout API error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
