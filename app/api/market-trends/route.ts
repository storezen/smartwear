import { NextResponse } from 'next/server'
import { saveSnapshot } from '@/lib/market-data'

const CATEGORIES = [
  { query: 'smartwatch', label: 'Smart Watches' },
  { query: 'analog watch', label: 'Analog Watches' },
  { query: 'watch band', label: 'Watch Bands' },
  { query: 'phone case', label: 'Phone Cases' },
  { query: 'earbuds', label: 'Earbuds' },
  { query: 'charger', label: 'Chargers' },
]

const CACHE_TTL = 3600 // 1 hour
let cache: { data: any; timestamp: number } | null = null

async function fetchTrendingPakistan() {
  try {
    const res = await fetch('https://trends.google.com/trending/rss?geo=PK', {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const xml = await res.text()
    const items: { title: string; traffic: string }[] = []
    const regex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = regex.exec(xml)) !== null) {
      const title = match[1].match(/<title>(.*?)<\/title>/)?.[1]
      const traffic = match[1].match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1]
      if (title) items.push({ title, traffic: traffic || 'N/A' })
    }
    return items.filter(i => !i.title.match(/^\d+$|^[a-z]$|^(n|m|s)$/i)).slice(0, 20)
  } catch {
    return []
  }
}

async function fetchDarazProducts(query: string): Promise<any[]> {
  try {
    const url = `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}&ajax=true&page=1&sort=orderdesc`
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
      },
    })
    const data = await res.json()
    const items = data?.mods?.listItems || []
    return items.slice(0, 10).map((i: any) => ({
      name: (i.name || '').trim().substring(0, 80),
      price: i.priceShow || 'N/A',
      rating: Math.round(parseFloat(i.ratingScore || '0') * 10) / 10,
      sold: parseInt(i.review || '0') || 0,
      seller: i.sellerName || 'N/A',
      url: i.productUrl || '',
    }))
  } catch {
    return []
  }
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL * 1000) {
      return NextResponse.json(cache.data)
    }

    const [trending, ...categoryProducts] = await Promise.all([
      fetchTrendingPakistan(),
      ...CATEGORIES.map(c => fetchDarazProducts(c.query)),
    ])

    const categories = CATEGORIES.map((c, i) => ({
      ...c,
      products: (categoryProducts[i] || []).map((p: any) => ({ ...p, category: c.label })),
    }))

    const trendingProducts = categories.flatMap(c => c.products).sort((a, b) => b.sold - a.sold).slice(0, 20)
    const brandMentions: Record<string, number> = {}
    trendingProducts.forEach(p => {
      const lower = p.name.toLowerCase()
      if (lower.includes('apple') || lower.includes('i-phone')) brandMentions['Apple'] = (brandMentions['Apple'] || 0) + 1
      if (lower.includes('samsung') || lower.includes('galaxy')) brandMentions['Samsung'] = (brandMentions['Samsung'] || 0) + 1
      if (lower.includes('xiaomi') || lower.includes('redmi')) brandMentions['Xiaomi'] = (brandMentions['Xiaomi'] || 0) + 1
      if (lower.includes('huawei')) brandMentions['Huawei'] = (brandMentions['Huawei'] || 0) + 1
    })

    const data = {
      trending,
      categories,
      trendingProducts,
      brandMentions,
      generatedAt: new Date().toISOString(),
    }

    cache = { data, timestamp: Date.now() }
    saveSnapshot(data)
    return NextResponse.json(data, {
      headers: { 'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}` },
    })
  } catch (error) {
    console.error('[Market Trends] Error:', error)
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
