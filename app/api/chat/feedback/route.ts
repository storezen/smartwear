import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const { sessionId, messageId, rating } = await req.json()

    if (!sessionId || !messageId || ![1, -1].includes(rating)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (supabase) {
      await supabase.from("chat_feedback").insert({
        session_id: sessionId,
        message_id: messageId,
        rating,
      })
    }

    // Also track in analytics
    if (supabase) {
      await supabase.from("analytics").insert({
        id: `chat_fb_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        event_name: "chat_feedback",
        timestamp: new Date().toISOString(),
        value: rating,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
