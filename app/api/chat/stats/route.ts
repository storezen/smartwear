import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        totalMessages: 0,
        totalSessions: 0,
        messagesToday: 0,
        positiveFeedback: 0,
        negativeFeedback: 0,
        dailyMessages: [],
        topQuestions: [],
        conversionRate: 0,
        sessionsWithOrders: 0,
      })
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [msgRes, sessionRes, todayRes, feedbackRes, dailyRes, userMsgs, sessionsWithOrdersRes, sessionsTotalRes] = await Promise.all([
      supabase.from("chat_messages").select("id", { count: "exact", head: true }),
      supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
      supabase.from("chat_messages").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
      supabase.from("chat_feedback").select("rating"),
      supabase
        .from("chat_messages")
        .select("created_at")
        .gte("created_at", sevenDaysAgo)
        .order("created_at", { ascending: true }),
      supabase
        .from("chat_messages")
        .select("content")
        .eq("role", "user")
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("chat_sessions").select("id", { count: "exact", head: true }).eq("has_delivered_order", true),
      supabase.from("chat_sessions").select("id", { count: "exact", head: true }),
    ])

    const positiveFeedback = (feedbackRes.data || []).filter((f: { rating: number }) => f.rating === 1).length
    const negativeFeedback = (feedbackRes.data || []).filter((f: { rating: number }) => f.rating === -1).length

    const dailyMap: Record<string, number> = {}
    for (const msg of dailyRes.data || []) {
      const day = new Date(msg.created_at).toISOString().slice(0, 10)
      dailyMap[day] = (dailyMap[day] || 0) + 1
    }
    const dailyMessages = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

    // Top questions — normalize user messages and count frequency
    const questionCounts: Record<string, number> = {}
    const normalize = (q: string) => q.toLowerCase().replace(/[?.!,]/g, "").trim()
    const stopWords = new Set(["ji", "hai", "hain", "ka", "ki", "ke", "ko", "se", "mein", "main", "to", "aur", "yeh", "woh", "aap", "mujhe", "kya", "konsa", "kahan", "kaise", "kab"])
    const questionIndicators = ["price", "price?", "rate", "kitna", "cost", "hai?", "available", "delivery", "shipping", "time", "warranty", "return", "replacement", "color", "feature", "review", "order", "track", "compare", "difference", "best", "latest", "new"]

    for (const msg of userMsgs.data || []) {
      const clean = normalize(msg.content)
      // Check if message matches a common question pattern
      for (const indicator of questionIndicators) {
        if (clean.includes(indicator)) {
          questionCounts[indicator] = (questionCounts[indicator] || 0) + 1
          break
        }
      }
    }

    const topQuestions = Object.entries(questionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([question, count]) => ({ question, count }))

    const totalSessions = sessionsTotalRes.count || 0
    const sessionsWithOrders = sessionsWithOrdersRes.count || 0
    const conversionRate = totalSessions > 0 ? Math.round((sessionsWithOrders / totalSessions) * 100) : 0

    return NextResponse.json({
      totalMessages: msgRes.count || 0,
      totalSessions,
      messagesToday: todayRes.count || 0,
      positiveFeedback,
      negativeFeedback,
      dailyMessages,
      topQuestions,
      conversionRate,
      sessionsWithOrders,
    })
  } catch (error) {
    console.error("Chat stats error:", error)
    return NextResponse.json({
      totalMessages: 0,
      totalSessions: 0,
      messagesToday: 0,
      positiveFeedback: 0,
      negativeFeedback: 0,
      dailyMessages: [],
      topQuestions: [],
      conversionRate: 0,
      sessionsWithOrders: 0,
    })
  }
}
