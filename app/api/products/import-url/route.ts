import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'SmartwearApp/1.0 (product importer)',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${res.status}` }, { status: 400 })
    }

    const html = await res.text()

    const og: Record<string, string> = {}
    const patterns = [
      { key: 'title', regex: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i },
      { key: 'title', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i },
      { key: 'description', regex: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i },
      { key: 'description', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i },
      { key: 'image', regex: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i },
      { key: 'image', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i },
      { key: 'price', regex: /<meta[^>]+property=["']product:price:amount["'][^>]+content=["']([^"']+)["']/i },
      { key: 'price', regex: /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']product:price:amount["']/i },
      { key: 'site_name', regex: /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i },
    ]

    for (const { key, regex } of patterns) {
      if (!og[key]) {
        const match = html.match(regex)
        if (match) og[key] = match[1]
      }
    }

    if (!og.title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      if (titleMatch) og.title = titleMatch[1].trim()
    }

    return NextResponse.json({
      success: true,
      title: og.title || '',
      description: og.description || '',
      image: og.image || '',
      price: og.price || '',
      site_name: og.site_name || '',
      url,
    })
  } catch (error: any) {
    console.error('Import URL Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to import URL' }, { status: 500 })
  }
}
