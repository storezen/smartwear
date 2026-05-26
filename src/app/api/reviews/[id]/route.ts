import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

// PATCH /api/reviews/[id] — toggle verified status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { verified } = await req.json()

    const review = await prisma.review.update({
      where: { id },
      data: { verified: Boolean(verified) },
    })

    return NextResponse.json({ review })
  } catch (error) {
    console.error("PATCH /api/reviews/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/reviews/[id] — remove a review
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.review.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
