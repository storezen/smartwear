export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'

import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    if (env.NODE_ENV === 'production' && supabase) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      const { data, error } = await supabase.from('analytics')
        .select('*')
        .gte('timestamp', twoHoursAgo)
        .order('timestamp', { ascending: false })
        .limit(100)
      
      if (!error && data) {
        return NextResponse.json(data)
      }
      console.warn("Supabase Analytics GET Error (falling back to memory):", error?.message)
    }
    const db = await getDb()
    const twoHoursAgoTime = Date.now() - 2 * 60 * 60 * 1000
    const filteredAnalytics = db.analytics.filter(e => new Date(e.timestamp).getTime() >= twoHoursAgoTime)
    return NextResponse.json(filteredAnalytics)
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
      const { error } = await supabase.from('analytics').insert([newEvent])
      if (!error) {
        return NextResponse.json({ success: true, event: newEvent }, { status: 201 })
      }
      console.warn("Supabase Analytics Insert Error (falling back to memory):", error.message)
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
