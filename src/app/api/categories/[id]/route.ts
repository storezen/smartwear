import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { revalidatePath } from "next/cache"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(category)
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
    const category = await prisma.category.update({ where: { id }, data })
    revalidatePath("/", "layout")
    return NextResponse.json(category)
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
    await prisma.category.delete({ where: { id } })
    revalidatePath("/", "layout")
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
