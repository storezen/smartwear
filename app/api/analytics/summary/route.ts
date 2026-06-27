export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { supabase } from "@/lib/supabase"
import { parseEvent, computeSummary } from "@/lib/analytics"

const globalAny: any = global
globalAny.liveAnalytics = globalAny.liveAnalytics || []

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const fromDate = from ? new Date(from).toISOString() : new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    const toDate = to ? new Date(to).toISOString() : new Date().toISOString()

    let events: any[] = []

    if (supabase) {
      const { data, error } = await supabase
        .from("analytics")
        .select("*")
        .gte("timestamp", fromDate)
        .lte("timestamp", toDate)
        .order("timestamp", { ascending: false })
        .limit(5000)

      if (!error && data) {
        events = data.map(parseEvent)
      } else {
        console.warn("Supabase summary error, using memory:", error?.message)
      }
    }

    if (events.length === 0) {
      const fromTs = new Date(fromDate).getTime()
      const toTs = new Date(toDate).getTime()
      events = (globalAny.liveAnalytics || [])
        .filter((e: any) => {
          const t = new Date(e.timestamp).getTime()
          return t >= fromTs && t <= toTs
        })
        .map(parseEvent)
    }

    const summary = computeSummary(events)
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
