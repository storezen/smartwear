import { categories } from '@/lib/mock-data'
import { normalizeCategorySlug } from '@/lib/normalize-product'

export const CATEGORY_SLUGS = categories.map((c) => c.slug)

/** Consistent product card count across homepage sections. */
export const HOMEPAGE_CARDS_PER_SECTION = 4

/** Category showcase — top lines only (keeps page shorter). */
export const HOMEPAGE_SHOWCASE_SLUGS = [
  'smart-watches',
  'analog-watches',
  'ladies-watches',
  'phone-cases',
  'watch-bands',
  'audio',
  'chargers',
] as const

export const HOMEPAGE_SHOWCASE_PER_CATEGORY = HOMEPAGE_CARDS_PER_SECTION

export function getCategoriesWithProducts(products: ProductLike[]) {
  return categories.filter((cat) => productsInCategory(products, cat.slug).length > 0)
}

type ProductLike = {
  id?: string
  slug?: string
  category_slug?: string
  images?: string[]
  is_featured?: boolean
  rating?: number
  created_at?: string
}

function productsInCategory(products: ProductLike[], slug: string) {
  const target = normalizeCategorySlug(slug)
  return products.filter(
    (p) => normalizeCategorySlug(p.category_slug) === target && (p as { is_active?: boolean }).is_active !== false
  )
}

/** Best cover image for a category — featured → highest rated → first available. */
export function pickCategoryCoverImage(products: ProductLike[], slug: string, fallback: string) {
  const pool = productsInCategory(products, slug).filter((p) => p.images?.[0])
  if (!pool.length) return fallback

  const featured = pool.find((p) => p.is_featured)
  if (featured?.images?.[0]) return featured.images[0]

  const topRated = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
  return topRated?.images?.[0] || fallback
}

/** Build slug → cover image map using live catalog + mock fallbacks. */
export function buildCategoryImageMap(products: ProductLike[]) {
  return Object.fromEntries(
    categories.map((cat) => [cat.slug, pickCategoryCoverImage(products, cat.slug, cat.image)])
  ) as Record<string, string>
}

/** Pick top N products globally (not balanced per category). */
export function pickTopProducts(
  products: ProductLike[],
  options: {
    maxTotal?: number
    sortFn?: (a: ProductLike, b: ProductLike) => number
    excludeCategory?: string
  } = {}
) {
  const { maxTotal = HOMEPAGE_CARDS_PER_SECTION, sortFn, excludeCategory } = options
  let pool = products.filter((p) => (p as { is_active?: boolean }).is_active !== false)
  if (excludeCategory) pool = pool.filter((p) => normalizeCategorySlug(p.category_slug) !== excludeCategory)
  if (sortFn) pool = [...pool].sort(sortFn)
  else pool = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0))
  return pool.slice(0, maxTotal)
}

/** Pick N products per category for balanced homepage grids. */
export function pickBalancedProducts(
  products: ProductLike[],
  options: {
    perCategory?: number
    maxTotal?: number
    sortFn?: (a: ProductLike, b: ProductLike) => number
  } = {}
) {
  const { perCategory = 2, maxTotal = 12, sortFn } = options
  const picked: ProductLike[] = []
  const seen = new Set<string>()

  for (const slug of CATEGORY_SLUGS) {
    let pool = productsInCategory(products, slug)
    if (sortFn) pool = [...pool].sort(sortFn)
    else pool = [...pool].sort((a, b) => (b.rating || 0) - (a.rating || 0))

    for (const product of pool.slice(0, perCategory)) {
      const key = product.id || product.slug
      if (!key || seen.has(key)) continue
      seen.add(key)
      picked.push(product)
    }
  }

  return picked.slice(0, maxTotal)
}

export function pickNewArrivals(
  products: ProductLike[],
  maxTotal = HOMEPAGE_CARDS_PER_SECTION
) {
  return pickTopProducts(products, {
    maxTotal,
    sortFn: (a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  })
}

export function pickBalancedNewArrivals(
  products: ProductLike[],
  perCategory = 1,
  maxTotal = HOMEPAGE_CARDS_PER_SECTION
) {
  return pickBalancedProducts(products, {
    perCategory,
    maxTotal,
    sortFn: (a, b) =>
      new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
  })
}

export function pickCategoryProducts(
  products: ProductLike[],
  slug: string,
  limit = 4
) {
  return productsInCategory(products, slug)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
}

export function pickAccessoriesForWatches(
  products: ProductLike[],
  limit = 4
) {
  const accessorySlugs = ['watch-bands', 'watch-cases', 'accessories', 'power-banks', 'chargers']
  const pool = products.filter((p) => {
    const slug = normalizeCategorySlug(p.category_slug)
    return accessorySlugs.includes(slug) && (p as { is_active?: boolean }).is_active !== false
  })
  return pool
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
}

export function pickFromCategory(
  products: ProductLike[],
  slug: string,
  limit = HOMEPAGE_CARDS_PER_SECTION
) {
  return [...productsInCategory(products, slug)]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit)
}