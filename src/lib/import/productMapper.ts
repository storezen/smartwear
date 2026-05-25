import type { CsvRow, ImportRowGroup, ParsedProduct, ParsedVariant } from "./types"
import { detectCategory, type CategorySuggestion } from "./categoryDetector"
import { parseTags, generateAutoTags, mergeTags } from "./tagNormalizer"
import { validateProduct } from "./importValidator"
import type { ImportWarning } from "./types"

export interface MappedProductResult {
  products: ParsedProduct[]
  categoryDetections: CategorySuggestion[]
  warnings: ImportWarning[]
}

export function mapGroupsToProducts(
  groups: ImportRowGroup[],
  existingHandles: Set<string>,
  existingSkus: Set<string>,
): MappedProductResult {
  const products: ParsedProduct[] = []
  const categoryDetections: CategorySuggestion[] = []
  const allWarnings: ImportWarning[] = []

  for (const group of groups) {
    const main = group.mainRow
    if (!main) continue

    const result = mapSingleProduct(group, main, existingHandles, existingSkus)
    products.push(result.product)
    categoryDetections.push(result.categoryDetection)
    allWarnings.push(...result.warnings)
  }

  return { products, categoryDetections, warnings: allWarnings }
}

function mapSingleProduct(
  group: ImportRowGroup,
  main: CsvRow,
  existingHandles: Set<string>,
  existingSkus: Set<string>,
): { product: ParsedProduct; categoryDetection: CategorySuggestion; warnings: ImportWarning[] } {
  const warnings: ImportWarning[] = []

  let title = main.title || ""
  const description = main.bodyHtml || ""
  const vendor = main.vendor || ""
  const type = main.type || ""

  const csvTags = parseTags(main.tags)

  // Title Cleaning & Smart Tagging
  const bracketRegex = /\s*[\[(]([^\])]+)[\])]/g;
  title = title.replace(bracketRegex, (match, content) => {
    if (content.includes('|')) {
      csvTags.push(...content.split('|').map((s: string) => s.trim()).filter(Boolean));
    } else {
      csvTags.push(content.trim());
    }
    return '';
  }).trim();

  const handle = group.handle || slugify(title)
  const categorySuggestion = detectCategory(main.productCategory, type, title, description, csvTags, vendor)
  const category = categorySuggestion.name

  const autoTags = generateAutoTags(title, type, category, vendor, description, collectVariantOptions(group))
  const tags = mergeTags(csvTags, autoTags)

  const published = main.published?.toLowerCase() === "true" || main.status?.toLowerCase() !== "draft"

  const seoTitle = main.seoTitle || undefined
  const seoDescription = main.seoDescription || undefined

  const allVariants = collectVariants(group, main)
  const { images, mainImage } = collectImages(group)

  const firstVariant = allVariants[0]
  const price = firstVariant?.price || 0
  const compareAtPrice = firstVariant?.compareAtPrice || undefined
  const sku = firstVariant?.sku || main.variantSku || ""
  const inventory = firstVariant?.inventory ?? 0

  const optionNames = buildOptionNames(main)
  const optionValues = buildOptionValues(allVariants)

  const specs = parseSpecs(main, title, description, tags)

  const product: ParsedProduct = {
    handle,
    title,
    description,
    vendor,
    category,
    type,
    tags,
    published,
    seoTitle,
    seoDescription,
    price,
    compareAtPrice,
    sku,
    inventory,
    image: mainImage,
    images,
    variants: allVariants,
    optionNames,
    optionValues,
    specs,
  }

  return { product, categoryDetection: categorySuggestion, warnings }
}

function collectVariants(group: ImportRowGroup, main: CsvRow): ParsedVariant[] {
  const variants: ParsedVariant[] = []
  const seenOptionKeys = new Set<string>()

  const rows = [main, ...group.variantRows]

  for (const row of rows) {
    const hasOption = !!(row.option1Value || row.option2Value || row.option3Value)
    if (!hasOption && variants.length > 0) continue

    const optionKey = `${row.option1Value || ""}|${row.option2Value || ""}|${row.option3Value || ""}`
    if (seenOptionKeys.has(optionKey)) continue
    if (optionKey.replace(/\|/g, "")) seenOptionKeys.add(optionKey)

    const price = parseFloat(row.variantPrice) || 0
    const compareAtPrice = row.variantCompareAtPrice ? parseFloat(row.variantCompareAtPrice) || undefined : undefined
    const inventory = parseInt(row.variantInventoryQty, 10) || 0
    const sku = row.variantSku || ""
    const image = row.variantImage || ""

    variants.push({
      sku,
      price,
      compareAtPrice,
      inventory: Math.max(0, inventory),
      image,
      option1: row.option1Value || "",
      option2: row.option2Value || "",
      option3: row.option3Value || "",
    })
  }

  return variants
}

