import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

const GEMINI_API_KEY = env.GEMINI_API_KEY || ''

const SYSTEM_PROMPT = `You are a Pakistan e-commerce market analyst. Analyze the market data and give:
1. **Key Trend** (1 line) — what's the biggest movement today
2. **Hot Categories** (top 2) — which categories are selling most
3. **Price Intelligence** — avg price ranges, good pricing opportunities
4. **Product Recommendations** (2-3) — what products we should stock at Smartwear
5. **Risk Alert** — any brand/demand risk

Keep it concise, actionable. Speak in Pakistani Rupee context.`

let cache: { data: any; timestamp: number } | null = null

export async function GET() {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({
      available: false,
      note: 'AI insights require GEMINI_API_KEY in .env.local',
    })
  }

  if (cache && Date.now() - cache.timestamp < 7200 * 1000) {
    return NextResponse.json(cache.data)
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_STORE_URL || 'http://localhost:3000'
    const marketRes = await fetch(`${baseUrl}/api/market-trends`, {
      signal: AbortSignal.timeout(10000),
    })
    const market = await marketRes.json()

    const prompt = `${SYSTEM_PROMPT}

---
Current Market Data:
- Trending on Google Pakistan: ${(market.trending || []).slice(0, 5).map((t: any) => t.title).join(', ')}
- Categories performance:
${(market.categories || []).map((c: any) => {
  const avgPrice = c.products.length ? Math.round(c.products.reduce((s: number, p: any) => {
    const price = parseInt((p.price || '').replace(/[^0-9]/g, '')) || 0
    return s + price
  }, 0) / c.products.length) : 0
  return `  - ${c.label}: ${c.products.length} products, avg PKR ${avgPrice.toLocaleString()}, total sales ${c.products.reduce((s: number, p: any) => s + p.sold, 0)}`
}).join('\n')}
- Brand mentions: ${JSON.stringify(market.brandMentions || {})}
- Top selling products: ${(market.trendingProducts || []).slice(0, 3).map((p: any) => `${p.name} (PKR ${p.price}, sold ${p.sold})`).join(' | ')}

---
Give analysis in plain text (no markdown). Max 4 short paragraphs.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`Gemini API error ${res.status}: ${errText.substring(0, 200)}`)
    }

    const json = await res.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'No insight generated'

    const data = {
      available: true,
      insight: text,
      generatedAt: new Date().toISOString(),
    }
    cache = { data, timestamp: Date.now() }
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('[Market Insights] Error:', error)
    return NextResponse.json({
      available: false,
      note: error.message || 'Failed to generate insights',
    })
  }
}
