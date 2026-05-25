import Papa from "papaparse"
import type { CsvRow, ImportRowGroup } from "./types"

const SHOPIFY_HEADERS = [
  "Handle", "Title", "Body HTML", "Vendor", "Product Category", "Type", "Tags", "Published",
  "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
  "Variant SKU", "Variant Inventory Qty", "Variant Price", "Variant Compare At Price",
  "Variant Image", "Image Src", "Image Position", "SEO Title", "SEO Description", "Status",
]

export function parseCsvText(text: string): { rows: CsvRow[]; errors: { row: number; message: string }[] } {
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true })
  const errors: { row: number; message: string }[] = []

  if (result.errors.length > 0) {
    for (const err of result.errors) {
      errors.push({ row: (err.row ?? 0) + 1, message: err.message })
    }
  }

  if (result.data.length < 2) {
    return { rows: [], errors: [{ row: 0, message: "CSV must have a header row and at least one data row" }] }
  }

  const headerRow = result.data[0].map((h) => h.trim())
  const headerMap = normalizeHeaders(headerRow)

  const rows: CsvRow[] = []
  for (let i = 1; i < result.data.length; i++) {
    const raw = result.data[i]
    const row: CsvRow = {} as CsvRow
    for (let j = 0; j < headerRow.length; j++) {
      const key = headerMap[j]
      if (key) {
        row[key] = (raw[j] || "").trim()
      }
    }
    rows.push(row)
  }

  return { rows, errors }
}

function normalizeHeaders(headers: string[]): Record<number, string> {
  const map: Record<number, string> = {}
  const headerMappings: Record<string, string> = {
    "handle": "handle",
    "title": "title",
    "body html": "bodyHtml",
    "body_html": "bodyHtml",
    "vendor": "vendor",
    "product category": "productCategory",
    "type": "type",
    "tags": "tags",
    "published": "published",
    "status": "status",
    "option1 name": "option1Name",
    "option1 value": "option1Value",
    "option2 name": "option2Name",
    "option2 value": "option2Value",
    "option3 name": "option3Name",
    "option3 value": "option3Value",
    "variant sku": "variantSku",
    "variant inventory qty": "variantInventoryQty",
    "variant price": "variantPrice",
    "variant compare at price": "variantCompareAtPrice",
    "variant image": "variantImage",
    "image src": "imageSrc",
    "image position": "imagePosition",
    "seo title": "seoTitle",
    "seo description": "seoDescription",
    "specifications": "specifications",
    "specs": "specifications",
    "spec": "specifications",
    "variant weight": "variantWeight",
    "variant weight unit": "variantWeightUnit",
    "variant taxable": "variantTaxable",
    "variant requires shipping": "variantRequiresShipping",
    "gift card": "giftCard",
    "google shopping / google product category": "googleProductCategory",
    "google shopping / gender": "googleGender",
    "google shopping / age group": "googleAgeGroup",
    "google shopping / mpn": "googleMpn",
    "google shopping / condition": "googleCondition",
    "google shopping / custom product": "googleCustomProduct",
    "variant grams": "variantGrams",
    "variant inventory tracker": "variantInventoryTracker",
    "variant inventory policy": "variantInventoryPolicy",
    "variant fulfillment service": "variantFulfillmentService",
    "variant barcode": "variantBarcode",
  }

  for (let i = 0; i < headers.length; i++) {
    const normalized = headers[i].toLowerCase().replace(/[:\-–—()]/g, " ").replace(/\s+/g, " ").trim()
    map[i] = headerMappings[normalized] || camelCase(headers[i])
  }

  return map
}

function camelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

export function groupRowsByHandle(rows: CsvRow[]): ImportRowGroup[] {
  const groups = new Map<string, ImportRowGroup>()
  const seenHandles = new Map<string, number>()

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    let handle = row.handle || ""

    if (!handle && !row.title) continue
    if (!handle && row.title) {
      handle = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    }

    if (seenHandles.has(handle)) {
      const idx = seenHandles.get(handle)!
      const group = groups.get(handle)!
      const hasTitle = !!row.title
      const hasOptionValue = !!(row.option1Value || row.option2Value || row.option3Value)
      const hasImage = !!row.imageSrc

      if (hasOptionValue) {
        group.variantRows.push(row)
      }
      if (hasImage) {
        group.imageRows.push(row)
      }
      group.rowIndices.push(idx)
    } else {
      const group: ImportRowGroup = {
        handle,
        mainRow: row.title ? row : null,
        variantRows: [],
        imageRows: [],
        rowIndices: [i],
      }
      if (!row.title) {
        group.mainRow = null
      }
      const hasOptionValue = !!(row.option1Value || row.option2Value || row.option3Value)
      const hasImage = !!row.imageSrc
      if (hasOptionValue) group.variantRows.push(row)
      if (hasImage) group.imageRows.push(row)
      seenHandles.set(handle, i)
      groups.set(handle, group)
    }
  }

  const firstRowByHandle = new Map<string, CsvRow>()
  for (const row of rows) {
    const h = row.handle || row.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    if (h && (!firstRowByHandle.has(h) || row.title)) {
      firstRowByHandle.set(h, row)
    }
  }

  for (const [handle, group] of groups) {
    if (!group.mainRow) {
      const first = firstRowByHandle.get(handle)
      if (first) group.mainRow = first
    }
  }

  return Array.from(groups.values())
}
