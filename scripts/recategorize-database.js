const fs = require('fs');
const path = require('path');
const { getProductCategory, getCategorySlug } = require('../lib/product-category');

const dbPath = path.join(__dirname, '../database.json');

if (!fs.existsSync(dbPath)) {
  console.error('database.json not found');
  process.exit(1);
}

const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const products = db.products || [];

const before = {};
const after = {};

for (const product of products) {
  const tags = Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || '';
  const beforeSlug = product.category_slug || 'none';
  before[beforeSlug] = (before[beforeSlug] || 0) + 1;

  const categoryName = getProductCategory(product.name || '', tags, '', product.slug || '');
  const newSlug = getCategorySlug(categoryName);
  product.category_slug = newSlug;

  after[newSlug] = (after[newSlug] || 0) + 1;
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');

console.log(`\nRecategorized ${products.length} products in database.json\n`);
console.log('--- Before ---');
Object.entries(before)
  .sort((a, b) => b[1] - a[1])
  .forEach(([slug, count]) => console.log(`${slug.padEnd(22)} : ${count}`));

console.log('\n--- After ---');
Object.entries(after)
  .sort((a, b) => b[1] - a[1])
  .forEach(([slug, count]) => console.log(`${slug.padEnd(22)} : ${count}`));

console.log('\nDone.\n');