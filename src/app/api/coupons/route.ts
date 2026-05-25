import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } })
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        discount: body.discount,
        type: body.type || "percentage",
        minOrder: body.minOrder || null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        active: body.active ?? true,
      },
    })
    return NextResponse.json(coupon, { status: 201 })
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
