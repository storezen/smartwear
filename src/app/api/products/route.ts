import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

const ALLOWED_PRODUCT_FIELDS = [
  "name", "price", "originalPrice", "cost", "image", "images", "category",
  "description", "inStock", "featured", "specs", "sku", "quantity",
  "lowStockThreshold", "rating", "reviews", "metaTitle", "metaDescription",
  "variants", "optionNames", "status", "handle", "tags",
] as const

function pickProductFields(data: Record<string, unknown>) {
  const picked: Record<string, unknown> = {}
  for (const key of ALLOWED_PRODUCT_FIELDS) {
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

    const [products, total] = await Promise.all([
      prisma.product.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
      prisma.product.count(),
    ])
    return NextResponse.json({ products, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const product = await prisma.product.create({ data: pickProductFields(data) as any })
    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const { id, ...fields } = data
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 })
    }
    const product = await prisma.product.update({ where: { id }, data: pickProductFields(fields) })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    await prisma.product.deleteMany({})
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete all products" }, { status: 500 })
  }
}
