import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // We consider "active" any session pinged in the last 60 seconds
    const activeThreshold = new Date(Date.now() - 60 * 1000)

    const activeSessions = await prisma.liveSession.findMany({
      where: {
        lastPingAt: {
          gte: activeThreshold
        }
      },
      select: {
        id: true,
        source: true,
        currentStep: true,
        lastPingAt: true
      }
    })

    return NextResponse.json({ sessions: activeSessions })
  } catch (err) {
    console.error("Live Analytics Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
