const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nubalbfizbaenzyevqco.supabase.co'
// Read from .env.local manually
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = Object.fromEntries(
  envContent.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const eq = l.indexOf('=')
    return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()]
  })
)
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local')
  process.exit(1)
}

const sb = createClient(supabaseUrl, supabaseKey)

async function main() {
  // Extract products from the git revision before the clear
  const { execSync } = require('child_process')
  const tmpFile = path.join(__dirname, '../.restore-tmp.json')
  execSync(`git show c52d115:database.json > "${tmpFile}"`, { cwd: path.join(__dirname, '..') })
  const raw = fs.readFileSync(tmpFile, 'utf8')
  const db = JSON.parse(raw)
  const products = db.products || []
  try { fs.unlinkSync(tmpFile) } catch {}

  console.log(`Found ${products.length} products in git history`)

  // Insert into Supabase in batches of 100
  const BATCH = 100
  let inserted = 0
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || '',
      price: p.price,
      compare_price: p.compare_price || null,
      images: p.images || [],
      category_slug: p.category_slug || '',
      brand: p.brand || '',
      stock: p.stock ?? 100,
      rating: p.rating ?? 0,
      reviews_count: p.reviews_count ?? 0,
      specifications: p.specifications || {},
      is_featured: p.is_featured ?? false,
      is_active: p.is_active !== false,
      upsell_accessories: p.upsell_accessories || [],
      created_at: p.created_at || new Date().toISOString(),
    }))
    const { error } = await sb.from('products').upsert(batch, { onConflict: 'id', ignoreDuplicates: false })
    if (error) {
      console.error(`Batch ${i / BATCH + 1} error:`, error.message)
    } else {
      inserted += batch.length
      console.log(`Inserted batch ${i / BATCH + 1}: ${batch.length} products (total ${inserted})`)
    }
  }

  // Also restore the local database.json
  const dbPaths = [
    path.join(__dirname, '../database.json'),
    '/tmp/database.json',
  ]
  for (const dbPath of dbPaths) {
    try {
      const existing = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      existing.products = products
      existing.settings = existing.settings || db.settings
      fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2))
      console.log(`Restored ${dbPath}`)
    } catch (e) {
      console.error(`Failed to write ${dbPath}:`, e.message)
    }
  }

  console.log(`\nDone! ${inserted} products restored to Supabase.`)
}

main().catch(console.error)
