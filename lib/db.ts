import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'database.json')

// Initial Structure
const INITIAL_DATA = {
  products: [
    {
      id: "prod-1",
      name: "Apple Watch Ultra 2",
      slug: "apple-watch-ultra-2",
      description: "The most rugged and capable Apple Watch. Designed for outdoor adventures and supercharged workouts.",
      price: 185000,
      compare_price: 200000,
      images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"],
      category_slug: "smartwatches",
      brand: "Apple",
      stock: 45,
      rating: 4.9,
      reviews_count: 128,
      specifications: { "Case": "49mm Titanium", "Display": "Always-On Retina", "Water Resistance": "100m" },
      is_featured: true,
      is_active: true,
      upsell_accessories: ["prod-2"]
    },
    {
      id: "prod-2",
      name: "Magnetic Link Strap",
      slug: "magnetic-link-strap",
      description: "Elegant magnetic link strap for all Apple Watch models.",
      price: 8500,
      compare_price: 12000,
      images: ["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&q=80"],
      category_slug: "straps",
      brand: "Smartwear",
      stock: 200,
      rating: 4.7,
      reviews_count: 56,
      specifications: { "Material": "Fine Woven", "Closure": "Magnetic" },
      is_featured: false,
      is_active: true,
      upsell_accessories: []
    }
  ],
  orders: [],
  marketing: [],
  analytics: [],
  settings: {
    store_name: "Smartwear Pakistan",
    store_phone: "0300 1234567",
    store_email: "support@smartwear.pk",
    shipping_flat_rate: "250",
    postex_api_token: "",
    tiktok_pixel_id: "",
    tiktok_access_token: ""
  }
}

export async function getDb(retries = 3): Promise<any> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8')
    const parsed = JSON.parse(data)
    parsed.products = parsed.products || []
    parsed.orders = parsed.orders || []
    parsed.marketing = parsed.marketing || []
    parsed.analytics = parsed.analytics || []
    parsed.settings = parsed.settings || INITIAL_DATA.settings
    return parsed
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // If file doesn't exist, create it with initial data
      await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2))
      return INITIAL_DATA
    }
    
    if (retries > 0) {
      // Wait a bit and retry if it's a parse error (might be reading during a write)
      await new Promise(resolve => setTimeout(resolve, 200))
      return getDb(retries - 1)
    }

    console.error('CRITICAL: Failed to parse database.json', error)
    // Return empty state rather than corrupting the file
    return { products: [], orders: [], marketing: [], analytics: [], settings: INITIAL_DATA.settings }
  }
}

export async function saveDb(data: any) {
  const tempPath = `${DB_PATH}.tmp.${Date.now()}`
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2))
  await fs.rename(tempPath, DB_PATH)
}

// --- Helper Functions ---

// Products
export async function getProducts() {
  const db = await getDb()
  return db.products || []
}

export async function getProduct(slug: string) {
  const db = await getDb()
  return db.products.find((p: any) => p.slug === slug)
}

export async function addProduct(product: any) {
  const db = await getDb()
  product.id = `PROD-${Math.floor(100000 + Math.random() * 900000)}`
  db.products.unshift(product)
  await saveDb(db)
  return product
}

export async function updateProduct(id: string, updates: any) {
  const db = await getDb()
  const index = db.products.findIndex((p: any) => p.id === id)
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updates }
    await saveDb(db)
    return db.products[index]
  }
  return null
}

export async function deleteProduct(id: string) {
  const db = await getDb()
  const initialLength = db.products.length
  db.products = db.products.filter((p: any) => p.id !== id)
  if (db.products.length !== initialLength) {
    await saveDb(db)
  }
}

export async function bulkImportProducts(productsToImport: any[], overwrite: boolean = false) {
  const db = await getDb()
  
  let added = 0
  let updated = 0
  let skipped = 0

  for (const newProduct of productsToImport) {
    const existingIndex = db.products.findIndex((p: any) => p.slug === newProduct.slug)
    
    if (existingIndex !== -1) {
      if (overwrite) {
        // Overwrite existing product but keep its original ID and created_at if not provided
        db.products[existingIndex] = { 
          ...db.products[existingIndex], 
          ...newProduct,
          id: db.products[existingIndex].id // Always preserve internal ID
        }
        updated++
      } else {
        // Skip existing product
        skipped++
      }
    } else {
      // Add new product with a collision-free UUID
      newProduct.id = `PROD-${crypto.randomUUID()}`
      if (!newProduct.created_at) {
        newProduct.created_at = new Date().toISOString()
      }
      db.products.unshift(newProduct)
      added++
    }
  }

  if (added > 0 || updated > 0) {
    await saveDb(db)
  }
  return { added, updated, skipped }
}

