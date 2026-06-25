import { NextResponse } from 'next/server'
import { getSnapshots } from '@/lib/market-data'

export async function GET() {
  try {
    const snapshots = await getSnapshots()
    return NextResponse.json(snapshots, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  } catch {
    return NextResponse.json([])
  }
}
