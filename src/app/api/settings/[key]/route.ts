import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  try {
    const setting = await prisma.storeSetting.findUnique({ where: { key } })
    return NextResponse.json({ key, value: setting?.value || null })
  } catch {
    return NextResponse.json({ key, value: null })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const { value } = await req.json()
  if (typeof value !== "string") {
    return NextResponse.json({ error: "value must be a string" }, { status: 400 })
  }
  try {
    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    return NextResponse.json(setting)
  } catch {
    return NextResponse.json({ error: "Failed to save setting" }, { status: 500 })
  }
}
