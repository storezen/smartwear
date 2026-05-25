import type { ParsedProduct, ParsedVariant, ImportError, ImportWarning } from "./types"

export interface ValidationResult {
  valid: boolean
  errors: ImportError[]
  warnings: ImportWarning[]
}

export function validateProduct(
  product: ParsedProduct,
  existingHandles: Set<string>,
  existingSkus: Set<string>,
  row: number,
): ValidationResult {
  const errors: ImportError[] = []
  const warnings: ImportWarning[] = []

  if (!product.title || !product.title.trim()) {
    errors.push({ row, handle: product.handle, field: "title", message: "Product title is missing" })
  }

  if (existingHandles.has(product.handle)) {
    warnings.push({ row, handle: product.handle, field: "handle", message: `Duplicate handle "${product.handle}" — will be skipped by default` })
  }

  if (!product.price || product.price <= 0) {
    const variant = product.variants[0]
    if (variant && variant.price > 0) {
      product.price = variant.price
    } else {
      errors.push({ row, handle: product.handle, field: "price", message: "Product price is missing or invalid" })
    }
  }

  if (product.image && !isValidUrl(product.image)) {
    warnings.push({ row, handle: product.handle, field: "image", message: `Invalid image URL: ${product.image}` })
  }

  for (const img of product.images) {
    if (img && !isValidUrl(img)) {
      warnings.push({ row, handle: product.handle, field: "image", message: `Invalid image URL: ${img}` })
    }
  }

  const seenSkus = new Set<string>()
  for (let i = 0; i < product.variants.length; i++) {
    const v = product.variants[i]
    const vRow = row + i

    if (v.sku && seenSkus.has(v.sku)) {
      warnings.push({ row: vRow, handle: product.handle, field: "variantSku", message: `Duplicate variant SKU: ${v.sku}` })
    }
    if (v.sku) seenSkus.add(v.sku)

    if (v.sku && existingSkus.has(v.sku)) {
      warnings.push({ row: vRow, handle: product.handle, field: "variantSku", message: `Variant SKU "${v.sku}" already exists in catalog` })
    }

    if (v.price <= 0) {
      if (product.price > 0) {
        v.price = product.price
      } else {
        errors.push({ row: vRow, handle: product.handle, field: "variantPrice", message: "Variant price is missing or invalid" })
      }
    }

    if (v.inventory < 0) {
      v.inventory = 0
      warnings.push({ row: vRow, handle: product.handle, field: "variantInventoryQty", message: "Negative inventory converted to 0" })
    }
  }

  if (!product.category) {
    warnings.push({ row, handle: product.handle, field: "category", message: "Category could not be detected" })
  }

  return { valid: errors.length === 0, errors, warnings }
}

export function validateImageUrl(url: string): boolean {
  if (!url) return true
  return isValidUrl(url) || url.startsWith("/uploads/") || url.startsWith("data:image")
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateCsvFormat(headers: string[]): string | null {
  const required = ["Title"]
  const missing = required.filter((r) => !headers.some((h) => h.toLowerCase().trim() === r.toLowerCase()))

  if (missing.length > 0) {
    return `Missing required column: ${missing.join(", ")}`
  }

  return null
}
