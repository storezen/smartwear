import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'

import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (env.NODE_ENV === 'production' && supabase) {
      const { data } = await supabase.from('analytics').select('*').order('timestamp', { ascending: false }).limit(100)
      return NextResponse.json(data || [])
    }
    const db = await getDb()
    return NextResponse.json(db.analytics)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const newEvent = {
      id: `evt-${Date.now()}`,
      event_name: data.event_name,
      value: data.value || 0,
      timestamp: new Date().toISOString()
    }

    if (env.NODE_ENV === 'production' && supabase) {
      await supabase.from('analytics').insert([newEvent])
      return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
    }

    const db = await getDb()
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
