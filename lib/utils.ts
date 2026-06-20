import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared categorization logic — keep in sync with lib/product-category.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  getProductCategory: categorizeProduct,
  getCategorySlug: slugFromCategory,
} = require('./product-category') as {
  getProductCategory: (title?: string, tags?: string, type?: string, handle?: string) => string
  getCategorySlug: (categoryName: string) => string
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
  return slugFromCategory(categoryName)
}
