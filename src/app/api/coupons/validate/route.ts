import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Missing coupon code" }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code" })
    }

    if (!coupon.active) {
      return NextResponse.json({ valid: false, error: "This coupon is no longer active" })
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json({ valid: false, error: "This coupon has expired" })
    }

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount: coupon.discount,
      type: coupon.type,
      minOrder: coupon.minOrder,
    })
  } catch {
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 })
  }
}
