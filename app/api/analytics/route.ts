import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    return NextResponse.json(db.analytics)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const db = await getDb()
    const newEvent = {
      id: `evt-${Date.now()}`,
      event_name: data.event_name,
      value: data.value || 0,
      timestamp: new Date().toISOString()
    }
    db.analytics.unshift(newEvent)
    // Keep only last 100 events to avoid massive JSON
    if (db.analytics.length > 100) {
      db.analytics.pop()
    }
    await saveDb(db)
    return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
