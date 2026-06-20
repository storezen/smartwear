const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '../database.json')
const DEFAULT_STOCK = 99

if (!fs.existsSync(dbPath)) {
  console.error('database.json not found')
  process.exit(1)
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
const products = db.products || []

let updated = 0
let skippedInactive = 0
let alreadyInStock = 0

for (const product of products) {
  if (product.is_active === false) {
    skippedInactive++
    continue
  }

  const stock = product.stock ?? 0
  if (stock > 0) {
    alreadyInStock++
    continue
  }

  product.stock = DEFAULT_STOCK
  updated++
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8')

console.log(`\nStock fix complete (${products.length} products)`)
console.log(`  Set to ${DEFAULT_STOCK}: ${updated}`)
console.log(`  Already in stock:  ${alreadyInStock}`)
console.log(`  Inactive skipped:  ${skippedInactive}\n`)