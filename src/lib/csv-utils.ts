import type { Product } from "./products"

export const CSV_TEMPLATE = `name,price,category,image,originalPrice,description,inStock,featured,sku,quantity,lowStockThreshold,rating,reviews,specs,images
"ProSport Smart Watch",12499,Clothing,"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85",15999,"Water-resistant fitness smart watch with heart rate monitor.",TRUE,TRUE,SPRT-001,85,10,4.8,156,"[{""label"":""Battery"",""value"":""7 Days""}]","https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85|https://images.unsplash.com/photo-1546868871-af0de0e72c43?w=800&q=85"
"AirBuds Pro",8999,Shoes,"https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=800&q=85",11999,"Premium wireless earbuds with active noise cancellation.",TRUE,TRUE,AIRB-001,120,10,4.7,89,"[{""label"":""Battery"",""value"":""24 Hours""}]","https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=800&q=85"`

export const CSV_HEADERS = [
  "name", "price", "category", "image", "originalPrice", "description",
  "inStock", "featured", "sku", "quantity", "lowStockThreshold",
  "rating", "reviews", "specs", "images",
]

const CANONICAL_HEADERS = [
  "name", "price", "category", "image", "originalPrice", "description",
  "inStock", "featured", "sku", "quantity", "lowStockThreshold",
  "rating", "reviews", "specs", "images",
]

const KNOWN_MAPPINGS: [string, string][] = [
  ["name", "name"], ["product name", "name"], ["productname", "name"],
  ["product", "name"], ["title", "name"], ["item name", "name"],
  ["price", "price"], ["rate", "price"], ["mrp", "price"],
  ["amount", "price"], ["cost", "price"], ["unit price", "price"],
  ["list price", "price"], ["retail price", "price"], ["selling price", "price"],
  ["category", "category"], ["categories", "category"], ["product category", "category"],
  ["type", "category"], ["department", "category"],
  ["image", "image"], ["image url", "image"], ["image link", "image"],
  ["image src", "image"], ["main image", "image"], ["photo", "image"],
  ["picture", "image"], ["image source", "image"],
  ["originalprice", "originalPrice"], ["original price", "originalPrice"],
  ["orig price", "originalPrice"], ["old price", "originalPrice"],
  ["list price", "originalPrice"], ["rrp", "originalPrice"],
  ["description", "description"], ["desc", "description"],
  ["details", "description"], ["product description", "description"],
  ["instock", "inStock"], ["in stock", "inStock"], ["stock", "inStock"],
  ["availability", "inStock"], ["available", "inStock"],
  ["featured", "featured"], ["is featured", "featured"],
  ["feature product", "featured"], ["show on home", "featured"],
  ["sku", "sku"], ["product sku", "sku"], ["code", "sku"],
  ["product code", "sku"], ["item code", "sku"], ["id", "sku"],
  ["quantity", "quantity"], ["qty", "quantity"], ["stock quantity", "quantity"],
  ["on hand", "quantity"], ["inventory", "quantity"],
  ["lowstockthreshold", "lowStockThreshold"], ["low stock threshold", "lowStockThreshold"],
  ["low stock", "lowStockThreshold"], ["low stock alert", "lowStockThreshold"],
  ["reorder point", "lowStockThreshold"], ["min stock", "lowStockThreshold"],
  ["specs", "specs"], ["specifications", "specifications"],
  ["specification", "specs"], ["features", "specs"],
  ["images", "images"], ["additional images", "images"],
  ["extra images", "images"], ["gallery", "images"],
  ["photos", "images"], ["image gallery", "images"],
  ["rating", "rating"], ["ratings", "rating"], ["stars", "rating"],
  ["reviews", "reviews"], ["review count", "reviews"], ["review", "reviews"],
]

function normalizeHeader(raw: string): string {
  let h = raw.trim().toLowerCase()
  h = h.replace(/\(.*?\)/g, "").trim()
  h = h.replace(/[:\-–—]/g, " ").replace(/\s+/g, " ").trim()
  for (const [from, to] of KNOWN_MAPPINGS) {
    if (h === from) return to
  }
  for (const canon of CANONICAL_HEADERS) {
    if (h.includes(canon)) return canon
  }
  return h
}

export interface CsvRow {
  name: string
  price: number
  category: string
  image: string
  originalPrice?: number
  description: string
  inStock: boolean
  featured: boolean
  sku: string
  quantity: number
  lowStockThreshold: number
  rating?: number
  reviews?: number
  specs: string
  images: string
}

export interface CsvParseResult {
  success: true
  products: Omit<Product, "id">[]
  errors: { row: number; message: string }[]
}

