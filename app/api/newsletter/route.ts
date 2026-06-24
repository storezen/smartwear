import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const db = await getDb()
    db.subscribers = db.subscribers || []

    // Avoid duplicates
    if (db.subscribers.some((s: any) => s.email === email)) {
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    db.subscribers.push({
      email,
      subscribed_at: new Date().toISOString(),
    })
    await saveDb(db)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Newsletter] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
