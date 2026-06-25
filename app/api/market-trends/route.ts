import { NextResponse } from 'next/server'
import { getProducts } from '@/lib/db'
import { normalizeCategorySlug } from '@/lib/normalize-product'

interface Product {
  name: string; price: string; priceNum: number; originalPrice: string
  discount: string; rating: number; sold: number; seller: string
  location: string; url: string; image: string; category: string
  trendScore: number; demandDensity: number; discountPct: number
}

interface CategoryDef { queries: string[]; label: string }

const CATEGORIES: CategoryDef[] = [
  { queries: ['smartwatch', 'smart watch men', 'smart watch price in pakistan'], label: 'Smart Watches' },
  { queries: ['analog watch men', 'wrist watch men', 'watch for men'], label: 'Analog Watches' },
  { queries: ['ladies watch', 'women watch', 'girls watch'], label: 'Ladies Watches' },
  { queries: ['watch band', 'watch strap', 'watch belt'], label: 'Watch Bands' },
  { queries: ['phone case', 'mobile cover', 'phone back cover'], label: 'Phone Cases' },
  { queries: ['wireless earbuds', 'bluetooth earphones', 'TWS earbuds'], label: 'Earbuds' },
  { queries: ['charger fast', 'charger adapter', 'type c charger'], label: 'Chargers' },
  { queries: ['power bank', 'powerbank 10000', 'portable charger'], label: 'Power Banks' },
  { queries: ['bluetooth speaker', 'wireless speaker', 'speaker portable'], label: 'Speakers' },
]

const CATEGORY_LABEL_MAP: Record<string, string> = {
  'smart-watches': 'Smart Watches', 'analog-watches': 'Analog Watches',
  'ladies-watches': 'Ladies Watches', 'watch-bands': 'Watch Bands',
  'phone-cases': 'Phone Cases', 'watch-cases': 'Watch Cases',
  'power-banks': 'Power Banks', chargers: 'Chargers', audio: 'Earbuds',
  accessories: 'Accessories', speakers: 'Speakers',
}

const CATEGORY_BASELINE: Record<string, { priceMin: number; priceMax: number; avgSold: number }> = {
  'Smart Watches': { priceMin: 1500, priceMax: 12000, avgSold: 800 },
  'Analog Watches': { priceMin: 600, priceMax: 5000, avgSold: 1200 },
  'Ladies Watches': { priceMin: 500, priceMax: 4000, avgSold: 900 },
  'Watch Bands': { priceMin: 250, priceMax: 2000, avgSold: 1500 },
  'Phone Cases': { priceMin: 200, priceMax: 1500, avgSold: 2500 },
  'Earbuds': { priceMin: 500, priceMax: 5000, avgSold: 1800 },
  'Chargers': { priceMin: 300, priceMax: 2500, avgSold: 2000 },
  'Power Banks': { priceMin: 1000, priceMax: 5000, avgSold: 600 },
  'Speakers': { priceMin: 800, priceMax: 8000, avgSold: 400 },
}

const CACHE_TTL = 3600
let cache: { data: any; timestamp: number } | null = null

function rng(seed: number): () => number {
  let s = seed
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)]
}

const SELLERS = ['TechMart PK', 'GadgetHouse', 'ShopNow Pakistan', 'ElectroWorld', 'CityMall', 'DigitalHub', 'MegaStore PK', 'TrendyShop', 'ExpressMall', 'PrimeDeals', 'BargainSpot', 'SmartGadgets']
const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala', 'Peshawar', 'Quetta', 'Sialkot', 'Sargodha', 'Hyderabad']
const ADJECTIVES = ['Premium', 'Genuine', 'Original', 'Latest', 'Pro', 'New', 'Deluxe', 'Classic', 'Elegant', 'Ultra', 'Slim', 'Heavy Duty', 'Smart', 'Advanced', 'Superior']

