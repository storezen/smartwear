import { Product, Category, Review, Order, User, Address } from '@/types'

// Expanded to 7 global categories
export const categories: Category[] = [
  {
    id: 'sw',
    name: 'Smart Watches',
    slug: 'smart-watches',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop',
    description: 'Modern complications for the ambitious professional.'
  },
  {
    id: 'aw',
    name: 'Analog Watches',
    slug: 'analog-watches',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=600&fit=crop',
    description: 'Heritage timepieces — the quiet luxury of generations.'
  },
  {
    id: 'lw',
    name: 'Ladies Watches',
    slug: 'ladies-watches',
    image: 'https://images.unsplash.com/photo-1549972574-8742bba40a7a?w=800&h=600&fit=crop',
    description: 'Elegant and graceful designs for every occasion.'
  },
  {
    id: 'wb',
    name: 'Watch Bands & Straps',
    slug: 'watch-bands',
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800&h=600&fit=crop',
    description: 'Style your watch your way with premium bands.'
  },
  {
    id: 'pc',
    name: 'Phone Cases',
    slug: 'phone-cases',
    image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?w=800&h=600&fit=crop',
    description: 'Ultimate protection and style for your device.'
  },
  {
    id: 'cp',
    name: 'Camera Protectors',
    slug: 'camera-protectors',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
    description: 'Crystal clear protection for your lenses.'
  },
  {
    id: 'acc',
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=600&fit=crop',
    description: 'Premium cables, chargers, and audio gear.'
  }
]

