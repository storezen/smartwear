export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import { parseEvent } from "@/lib/analytics"

const globalAny: any = global
globalAny.liveAnalytics = globalAny.liveAnalytics || []

export async function GET() {
  try {
    if (env.NODE_ENV === "production" && supabase) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .gte("timestamp", twoHoursAgo)
        .order("timestamp", { ascending: false })
        .limit(200)

      if (!error && data) {
        return NextResponse.json(data.map(parseEvent))
      }
      console.warn("Supabase Analytics GET Error (falling back to memory):", error?.message)
    }
    const cutoff = Date.now() - 2 * 60 * 60 * 1000
    const filtered = globalAny.liveAnalytics.filter(
      (e: any) => new Date(e.timestamp).getTime() >= cutoff
    )
    return NextResponse.json(filtered.map(parseEvent))
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    if (!data.event_name || typeof data.event_name !== "string") {
      return NextResponse.json({ error: "event_name is required" }, { status: 400 })
    }

    const newEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      event_name: data.event_name,
      value: typeof data.value === "number" ? data.value : 0,
      timestamp: new Date().toISOString(),
    }

    if (env.NODE_ENV === "production" && supabase) {
      const { error } = await supabase.from("analytics").insert([newEvent])
      if (error) {
        console.warn("Supabase Analytics Insert Error:", error.message)
      }
    } else {
      globalAny.liveAnalytics.unshift(newEvent)
      if (globalAny.liveAnalytics.length > 500) {
        globalAny.liveAnalytics.length = 500
      }
    }

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
