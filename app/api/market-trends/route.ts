import { NextResponse } from 'next/server'

const CATEGORIES = [
  { query: 'smartwatch', label: 'Smart Watches' },
  { query: 'analog watch men', label: 'Analog Watches' },
  { query: 'watch band strap', label: 'Watch Bands' },
  { query: 'phone case cover', label: 'Phone Cases' },
  { query: 'wireless earbuds', label: 'Earbuds' },
  { query: 'charger fast', label: 'Chargers' },
  { query: 'smart watch', label: 'Smart Watches' },
  { query: 'ladies watch', label: 'Ladies Watches' },
  { query: 'power bank', label: 'Power Banks' },
  { query: 'bluetooth speaker', label: 'Speakers' },
]

const CACHE_TTL = 3600
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
    return items.filter(i => !i.title.match(/^\d+$|^[a-z]$|^(n|m|s)$/i)).slice(0, 15)
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
    return items.slice(0, 10).map((i: any) => {
      const priceStr = i.priceShow || ''
      const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0
      return {
        name: (i.name || '').trim().substring(0, 80),
        price: priceStr,
        priceNum,
        originalPrice: i.originalPriceShow || '',
        discount: i.discount || '',
        rating: Math.round(parseFloat(i.ratingScore || '0') * 10) / 10,
        sold: parseInt(i.review || '0') || 0,
        seller: i.sellerName || 'N/A',
        location: i.location || '',
        url: i.productUrl || '',
        image: i.image || '',
      }
    })
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

    const mergedLabels = [...new Set(CATEGORIES.map(c => c.label))]
    const categories = mergedLabels.map(label => {
      const indexes = CATEGORIES.map((c, i) => c.label === label ? i : -1).filter(i => i >= 0)
      const allProducts = indexes.flatMap(i => (categoryProducts[i] || []).map((p: any) => ({ ...p, category: label })))
      const unique = allProducts.filter((p, i, a) => a.findIndex(x => x.name === p.name) === i)
      return { label, query: CATEGORIES.find(c => c.label === label)?.query || '', products: unique.slice(0, 15) }
    })

    const allProducts = categories.flatMap(c => c.products)
      .sort((a, b) => b.sold - a.sold)
      .filter((p, i, a) => a.findIndex(x => x.name === p.name) === i)
      .slice(0, 30)

    const brandMentions: Record<string, number> = {}
    allProducts.forEach(p => {
      const lower = p.name.toLowerCase()
      if (lower.includes('apple') || lower.includes('i-phone')) brandMentions['Apple'] = (brandMentions['Apple'] || 0) + 1
      if (lower.includes('samsung') || lower.includes('galaxy')) brandMentions['Samsung'] = (brandMentions['Samsung'] || 0) + 1
      if (lower.includes('xiaomi') || lower.includes('redmi')) brandMentions['Xiaomi'] = (brandMentions['Xiaomi'] || 0) + 1
      if (lower.includes('huawei')) brandMentions['Huawei'] = (brandMentions['Huawei'] || 0) + 1
      if (lower.includes('nike')) brandMentions['Nike'] = (brandMentions['Nike'] || 0) + 1
      if (lower.includes('adidas')) brandMentions['Adidas'] = (brandMentions['Adidas'] || 0) + 1
      if (lower.includes('rolex')) brandMentions['Rolex'] = (brandMentions['Rolex'] || 0) + 1
      if (lower.includes('fossil')) brandMentions['Fossil'] = (brandMentions['Fossil'] || 0) + 1
    })

    const totalProducts = allProducts.length
    const avgPrice = totalProducts
      ? Math.round(allProducts.reduce((s, p) => s + p.priceNum, 0) / totalProducts)
      : 0
    const maxPrice = totalProducts ? Math.max(...allProducts.map(p => p.priceNum)) : 0
    const minPrice = totalProducts ? Math.min(...allProducts.map(p => p.priceNum).filter(Boolean)) : 0

    const priceRanges = [
      { label: 'Under PKR 1K', min: 0, max: 1000, count: 0 },
      { label: 'PKR 1K-3K', min: 1000, max: 3000, count: 0 },
      { label: 'PKR 3K-5K', min: 3000, max: 5000, count: 0 },
      { label: 'PKR 5K-10K', min: 5000, max: 10000, count: 0 },
      { label: 'PKR 10K+', min: 10000, max: Infinity, count: 0 },
    ]
    allProducts.forEach(p => {
      const range = priceRanges.find(r => p.priceNum >= r.min && p.priceNum < r.max)
      if (range) range.count++
    })

    const categorySummary = categories.map(c => ({
      label: c.label,
      count: c.products.length,
      totalSold: c.products.reduce((s, p) => s + p.sold, 0),
      avgPrice: c.products.length
        ? Math.round(c.products.reduce((s, p) => s + p.priceNum, 0) / c.products.length)
        : 0,
    })).sort((a, b) => b.totalSold - a.totalSold)

    const data = {
      trending,
      categories,
      topSelling: allProducts,
      brandMentions,
      summary: { totalProducts, avgPrice, minPrice, maxPrice, priceRanges },
      categorySummary,
      generatedAt: new Date().toISOString(),
    }

    cache = { data, timestamp: Date.now() }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}` },
    })
  } catch (error) {
    console.error('[Market Trends] Error:', error)
    if (cache) return NextResponse.json(cache.data)
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
