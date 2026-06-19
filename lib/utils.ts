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

  // 1. Watch Bands & Straps
  // Rule: Must have strap/band keywords AND NOT be a watch bundled "with" a strap.
  // We check if "watch" is immediately followed by "with" and then a strap keyword (allowing an optional material adjective)
  const isBand = /\b(strap|straps|band|bands|loop|chain)\b/i.test(lowerTitle);
  const isWatchWithBand = /\b(smartwatch|smart watch|watch|series)\b\s*(with|w\/|\+|and)\s*(silicone|metal|leather|nylon|magnetic|mesh|sport|woven|alpine|ocean|trail|braided|steel)?\s*(strap|band|loop|chain)\b/i.test(lowerTitle);
  
  if (isBand && !isWatchWithBand) {
    return 'Watch Bands & Straps';
  }

  // 2. Phone Cases
  if (/\b(case|cover)\b/i.test(lowerTitle) && /\b(phone|iphone|samsung|galaxy)\b/i.test(lowerTitle)) {
    return 'Phone Cases';
  }

  // 3. Camera Protectors
  if (/\b(camera lens|lens protector|camera protector)\b/i.test(searchStr)) {
    return 'Camera Protectors';
  }

  // 4. Accessories (Wireless Chargers / Earpods / General Covers)
  if (/\b(airpod|airpods|earbud|earbuds|pod|pods|charger|cable|adapter|wisme|powerbank)\b/i.test(searchStr)) {
    return 'Accessories';
  }
  // If it's a generic case/cover but not a phone case (and not a watch)
  if (/\b(case|cover|protector|glass|screen)\b/i.test(lowerTitle) && !/\b(watch|smartwatch)\b/i.test(lowerTitle)) {
    return 'Accessories';
  }

  // 5. Ladies Watches
  // Rule: Sirf tab jab clearly ladies/women specific ho aur watch ho. Must NOT be a band or accessory.
  if (/\b(ladies|women|womens|girl|girls)\b/i.test(searchStr) && /\b(watch|watches|smartwatch|analog)\b/i.test(searchStr) && !isBand && !/\b(case|cover)\b/i.test(lowerTitle)) {
    return 'Ladies Watches';
  }

  // 6. Smart Watches (MUST CHECK BEFORE ANALOG)
  // Rule: Agar title mein "smartwatch", "series", "ultra", "amoled", "smart watch" ho.
  if (/\b(smartwatch|smart watch|smart|series|ultra|amoled|apple watch|hw\d+|t\d+|hk\d+|dt\d+|ws-\w+)\b/i.test(searchStr)) {
    return 'Smart Watches';
  }

  // 7. Analog Watches
  if (/\b(analog|automatic|quartz|chronograph|mechanic|mechanical|rolex|rlx|rolx|patek|citizen|ctzn|seiko|casio|edifice|hublot|hblt|versace|vr\d+)\b/i.test(searchStr)) {
    return 'Analog Watches';
  }

  // Default Fallback
  // Rule: Jo products clearly nahi samajh aa rahe (jaise "XT-Lock"), unhe Accessories mein daal do.
  // Exception: If it explicitly has the standalone word "watch" but didn't trigger smartwatch/analog rules, default to Smart Watches.
  if (/\b(watch|watches)\b/i.test(lowerTitle)) {
    return 'Smart Watches';
  }

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
