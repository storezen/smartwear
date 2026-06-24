export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import { parseEvent } from "@/lib/analytics"

const globalAny: any = global
globalAny.liveAnalytics = globalAny.liveAnalytics || []

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const fromDate = from ? new Date(from).toISOString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const toDate = to ? new Date(to).toISOString() : new Date().toISOString()

    if (env.NODE_ENV === "production" && supabase) {
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .gte("timestamp", fromDate)
        .lte("timestamp", toDate)
        .order("timestamp", { ascending: false })
        .limit(5000)

      if (!error && data) {
        return NextResponse.json(data.map(parseEvent))
      }
      console.warn("Supabase Analytics GET Error (falling back to memory):", error?.message)
    }
    const fromTs = new Date(fromDate).getTime()
    const toTs = new Date(toDate).getTime()
    const filtered = globalAny.liveAnalytics.filter(
      (e: any) => {
        const t = new Date(e.timestamp).getTime()
        return t >= fromTs && t <= toTs
      }
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

    globalAny.liveAnalytics.unshift(newEvent)
    if (globalAny.liveAnalytics.length > 10000) {
      globalAny.liveAnalytics.length = 10000
    }

    if (env.NODE_ENV === "production" && supabase) {
      const { error } = await supabase.from("analytics").insert([newEvent])
      if (error) {
        console.warn("Supabase Analytics Insert Error:", error.message)
      }
    }

    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
