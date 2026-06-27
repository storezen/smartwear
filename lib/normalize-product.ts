import { categories } from '@/lib/mock-data'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getProductCategory, getCategorySlug } = require('./product-category') as {
  getProductCategory: (title?: string, tags?: string, type?: string, handle?: string) => string
  getCategorySlug: (categoryName: string) => string
}

const CANONICAL_SLUGS = new Set(categories.map((c) => c.slug))

/** Legacy / admin labels → current store slugs */
const SLUG_ALIASES: Record<string, string> = {
  audio: 'audio',
  charger: 'chargers',
  chargers: 'chargers',
  'chargers & cables': 'chargers',
  'chargers-and-cables': 'chargers',
  'chargers & cable': 'chargers',
  smartwatches: 'smart-watches',
  'smart watches': 'smart-watches',
  'smart-watches': 'smart-watches',
  analogwatches: 'analog-watches',
  'analog watches': 'analog-watches',
  ladieswatches: 'ladies-watches',
  'ladies watches': 'ladies-watches',
  straps: 'watch-bands',
  'watch bands': 'watch-bands',
  'watch bands & straps': 'watch-bands',
  'watch-bands': 'watch-bands',
  'phone cases': 'phone-cases',
  'phone-cases': 'phone-cases',
  'watch cases': 'watch-cases',
  'watch cases & protectors': 'watch-cases',
  'watch-cases': 'watch-cases',
  'power banks': 'power-banks',
  'power-banks': 'power-banks',
  accessories: 'accessories',
  accessory: 'accessories',
}

export function normalizeCategorySlug(slug?: string): string {
  const raw = (slug || '').toLowerCase().trim()
  if (!raw) return 'accessories'
  if (CANONICAL_SLUGS.has(raw)) return raw
  return SLUG_ALIASES[raw] || raw
}

type ProductRecord = {
  name?: string
  slug?: string
  tags?: string[] | string
  category_slug?: string
  [key: string]: unknown
}

/** Ensure every product uses a canonical category_slug (re-derive from title when needed). */
export function normalizeProductRecord<T extends ProductRecord>(product: T): T {
  const tags = Array.isArray(product.tags)
    ? product.tags.join(', ')
    : (product.tags as string) || ''

  let slug = normalizeCategorySlug(product.category_slug)

  if (!CANONICAL_SLUGS.has(slug)) {
    const categoryName = getProductCategory(
      product.name || '',
      tags,
      '',
      product.slug || ''
    )
    slug = getCategorySlug(categoryName)
  }

  if (product.category_slug === slug) return product
  return { ...product, category_slug: slug }
}

/** Ensure `status` and `is_active` are always consistent. */
function normalizeProductStatus(p: any): any {
  if (p.is_active === undefined) {
    p.is_active = p.status === 'Active'
  }
  if (p.status === undefined) {
    p.status = p.is_active ? 'Active' : 'Draft'
  }
  return p
}

export function normalizeProductList<T extends ProductRecord>(products: T[]): T[] {
  return products.map(p => normalizeProductStatus(normalizeProductRecord(p)))
}