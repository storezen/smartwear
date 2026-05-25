export interface Spec {
  label: string;
  value: string;
}

export interface ProductVariant {
  name: string
  value: string
  priceAdjustment?: number
  inStock?: boolean
  sku?: string
  image?: string
  option1?: string
  option2?: string
  option3?: string
  option1Name?: string
  option2Name?: string
  option3Name?: string
}

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
  specs: Spec[];
  sku: string;
  quantity: number;
  lowStockThreshold: number;
  rating?: number;
  reviews?: number;
  metaTitle?: string;
  metaDescription?: string;
  variants?: ProductVariant[];
  optionNames?: string[]
  status?: "draft" | "published" | "archived"
  handle?: string
  tags?: string[]
}

export function formatPrice(price: number) {
  return `Rs. ${price.toLocaleString("en-PK")}`;
}