export const products: Product[] = [
  // SMART WATCHES
  {
    id: 'sw1',
    name: 'Apple Watch Ultra 2',
    slug: 'apple-watch-ultra-2',
    description: 'The ultimate companion for Pakistan\'s go-getters. Titanium build, advanced health tracking, and the reliability you need from Karachi to the northern mountains.',
    price: 224999,
    compare_price: 239999,
    images: [
      'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop'
    ],
    category_id: 'sw',
    category: categories[0],
    brand: 'Apple',
    stock: 18,
    rating: 4.9,
    reviews_count: 87,
    specifications: {
      'Case': '49mm Titanium',
      'Display': 'Always-On Retina',
      'Battery': 'Up to 36 hours',
      'Water Resistance': '100m',
      'GPS': 'Dual-frequency'
    },
    is_featured: true,
    is_active: true,
    created_at: '2024-02-15'
  },
  {
    id: 'sw2',
    name: 'Samsung Galaxy Watch 6 Classic',
    slug: 'galaxy-watch-6-classic',
    description: 'Rotating bezel for intuitive navigation. Advanced health tracking, Wear OS, and premium stainless steel design.',
    price: 84999,
    compare_price: 94999,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop'
    ],
    category_id: 'sw',
    category: categories[0],
    brand: 'Samsung',
    stock: 31,
    rating: 4.7,
    reviews_count: 64,
    specifications: {
      'Display': '1.5" Super AMOLED',
      'Battery': 'Up to 40 hours',
      'Water Resistance': '5ATM + IP68',
      'OS': 'Wear OS 4',
      'Material': 'Stainless Steel'
    },
    is_featured: true,
    is_active: true,
    created_at: '2024-02-10'
  },
  {
    id: 'sw3',
    name: 'Google Pixel Watch 2',
    slug: 'google-pixel-watch-2',
    description: 'Beautiful round design with deep Google integration. ECG, sleep tracking, and seamless Fitbit health insights.',
    price: 119999,
    compare_price: 129999,
    images: [
      'https://images.unsplash.com/photo-1557438159-51eec7dbc7a1?w=800&h=800&fit=crop'
    ],
    category_id: 'sw',
    category: categories[0],
    brand: 'Google',
    stock: 24,
    rating: 4.6,
    reviews_count: 41,
    specifications: {
      'Display': '1.4" AMOLED',
      'Battery': 'Up to 24 hours',
      'Sensors': 'ECG, SpO2, Temperature',
      'Material': 'Aluminum'
    },
    is_featured: false,
    is_active: true,
    created_at: '2024-03-01'
  },

  // ANALOG WATCHES
  {
    id: 'aw1',
    name: 'Seiko Prospex Diver',
    slug: 'seiko-prospex-diver',
    description: 'A true workhorse for the Pakistani man. 200m water resistance, exceptional legibility, and the trusted Seiko automatic movement that lasts generations.',
    price: 64999,
    compare_price: 72999,
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop'
    ],
    category_id: 'aw',
    category: categories[1],
    brand: 'Seiko',
    stock: 29,
    rating: 4.8,
    reviews_count: 112,
    specifications: {
      'Movement': 'Automatic 4R36',
      'Water Resistance': '200m',
      'Case': 'Stainless Steel 42mm',
      'Crystal': 'Hardlex'
    },
    is_featured: true,
    is_active: true,
    created_at: '2024-01-20'
  },
  {
    id: 'aw2',
    name: 'Citizen Eco-Drive Chandler',
    slug: 'citizen-eco-drive-chandler',
    description: 'Light-powered. Never needs a battery change. Clean minimalist dial with premium leather strap.',
    price: 38999,
    compare_price: 44999,
    images: [
      'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&h=800&fit=crop'
    ],
    category_id: 'aw',
    category: categories[1],
    brand: 'Citizen',
    stock: 37,
    rating: 4.5,
    reviews_count: 58,
    specifications: {
      'Movement': 'Eco-Drive (Solar)',
      'Case': 'Stainless Steel',
      'Strap': 'Genuine Leather',
      'Features': 'Date, Luminous Hands'
    },
    is_featured: false,
    is_active: true,
    created_at: '2024-02-05'
  },
  {
    id: 'aw3',
    name: 'Orient Bambino Version 7',
    slug: 'orient-bambino-v7',
    description: 'The perfect dress watch. Roman numerals, domed glass, and a refined 40.5mm case at an incredible value.',
    price: 26999,
    compare_price: null,
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&h=800&fit=crop'
    ],
    category_id: 'aw',
    category: categories[1],
    brand: 'Orient',
    stock: 52,
    rating: 4.7,
    reviews_count: 93,
    specifications: {
      'Movement': 'Automatic F6724',
      'Case': '40.5mm Stainless Steel',
      'Crystal': 'Mineral Glass',
      'Power Reserve': '40 hours'
    },
    is_featured: true,
    is_active: true,
    created_at: '2024-01-28'
  },

  // ACCESSORIES
  {
    id: 'acc1',
    name: 'Milanese Loop Strap (Silver)',
    slug: 'milanese-loop-silver',
    description: 'Premium stainless steel mesh strap. Breathable and infinitely adjustable. Fits most 20-22mm watches.',
    price: 8499,
    compare_price: 10999,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'
    ],
    category_id: 'acc',
    category: categories[2],
    brand: 'Lumina',
    stock: 87,
    rating: 4.8,
    reviews_count: 134,
    specifications: {
      'Material': 'Surgical Stainless Steel',
      'Width': '20mm',
      'Clasp': 'Magnetic',
      'Finish': 'Brushed Silver'
    },
    is_featured: false,
    is_active: true,
    created_at: '2024-02-12'
  },
  {
    id: 'acc2',
    name: 'NATO Canvas Strap — Midnight',
    slug: 'nato-canvas-midnight',
    description: 'Classic military-inspired NATO strap in premium cotton canvas. Extremely durable and comfortable.',
    price: 4499,
    compare_price: null,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'
    ],
    category_id: 'acc',
    category: categories[2],
    brand: 'Lumina',
    stock: 64,
    rating: 4.6,
    reviews_count: 76,
    specifications: {
      'Material': 'Premium Cotton Canvas',
      'Width': '20mm',
      'Hardware': 'Brushed Steel'
    },
    is_featured: false,
    is_active: true,
    created_at: '2024-03-02'
  },
  {
    id: 'acc3',
    name: 'Watch Travel Case — 2 Slot',
    slug: 'watch-travel-case-2',
    description: 'Compact, protective case for two watches. Soft microfiber lining and elegant leather exterior.',
    price: 6999,
    compare_price: 8499,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop'
    ],
    category_id: 'acc',
    category: categories[2],
    brand: 'Lumina',
    stock: 41,
    rating: 4.9,
    reviews_count: 29,
    specifications: {
      'Capacity': '2 Watches',
      'Material': 'Genuine Leather + Microfiber',
      'Dimensions': '18 × 10 × 6 cm'
    },
    is_featured: true,
    is_active: true,
    created_at: '2024-01-15'
  }
]

export const reviews: Review[] = [
  {
    id: '1',
    product_id: '1',
    user_id: '1',
    user_name: 'Ahmed Khan',
    rating: 5,
    title: 'Behtareen phone!',
    comment: 'iPhone 15 Pro Max kamaal ka phone hai. Camera quality zabardast hai aur battery bhi kaafi achi hai. Worth every rupee!',
    is_verified: true,
    created_at: '2024-02-15'
  },
  {
    id: '2',
    product_id: '1',
    user_id: '2',
    user_name: 'Sara Ali',
    rating: 5,
    title: 'Perfect upgrade',
    comment: 'iPhone 13 se upgrade kiya hai, bohat fark hai. Titanium build solid lagti hai aur Action button useful hai.',
    is_verified: true,
    created_at: '2024-02-18'
  },
  {
    id: '3',
    product_id: '2',
    user_id: '3',
    user_name: 'Usman Malik',
    rating: 4,
    title: 'Great phone, expensive',
    comment: 'S24 Ultra ki camera quality amazing hai, especially 200MP sensor. Galaxy AI features bhi kaafi useful hain.',
    is_verified: true,
    created_at: '2024-02-20'
  },
  {
    id: '4',
    product_id: '7',
    user_id: '4',
    user_name: 'Fatima Zahra',
    rating: 5,
    title: 'Best headphones ever',
    comment: 'Sony XM5 ki noise cancellation unbeatable hai. Office mein use karti hun, complete silence milti hai.',
    is_verified: true,
    created_at: '2024-02-10'
  }
]

