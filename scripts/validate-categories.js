const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { getProductCategory } = require('../lib/product-category');

const inputFile = path.join(__dirname, '../filtered_products.csv');

const data = Papa.parse(fs.readFileSync(inputFile, 'utf8'), {
  header: true,
  skipEmptyLines: true,
}).data;

const byHandle = new Map();
for (const row of data) {
  if (!row.Handle || byHandle.has(row.Handle)) continue;
  byHandle.set(row.Handle, row);
}

const products = [...byHandle.values()];
const issues = [];

function flag(category, reason, product) {
  issues.push({ category, reason, title: product.Title, handle: product.Handle, tags: product.Tags, type: product.Type });
}

for (const p of products) {
  const cat = getProductCategory(p.Title, p.Tags || '', p.Type || '', p.Handle);
  const blob = `${p.Title} ${p.Tags} ${p.Type} ${p.Handle}`.toLowerCase();

  if (cat === 'Accessories') {
    if (/\b(smartwatch|smart watch|galaxy watch|watch 9 max|watch 10 max|series 9|series 10|series 11|amoled)\b/i.test(blob)) {
      flag(cat, 'Looks like smart watch', p);
    } else if (/\b(rolex|rlx|rolx|patek|tissot|analog|quartz|automatic|sgw\d+)\b/i.test(blob) && /\bwatch/i.test(blob)) {
      flag(cat, 'Looks like analog watch', p);
    } else if (/\b(ladies|women)\b/i.test(blob) && /\bwatch/i.test(blob)) {
      flag(cat, 'Looks like ladies watch', p);
    } else if (/\bcase\b/i.test(blob) && /\b(iphone|silicon case|premium case|samsung|galaxy phone)\b/i.test(blob)) {
      flag(cat, 'Looks like phone case', p);
    }
  }

  if (cat === 'Watch Bands & Straps') {
    if (/\b(chain watch|strap watch|band watch|tissot.*watch|tomi.*watch)\b/i.test(blob)) {
      flag(cat, 'Band category but title is a watch', p);
    }
  }

  if (cat === 'Smart Watches') {
    if (/\b(case|protector|tempered glass|screen protector)\b/i.test(blob) && /\b(apple watch|iwatch)\b/i.test(blob)) {
      flag(cat, 'Smart watch but is Apple Watch accessory', p);
    }
    if (/\bultra[- ]?thin\b/i.test(p.Title || '')) {
      flag(cat, 'Ultra-thin case misclassified as smart', p);
    }
  }
}

console.log(`Validated ${products.length} unique products`);
console.log(`Potential issues: ${issues.length}\n`);

const grouped = {};
for (const i of issues) {
  grouped[i.reason] = grouped[i.reason] || [];
  grouped[i.reason].push(i);
}

for (const [reason, list] of Object.entries(grouped)) {
  console.log(`\n== ${reason} (${list.length}) ==`);
  list.slice(0, 8).forEach((i) => console.log(`  - [${i.category}] ${i.title}`));
  if (list.length > 8) console.log(`  ... +${list.length - 8} more`);
}