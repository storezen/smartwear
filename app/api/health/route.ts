export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export async function GET() {
  const health = {
    supabaseConfigured: isSupabaseConfigured(),
    supabaseConnection: false,
    tables: {
      orders: false,
      products: false,
      settings: false,
      marketing: false,
      analytics: false
    },
    message: ''
  }

  if (health.supabaseConfigured && supabase) {
    try {
      // Check each table with a fast limit(1) query
      const tables = ['orders', 'products', 'settings', 'marketing', 'analytics']
      let allConnected = true
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('id').limit(1)
        if (error) {
          allConnected = false
        } else {
          (health.tables as any)[table] = true
        }
      }
      
      health.supabaseConnection = allConnected
      if (!allConnected) {
        health.message = 'Some Supabase tables are missing. The app is falling back to memory storage which may be lost on Vercel restart.'
      } else {
        health.message = 'All systems operational. Vercel is perfectly synced with Supabase.'
      }
      
    } catch (err: any) {
      health.supabaseConnection = false
      health.message = 'Error connecting to Supabase: ' + err.message
    }
  } else {
    health.message = 'Supabase is not configured. Running purely on memory fallback. Data will not persist.'
  }

  return NextResponse.json(health)
}
