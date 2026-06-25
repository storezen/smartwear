import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_HOSTS = ['cdn.shopify.com']

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const encoded = req.nextUrl.searchParams.get('url')
    if (!encoded) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    let originalUrl: string
    try {
      originalUrl = Buffer.from(encoded, 'base64url').toString('utf-8')
    } catch {
      return new NextResponse('Invalid url encoding', { status: 400 })
    }

    try {
      const parsed = new URL(originalUrl)
      if (!ALLOWED_HOSTS.some(h => parsed.hostname.endsWith(h))) {
        return new NextResponse('Invalid image host', { status: 403 })
      }
    } catch {
      return new NextResponse('Invalid URL', { status: 400 })
    }

    const resp = await fetch(originalUrl, {
      signal: AbortSignal.timeout(10000),
    })

    if (!resp.ok) {
      throw new Error(`Fetch failed: ${resp.status}`)
    }

    const contentType = resp.headers.get('content-type') || 'image/webp'
    const buffer = Buffer.from(await resp.arrayBuffer())

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error: any) {
    console.error('[Image Proxy] Error:', error)
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 })
  }
}
