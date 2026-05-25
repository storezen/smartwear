import { NextResponse } from "next/server"
import { writeFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { existsSync } from "node:fs"

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin") || ""
    const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL
    if (!allowedOrigin) {
      return NextResponse.json({ error: "Upload not configured" }, { status: 500 })
    }
    if (origin && origin !== allowedOrigin && !origin.startsWith(allowedOrigin)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const id = crypto.randomUUID()
    const filename = `${id}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads")

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    return NextResponse.json({
      id,
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