function collectImages(group: ImportRowGroup): { images: string[]; mainImage: string } {
  const imageMap = new Map<number, string>()
  const allImageRows = [...(group.mainRow ? [group.mainRow] : []), ...group.imageRows]

  for (const row of allImageRows) {
    const src = row.imageSrc || ""
    if (!src) continue
    const pos = parseInt(row.imagePosition, 10) || (imageMap.size + 1)
    if (!imageMap.has(pos)) {
      imageMap.set(pos, src)
    }
  }

  const sorted = Array.from(imageMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([, url]) => url)

  const mainImage = sorted[0] || ""
  return { images: sorted, mainImage }
}

function buildOptionNames(main: CsvRow): string[] {
  const names: string[] = []
  if (main.option1Name) names.push(main.option1Name)
  if (main.option2Name) names.push(main.option2Name)
  if (main.option3Name) names.push(main.option3Name)
  return names
}

function buildOptionValues(variants: ParsedVariant[]): string[][] {
  const values: string[][] = [[], [], []]
  for (const v of variants) {
    if (v.option1 && !values[0].includes(v.option1)) values[0].push(v.option1)
    if (v.option2 && !values[1].includes(v.option2)) values[1].push(v.option2)
    if (v.option3 && !values[2].includes(v.option3)) values[2].push(v.option3)
  }
  return values.filter((arr) => arr.length > 0)
}

function collectVariantOptions(group: ImportRowGroup): string[] {
  const options: string[] = []
  for (const row of [group.mainRow, ...group.variantRows].filter(Boolean)) {
    if (!row) continue
    if (row.option1Value) options.push(row.option1Value)
    if (row.option2Value) options.push(row.option2Value)
    if (row.option3Value) options.push(row.option3Value)
  }
  return [...new Set(options)]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function parseSpecs(main: CsvRow, title: string, bodyHtml: string, tags: string[]): { label: string; value: string }[] {
  const specs: { label: string; value: string }[] = []
  const seen = new Set<string>()

  function add(label: string, value: string) {
    const key = `${label}:${value}`.toLowerCase()
    if (!label || !value || seen.has(key)) return
    seen.add(key)
    specs.push({ label: label.trim(), value: value.trim() })
  }

  // 1. Parse from dedicated "Specifications" CSV column (JSON or pipe-separated)
  const specsRaw = main.specifications || ""
  if (specsRaw) {
    try {
      const parsed = JSON.parse(specsRaw)
      if (Array.isArray(parsed)) {
        for (const s of parsed) {
          add(s.label || s.name || "", s.value || s.detail || "")
        }
      }
    } catch {
      const pairs = specsRaw.split("|")
      for (const pair of pairs) {
        const [label, ...rest] = pair.split(":")
        if (label && rest.length > 0) add(label.trim(), rest.join(":").trim())
      }
    }
  }

  // 2. Parse Body HTML for spec patterns
  const text = bodyHtml.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim()
  const lines = text.split(/[.;\n]/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.length < 3) continue
    const colonIdx = trimmed.indexOf(":")
    if (colonIdx > 0 && colonIdx < 30) {
      const label = trimmed.slice(0, colonIdx).trim()
      const value = trimmed.slice(colonIdx + 1).trim()
      if (label && value && label.length < 40) add(label, value)
    }
  }

  // 3. Parse spec-like tags (e.g., "display-1-43-amoled" → label:"Display", value:"1.43 AMOLED")
  const specKeywords = [
    "display", "battery", "sensor", "water", "chip", "processor", "ram", "storage",
    "screen", "camera", "weight", "dimension", "material", "color", "connectivity",
    "bluetooth", "wifi", "nfc", "charging", "warranty", "compatibility", "os",
  ]

  for (const tag of tags) {
    const parts = tag.split("-")
    if (parts.length >= 2) {
      const first = parts[0].toLowerCase()
      if (specKeywords.includes(first)) {
        const value = parts.slice(1).join(" ").replace(/-/g, " ")
        add(parts[0].charAt(0).toUpperCase() + parts[0].slice(1), value)
      }
    }
  }

  // 4. Detect from li items in HTML
  const liMatches = bodyHtml.matchAll(/<li[^>]*>([^<]+)<\/li>/gi)
  for (const match of liMatches) {
    const content = match[1].trim()
    const colonIdx = content.indexOf(":")
    if (colonIdx > 0 && colonIdx < 30) {
      add(content.slice(0, colonIdx).trim(), content.slice(colonIdx + 1).trim())
    }
  }

  // 5. Detect from table rows (<tr><td>...</td><td>...</td></tr>)
  const trMatches = bodyHtml.matchAll(/<tr[^>]*>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>[\s\S]*?<\/?tr[^>]*>/gi)
  for (const match of trMatches) {
    const label = match[1].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim()
    const value = match[2].replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").trim()
    if (label && value && label.length < 40) {
      add(label, value)
    }
  }

  return specs.slice(0, 40)
}
