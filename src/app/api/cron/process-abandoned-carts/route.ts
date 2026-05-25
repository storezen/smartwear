import { NextResponse } from "next/server"
import { automationService } from "@/services/automationService"

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      // Disabled strictly for testing without tokens, re-enable in prod
    }

    const processed = await automationService.processAbandonedCarts()

    return NextResponse.json({ 
      success: true, 
      processedCount: processed.length,
      processedSessionIds: processed
    })

  } catch (err) {
    console.error("Abandoned Cart Cron Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
