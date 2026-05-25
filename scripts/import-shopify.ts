import fs from "fs"
import path from "path"
import Papa from "papaparse"
import { prisma } from "../src/lib/db/prisma"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, "..")

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

async function main() {
  const csvPath = path.join(ROOT, "products_export_1.csv")
  if (!fs.existsSync(csvPath)) {
    console.error(`Error: products.csv not found at ${csvPath}`)
    process.exit(1)
  }

  const csvFile = fs.readFileSync(csvPath, "utf-8")
  const parsed = Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
  })

  const rows = parsed.data as any[]
  console.log(`Parsed ${rows.length} rows from CSV.`)

  // Group by Handle
  const productsByHandle: Record<string, any[]> = {}
  for (const row of rows) {
    const handle = row["Handle"]
    if (!handle) continue
    if (!productsByHandle[handle]) {
      productsByHandle[handle] = []
    }
    productsByHandle[handle].push(row)
  }

  console.log(`Found ${Object.keys(productsByHandle).length} unique products.`)

  // Clear existing products and categories for clean import
  await prisma.product.deleteMany({})
  await prisma.category.deleteMany({})
  console.log("Cleared existing products and categories.")

  const categoriesSet = new Set<string>()

  let imported = 0
  for (const [handle, groupRows] of Object.entries(productsByHandle)) {
    // The first row with a Title usually contains the base product data
    const baseRow = groupRows.find(r => r["Title"]) || groupRows[0]

    const title = baseRow["Title"] || handle
    const description = baseRow["Body (HTML)"] || ""
    const tagsStr = baseRow["Tags"] || ""
    const tags = tagsStr.split(",").map((t: string) => t.trim()).filter(Boolean)
    
    // Category mapping
    let categoryName = baseRow["Type"] || baseRow["Product Category"] || "Uncategorized"
    // Sometimes Product Category is a breadcrumb like "Apparel & Accessories > Jewelry > Smart Watches"
    if (categoryName.includes(">")) {
      categoryName = categoryName.split(">").pop()?.trim() || "Uncategorized"
    }
    const categorySlug = slugify(categoryName)
    categoriesSet.add(categoryName)

    // Collect all unique images
    const images: string[] = []
    groupRows.forEach(row => {
      const img = row["Image Src"]
      if (img && !images.includes(img)) {
        images.push(img)
      }
    })
    
    // Main image is the one with Image Position = 1, or first available
    const mainRowImg = groupRows.find(r => r["Image Position"] === "1")?.["Image Src"]
    const mainImage = mainRowImg || (images.length > 0 ? images[0] : "")

    // Collect variants
    const variants: any[] = []
    const optionNames = new Set<string>()

    groupRows.forEach(row => {
      if (!row["Variant Price"]) return // Not a variant row
      
      const variant: any = {
        price: parseFloat(row["Variant Price"]) || 0,
        originalPrice: parseFloat(row["Variant Compare At Price"]) || null,
        sku: row["Variant SKU"] || "",
        inventory: parseInt(row["Variant Inventory Qty"]) || 100,
        image: row["Variant Image"] || "",
        options: {}
      }

      for (let i = 1; i <= 3; i++) {
        const optName = row[`Option${i} Name`]
        const optValue = row[`Option${i} Value`]
        if (optName && optValue) {
          optionNames.add(optName)
          variant.options[optName] = optValue
        }
      }
      
      // Shopify default title fallback
      if (Object.keys(variant.options).length === 1 && variant.options["Title"] === "Default Title") {
        optionNames.delete("Title")
        variant.options = {}
      }

      variants.push(variant)
    })

    // If no variants found, create a default one from base row
    if (variants.length === 0) {
      variants.push({
        price: parseFloat(baseRow["Variant Price"]) || 0,
        originalPrice: parseFloat(baseRow["Variant Compare At Price"]) || null,
        sku: baseRow["Variant SKU"] || "",
        inventory: parseInt(baseRow["Variant Inventory Qty"]) || 100,
        options: {}
      })
    }

    const basePrice = variants.length > 0 ? variants[0].price : 0
    const originalPrice = variants.length > 0 ? variants[0].originalPrice : null

    // Determine status
    const isPublished = baseRow["Published"] === "true" || baseRow["Status"] === "active"
    const status = isPublished ? "published" : "draft"

    await prisma.product.create({
      data: {
        name: title,
        handle: handle,
        description,
        price: basePrice,
        originalPrice: originalPrice,
        image: mainImage,
        images: images,
        category: categorySlug,
        tags: tags,
        status: status,
        variants: variants,
        optionNames: Array.from(optionNames),
        inStock: variants.some(v => v.inventory > 0),
        featured: tags.includes("hot") || tags.includes("featured")
      }
    })
    
    imported++
    console.log(`Imported: ${title}`)
  }

  // Create categories
  for (const catName of Array.from(categoriesSet)) {
    const slug = slugify(catName)
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: {
        name: catName,
        slug: slug,
        showInNavbar: true,
        showOnHomepage: true,
      }
    })
  }

  console.log(`\nSuccess! Imported ${imported} products and ${categoriesSet.size} categories.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
