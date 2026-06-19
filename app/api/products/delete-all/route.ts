import { NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import fs from 'fs'
import path from 'path'

export async function DELETE() {
  try {
    if (isSupabaseConfigured() && supabase) {
      // In Supabase, delete all products
      const { error } = await supabase.from('products').delete().neq('id', 'placeholder')
      if (error) throw error;
    } else {
      // Local JSON DB
      const dbPath = path.join(process.cwd(), 'database.json')
      let dbData = { products: [] }
      if (fs.existsSync(dbPath)) {
        const fileContent = fs.readFileSync(dbPath, 'utf8')
        try {
          dbData = JSON.parse(fileContent)
        } catch(e) {}
      }
      dbData.products = []
      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    }

    return NextResponse.json({ success: true, message: "All products deleted successfully" })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