// Orders
export async function getOrders() {
  const db = await getDb()
  return db.orders || []
}

export async function getOrderById(id: string) {
  const db = await getDb()
  return db.orders.find((o: any) => o.id === id) || null
}

export async function createOrder(order: any) {
  const db = await getDb()
  
  // 1. Verify and deduct stock (Simulate transaction)
  for (const item of order.items) {
    const product = db.products.find((p: any) => p.id === item.id)
    if (!product) throw new Error(`Product not found: ${item.name}`)
    if ((product.stock || 0) < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`)
    }
  }

  // Deduct stock
  for (const item of order.items) {
    const product = db.products.find((p: any) => p.id === item.id)
    if (product) {
      product.stock -= item.quantity
    }
  }

  order.id = `ORD-${crypto.randomUUID()}`
  order.created_at = new Date().toISOString()
  order.history = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
  order.notes = ""
  order.status = "Pending"
  db.orders.unshift(order)
  await saveDb(db)
  return order
}

// Settings
export async function getSettings() {
  const db = await getDb()
  // Ensure settings object exists
  if (!db.settings) {
    db.settings = {
      store_name: "Smartwear Pakistan",
      store_phone: "",
      store_email: "",
      shipping_flat_rate: "250",
      postex_api_token: "",
      tiktok_pixel_id: "",
      tiktok_access_token: ""
    }
    await saveDb(db)
  }
  return db.settings
}

export async function updateSettings(updates: any) {
  const db = await getDb()
  db.settings = { ...db.settings, ...updates }
  await saveDb(db)
  return db.settings
}

export async function updateOrderStatus(orderId: string, status: string, postexId?: string, note?: string) {
  const db = await getDb()
  const order = db.orders.find((o: any) => o.id === orderId)
  if (order) {
    // Only add to history if status changed or note provided
    if (order.status !== status || note) {
      if (!order.history) order.history = []
      order.history.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`
      })
    }
    
    // Inventory restoration logic
    if (order.status !== 'Cancelled' && order.status !== 'Returned') {
      if (status === 'Cancelled' || status === 'Returned') {
        // Restore stock
        for (const item of order.items) {
          const product = db.products.find((p: any) => p.id === item.id)
          if (product) {
            product.stock = (product.stock || 0) + item.quantity
          }
        }
      }
    }

    order.status = status
    if (postexId) order.postex = postexId
    if (note && !order.notes) {
      order.notes = note
    } else if (note) {
      order.notes = order.notes + "\n" + note
    }
    await saveDb(db)
    return order
  }
  return null
}

// --- Marketing / Promos ---
export async function getPromos() {
  const db = await getDb()
  return db.marketing || []
}

export async function getPromoByCode(code: string) {
  const db = await getDb()
  const marketing = db.marketing || []
  return marketing.find((p: any) => p.code.toUpperCase() === code.toUpperCase()) || null
}

export async function createPromo(promo: any) {
  const db = await getDb()
  promo.id = `PROMO-${crypto.randomUUID()}`
  promo.created_at = new Date().toISOString()
  promo.usage_count = 0
  if (!db.marketing) db.marketing = []
  db.marketing.unshift(promo)
  await saveDb(db)
  return promo
}

export async function updatePromo(id: string, updates: any) {
  const db = await getDb()
  if (!db.marketing) db.marketing = []
  const index = db.marketing.findIndex((p: any) => p.id === id)
  if (index !== -1) {
    db.marketing[index] = { ...db.marketing[index], ...updates }
    await saveDb(db)
    return db.marketing[index]
  }
  return null
}

export async function deletePromo(id: string) {
  const db = await getDb()
  if (!db.marketing) db.marketing = []
  const initialLength = db.marketing.length
  db.marketing = db.marketing.filter((p: any) => p.id !== id)
  if (db.marketing.length !== initialLength) {
    await saveDb(db)
  }
}
