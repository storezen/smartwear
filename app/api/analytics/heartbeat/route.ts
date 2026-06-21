export const dynamic = "force-dynamic"

import { NextRequest, NextResponse } from "next/server"
import { recordHeartbeat, getActiveCount, clearAllPresence } from "@/lib/presence"

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json()
    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 })
    }
    const active = recordHeartbeat(sessionId)
    return NextResponse.json({ active, sessionId })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const active = getActiveCount()
    return NextResponse.json({ active })
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE() {
  clearAllPresence()
  return NextResponse.json({ success: true })
}
