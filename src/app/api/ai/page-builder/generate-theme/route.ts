import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()
    
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API Key not configured" }, { status: 500 })
    }

    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    const model = process.env.AI_MODEL || "deepseek-v4-flash-free"

    const systemPrompt = `You are an expert UI/UX designer. Given a prompt, generate a beautiful, harmonious 10-color hex code palette.
The output MUST be a valid JSON object matching this exact structure:
{
  "primary": "#hex",
  "accent": "#hex",
  "background": "#hex",
  "foreground": "#hex",
  "card": "#hex",
  "muted": "#hex",
  "border": "#hex",
  "success": "#hex",
  "warning": "#hex",
  "destructive": "#hex"
}
Ensure there is high contrast between background/card and foreground/text.
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
          { role: "user", content: `Theme request: ${prompt}` }
        ],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`AI API Error: ${await response.text()}`)
    }

    const data = await response.json()
    let content = data.choices[0].message.content.trim()

    // Strip markdown if AI ignored instructions
    content = content.replace(/```json/g, "").replace(/```/g, "").trim()

    const theme = JSON.parse(content)

    return NextResponse.json({ theme })

  } catch (err: any) {
    console.error("Generate theme error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
