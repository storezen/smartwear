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

  const watchKeywords = /\b(smartwatch|smart watch|series|ultra|amoled)\b/i;

  // Priority 1: Watch Bands & Straps
  // Rule: Title has strap, band, chain, loop, bracelet BUT NOT smart watch keywords
  // Agar dono hain toh yeh condition fail hogi aur wo neechay Smart Watches mein jayega
  const isBand = /\b(strap|band|chain|loop|bracelet)\b/i.test(lowerTitle);
  if (isBand && !watchKeywords.test(lowerTitle)) {
    return 'Watch Bands & Straps';
  }

  // Priority 2: Phone Cases
  // Rule: Title has "case" AND ("iphone" or "phone")
  if (/\b(case)\b/i.test(lowerTitle) && /\b(iphone|phone)\b/i.test(searchStr)) {
    return 'Phone Cases';
  }

  // Priority 3: Camera Protectors
  // Rule: Title has "camera lens" or "lens protector"
  if (/\b(camera lens|lens protector)\b/i.test(searchStr)) {
    return 'Camera Protectors';
  }

  // Priority 4: Smart Watches
  // Rule: Title has smartwatch, series, ultra, amoled, smart watch
  if (watchKeywords.test(searchStr)) {
    return 'Smart Watches';
  }

  // Priority 5: Analog Watches
  // Rule: Title has "analog"
  if (/\b(analog)\b/i.test(searchStr)) {
    return 'Analog Watches';
  }

  // Priority 6: Ladies Watches
  // Rule: Title has ladies, women, woman AND watch
  if (/\b(ladies|women|woman)\b/i.test(searchStr) && /\b(watch|watches)\b/i.test(searchStr)) {
    return 'Ladies Watches';
  }

  // Priority 7: Accessories (Default)
  // Rule: Everything else
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
