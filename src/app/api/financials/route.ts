import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get("days") || "7")

    // Build date range
    const dates: string[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split("T")[0])
    }

    // Fetch records for the date range
    const summaries = await prisma.profitSummary.findMany({
      where: {
        date: { in: dates }
      },
      orderBy: { date: "asc" }
    })

    // Fill in zeros for missing dates
    const summaryMap = new Map(summaries.map(s => [s.date, s]))
    const filled = dates.map(date => summaryMap.get(date) ?? {
      date,
      totalRevenue: 0,
      totalCOGS: 0,
      totalShipping: 0,
      totalAdSpend: 0,
      netProfit: 0,
      lossRecovery: 0
    })

    // Compute totals
    const totals = filled.reduce((acc, s) => ({
      totalRevenue: acc.totalRevenue + s.totalRevenue,
      totalCOGS: acc.totalCOGS + s.totalCOGS,
      totalShipping: acc.totalShipping + s.totalShipping,
      totalAdSpend: acc.totalAdSpend + s.totalAdSpend,
      netProfit: acc.netProfit + s.netProfit,
      lossRecovery: acc.lossRecovery + s.lossRecovery,
    }), {
      totalRevenue: 0, totalCOGS: 0, totalShipping: 0,
      totalAdSpend: 0, netProfit: 0, lossRecovery: 0
    })

    return NextResponse.json({ summaries: filled, totals, days })
  } catch (err) {
    console.error("Financials API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
