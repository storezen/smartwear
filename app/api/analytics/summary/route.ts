export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import { parseEvent, computeSummary } from "@/lib/analytics"

const globalAny: any = global
globalAny.liveAnalytics = globalAny.liveAnalytics || []

export async function GET() {
  try {
    let events: any[] = []

    if (env.NODE_ENV === "production" && supabase) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .gte("timestamp", twoHoursAgo)
        .order("timestamp", { ascending: false })
        .limit(200)

      if (!error && data) {
        events = data.map(parseEvent)
      } else {
        console.warn("Supabase summary error, using memory:", error?.message)
      }
    }

    if (events.length === 0) {
      const cutoff = Date.now() - 2 * 60 * 60 * 1000
      events = (globalAny.liveAnalytics || [])
        .filter((e: any) => new Date(e.timestamp).getTime() >= cutoff)
        .map(parseEvent)
    }

    const summary = computeSummary(events)
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
