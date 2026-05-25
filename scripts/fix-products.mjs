import fs from "fs"

let content = fs.readFileSync("src/lib/products.ts", "utf8")

// Remove duplicate lines 23-25 (second sku/quantity/lowStockThreshold in interface)
const dupPattern = `  rating?: number\n  reviews?: number\n  sku: string\n  quantity: number\n  lowStockThreshold: number\n}`
content = content.replace(dupPattern, `  rating?: number\n  reviews?: number\n}`)

// Fix each product: the broken line pattern is:
// rating: 4.8,\n    reviews: 156,    sku: `ATH-${id.padStart(4, "0")}`,
// quantity: Math.floor(Math.random() * 100) + 20,
// lowStockThreshold: 10,
// specs: [
// Need to replace with actual values

const productData = [
  { id: "1", qty: 85, thresh: 10 },
  { id: "2", qty: 120, thresh: 10 },
  { id: "3", qty: 200, thresh: 15 },
  { id: "4", qty: 60, thresh: 10 },
  { id: "5", qty: 45, thresh: 8 },
  { id: "6", qty: 150, thresh: 15 },
  { id: "7", qty: 300, thresh: 20 },
  { id: "8", qty: 500, thresh: 25 },
  { id: "9", qty: 400, thresh: 20 },
  { id: "10", qty: 90, thresh: 10 },
  { id: "11", qty: 75, thresh: 10 },
  { id: "12", qty: 250, thresh: 15 },
]

for (const p of productData) {
  const oldPattern = `    rating:`,
  // Just replace the pattern more carefully
  const oldFull = `    sku: \`ATH-\${id.padStart(4, "0")}\`,
    quantity: Math.floor(Math.random() * 100) + 20,
    lowStockThreshold: 10,`
  const newFull = `    sku: "ATH-${p.id.padStart(4, "0")}",
    quantity: ${p.qty},
    lowStockThreshold: ${p.thresh},`
  content = content.replace(oldFull, newFull)
}

// Also fix the review line that has the sku appended on same line
// Pattern: reviews: 156,    sku: `ATH-...
content = content.replace(/reviews: (\d+),\s+sku: `ATH-\${id\.padStart\(4, "0"\)}`/g, (match, reviews) => {
  // Extract which product this is based on surrounding context... just keep the reviews value
  return `reviews: ${reviews}`
})

fs.writeFileSync("src/lib/products.ts", content)
console.log("Fixed all products")
