/** Encode product slugs for safe use in URL paths (handles |, spaces, unicode, etc.). */
export function encodeProductSlug(slug: string): string {
  return encodeURIComponent(slug)
}

export function decodeProductSlug(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export function productPagePath(slug: string): string {
  return `/products/${encodeProductSlug(slug)}`
}

export function productApiPath(slug: string): string {
  return `/api/products/${encodeProductSlug(slug)}`
}

/** Resolve mangled / legacy slugs to the canonical catalog slug. */
export function resolveProductSlug(slug: string): string {
  const decoded = decodeProductSlug(slug).trim()
  const key = decoded.toLowerCase()

  if (PRODUCT_SLUG_ALIASES[key]) return PRODUCT_SLUG_ALIASES[key]

  // Common corruption when "|" or parentheses break routing/CDN paths
  if (/^(series|s)[.\-_]?(11)?[.\-_]?(cash|cod)/i.test(decoded) || /^series\.cash-on-delivery/i.test(decoded)) {
    return "s11-(allow-to-open-|-cash-on-delivery)"
  }

  return decoded
}

const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  "series-11-cod": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series.cash-on-delivery": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-cash-on-delivery": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-11-(allow-to-open-|-cash-on-delivery)": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-11-(allow-to-open-cash-on-delivery)": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-11-allow-to-open-cash-on-delivery": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "s11-(allow-to-open-|-cash-on-delivery)": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "s11-(allow-to-open-cash-on-delivery)": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "s11-allow-to-open-cash-on-delivery": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "s11-allow-to-open-|-cash-on-delivery": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-10-apple-logo-with-megnatic-chain-allow-to-open": "series-10-apple-logo-with-megnatic-chain-allow-to-open",
  "series-11-(allow-to-open-parcel)": "series-11-apple-logo-nike-free-loop-master-replica-allow-to-open-parcel",
  "series-11-allow-to-open-parcel": "series-11-apple-logo-nike-free-loop-master-replica-allow-to-open-parcel",
  "s11-(allow-to-open-parcel)": "series-11-apple-logo-nike-free-loop-master-replica-allow-to-open-parcel",
  "s11-allow-to-open-parcel": "series-11-apple-logo-nike-free-loop-master-replica-allow-to-open-parcel",
}