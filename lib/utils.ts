import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Categorizes a product based on its title and tags.
 * 
 * @param title - The product title
 * @param tags - Comma separated tags (optional)
 * @returns The matched category string
 */
export function getProductCategory(title: string, tags: string = ''): string {
  const searchStr = `${title} ${tags}`.toLowerCase();
  const lowerTitle = title.toLowerCase();

  // Smart Watch Keywords (Used in multiple rules)
  const watchKeywords = /\b(smartwatch|smart watch|series|ultra|amoled)\b/i;

  // 1. First Priority - Watch Bands & Straps
  // Rule: Title has "strap", "band", "chain", "loop", "bracelet" BUT NOT smart watch keywords
  const isBand = /\b(strap|band|chain|loop|bracelet)\b/i.test(lowerTitle);
  if (isBand && !watchKeywords.test(lowerTitle)) {
    return 'Watch Bands & Straps';
  }

  // 2. Second Priority - Smart Watches
  // Rule: Title has "smartwatch", "series", "ultra", "amoled", "smart watch"
  if (watchKeywords.test(searchStr)) {
    return 'Smart Watches';
  }

  // 3. Third Priority - Analog Watches
  // Rule: Title has "analog" and NO smart watch keywords
  if (/\b(analog)\b/i.test(searchStr) && !watchKeywords.test(searchStr)) {
    return 'Analog Watches';
  }

  // 4. Fourth Priority - Ladies Watches
  // Rule: Title has "ladies", "women", "woman" AND "watch"
  if (/\b(ladies|women|woman)\b/i.test(searchStr) && /\b(watch|watches)\b/i.test(searchStr)) {
    return 'Ladies Watches';
  }

  // 5. Fifth Priority - Phone Cases
  // Rule: Title has "case" + "iphone" or "phone"
  // (Also catching generic phone cases like "Woven Weave Breathable Grid Case" by ensuring it's not a watch/earpod case)
  if (/\b(case)\b/i.test(lowerTitle)) {
    if (/\b(iphone|phone|samsung)\b/i.test(searchStr) || !/\b(watch|earbuds|airpods)\b/i.test(searchStr)) {
      return 'Phone Cases';
    }
  }

  // 6. Sixth Priority - Camera Protectors
  // Rule: Title has "camera lens" or "lens protector"
  if (/\b(camera lens|lens protector)\b/i.test(searchStr)) {
    return 'Camera Protectors';
  }

  // 7. Accessories (Default)
  // Rule: Everything else (chargers, earpods, protectors, etc.)
  return 'Accessories';
}

/**
 * Maps a human-readable category name to its URL-friendly slug.
 */
export function getCategorySlug(categoryName: string): string {
  switch (categoryName) {
    case 'Smart Watches': return 'smart-watches';
    case 'Analog Watches': return 'analog-watches';
    case 'Ladies Watches': return 'ladies-watches';
    case 'Watch Bands & Straps': return 'watch-bands';
    case 'Phone Cases': return 'phone-cases';
    case 'Camera Protectors': return 'camera-protectors';
    case 'Accessories': return 'accessories';
    default: return 'smart-watches'; // Fallback
  }
}
