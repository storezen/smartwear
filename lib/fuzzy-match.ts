function levenshtein(a: string, b: string): number {
  const an = a.length, bn = b.length
  const matrix: number[][] = []
  for (let i = 0; i <= an; i++) { matrix[i] = [i]; for (let j = 1; j <= bn; j++) matrix[i][j] = i === 0 ? j : 0 }
  for (let i = 1; i <= an; i++) for (let j = 1; j <= bn; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1
    matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
  }
  return matrix[an][bn]
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim()
}

function tokens(s: string): string[] {
  return normalize(s).split(" ").filter(t => t.length > 1)
}

function soundex(s: string): string {
  const a = s.toUpperCase(), map: Record<string, string> = { B: "1", F: "1", P: "1", V: "1", C: "2", G: "2", J: "2", K: "2", Q: "2", S: "2", X: "2", Z: "2", D: "3", T: "3", L: "4", M: "5", N: "5", R: "6" }
  let r = a[0] || ""
  for (let i = 1; i < a.length && r.length < 4; i++) { const c = map[a[i]]; if (c && c !== r[r.length - 1]) r += c }
  return r.padEnd(4, "0")
}

// Common Pakistani misspellings for watch brands/models
const COMMON_MISTAKES: Record<string, string[]> = {
  "ultra": ["ulro", "ultro", "altro", "ulter", "altra", "ultraa"],
  "sync": ["sinc", "sink", "sinc", "synk", "sinkh"],
  "smart": ["smat", "smaat", "smath", "esmart", "esmat"],
  "band": ["bnd", "baand", "bannd", "bend"],
  "midnight": ["midnit", "midnigh", "midnait", "mednight"],
  "elite": ["elitee", "eleet", "ilit", "elyte"],
  "pro": ["proo", "bro", "proh"],
  "versace": ["versacee", "versachi", "versa", "varsace"],
  "rolx": ["rolx", "rolex", "roleks", "rolxs", "rollx"],
  "submariner": ["submari", "submar", "submarinar", "submarineer"],
  "datejust": ["datejst", "datejus", "datejast"],
  "kd": ["kd", "k d", "ked"],
  "watch": ["wach", "watc", "wotch", "wuatch"],
  "digital": ["dijital", "dijtal", "digitle", "dijitl"],
}

function fuzzyTokenMatch(query: string, productName: string): number {
  const qTokens = tokens(query)
  const pTokens = tokens(productName)
  if (qTokens.length === 0 || pTokens.length === 0) return 0

  let score = 0
  const matched = new Set<number>()

  for (const qt of qTokens) {
    let best = 0
    let bestIdx = -1
    for (let i = 0; i < pTokens.length; i++) {
      if (matched.has(i)) continue
      const pt = pTokens[i]

      // Exact match
      if (qt === pt) { best = 1; bestIdx = i; break }

      // Starts with (e.g., "ultra" matches "ultra" in "Ultra Sync Pro")
      if (pt.startsWith(qt) || qt.startsWith(pt)) { best = Math.max(best, 0.9); bestIdx = i }

      // Contains substring
      if (pt.includes(qt) || qt.includes(pt)) { best = Math.max(best, 0.7); bestIdx = i }

      // Soundex match
      if (soundex(qt) === soundex(pt) && soundex(qt) !== "0000") { best = Math.max(best, 0.8); bestIdx = i }

      // Levenshtein distance
      const dist = levenshtein(qt, pt)
      const maxLen = Math.max(qt.length, pt.length)
      if (maxLen > 2 && dist <= Math.ceil(maxLen * 0.4)) { best = Math.max(best, 1 - dist / maxLen); bestIdx = i }

      // Known misspelling match
      for (const [canonical, misspellings] of Object.entries(COMMON_MISTAKES)) {
        if (misspellings.includes(qt) && (pt === canonical || pt.startsWith(canonical) || canonical.startsWith(pt))) { best = Math.max(best, 0.85); bestIdx = i; break }
        if (misspellings.includes(pt) && (qt === canonical || qt.startsWith(canonical) || canonical.startsWith(qt))) { best = Math.max(best, 0.85); bestIdx = i; break }
      }
    }
    if (bestIdx >= 0) { score += best; matched.add(bestIdx) }
  }

  return score / Math.max(qTokens.length, 1)
}

export function fuzzySearchProducts(query: string, products: any[], maxResults = 5): any[] {
  if (!query || !products) return []

  const scored = products.map(p => {
    const nameScore = fuzzyTokenMatch(query, p.name || "")
    const descScore = p.description ? fuzzyTokenMatch(query, p.description) * 0.4 : 0
    const brandScore = p.brand ? fuzzyTokenMatch(query, p.brand) * 0.6 : 0
    const catScore = p.category_slug ? fuzzyTokenMatch(query, p.category_slug) * 0.3 : 0
    const totalScore = Math.max(nameScore, descScore, brandScore, catScore)
    return { product: p, score: totalScore }
  })

  return scored
    .filter(s => s.score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(s => s.product)
}
