// User Types
export interface User {
  id: string
  email: string
  name: string
  phone: string
  avatar?: string
  role: 'customer' | 'admin'
  created_at: string
}

export interface Address {
  id: string
  user_id: string
  name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  province: string
  postal_code: string
  is_default: boolean
}

// Product Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  compare_price?: number | null
  images: string[]
  colors?: string[]
  category_id: string
  category: Category
  brand: string
  stock: number
  rating: number
  reviews_count: number
  specifications: Record<string, string>
  is_featured: boolean
  is_active: boolean
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description?: string
  parent_id?: string
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  user_name: string
  rating: number
  title: string
  comment: string
  is_verified: boolean
  created_at: string
}

// Cart Types
export interface CartItem {
  id: string
  product: Product
  quantity: number
  selectedColor?: string
}

// Order Types
export interface Order {
  id: string
  user_id: string
  items: OrderItem[]
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  status: OrderStatus
  shipping_address: Address
  payment_method: string
  tracking_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  price: number
  quantity: number
  color?: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

// Wishlist
export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  product: Product
  created_at: string
}

// Coupon
export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order: number
  max_discount?: number
  usage_limit: number
  used_count: number
  expires_at: string
  is_active: boolean
}

// Pakistan Specific
export const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Gilgit-Baltistan',
  'Azad Kashmir'
] as const

export const MAJOR_CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
  'Hyderabad',
  'Bahawalpur',
  'Sukkur',
  'Abbottabad',
  'Sargodha',
  'Gujrat',
  'Sheikhupura',
  'Rahim Yar Khan',
  'Larkana',
  'Gilgit',
  'Muzaffarabad',
] as const

export const SHIPPING_ZONES = {
  major_cities: { cost: 200, days: '2-3' },
  punjab: { cost: 250, days: '3-4' },
  sindh: { cost: 300, days: '3-5' },
  kpk: { cost: 350, days: '4-5' },
  balochistan: { cost: 400, days: '5-7' },
  northern_areas: { cost: 500, days: '7-10' }
} as const

export type Province = typeof PAKISTAN_PROVINCES[number]
export type City = typeof MAJOR_CITIES[number]
