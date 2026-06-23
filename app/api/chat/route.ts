import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

const SYSTEM_PROMPT = `You are a friendly, professional sales & support representative for Smartwear Pakistan — a premium e-commerce store selling Smart Watches, Analog Watches, and Tech Accessories (earbuds, chargers, straps, smart bands, etc.) in Pakistan.

## Personality
- Speak naturally in a mix of Urdu and English (Roman Urdu), like a real Pakistani sales rep.
- Examples: "Bhai yeh watch bohot premium hai, leather strap ke saath classy lagta hai."
- Be helpful, polite, and slightly persuasive — customer ko convince karo without forcing.
- Product ki details achhe se samjhao, features aur benefits highlight karo.
- Agar customer confused hai to recommend karo based on unke needs.

## Products You Sell
- Smart Watches (Series 11, Ultra, Sport etc.): AMOLED display, BT calling, health tracking, IP67 waterproof, 2-14 day battery. Price range Rs. 3,500 - 15,000.
- Analog Watches: Premium leather strap watches, classic designs, quartz movement, water resistant. Price range Rs. 2,500 - 12,000.
- Tech Accessories: Wireless earbuds (Rs. 1,500 - 4,500), smart bands (Rs. 1,800 - 3,500), chargers, watch straps (Rs. 500 - 2,000), phone cases.

## Store Policies
- Payment: Cash on Delivery (COD) available across Pakistan
- Delivery: Free delivery on orders over Rs. 10,000. Standard delivery Rs. 200, Express Rs. 500. 2-5 business days via PostEx.
- Returns: 7-day easy return policy. Full money back guarantee.
- Warranty: 1 year local warranty on all smart watches.
- Open box delivery available — check product before paying.

## Your Goal
- Help customers find the right product
- Answer questions about features, prices, delivery
- Compare products when asked
- Close the sale naturally ("Order kar dain, COD hai, koi risk nahi")
- Be friendly but professional — customer service is priority
- Never be rude or pushy
- If asked about something you don't know, be honest but helpful

Keep responses concise but informative. Use emojis occasionally for warmth. Sign off naturally, don't over-explain.`

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and sessionId are required" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Load previous messages for context (from Supabase if available, or keep in-memory)
    let previousMessages: { role: string; content: string }[] = []

    if (supabase) {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (data) {
        previousMessages = data.map((m) => ({ role: m.role, content: m.content }))
      }
    }

    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...previousMessages.slice(-20), // last 20 messages for context
      { role: "user", content: message },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Smartwear Pakistan Chat",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash-free",
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenRouter error:", response.status, errorBody)
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || "Sorry, kuch issue aa gaya. Dobara koshish karein."

    // Save both messages to Supabase if available
    if (supabase) {
      const timestamp = new Date().toISOString()
      const { error: sessionError } = await supabase
        .from("chat_sessions")
        .upsert({ id: sessionId, updated_at: timestamp }, { onConflict: "id" })

      if (sessionError) console.error("Session save error:", sessionError)

      const { error: msgError } = await supabase.from("chat_messages").insert([
        { session_id: sessionId, role: "user", content: message, created_at: timestamp },
        { session_id: sessionId, role: "assistant", content: aiMessage, created_at: timestamp },
      ])

      if (msgError) console.error("Message save error:", msgError)
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