function generateEstimatedProducts(cat: CategoryDef, count: number): Product[] {
  const base = CATEGORY_BASELINE[cat.label]
  if (!base) return []
  const rand = rng(cat.label.length * 1000 + count)
  const seen = new Set<string>()
  const products: Product[] = []

  for (let i = 0; i < count * 2 && products.length < count; i++) {
    const adj = pick(ADJECTIVES, rand)
    const name = `${adj} ${cat.label.replace(/s$/, '')} ${String.fromCharCode(65 + Math.floor(rand() * 26))}${Math.floor(rand() * 99 + 1)}`.substring(0, 80)
    if (seen.has(name)) continue
    seen.add(name)

    const priceNum = Math.round(base.priceMin + rand() * (base.priceMax - base.priceMin))
    const sold = Math.round(base.avgSold * (0.2 + rand() * 1.8))
    const rating = Math.round((3 + rand() * 2) * 10) / 10
    const discountPct = rand() > 0.4 ? Math.round(rand() * 40) : 0
    const originalPrice = discountPct > 0 ? Math.round(priceNum / (1 - discountPct / 100)) : priceNum
    const trendScore = sold > 0
      ? Math.round((sold * rating * (1 + discountPct / 100)) / Math.max(Math.sqrt(priceNum), 1))
      : 0

    products.push({
      name, price: `PKR ${priceNum.toLocaleString()}`, priceNum, originalPrice: `PKR ${originalPrice.toLocaleString()}`,
      discount: discountPct > 0 ? `-${discountPct}%` : '', rating, sold, discountPct,
      seller: pick(SELLERS, rand), location: pick(CITIES, rand),
      url: '', image: '', category: cat.label, trendScore, demandDensity: 0,
    })
  }
  return products
}

async function fetchTrendingPakistan() {
  try {
    const res = await fetch('https://trends.google.com/trending/rss?geo=PK', {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    })
    const xml = await res.text()
    const items: { title: string; traffic: string; snippet: string }[] = []
    const regex = /<item>([\s\S]*?)<\/item>/g
    let match
    while ((match = regex.exec(xml)) !== null) {
      const title = match[1].match(/<title>(.*?)<\/title>/)?.[1]
      const traffic = match[1].match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1]
      const snippet = match[1].match(/<ht:news_item_title>(.*?)<\/ht:news_item_title>/)?.[1]
        ?.replace(/<!\[CDATA\[(.*?)\]\]>/, '$1') || ''
      if (title) items.push({ title, traffic: traffic || 'N/A', snippet })
    }
    return items
      .filter(i => !i.title.match(/^\d+$|^[a-z]$|^(n|m|s)$/i))
      .slice(0, 20)
      .map(i => ({
        ...i,
        categoryMatch: CATEGORIES.find(c =>
          c.queries.some(q => i.title.toLowerCase().includes(q.split(' ')[0]))
        )?.label || null,
      }))
  } catch {
    return []
  }
}

let darazBlocked = false

async function fetchDarazPage(query: string, page: number): Promise<any[]> {
  try {
    const url = `https://www.daraz.pk/catalog/?q=${encodeURIComponent(query)}&ajax=true&page=${page}&sort=orderdesc`
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'x-requested-with': 'XMLHttpRequest',
      },
    })
    const text = await res.text()
    if (text.trim().startsWith('<') || text.includes('punish') || text.includes('x5sec') || text.includes('captcha')) {
      darazBlocked = true
      return []
    }
    const data = JSON.parse(text)
    return data?.mods?.listItems || []
  } catch {
    return []
  }
}

async function processDarazItems(items: any[]): Promise<Product[]> {
  const seen = new Set<string>()
  return items
    .filter((i: any) => {
      const name = (i.name || '').trim()
      if (!name || seen.has(name)) return false
      seen.add(name)
      return true
    })
    .slice(0, 30)
    .map((i: any) => {
      const priceStr = i.priceShow || ''
      const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0
      const sold = parseInt(i.review || '0') || 0
      const rating = Math.round(parseFloat(i.ratingScore || '0') * 10) / 10
      const discount = i.discount || ''
      const discountPct = parseInt(discount.replace(/[^0-9]/g, '')) || 0
      const trendScore = sold > 0
        ? Math.round((sold * (rating || 3) * (1 + discountPct / 100)) / Math.max(Math.sqrt(priceNum), 1))
        : 0
      return {
        name: (i.name || '').trim().substring(0, 80),
        price: priceStr, priceNum, originalPrice: i.originalPriceShow || '',
        discount, discountPct, rating, sold,
        seller: i.sellerName || 'N/A', location: i.location || '',
        url: i.productUrl || '', image: i.image || '', category: '',
        trendScore, demandDensity: 0,
      }
    })
}

