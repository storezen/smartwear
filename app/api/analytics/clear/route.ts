export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'
import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    if (env.NODE_ENV === 'production' && supabase) {
      // In production, delete all rows from analytics table
      // We use .neq('id', '0') as a hack to delete all rows since delete() requires a filter
      const { error } = await supabase.from('analytics').delete().neq('id', '0')
      if (error) {
        console.error("Failed to clear supabase analytics:", error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    // Local DB
    const db = await getDb()
    db.analytics = []
    await saveDb(db)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
