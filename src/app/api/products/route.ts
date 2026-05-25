import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(products)
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const product = await prisma.product.create({ data })
    return NextResponse.json(product, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json()
    const { id, ...fields } = data
    const product = await prisma.product.update({ where: { id }, data: fields })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