function computeMarketAnalysis(categories: { label: string; products: Product[] }[], localProducts: any[]) {
  const localCategoryMap: Record<string, any[]> = {}
  localProducts.forEach((p: any) => {
    const label = CATEGORY_LABEL_MAP[normalizeCategorySlug(p.category_slug)] || p.category_slug || 'Other'
    if (!localCategoryMap[label]) localCategoryMap[label] = []
    localCategoryMap[label].push(p)
  })

  const localSummary = Object.entries(localCategoryMap).map(([label, products]) => ({
    label, count: products.length,
    avgPrice: Math.round(products.reduce((s: number, p: any) => s + (p.price || 0), 0) / products.length),
    minPrice: Math.min(...products.map((p: any) => p.price || 0)),
    maxPrice: Math.max(...products.map((p: any) => p.price || 0)),
    totalStock: products.reduce((s: number, p: any) => s + (p.stock || 0), 0),
  })).sort((a, b) => b.count - a.count)

  const localPriceRanges = [
    { label: 'Under PKR 500', min: 0, max: 500, count: 0 },
    { label: 'PKR 500-1K', min: 500, max: 1000, count: 0 },
    { label: 'PKR 1K-3K', min: 1000, max: 3000, count: 0 },
    { label: 'PKR 3K-5K', min: 3000, max: 5000, count: 0 },
    { label: 'PKR 5K-10K', min: 5000, max: 10000, count: 0 },
    { label: 'PKR 10K+', min: 10000, max: Infinity, count: 0 },
  ]
  localProducts.forEach((p: any) => {
    const range = localPriceRanges.find(r => (p.price || 0) >= r.min && (p.price || 0) < r.max)
    if (range) range.count++
  })

  const localTotalValue = Math.round(localProducts.reduce((s: number, p: any) => s + ((p.price || 0) * (p.stock || 0)), 0))
  const localTotalStock = localProducts.reduce((s: number, p: any) => s + (p.stock || 0), 0)

  const allProducts = categories
    .flatMap(c => c.products)
    .filter((p, i, a) => a.findIndex(x => x.name === p.name) === i)
    .sort((a, b) => b.trendScore - a.trendScore)

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

  const priceRanges = [
    { label: 'Under PKR 500', min: 0, max: 500, count: 0, totalSold: 0 },
    { label: 'PKR 500-1K', min: 500, max: 1000, count: 0, totalSold: 0 },
    { label: 'PKR 1K-3K', min: 1000, max: 3000, count: 0, totalSold: 0 },
    { label: 'PKR 3K-5K', min: 3000, max: 5000, count: 0, totalSold: 0 },
    { label: 'PKR 5K-10K', min: 5000, max: 10000, count: 0, totalSold: 0 },
    { label: 'PKR 10K+', min: 10000, max: Infinity, count: 0, totalSold: 0 },
  ]
  allProducts.forEach(p => {
    const range = priceRanges.find(r => p.priceNum >= r.min && p.priceNum < r.max)
    if (range) { range.count++; range.totalSold += p.sold }
  })

  const categorySummary = categories.map(c => {
    const totalSold = c.products.reduce((s, p) => s + p.sold, 0)
    const count = c.products.length
    return {
      label: c.label, count, totalSold,
      avgPrice: count ? Math.round(c.products.reduce((s, p) => s + p.priceNum, 0) / count) : 0,
      avgSoldPerProduct: count ? Math.round(totalSold / count) : 0,
      uniqueSellers: new Set(c.products.map(p => p.seller)).size,
      competition: count > 1 ? Math.round((new Set(c.products.map(p => p.seller)).size / count) * 100) : 100,
    }
  }).sort((a, b) => b.totalSold - a.totalSold)

  const bestPricePerCategory = categories.map(c => {
    const ranges = [
      { label: 'Under 500', min: 0, max: 500 }, { label: '500-1K', min: 500, max: 1000 },
      { label: '1K-3K', min: 1000, max: 3000 }, { label: '3K-5K', min: 3000, max: 5000 },
      { label: '5K-10K', min: 5000, max: 10000 }, { label: '10K+', min: 10000, max: Infinity },
    ]
    const withSales = ranges.map(r => {
      const products = c.products.filter(p => p.priceNum >= r.min && p.priceNum < r.max)
      return { ...r, count: products.length, totalSold: products.reduce((s, p) => s + p.sold, 0) }
    }).filter(r => r.count > 0).sort((a, b) => b.totalSold - a.totalSold)
    return { category: c.label, sweetSpot: withSales[0]?.label || null, sweetSpotSales: withSales[0]?.totalSold || 0, ranges: withSales }
  })

  const topTrending = allProducts
    .filter(p => p.sold > 0)
    .slice(0, 50)
    .map((p, i) => ({ ...p, rank: i + 1 }))

  const hotProducts = allProducts
    .filter(p => p.trendScore > 0)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 10)

  const trendingCategorySales = categorySummary.filter(c => c.totalSold > 0)
  const opportunityScore = trendingCategorySales.map(c => ({
    label: c.label,
    demandDensity: c.avgSoldPerProduct,
    competition: c.competition,
    opportunity: c.avgSoldPerProduct > 0 && c.competition > 0
      ? Math.round((c.avgSoldPerProduct / Math.max(c.competition / 100, 0.1)) * 10) / 10
      : 0,
  })).sort((a, b) => b.opportunity - a.opportunity)

  const priceComparison = localSummary.map(local => {
    const market = categorySummary.find(c => c.label === local.label)
    return {
      category: local.label,
      yourCount: local.count, yourAvgPrice: local.avgPrice,
      yourMinPrice: local.minPrice, yourMaxPrice: local.maxPrice,
      marketCount: market?.count || 0, marketAvgPrice: market?.avgPrice || 0,
      marketTotalSold: market?.totalSold || 0,
      diff: market ? local.avgPrice - market.avgPrice : 0,
      diffPct: market && market.avgPrice > 0
        ? Math.round(((local.avgPrice - market.avgPrice) / market.avgPrice) * 100)
        : 0,
    }
  }).sort((a, b) => b.marketTotalSold - a.marketTotalSold)

  const gapAnalysis = categorySummary
    .filter(m => m.totalSold > 50)
    .map(m => {
      const local = localSummary.find(l => l.label === m.label)
      return {
        category: m.label,
        marketDemand: m.totalSold,
        marketAvgPrice: m.avgPrice,
        yourCount: local ? local.count : 0,
        marketAvgPerProduct: m.avgSoldPerProduct,
        status: !local ? 'missing' : local.count < 5 ? 'low' : local.count < 15 ? 'medium' : 'strong',
      }
    }).sort((a, b) => b.marketDemand - a.marketDemand)

  return {
    trending: [],
    categories,
    topTrending, hotProducts, brandMentions,
    summary: { totalProducts, avgPrice, priceRanges },
    categorySummary, bestPricePerCategory, opportunityScore,
    darazBlocked,
    local: {
      totalProducts: localProducts.length, totalValue: localTotalValue,
      totalStock: localTotalStock, categories: localSummary,
      priceRanges: localPriceRanges,
      products: localProducts.slice(0, 50).map((p: any) => ({
        name: p.name, price: p.price || 0, stock: p.stock || 0,
        category: CATEGORY_LABEL_MAP[normalizeCategorySlug(p.category_slug)] || p.category_slug || 'Other',
        rating: p.rating || 0,
      })),
    },
    priceComparison, gapAnalysis,
    generatedAt: new Date().toISOString(),
  }
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL * 1000) {
      return NextResponse.json(cache.data)
    }

    const localProducts = await getProducts()
    darazBlocked = false

    const [trending] = await Promise.all([
      fetchTrendingPakistan(),
    ])

    const categoryResults = await Promise.all(
      CATEGORIES.map(async (cat) => {
        const allItems: any[] = []
        for (const query of cat.queries) {
          if (darazBlocked) break
          for (let page = 1; page <= 3; page++) {
            const items = await fetchDarazPage(query, page)
            allItems.push(...items)
            if (items.length < 20) break
          }
        }
        const products = darazBlocked
          ? generateEstimatedProducts(cat, 25)
          : (await processDarazItems(allItems)).map(p => ({ ...p, category: cat.label }))
        return { label: cat.label, queries: cat.queries, products }
      })
    )

    const data = {
      ...computeMarketAnalysis(categoryResults, localProducts),
      trending,
      darazBlocked,
      estimatedData: darazBlocked,
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
