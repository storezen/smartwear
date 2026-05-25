import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Database unavailable" }, { status: 503 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const data = await req.json()
    const product = await prisma.product.update({ where: { id }, data })
    return NextResponse.json(product)
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