export const mockUser: User = {
  id: '1',
  email: 'demo@techmart.pk',
  name: 'Demo User',
  phone: '+92 300 1234567',
  role: 'customer',
  created_at: '2024-01-01'
}

// Admin customers page mock data
export const mockUsers = [
  {
    id: '1',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@email.com',
    phone: '+92 300 1234567',
    createdAt: '2024-01-15',
    isActive: true,
    addresses: [
      {
        id: '1',
        city: 'Lahore',
        province: 'Punjab'
      }
    ],
    orderCount: 5,
    totalSpent: 524999
  },
  {
    id: '2',
    name: 'Sara Ali',
    email: 'sara.ali@email.com',
    phone: '+92 321 9876543',
    createdAt: '2024-01-20',
    isActive: true,
    addresses: [
      {
        id: '2',
        city: 'Karachi',
        province: 'Sindh'
      }
    ],
    orderCount: 3,
    totalSpent: 249999
  },
  {
    id: '3',
    name: 'Usman Malik',
    email: 'usman.malik@email.com',
    phone: '+92 333 4567890',
    createdAt: '2024-02-01',
    isActive: true,
    addresses: [
      {
        id: '3',
        city: 'Islamabad',
        province: 'Punjab'
      }
    ],
    orderCount: 8,
    totalSpent: 899999
  },
  {
    id: '4',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@email.com',
    phone: '+92 334 5678901',
    createdAt: '2024-02-10',
    isActive: false,
    addresses: [],
    orderCount: 1,
    totalSpent: 89999
  },
  {
    id: '5',
    name: 'Bilal Ahmed',
    email: 'bilal.ahmed@email.com',
    phone: '+92 335 6789012',
    createdAt: '2024-02-15',
    isActive: true,
    addresses: [
      {
        id: '5',
        city: 'Peshawar',
        province: 'Khyber Pakhtunkhwa'
      }
    ],
    orderCount: 2,
    totalSpent: 179998
  }
]

export const mockAddresses: Address[] = [
  {
    id: '1',
    user_id: '1',
    name: 'Ahmed Khan',
    phone: '+92 300 1234567',
    address_line1: 'House 123, Street 5',
    address_line2: 'DHA Phase 6',
    city: 'Lahore',
    province: 'Punjab',
    postal_code: '54000',
    is_default: true
  },
  {
    id: '2',
    user_id: '1',
    name: 'Ahmed Khan',
    phone: '+92 321 9876543',
    address_line1: 'Office 45, 3rd Floor',
    address_line2: 'Arfa Software Technology Park',
    city: 'Lahore',
    province: 'Punjab',
    postal_code: '54000',
    is_default: false
  }
]

export const mockOrders: Order[] = [
  {
    id: 'ORD-2024-001',
    user_id: '1',
    items: [
      {
        id: '1',
        product_id: '1',
        product_name: 'iPhone 15 Pro Max',
        product_image: products[0]?.images?.[0] || '',
        price: 524999,
        quantity: 1
      }
    ],
    subtotal: 524999,
    shipping_cost: 0,
    discount: 25000,
    total: 499999,
    status: 'delivered',
    shipping_address: mockAddresses[0],
    payment_method: 'COD',
    tracking_number: 'TCS-123456789',
    created_at: '2024-02-01',
    updated_at: '2024-02-05'
  },
  {
    id: 'ORD-2024-002',
    user_id: '1',
    items: [
      {
        id: '2',
        product_id: '7',
        product_name: 'Sony WH-1000XM5',
        product_image: products[6]?.images?.[0] || '',
        price: 89999,
        quantity: 1
      },
      {
        id: '3',
        product_id: '11',
        product_name: 'Anker 65W USB-C Charger',
        product_image: products[8]?.images?.[0] || '',
        price: 12999,
        quantity: 2
      }
    ],
    subtotal: 115997,
    shipping_cost: 200,
    discount: 0,
    total: 116197,
    status: 'shipped',
    shipping_address: mockAddresses[0],
    payment_method: 'COD',
    tracking_number: 'TCS-987654321',
    created_at: '2024-02-20',
    updated_at: '2024-02-22'
  }
]

// Helper functions
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug)
}

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = categories.find(c => c.slug === categorySlug)
  if (!category) return []
  return products.filter(p => p.category_id === category.id)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => p.is_featured)
}

export function getReviewsByProduct(productId: string): Review[] {
  return reviews.filter(r => r.product_id === productId)
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return products.filter(p => 
    p.name.toLowerCase().includes(lowerQuery) ||
    p.brand.toLowerCase().includes(lowerQuery) ||
    p.description.toLowerCase().includes(lowerQuery)
  )
}
