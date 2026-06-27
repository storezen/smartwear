const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = 'https://nubalbfizbaenzyevqco.supabase.co'
const envPath = path.join(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars = Object.fromEntries(
  envContent.split('\n').filter(l => l.trim() && !l.startsWith('#')).map(l => {
    const eq = l.indexOf('=')
    return [l.slice(0, eq).trim(), l.slice(eq + 1).trim()]
  })
)
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

async function main() {
  const sb = createClient(supabaseUrl, supabaseKey)

  console.log('Deleting all products from Supabase...')
  const { error, data } = await sb.from('products').delete().neq('id', 'placeholder')
  if (error) {
    console.error('Supabase delete error:', error.message)
  } else {
    console.log('Supabase products deleted successfully')
  }

  // Clear local database.json files
  for (const dbPath of [
    path.join(__dirname, '../database.json'),
    '/tmp/database.json',
  ]) {
    try {
      const existing = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
      existing.products = []
      fs.writeFileSync(dbPath, JSON.stringify(existing, null, 2))
      console.log(`Cleared ${dbPath}`)
    } catch (e) {
      console.error(`Failed to clear ${dbPath}:`, e.message)
    }
  }

  console.log('Done! All products cleared.')
}

main().catch(console.error)
