import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const all = await prisma.storeSetting.findMany()
    const map: Record<string, string> = {}
    for (const s of all) map[s.key] = s.value
    return NextResponse.json(map)
  } catch {
    return NextResponse.json({})
  }
}
