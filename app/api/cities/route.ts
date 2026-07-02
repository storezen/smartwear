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

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  const raw = await res.json()
  return Array.isArray(raw) ? raw : (raw.data || [])
}

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  return res.text()
}

function extractCity(item: any) {
  const rawProvince = item.ancestors?.[0]?.name?.en || item.parent?.name?.en || 'Unknown'
  return {
    name: item.name.en.trim(),
    province: PROVINCE_MAP[rawProvince] || rawProvince,
    lat: parseFloat(item.geo?.lat) || 0,
    lng: parseFloat(item.geo?.lon) || 0,
  }
}

function parseCsv(text: string): { name: string; district: string }[] {
  const lines = text.split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const result: { name: string; district: string }[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length >= 3) {
      const name = parts[0]?.trim().replace(/^"|"$/g, '')
      const district = parts[2]?.trim().replace(/^"|"$/g, '')
      if (name && district) {
        result.push({ name, district })
      }
    }
  }
  return result
}

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const BASE = 'https://raw.githubusercontent.com/open-admin-data/pakistan-administrative-divisions/main/data'

    const [districts, tehsils, townsCsv] = await Promise.all([
      fetchJson(`${BASE}/all-district.json`),
      fetchJson(`${BASE}/all-tehsil.json`),
      fetchCsv('https://opendata.com.pk/dataset/e1e7b831-9b38-4c04-98c1-cb500a29ef76/resource/a20dc97b-5b2d-48d6-9632-ce696a744b3f/download/pakistani-cities-towns-and-villages-with-districts.csv').catch(() => ''),
    ])

    // Build district → province map from open-admin districts
    const districtProvinceMap = new Map<string, string>()
    for (const d of districts) {
      const rawProvince = d.ancestors?.[0]?.name?.en || 'Unknown'
      const province = PROVINCE_MAP[rawProvince] || rawProvince
      districtProvinceMap.set(d.name.en.toLowerCase(), province)
    }

    // Parse towns CSV and map to provinces
    const towns = townsCsv ? parseCsv(townsCsv) : []
    const townCities = towns
      .map((t) => ({
        name: t.name,
        province: districtProvinceMap.get(t.district.toLowerCase()) || 'Unknown',
        lat: 0,
        lng: 0,
      }))
      .filter((c) => c.name && c.province !== 'Unknown')

    const allItems = [...districts, ...tehsils]
    const adminCities = allItems.map(extractCity).filter((c) => c.name && c.province !== 'Unknown')

    const combined = [...adminCities, ...townCities]

    const seen = new Set<string>()
    const unique = combined.filter((c) => {
      const key = `${c.name.toLowerCase()}|${c.province}`
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
