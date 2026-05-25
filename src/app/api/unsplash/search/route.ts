import { NextResponse } from "next/server"

const UNSPLASH_API = "https://api.unsplash.com"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q") || searchParams.get("query") || ""
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("per_page") || "20"

  if (!query) {
    return NextResponse.json({ error: "Query parameter is required" }, { status: 400 })
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return NextResponse.json({ error: "Unsplash API key not configured" }, { status: 500 })
  }

  try {
    const res = await fetch(
      `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    )

    if (!res.ok) {
      return NextResponse.json({ error: "Unsplash API error" }, { status: res.status })
    }

    const data = await res.json()

    const photos = data.results.map((img: any) => ({
      id: img.id,
      slug: img.slug || "",
      description: img.alt_description || "",
      urls: {
        raw: img.urls.raw,
        full: img.urls.full,
        regular: img.urls.regular,
        small: img.urls.small,
        thumb: img.urls.thumb,
      },
      links: { html: img.links.html },
      user: {
        name: img.user.name,
        username: img.user.username,
        links: { html: img.user.links.html },
      },
      width: img.width,
      height: img.height,
      color: img.color,
      blur_hash: img.blur_hash || "",
    }))

    const results = data.results.map((img: any) => ({
      id: img.id,
      url: img.urls.regular,
      thumb: img.urls.thumb,
      alt: img.alt_description || "",
      width: img.width,
      height: img.height,
      photographerName: img.user.name,
      photographerUrl: img.user.links.html,
      unsplashUrl: img.links.html,
      downloadLocation: img.links.download_location,
    }))

    return NextResponse.json({
      photos,
      results,
      total: data.total,
      total_pages: data.total_pages,
    })
  } catch {
    return NextResponse.json({ error: "Failed to fetch from Unsplash" }, { status: 500 })
  }
}
