import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()
  try {
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code?.toUpperCase(),
        discount: body.discount,
        type: body.type,
        minOrder: body.minOrder,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        active: body.active,
        usageCount: body.usageCount,
      },
    })
    return NextResponse.json(coupon)
  } catch {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await prisma.coupon.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}
