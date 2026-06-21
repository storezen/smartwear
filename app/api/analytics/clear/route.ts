export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { env } from "@/lib/env"

const globalAny: any = global
globalAny.liveAnalytics = globalAny.liveAnalytics || []

export async function POST() {
  try {
    if (env.NODE_ENV === "production" && supabase) {
      const { error } = await supabase.from("analytics").delete().neq("id", "0")
      if (error) {
        console.warn("Supabase Analytics Clear Error:", error.message)
      }
    }

    globalAny.liveAnalytics = []

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
