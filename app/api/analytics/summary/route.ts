export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { supabase, supabaseAdmin } from "@/lib/supabase"
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

    const sb = supabaseAdmin || supabase
    if (sb) {
      let page = 0
      while (true) {
        const fromRow = page * 1000
        const { data, error } = await sb
          .from("analytics")
          .select("*")
          .gte("timestamp", fromDate)
          .lte("timestamp", toDate)
          .order("timestamp", { ascending: false })
          .range(fromRow, fromRow + 999)

        if (error) {
          console.warn("Supabase summary error at page", page, error?.message)
          break
        }
        if (!data || data.length === 0) break
        events.push(...data.map(parseEvent))
        if (data.length < 1000) break
        page++
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

    const summary = computeSummary(events, fromDate, toDate)
    return NextResponse.json(summary)
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
