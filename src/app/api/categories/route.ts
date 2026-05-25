import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const category = await prisma.category.create({ data })
    return NextResponse.json(category, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create category"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const { id, ...fields } = data
    const category = await prisma.category.update({ where: { id }, data: fields })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
