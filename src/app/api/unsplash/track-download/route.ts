import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 })
  }

  try {
    const { downloadLocation } = await request.json()

    if (!downloadLocation) {
      return NextResponse.json({ error: "downloadLocation is required" }, { status: 400 })
    }

    const res = await fetch(downloadLocation, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to track download" }, { status: res.status })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
