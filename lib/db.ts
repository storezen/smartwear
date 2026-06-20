import fs from 'fs/promises'
import path from 'path'
import { env } from './env'
import { normalizeProductList } from './normalize-product'
import { resolveProductSlug } from './product-url'
import { supabase } from './supabase'

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

const globalAny: any = global;

export async function getDb(retries = 3): Promise<any> {
  if (env.NODE_ENV === 'production') {
    if (!globalAny.memoryDb) {
      globalAny.memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA))
    }
    return globalAny.memoryDb
  }
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
      await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DATA, null, 2))
      return INITIAL_DATA
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return getDb(retries - 1)
    }
    console.error('CRITICAL: Failed to parse database.json', error)
    return { products: [], orders: [], marketing: [], analytics: [], settings: INITIAL_DATA.settings }
  }
}

export async function saveDb(data: any) {
  if (env.NODE_ENV === 'production') {
    globalAny.memoryDb = data
    return
  }
  const tempPath = `${DB_PATH}.tmp.${Date.now()}`
  await fs.writeFile(tempPath, JSON.stringify(data, null, 2))
  await fs.rename(tempPath, DB_PATH)
}

// --- Helper Functions ---

// Products
export async function getProducts() {
  const db = await getDb()
  const local = normalizeProductList(db.products || [])

  // database.json is the maintained catalog — prefer it when populated
  if (local.length > 0) {
    return local
  }

  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) console.error('Supabase getProducts error:', error)
    return normalizeProductList(data || [])
  }

  return []
}

export async function getProduct(slug: string) {
  const canonicalSlug = resolveProductSlug(slug)
  const db = await getDb()
  const local = normalizeProductList(db.products || [])

  if (local.length > 0) {
    const product = local.find((p: any) => p.slug === canonicalSlug || p.slug === slug)
    if (product) return product
  }

  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', canonicalSlug).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getProduct error:', error)
    return data ? normalizeProductList([data])[0] : null
  }

  return null
}

export async function addProduct(product: any) {
  product.id = `PROD-${crypto.randomUUID()}`
  if (!product.created_at) product.created_at = new Date().toISOString()
  
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('products').insert([product]).select().single()
    if (!error && data) return data
    console.warn("Supabase addProduct failed, falling back to memory:", error?.message)
  }
  const db = await getDb()
  db.products.unshift(product)
  await saveDb(db)
  return product
}

export async function updateProduct(id: string, updates: any) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (!error && data) return data
    console.warn("Supabase updateProduct failed, falling back to memory:", error?.message)
  }
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
  if (env.NODE_ENV === 'production' && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) return
    console.warn("Supabase deleteProduct failed, falling back to memory:", error?.message)
  }
  const db = await getDb()
  const initialLength = db.products.length
  db.products = db.products.filter((p: any) => p.id !== id)
  if (db.products.length !== initialLength) {
    await saveDb(db)
  }
}

export async function bulkImportProducts(productsToImport: any[], overwrite: boolean = false) {
  if (env.NODE_ENV === 'production' && supabase) {
    // Basic implementation for Supabase bulk upsert
    let added = 0; let updated = 0; let skipped = 0;
    for (const newProduct of productsToImport) {
      const { data: existing } = await supabase.from('products').select('id').eq('slug', newProduct.slug).single()
      if (existing) {
        if (overwrite) {
          await supabase.from('products').update(newProduct).eq('id', existing.id)
          updated++
        } else {
          skipped++
        }
      } else {
        newProduct.id = `PROD-${crypto.randomUUID()}`
        if (!newProduct.created_at) newProduct.created_at = new Date().toISOString()
        await supabase.from('products').insert([newProduct])
        added++
      }
    }
    return { added, updated, skipped }
  }

  const db = await getDb()
  let added = 0; let updated = 0; let skipped = 0;
  for (const newProduct of productsToImport) {
    const existingIndex = db.products.findIndex((p: any) => p.slug === newProduct.slug)
    if (existingIndex !== -1) {
      if (overwrite) {
        db.products[existingIndex] = { ...db.products[existingIndex], ...newProduct, id: db.products[existingIndex].id }
        updated++
      } else {
        skipped++
      }
    } else {
      newProduct.id = `PROD-${crypto.randomUUID()}`
      if (!newProduct.created_at) newProduct.created_at = new Date().toISOString()
      db.products.unshift(newProduct)
      added++
    }
  }
  if (added > 0 || updated > 0) await saveDb(db)
  return { added, updated, skipped }
}

// Orders
export async function getOrders() {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error('Supabase getOrders error:', error)
    return data || []
  }
  const db = await getDb()
  return db.orders || []
}

export async function getOrderById(id: string) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getOrderById error:', error)
    return data || null
  }
  const db = await getDb()
  return db.orders.find((o: any) => o.id === id) || null
}

export async function createOrder(order: any) {
  // Deduct stock is complex in API, but for simplicity we fetch and update
  if (env.NODE_ENV === 'production' && supabase) {
    let hasError = false;
    for (const item of order.items) {
      const { data: product, error: pError } = await supabase.from('products').select('id, stock, name').eq('id', item.id).single()
      if (pError) { hasError = true; console.warn("Supabase product check failed:", pError.message); }
      if (!pError && product && (product.stock || 0) >= item.quantity) {
        await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.id)
      }
    }
    
    order.id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
    order.created_at = new Date().toISOString()
    order.history = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
    order.notes = ""
    order.status = "Pending"
    
    const { data, error } = await supabase.from('orders').insert([order]).select().single()
    if (!error && data) return data
    console.warn("Supabase createOrder failed, falling back to memory:", error?.message)
  }

  const db = await getDb()
  for (const item of order.items) {
    const product = db.products.find((p: any) => p.id === item.id)
    if (!product) throw new Error(`Product not found: ${item.name}`)
    if ((product.stock || 0) < item.quantity) throw new Error(`Insufficient stock for ${product.name}`)
  }
  for (const item of order.items) {
    const product = db.products.find((p: any) => p.id === item.id)
    if (product) product.stock -= item.quantity
  }
  order.id = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
  order.created_at = new Date().toISOString()
  order.history = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
  order.notes = ""
  order.status = "Pending"
  db.orders.unshift(order)
  await saveDb(db)
  return order
}

