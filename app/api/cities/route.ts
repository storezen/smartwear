import { NextResponse } from 'next/server'

const PROVINCE_MAP: Record<string, string> = {
  'Gilgit Baltistan': 'Gilgit-Baltistan',
  'Gilgit-Baltistan': 'Gilgit-Baltistan',
  'Islamabad': 'Islamabad Capital Territory',
  'Azad Kashmir': 'Azad Kashmir',
  'Punjab': 'Punjab',
  'Sindh': 'Sindh',
  'Khyber Pakhtunkhwa': 'Khyber Pakhtunkhwa',
  'Balochistan': 'Balochistan',
}

const CACHE_TTL = 86400000
let cache: { data: any[]; timestamp: number } | null = null

async function fetchFromGitHub() {
  const res = await fetch(
    'https://raw.githubusercontent.com/open-admin-data/pakistan-administrative-divisions/main/data/all-flat.json',
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) throw new Error('Failed to fetch city data')
  return res.json()
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const raw = await fetchFromGitHub()
    const items = Array.isArray(raw) ? raw : (raw.data || [])

    const cities = items
      .filter((item: any) => item.level >= 2)
      .map((item: any) => {
        const rawProvince = item.ancestors?.[0]?.name?.en || item.parent?.name?.en || 'Unknown'
        return {
          name: item.name.en,
          province: PROVINCE_MAP[rawProvince] || rawProvince,
          lat: parseFloat(item.geo?.lat) || 0,
          lng: parseFloat(item.geo?.lon) || 0,
        }
      })
      .filter((c: any) => c.name && c.province !== 'Unknown')

    const seen = new Set<string>()
    const unique = cities.filter((c: any) => {
      const key = `${c.name}|${c.province}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    cache = { data: unique, timestamp: Date.now() }
    return NextResponse.json(unique)
  } catch {
    return NextResponse.json({ error: 'Failed to load cities' }, { status: 500 })
  }
}
