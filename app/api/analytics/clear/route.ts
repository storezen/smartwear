export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getDb, saveDb } from '@/lib/db'
import { env } from '@/lib/env'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    if (env.NODE_ENV === 'production' && supabase) {
      const { error } = await supabase.from('analytics').delete().neq('id', '0')
      if (error) {
        console.warn("Supabase Analytics Clear Error (falling back to memory):", error.message)
      } else {
        return NextResponse.json({ success: true })
      }
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