export async function updateOrderStatus(orderId: string, status: string, postexId?: string, note?: string) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return null
    if (order.status !== status || note) {
      if (!order.history) order.history = []
      order.history.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` })
    }
    if (order.status !== 'Cancelled' && order.status !== 'Returned') {
      if (status === 'Cancelled' || status === 'Returned') {
        for (const item of order.items) {
          const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single()
          if (product) await supabase.from('products').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.id)
        }
      }
    }
    order.status = status
    if (postexId) order.postex = postexId
    if (note && !order.notes) order.notes = note
    else if (note) order.notes = order.notes + "\n" + note
    
    const { data, error } = await supabase.from('orders').update(order).eq('id', orderId).select().single()
    if (!error && data) return data
    console.warn("Supabase updateOrderStatus failed, falling back to memory:", error?.message)
  }

  const db = await getDb()
  const order = db.orders.find((o: any) => o.id === orderId)
  if (order) {
    if (order.status !== status || note) {
      if (!order.history) order.history = []
      order.history.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` })
    }
    if (order.status !== 'Cancelled' && order.status !== 'Returned') {
      if (status === 'Cancelled' || status === 'Returned') {
        for (const item of order.items) {
          const product = db.products.find((p: any) => p.id === item.id)
          if (product) product.stock = (product.stock || 0) + item.quantity
        }
      }
    }
    order.status = status
    if (postexId) order.postex = postexId
    if (note && !order.notes) order.notes = note
    else if (note) order.notes = order.notes + "\n" + note
    await saveDb(db)
    return order
  }
  return null
}

export async function deleteOrders(ids: string[]) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { error } = await supabase.from('orders').delete().in('id', ids)
    if (!error) return { success: true }
    console.warn("Supabase deleteOrders failed, falling back to memory:", error?.message)
  }
  
  const db = await getDb()
  db.orders = db.orders.filter((o: any) => !ids.includes(o.id))
  await saveDb(db)
  return { success: true }
}

// Settings
export async function getSettings() {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('settings').select('*').single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getSettings error:', error)
    if (data) return data
    // Fallback default
    return { store_name: "Smartwear Pakistan", store_phone: "", store_email: "", shipping_flat_rate: "250", postex_api_token: "", tiktok_pixel_id: "", tiktok_access_token: "" }
  }

  const db = await getDb()
  if (!db.settings) {
    db.settings = { store_name: "Smartwear Pakistan", store_phone: "", store_email: "", shipping_flat_rate: "250", postex_api_token: "", tiktok_pixel_id: "", tiktok_access_token: "" }
    await saveDb(db)
  }
  return db.settings
}

export async function updateSettings(updates: any) {
  if (env.NODE_ENV === 'production' && supabase) {
    const current = await getSettings()
    const { data, error } = await supabase.from('settings').upsert({ id: 1, ...current, ...updates }).select().single()
    if (!error && data) return data
    console.warn("Supabase updateSettings failed, falling back to memory:", error?.message)
  }
  const db = await getDb()
  db.settings = { ...db.settings, ...updates }
  await saveDb(db)
  return db.settings
}

// Marketing
export async function getPromos() {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('marketing').select('*').order('created_at', { ascending: false })
    if (error) console.error('Supabase getPromos error:', error)
    return data || []
  }
  const db = await getDb()
  return db.marketing || []
}

export async function getPromoByCode(code: string) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('marketing').select('*').ilike('code', code).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getPromoByCode error:', error)
    return data || null
  }
  const db = await getDb()
  const marketing = db.marketing || []
  return marketing.find((p: any) => p.code.toUpperCase() === code.toUpperCase()) || null
}

export async function createPromo(promo: any) {
  promo.id = `PROMO-${crypto.randomUUID()}`
  promo.created_at = new Date().toISOString()
  promo.usage_count = 0
  
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('marketing').insert([promo]).select().single()
    if (!error && data) return data
    console.warn("Supabase createPromo failed, falling back to memory:", error?.message)
  }
  const db = await getDb()
  if (!db.marketing) db.marketing = []
  db.marketing.unshift(promo)
  await saveDb(db)
  return promo
}

export async function updatePromo(id: string, updates: any) {
  if (env.NODE_ENV === 'production' && supabase) {
    const { data, error } = await supabase.from('marketing').update(updates).eq('id', id).select().single()
    if (!error && data) return data
    console.warn("Supabase updatePromo failed, falling back to memory:", error?.message)
  }
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
  if (env.NODE_ENV === 'production' && supabase) {
    const { error } = await supabase.from('marketing').delete().eq('id', id)
    if (!error) return
    console.warn("Supabase deletePromo failed, falling back to memory:", error?.message)
  }
  const db = await getDb()
  if (!db.marketing) db.marketing = []
  const initialLength = db.marketing.length
  db.marketing = db.marketing.filter((p: any) => p.id !== id)
  if (db.marketing.length !== initialLength) await saveDb(db)
}
