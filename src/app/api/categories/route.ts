import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const ALLOWED_CATEGORY_FIELDS = [
  "name", "slug", "description", "image",
  "showInNavbar", "showOnHomepage", "active", "sortOrder",
] as const

function pickCategoryFields(data: Record<string, unknown>) {
  const picked: Record<string, unknown> = {}
  for (const key of ALLOWED_CATEGORY_FIELDS) {
    if (key in data) picked[key] = data[key]
  }
  return picked
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50")))
    const skip = (page - 1) * limit

    const [categories, total] = await Promise.all([
      prisma.category.findMany({ orderBy: { sortOrder: "asc" }, skip, take: limit }),
      prisma.category.count(),
    ])
    return NextResponse.json({ categories, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const category = await prisma.category.create({ data: pickCategoryFields(data) as any })
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
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing category id" }, { status: 400 })
    }
    const category = await prisma.category.update({ where: { id }, data: pickCategoryFields(fields) as any })
    return NextResponse.json(category)
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
