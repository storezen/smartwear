import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get("orderId")
    const phone = searchParams.get("phone")

    if (!orderId || !phone) {
      return NextResponse.json({ error: "Missing tracking information" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Very basic auth: phone must match (could strip whitespace/formatting for robust comparison)
    if (order.phone.replace(/[^0-9+]/g, '') !== phone.replace(/[^0-9+]/g, '')) {
      return NextResponse.json({ error: "Invalid tracking details" }, { status: 403 })
    }

    // Return safe data
    return NextResponse.json({
      id: order.id,
      productName: order.productName,
      productImage: order.productImage,
      total: order.total,
      status: order.status,
      statusHistory: JSON.parse(order.statusHistory as string || "[]"),
      customerName: order.customerName,
      address: order.address,
      city: order.city,
      createdAt: order.createdAt
    })

  } catch (err) {
    console.error("Track API Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
