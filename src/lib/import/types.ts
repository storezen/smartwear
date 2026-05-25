export interface CsvRow {
  handle: string
  title: string
  bodyHtml: string
  vendor: string
  productCategory: string
  type: string
  tags: string
  published: string
  status: string
  option1Name: string
  option1Value: string
  option2Name: string
  option2Value: string
  option3Name: string
  option3Value: string
  variantSku: string
  variantInventoryQty: string
  variantPrice: string
  variantCompareAtPrice: string
  variantImage: string
  imageSrc: string
  imagePosition: string
  seoTitle: string
  seoDescription: string
  [key: string]: string
}

export interface ParsedVariant {
  sku: string
  price: number
  compareAtPrice?: number
  inventory: number
  image?: string
  option1: string
  option2: string
  option3: string
  taxable?: boolean
  requiresShipping?: boolean
  weight?: number
  weightUnit?: string
}

export interface ParsedProduct {
  handle: string
  title: string
  description: string
  vendor: string
  category: string
  type: string
  tags: string[]
  published: boolean
  seoTitle?: string
  seoDescription?: string
  price: number
  compareAtPrice?: number
  sku: string
  inventory: number
  image: string
  images: string[]
  variants: ParsedVariant[]
  optionNames: string[]
  optionValues: string[][]
  specs: { label: string; value: string }[]
}

export interface ImportRowGroup {
  handle: string
  mainRow: CsvRow | null
  variantRows: CsvRow[]
  imageRows: CsvRow[]
  rowIndices: number[]
}

export interface ImportSummary {
  totalCsvRows: number
  totalProducts: number
  totalVariants: number
  totalImages: number
  categoriesToCreate: string[]
  tagsToCreate: string[]
  products: ParsedProduct[]
  errors: ImportError[]
  warnings: ImportWarning[]
}

export interface ImportError {
  row: number
  handle: string
  field: string
  message: string
}

export interface ImportWarning {
  row: number
  handle: string
  field: string
  message: string
}

export interface ImportResult {
  imported: number
  skipped: number
  failed: number
  updated: number
  errors: ImportError[]
}

export type DuplicateStrategy = "skip" | "update" | "replace" | "merge"
