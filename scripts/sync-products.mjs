import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase env vars not found in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const SUPABASE_PRODUCT_COLUMNS = new Set([
  'id', 'created_at', 'name', 'slug', 'description', 'price', 'compare_price',
  'images', 'category_slug', 'brand', 'stock', 'rating', 'reviews_count',
  'specifications', 'is_featured', 'is_active', 'upsell_accessories', 'cost_price',
  'colors'
])

function stripNonProductFields(row) {
  const clean = {}
  for (const key of SUPABASE_PRODUCT_COLUMNS) {
    if (row[key] !== undefined) clean[key] = row[key]
  }
  return clean
}

async function main() {
  const backupPath = path.resolve(__dirname, '../database.json.backup')
  const raw = fs.readFileSync(backupPath, 'utf-8')
  const data = JSON.parse(raw)
  let products = data.products || []

  // Fix: all Active, stock 100, strip non-table columns
  products = products.map(p => stripNonProductFields({
    ...p,
    is_active: true,
    stock: 100,
    is_featured: p.is_featured ?? false,
    created_at: p.created_at || new Date().toISOString(),
  }))

  console.log(`Total products in backup: ${products.length}`)

  // Step 1: Delete all existing products
  console.log('\n--- Deleting existing products ---')
  let deleted = 0
  const BATCH = 500
  while (true) {
    const { data: ids, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .limit(BATCH)
    if (fetchError) { console.error('Fetch error:', fetchError); break }
    if (!ids || ids.length === 0) break
    const idList = ids.map(r => r.id)
    const { error: delError } = await supabase.from('products').delete().in('id', idList)
    if (delError) { console.error('Delete error:', delError); break }
    deleted += idList.length
    console.log(`  Deleted ${deleted} products...`)
  }
  console.log(`Total deleted: ${deleted}`)

  // Step 2: Upload products in batches
  console.log('\n--- Uploading products ---')
  const BATCH_SIZE = 100
  let uploaded = 0
  let errors = 0
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id', ignoreDuplicates: false })
    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message)
      errors++
    } else {
      uploaded += batch.length
    }
    console.log(`  Uploaded ${uploaded}/${products.length} products...`)
  }

  console.log(`\nDone! Uploaded: ${uploaded}, Errors: ${errors}`)
}

main().catch(console.error)
