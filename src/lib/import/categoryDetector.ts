import type { ProductCategory } from "@/lib/categories-context"

const CATEGORY_NORMALIZATION: [RegExp, string][] = [
  [/smart\s*watch(es)?/i, "Smart Watches"],
  [/smartwatch(es)?/i, "Smart Watches"],
  [/watch(es)?/i, "Watches"],
  [/airpods?/i, "AirPods / Earbuds"],
  [/earbuds?/i, "AirPods / Earbuds"],
  [/wireless\s*earbuds?/i, "AirPods / Earbuds"],
  [/phone\s*case(s)?/i, "Phone Cases"],
  [/iphone\s*case(s)?/i, "iPhone Cases"],
  [/case(s)?/i, "Phone Cases"],
  [/accessor(y|ies)/i, "Accessories"],
  [/watch\s*accessor(y|ies)/i, "Watch Accessories"],
  [/charging/i, "Charging"],
  [/charger/i, "Charging"],
  [/power\s*bank/i, "Charging"],
  [/cable/i, "Charging"],
  [/screen\s*guard/i, "Accessories"],
  [/tempered\s*glass/i, "Accessories"],
  [/tag/i, "Accessories"],
  [/tracker/i, "Accessories"],
  [/audio/i, "Wireless Audio"],
  [/headphones?/i, "Wireless Audio"],
  [/speaker/i, "Wireless Audio"],
  [/bluetooth\s*speaker/i, "Wireless Audio"],
  [/fitness\s*band/i, "Smart Watches"],
  [/band/i, "Watch Accessories"],
  [/strap/i, "Watch Accessories"],
  [/wireless\s*charger/i, "Charging"],
  [/usb[-\s]*c/i, "Charging"],
  [/power\s*adapter/i, "Charging"],
]

const KEYWORD_CATEGORIES: [RegExp, string][] = [
  [/amoled|heart.?rate|gps|fitness|sport.*watch|smart.*band/i, "Smart Watches"],
  [/anc|noise.?cancel|driver|bass|tws/i, "Wireless Audio"],
  [/mAh|power.*bank|fast.*charg|pd\s*3\.0|qc\s*3\.0/i, "Charging"],
  [/drop.*protect|military.*grade|tpu|polycarbonate|screen.*protect/i, "Accessories"],
  [/bluetooth.*tracker|find.*(key|device)/i, "Accessories"],
]

export interface CategorySuggestion {
  name: string
  slug: string
  source: "csv" | "type" | "inferred" | "fallback"
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function normalizeCategoryName(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return ""

  for (const [pattern, replacement] of CATEGORY_NORMALIZATION) {
    if (pattern.test(trimmed)) return replacement
  }

  return trimmed
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function detectCategory(
  productCategory: string,
  type: string,
  title: string,
  bodyHtml: string,
  tags: string[],
  vendor: string,
): CategorySuggestion {
  const priority = productCategory || type

  if (priority) {
    const normalized = normalizeCategoryName(priority)
    if (normalized) {
      return { name: normalized, slug: slugify(normalized), source: "csv" }
    }
  }

  const text = `${title} ${bodyHtml} ${tags.join(" ")} ${vendor}`.toLowerCase()

  for (const [pattern, name] of KEYWORD_CATEGORIES) {
    if (pattern.test(text)) {
      return { name, slug: slugify(name), source: "inferred" }
    }
  }

  for (const [pattern, name] of CATEGORY_NORMALIZATION) {
    if (pattern.test(text)) {
      return { name, slug: slugify(name), source: "inferred" }
    }
  }

  return { name: "Uncategorized", slug: "uncategorized", source: "fallback" }
}

export function collectCategories(
  categories: ProductCategory[],
  detections: CategorySuggestion[],
): { existing: ProductCategory[]; newCategories: Omit<ProductCategory, "id">[] } {
  const existingNames = new Set(categories.map((c) => c.name.toLowerCase()))
  const existingMap = new Map(categories.map((c) => [c.name.toLowerCase(), c]))
  const newCategories: Omit<ProductCategory, "id">[] = []
  const seenNew = new Set<string>()

  for (const d of detections) {
    const key = d.name.toLowerCase()
    if (existingNames.has(key)) continue
    if (seenNew.has(key)) continue
    seenNew.add(key)

    if (d.name !== "Uncategorized" || !existingNames.has("uncategorized")) {
      newCategories.push({ name: d.name, slug: d.slug })
    }
  }

  return {
    existing: categories,
    newCategories,
  }
}
