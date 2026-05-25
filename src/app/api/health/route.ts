import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    // Quick DB ping to ensure connection is alive
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV
    })
  } catch (err) {
    return NextResponse.json({ status: "error", db: "disconnected" }, { status: 503 })
  }
}
