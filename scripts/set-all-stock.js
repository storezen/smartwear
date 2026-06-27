const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://nubalbfizbaenzyevqco.supabase.co'
const envPath = path.join(__dirname, '../.env.local')
const c = fs.readFileSync(envPath, 'utf8')
const vars = Object.fromEntries(
  c.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const eq = l.indexOf('=')
    return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()]
  })
)

const sb = createClient(supabaseUrl, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function main() {
  // Update ALL products to stock=100 in Supabase (single query)
  const { error, data } = await sb.from('products').update({ stock: 100 }).neq('id', 'placeholder').select()
  if (error) throw error
  console.log(`Supabase updated: ${data?.length || 0} products set to stock=100`)

  // Also update local DB files
  for (const dbPath of [
    path.join(__dirname, '../database.json'),
    '/tmp/database.json'
  ]) {
    try {
      const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      let localUpdated = 0
      for (const p of db.products || []) {
        if (p.stock !== 100) { p.stock = 100; localUpdated++ }
      }
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
      console.log(`Updated ${dbPath}: ${localUpdated} products`)
    } catch {}
  }
}

main().catch(console.error)
