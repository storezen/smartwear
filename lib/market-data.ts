import fs from 'fs/promises'
import path from 'path'

const SNAPSHOTS_PATH = '/tmp/market-snapshots.json'

interface Snapshot {
  date: string
  categories: { label: string; avgPrice: number; totalSold: number; productCount: number }[]
  brandMentions: Record<string, number>
  trendingCount: number
}

let memoryCache: Snapshot[] | null = null

export async function getSnapshots(): Promise<Snapshot[]> {
  if (memoryCache) return memoryCache
  try {
    const raw = await fs.readFile(SNAPSHOTS_PATH, 'utf-8')
    memoryCache = JSON.parse(raw)
    return memoryCache || []
  } catch {
    return []
  }
}

function computeSnapshot(data: any): Snapshot {
  return {
    date: new Date().toISOString().split('T')[0],
    categories: (data.categories || []).map((c: any) => ({
      label: c.label,
      avgPrice: c.products.length
        ? Math.round(c.products.reduce((s: number, p: any) => {
            const price = parseInt((p.price || '').replace(/[^0-9]/g, '')) || 0
            return s + price
          }, 0) / c.products.length)
        : 0,
      totalSold: c.products.reduce((s: number, p: any) => s + p.sold, 0),
      productCount: c.products.length,
    })),
    brandMentions: data.brandMentions || {},
    trendingCount: (data.trending || []).length,
  }
}

export async function saveSnapshot(data: any): Promise<void> {
  try {
    const snapshots = await getSnapshots()
    const today = new Date().toISOString().split('T')[0]
    const existing = snapshots.findIndex((s: Snapshot) => s.date === today)
    const snapshot = computeSnapshot(data)
    if (existing >= 0) {
      snapshots[existing] = snapshot
    } else {
      snapshots.push(snapshot)
    }
    memoryCache = snapshots
    await fs.writeFile(SNAPSHOTS_PATH, JSON.stringify(snapshots))
  } catch (err) {
    console.error('[Market Snapshots] Save error:', err)
  }
}
