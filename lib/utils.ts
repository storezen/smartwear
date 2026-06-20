import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared categorization logic — keep in sync with lib/product-category.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getProductCategory: categorizeProduct } = require('./product-category') as {
  getProductCategory: (title?: string, tags?: string, type?: string, handle?: string) => string
}

/**
 * Categorizes a product based on title, tags, type, and handle.
 */
export function getProductCategory(title: string, tags: string = '', type: string = '', handle: string = ''): string {
  return categorizeProduct(title, tags, type, handle)
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
