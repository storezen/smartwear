import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// GET /api/reviews?productId=xxx  — fetch reviews for a product
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 })
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    })

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return NextResponse.json({ reviews, avgRating: Math.round(avgRating * 10) / 10 })
  } catch (error) {
    console.error("GET /api/reviews error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/reviews  — submit a new review
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { productId, customerName, phone, rating, comment } = body

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json({ error: "productId, customerName, rating, aur comment zaroori hain" }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating 1 se 5 ke beech honi chahiye" }, { status: 400 })
    }

    if (comment.trim().length < 10) {
      return NextResponse.json({ error: "Review kam az kam 10 characters ka hona chahiye" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerName: customerName.trim(),
        phone: phone?.trim() || null,
        rating: Number(rating),
        comment: comment.trim(),
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("POST /api/reviews error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