export interface CsvParseError {
  success: false
  error: string
}

export function parseCsvProducts(text: string): CsvParseResult | CsvParseError {
  const cleaned = text.replace(/^\ufeff/, "").trim()
  const lines = cleaned.split(/\r?\n/)
  if (lines.length < 2) return { success: false, error: "CSV must have a header row and at least one data row" }

  const rawHeaders = parseCsvLine(lines[0])
  const headerToIndex: Record<string, number> = {}
  for (let hi = 0; hi < rawHeaders.length; hi++) {
    const canon = normalizeHeader(rawHeaders[hi])
    if (!(canon in headerToIndex)) headerToIndex[canon] = hi
  }
  const required = ["name", "price", "category", "image"]
  const missing = required.filter((r) => !(r in headerToIndex))
  if (missing.length > 0) return { success: false, error: `Missing required columns: ${missing.join(", ")}` }

  const col = (row: string[], name: string) => {
    const idx = headerToIndex[name]
    return idx !== undefined ? (row[idx] || "") : ""
  }

  const products: Omit<Product, "id">[] = []
  const errors: { row: number; message: string }[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const values = parseCsvLine(line)

    const rowNum = i + 1
    const rowErrors: string[] = []

    const name = col(values, "name").trim()
    if (!name) rowErrors.push("name is required")

    const priceRaw = col(values, "price")
    const price = Number(priceRaw)
    if (!priceRaw || isNaN(price) || price <= 0) rowErrors.push("price must be a positive number")

    const category = col(values, "category").trim()
    if (!category) rowErrors.push("category is required")

    const image = col(values, "image").trim()
    if (!image) rowErrors.push("image URL is required")

    if (rowErrors.length > 0) {
      errors.push({ row: rowNum, message: rowErrors.join("; ") })
      continue
    }

    const specsRaw = col(values, "specs")
    let specs: { label: string; value: string }[] = []
    if (specsRaw) {
      try {
        const parsed = JSON.parse(specsRaw)
        if (Array.isArray(parsed)) specs = parsed
      } catch {
        errors.push({ row: rowNum, message: "Invalid specs JSON, skipping" })
      }
    }

    const imagesRaw = col(values, "images")
    let images: string[] = []
    if (imagesRaw) {
      images = imagesRaw.split("|").map((u) => u.trim()).filter(Boolean)
    }

    const originalPriceRaw = col(values, "originalPrice")
    const descriptionRaw = col(values, "description")
    const inStockRaw = col(values, "inStock")
    const featuredRaw = col(values, "featured")
    const skuRaw = col(values, "sku")
    const quantityRaw = col(values, "quantity")
    const thresholdRaw = col(values, "lowStockThreshold")
    const ratingRaw = col(values, "rating")
    const reviewsRaw = col(values, "reviews")

    products.push({
      name,
      price,
      category,
      image,
      originalPrice: originalPriceRaw ? Number(originalPriceRaw) || undefined : undefined,
      description: descriptionRaw || "",
      inStock: inStockRaw?.toUpperCase() === "TRUE" || inStockRaw === "1",
      featured: featuredRaw?.toUpperCase() === "TRUE" || featuredRaw === "1",
      sku: skuRaw || "",
      quantity: quantityRaw ? Math.max(0, Number(quantityRaw)) || 0 : 0,
      lowStockThreshold: thresholdRaw ? Math.max(1, Number(thresholdRaw)) || 1 : 1,
      rating: ratingRaw ? Number(ratingRaw) || undefined : undefined,
      reviews: reviewsRaw ? Number(reviewsRaw) || undefined : undefined,
      specs,
      images: images.length > 0 ? images : undefined,
    })
  }

  return { success: true, products, errors }
}

export function exportProductsCsv(products: Product[]): string {
  const header = CSV_HEADERS.join(",")
  const rows = products.map((p) => {
    const row = [
      csvEscape(p.name),
      p.price,
      csvEscape(p.category),
      csvEscape(p.image),
      p.originalPrice || "",
      csvEscape(p.description),
      p.inStock ? "TRUE" : "FALSE",
      p.featured ? "TRUE" : "FALSE",
      p.sku || "",
      p.quantity,
      p.lowStockThreshold,
      p.rating || "",
      p.reviews || "",
      p.specs?.length > 0 ? csvEscape(JSON.stringify(p.specs)) : "",
      p.images && p.images.length > 0 ? csvEscape(p.images.join("|")) : "",
    ]
    return row.join(",")
  })
  return [header, ...rows].join("\n")
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function csvEscape(val: unknown): string {
  const s = String(val ?? "")
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}
