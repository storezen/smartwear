import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { normalizeProductList } from './normalize-product'
import { resolveProductSlug } from './product-url'
import { supabase } from './supabase'

// Supabase products table columns (strip unknown fields before write)
const SUPABASE_PRODUCT_COLUMNS = new Set([
  'id', 'created_at', 'name', 'slug', 'description', 'price', 'compare_price',
  'images', 'category_slug', 'brand', 'stock', 'rating', 'reviews_count',
  'specifications', 'is_featured', 'is_active', 'upsell_accessories', 'cost_price'
])

function stripNonProductFields(row: any) {
  const clean: Record<string, any> = {}
  for (const key of SUPABASE_PRODUCT_COLUMNS) {
    if (row[key] !== undefined) clean[key] = row[key]
  }
  return clean
}

// Try multiple paths so it works on dev, Vercel, and custom deploys
function getDbPaths(): string[] {
  const paths: string[] = ['/tmp/database.json']
  paths.push(path.join(process.cwd(), 'database.json'))
  // Fallback paths relative to module (handles ESM on Vercel)
  try {
    const modPath = fileURLToPath(import.meta.url)
    const modDir = path.dirname(modPath)
    paths.push(path.resolve(modDir, '../database.json'))
    paths.push(path.resolve(modDir, '../../database.json'))
  } catch {}
  return [...new Set(paths)]
}

const DB_PATHS = getDbPaths()
const TMP_DB_PATH = '/tmp/database.json'

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
      rating: 4.3,
      reviews_count: 86,
      specifications: { "Case": "49mm Titanium", "Display": "Always-On Retina", "Water Resistance": "100m" },
      status: "Active",
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
      rating: 4.0,
      reviews_count: 32,
      specifications: { "Material": "Fine Woven", "Closure": "Magnetic" },
      status: "Active",
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
    store_tagline: "Premium Watches & Accessories",
    whatsapp_number: "923001234567",
    whatsapp_message: "Hi Smartwear! I need help with my order.",
    support_phone: "+92 300 1234567",
    support_email: "concierge@smartwear.pk",
    legal_email: "legal@smartwear.pk",
    privacy_email: "privacy@smartwear.pk",
    store_address_line1: "MM Alam Road",
    store_address_line2: "Gulberg III",
    store_city: "Lahore, Pakistan",
    business_hours: "Mon-Sat: 10am - 8pm PKT",
    social_instagram: "https://instagram.com/smartwear.pk",
    social_facebook: "https://facebook.com/smartwear.pk",
    social_twitter: "https://twitter.com/smartwear_pk",
    social_youtube: "https://youtube.com/@smartwearpk",
    shipping_flat_rate: "250",
    free_delivery_threshold: 10000,
    shipping_standard_rate: 200,
    shipping_express_rate: 500,
    cod_available: true,
    payment_methods: '["COD","JazzCash","Easypaisa","Bank Transfer"]',
    announcement_line1: "Free Delivery on Orders Over Rs. 10,000",
    announcement_line2: "Open Box Delivery Available",
    announcement_line3: "100% Cash on Delivery",
    hero_headline: "Premium Quality. No Premium Price.",
    hero_subtitle: "Premium smartwatches and accessories, delivered to your doorstep with open-box verification.",
    hero_badge_text: "New 2026",
    seo_title: "Smartwear • Premium Watches & Accessories",
    seo_description: "Pakistan's trusted destination for premium smartwatches and accessories. Nationwide delivery with open-box verification.",
    seo_keywords: "smart watches pakistan, analog watches, luxury watches, smartwear, watch store pakistan, premium watches",
    security_badges: '[{"label":"SSL Secure","icon":"Lock"},{"label":"100% COD","icon":"Banknote"},{"label":"Open Box Delivery","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"}]',
    trust_badges: '[{"label":"7-Day Replacement","icon":"RefreshCw"},{"label":"Cash on Delivery","icon":"Banknote"},{"label":"Open Box Check","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"},{"label":"Secure Checkout","icon":"Lock"}]',
    postex_api_token: "",
    postex_webhook_secret: "",
    tiktok_pixel_id: "",
    tiktok_access_token: ""
  }
}

const globalAny: any = global;

export async function getDb(retries = 3): Promise<any> {
  // Return memory DB if it's already loaded (super fast)
  if (globalAny.memoryDb) {
    return globalAny.memoryDb
  }

  try {
    let rawData: string | null = null
    for (const p of DB_PATHS) {
      try {
        rawData = await fs.readFile(p, 'utf-8')
        break
      } catch {
        continue
      }
    }
    if (!rawData) throw Object.assign(new Error('No database file found'), { code: 'ENOENT' })

    const parsed = JSON.parse(rawData)
    parsed.products = parsed.products || []
    parsed.orders = parsed.orders || []
    parsed.marketing = parsed.marketing || []
    parsed.analytics = parsed.analytics || []
    parsed.subscribers = parsed.subscribers || []
    parsed.settings = { ...INITIAL_DATA.settings, ...parsed.settings }
    
    // Cache it in memory so future reads/writes persist across hot-reloads and Vercel serverless requests
    globalAny.memoryDb = parsed
    return parsed
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      for (const p of [TMP_DB_PATH, ...DB_PATHS]) {
        try {
          await fs.writeFile(p, JSON.stringify(INITIAL_DATA, null, 2))
          break
        } catch {
          continue
        }
      }
      globalAny.memoryDb = JSON.parse(JSON.stringify(INITIAL_DATA))
      return globalAny.memoryDb
    }
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 200))
      return getDb(retries - 1)
    }
    console.error('CRITICAL: Failed to parse database.json', error)
    
    const safeData = { products: [], orders: [], marketing: [], analytics: [], settings: INITIAL_DATA.settings }
    globalAny.memoryDb = safeData
    return safeData
  }
}

export async function saveDb(data: any, targetPath?: string) {
  globalAny.memoryDb = data
  const paths = targetPath ? [targetPath, TMP_DB_PATH, ...DB_PATHS] : [TMP_DB_PATH, ...DB_PATHS]
  const seen = new Set<string>()
  let wroteAny = false
  for (const p of paths) {
    if (seen.has(p)) continue
    seen.add(p)
    try {
      const tempPath = `${p}.tmp.${Date.now()}`
      await fs.writeFile(tempPath, JSON.stringify(data, null, 2))
      await fs.rename(tempPath, p)
      wroteAny = true
    } catch {
      /* skip unwritable paths */
    }
  }
  // On Vercel only /tmp is writable; on dev both /tmp and project-root work.
  // At least one should succeed — if none did the in-memory copy is still available
  // for the lifetime of the Node process.
}

// --- Helper Functions ---

// Products
export async function getProducts() {
  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) {
      console.error('Supabase getProducts error:', error)
    } else if (data) {
      if (data.length === 0) {
        const db = await getDb()
        const local = normalizeProductList(db.products || [])
        if (local.length > 10) {
          console.log(`[db] Seeding empty Supabase: ${local.length} products...`)
          const toInsert = local.map((p: any) => stripNonProductFields({ ...p, created_at: p.created_at || new Date().toISOString() }))
          const BATCH_SIZE = 100
          for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
            const batch = toInsert.slice(i, i + BATCH_SIZE)
            try { await supabase.from('products').upsert(batch, { onConflict: 'id', ignoreDuplicates: false }) } catch {}
          }
        }
      }
      if (data.length > 0) return normalizeProductList(data)
    }
  }

  const db = await getDb()
  return normalizeProductList(db.products || [])
}

export async function getProduct(slug: string) {
  const canonicalSlug = resolveProductSlug(slug)

  if (supabase) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', canonicalSlug).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getProduct error:', error)
    if (data) return normalizeProductList([data])[0]
  }

  const db = await getDb()
  const local = normalizeProductList(db.products || [])
  if (local.length > 0) {
    const product = local.find((p: any) => p.slug === canonicalSlug || p.slug === slug)
    if (product) return product
  }

  return null
}

export async function addProduct(product: any) {
  product.id = `PROD-${crypto.randomUUID()}`
  if (!product.created_at) product.created_at = new Date().toISOString()
  if (product.is_active === undefined) product.is_active = product.status === 'Active'
  
  if (supabase) {
    const { data, error } = await supabase.from('products').insert([stripNonProductFields(product)]).select().single()
    if (!error && data) {
      const merged = { ...data, ...product }
      const db = await getDb()
      db.products.unshift(merged)
      globalAny.memoryDb = db
      return merged
    }
    throw new Error(error?.message || 'Supabase add failed')
  }
  const db = await getDb()
  db.products.unshift(product)
  await saveDb(db)
  return product
}

export async function updateProduct(id: string, updates: any) {
  if (updates.status !== undefined && updates.is_active === undefined) {
    updates.is_active = updates.status === 'Active' || updates.status === 'Out of Stock'
  }
  if (supabase) {
    const { data, error } = await supabase.from('products').update(stripNonProductFields(updates)).eq('id', id).select().single()
    if (!error && data) {
      const merged = { ...data, ...updates }
      const db = await getDb()
      const index = db.products.findIndex((p: any) => p.id === id)
      if (index !== -1) {
        db.products[index] = { ...db.products[index], ...updates }
        globalAny.memoryDb = db
      }
      return merged
    }
    throw new Error(error?.message || 'Supabase update failed')
  }
  const db = await getDb()
  const index = db.products.findIndex((p: any) => p.id === id)
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...updates }
    await saveDb(db)
    return db.products[index]
  }
  throw new Error('Product not found')
}

export async function bulkUpdateProducts(updates: { id: string; status?: string; is_active?: boolean }[]) {
  if (supabase) {
    for (const u of updates) {
      await supabase.from('products').update(stripNonProductFields(u)).eq('id', u.id)
    }
    return
  }
  const db = await getDb()
  for (const u of updates) {
    const idx = db.products.findIndex((p: any) => p.id === u.id)
    if (idx !== -1) db.products[idx] = { ...db.products[idx], ...u }
  }
  await saveDb(db)
}

export async function deleteProduct(id: string) {
  if (supabase) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (!error) {
      const db = await getDb()
      db.products = db.products.filter((p: any) => p.id !== id)
      globalAny.memoryDb = db
      return
    }
    throw new Error(error?.message || 'Supabase delete failed')
  }
  const db = await getDb()
  const initialLength = db.products.length
  db.products = db.products.filter((p: any) => p.id !== id)
  if (db.products.length !== initialLength) {
    await saveDb(db)
  }
}

export async function bulkImportProducts(productsToImport: any[], overwrite: boolean = false) {
  if (supabase) {
    const cleaned = productsToImport.map((p) => {
      if (!p.id) p.id = `PROD-${crypto.randomUUID()}`
      if (!p.created_at) p.created_at = new Date().toISOString()
      return stripNonProductFields(p)
    })
    // Upsert in batches
    let added = 0; let updated = 0; let skipped = 0;
    const BATCH_SIZE = 100;
    for (let i = 0; i < cleaned.length; i += BATCH_SIZE) {
      const batch = cleaned.slice(i, i + BATCH_SIZE)
      const { error } = await supabase.from('products').upsert(batch, { onConflict: 'id', ignoreDuplicates: false })
      if (!error) {
        added += batch.length
      } else {
        console.error('Supabase bulkImportProducts batch error:', error.message)
      }
    }
    // Also update file DB cache
    const db = await getDb()
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
        db.products.unshift(newProduct)
        added++
      }
    }
    globalAny.memoryDb = db
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
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) console.error('Supabase getOrders error:', error)
    return data || []
  }
  const db = await getDb()
  return db.orders || []
}

export async function getOrderById(id: string) {
  if (supabase) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getOrderById error:', error)
    return data || null
  }
  const db = await getDb()
  return db.orders.find((o: any) => o.id === id) || null
}

export async function createOrder(order: any) {
  // Deduct stock is complex in API, but for simplicity we fetch and update
  if (supabase) {
    const deductedItems: { id: string; quantity: number }[] = []
    for (const item of order.items) {
      const { data: product, error: pError } = await supabase.from('products').select('id, stock, name').eq('id', item.id).single()
      if (pError) { console.warn("Supabase product check failed:", pError.message); continue }
      if (product && (product.stock || 0) >= item.quantity) {
        await supabase.from('products').update({ stock: product.stock - item.quantity }).eq('id', item.id)
        deductedItems.push({ id: item.id, quantity: item.quantity })
      }
    }
    
    order.id = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    order.created_at = new Date().toISOString()
    order.history = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
    order.notes = ""
    order.status = "Pending"
    
    const { data, error } = await supabase.from('orders').insert([order]).select().single()
    if (!error && data) {
      if (order.promo_code) {
        await incrementPromoUsage(order.promo_code)
      }
      return data
    }
    console.warn("Supabase createOrder failed, falling back to memory:", error?.message)
    for (const item of deductedItems) {
      const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single()
      if (product) await supabase.from('products').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.id)
    }
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
  order.id = `ORD-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  order.created_at = new Date().toISOString()
  order.history = [{ status: 'Pending', timestamp: new Date().toISOString(), note: 'Order placed' }]
  order.notes = ""
  order.status = "Pending"
  db.orders.unshift(order)
  await saveDb(db)
  return order
}

function isCancelledOrReturned(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'cancelled' || s === 'returned' || s === 'rto' || s === 'rto delivered' || s.includes('return to origin') || s === 'lost' || s === 'stolen' || s === 'damage'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateOrderStatus(orderId: string, status: string, postexId?: string, note?: string, postexCharges?: any) {
  if (supabase) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return null
    if (order.status !== status || note) {
      if (!order.history) order.history = []
      order.history.push({ status, timestamp: new Date().toISOString(), note: note || `Status updated to ${status}` })
    }
    if (!isCancelledOrReturned(order.status)) {
      if (isCancelledOrReturned(status)) {
        for (const item of order.items) {
          const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single()
          if (product) await supabase.from('products').update({ stock: (product.stock || 0) + item.quantity }).eq('id', item.id)
        }
      }
    }
    order.status = status
    if (postexId) order.postex = postexId
    if (postexCharges) order.postex_charges = postexCharges
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
    if (!isCancelledOrReturned(order.status)) {
      if (isCancelledOrReturned(status)) {
        for (const item of order.items) {
          const product = db.products.find((p: any) => p.id === item.id)
          if (product) product.stock = (product.stock || 0) + item.quantity
        }
      }
    }
    order.status = status
    if (postexId) order.postex = postexId
    if (postexCharges) order.postex_charges = postexCharges
    if (note && !order.notes) order.notes = note
    else if (note) order.notes = order.notes + "\n" + note
    await saveDb(db)
    return order
  }
  return null
}

export async function deleteOrders(ids: string[]) {
  if (supabase) {
    const { error } = await supabase.from('orders').delete().in('id', ids)
    if (!error) return { success: true }
    console.warn("Supabase deleteOrders failed, falling back to memory:", error?.message)
  }
  
  const db = await getDb()
  db.orders = db.orders.filter((o: any) => !ids.includes(o.id))
  await saveDb(db)
  return { success: true }
}

const SETTINGS_DEFAULTS = {
  store_name: "Smartwear Pakistan",
  store_tagline: "Premium Watches & Accessories",
  whatsapp_number: "923001234567",
  whatsapp_message: "Hi Smartwear! I need help with my order.",
  support_phone: "+92 300 1234567",
  support_email: "concierge@smartwear.pk",
  legal_email: "legal@smartwear.pk",
  privacy_email: "privacy@smartwear.pk",
  store_address_line1: "MM Alam Road",
  store_address_line2: "Gulberg III",
  store_city: "Lahore, Pakistan",
  business_hours: "Mon-Sat: 10am - 8pm PKT",
  social_instagram: "https://instagram.com/smartwear.pk",
  social_facebook: "https://facebook.com/smartwear.pk",
  social_twitter: "https://twitter.com/smartwear_pk",
  social_youtube: "https://youtube.com/@smartwearpk",
  shipping_flat_rate: "250",
  free_delivery_threshold: 10000,
  shipping_standard_rate: 200,
  shipping_express_rate: 500,
  cod_available: true,
  payment_methods: '["COD","JazzCash","Easypaisa","Bank Transfer"]',
  announcement_line1: "Free Delivery on Orders Over Rs. 10,000",
  announcement_line2: "Open Box Delivery Available",
  announcement_line3: "100% Cash on Delivery",
  hero_headline: "Premium Quality. No Premium Price.",
  hero_subtitle: "Premium smartwatches and accessories, delivered to your doorstep with open-box verification.",
  hero_badge_text: "New 2026",
  seo_title: "Smartwear • Premium Watches & Accessories",
  seo_description: "Pakistan's trusted destination for premium smartwatches and accessories. Nationwide delivery with open-box verification.",
  seo_keywords: "smart watches pakistan, analog watches, luxury watches, smartwear, watch store pakistan, premium watches",
  security_badges: '[{"label":"SSL Secure","icon":"Lock"},{"label":"100% COD","icon":"Banknote"},{"label":"Open Box Delivery","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"}]',
  trust_badges: '[{"label":"7-Day Replacement","icon":"RefreshCw"},{"label":"Cash on Delivery","icon":"Banknote"},{"label":"Open Box Check","icon":"PackageOpen"},{"label":"Nationwide Delivery","icon":"Truck"},{"label":"Secure Checkout","icon":"Lock"}]',
  postex_api_token: "",
  postex_webhook_secret: "",
  tiktok_pixel_id: "",
  tiktok_access_token: "",
}

// Fields that exist in the Supabase `settings` table schema.
// When adding new columns, add to this list AND create a DB migration.
const KNOWN_SETTINGS_COLUMNS = new Set([
  'id',
  'store_name', 'store_tagline',
  'whatsapp_number', 'whatsapp_message',
  'support_phone', 'support_email', 'legal_email', 'privacy_email',
  'store_address_line1', 'store_address_line2', 'store_city',
  'business_hours',
  'social_instagram', 'social_facebook', 'social_twitter', 'social_youtube',
  'shipping_flat_rate', 'free_delivery_threshold',
  'shipping_standard_rate', 'shipping_express_rate',
  'cod_available', 'payment_methods',
  'announcement_line1', 'announcement_line2', 'announcement_line3',
  'hero_headline', 'hero_subtitle', 'hero_badge_text',
  'seo_title', 'seo_description', 'seo_keywords',
  'security_badges', 'trust_badges',
  'postex_api_token', 'postex_webhook_secret',
  'tiktok_pixel_id', 'tiktok_access_token',
])

// Settings
export async function getSettings() {
  if (supabase) {
    const { data, error } = await supabase.from('settings').select('*').single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getSettings error:', error)

    let fromSupabase: Record<string, unknown> = {}
    if (data) {
      // Strip null values so they don't override defaults
      for (const [k, v] of Object.entries(data)) {
        if (v !== null) fromSupabase[k] = v
      }
    }

    // Merge with local file backup (fills in any keys missing from Supabase table)
    try {
      const db = await getDb()
      const fromFile = db.settings || {}
      const result = { ...SETTINGS_DEFAULTS, ...fromFile, ...fromSupabase }
      return result
    } catch {}

    const fallback = { ...SETTINGS_DEFAULTS, ...fromSupabase }
    console.log('[settings] getSettings - no file, supabase keys:', Object.keys(fromSupabase).length)
    return fallback
  }

  const db = await getDb()
  if (!db.settings) {
    db.settings = { ...SETTINGS_DEFAULTS }
    await saveDb(db)
  }
  return { ...SETTINGS_DEFAULTS, ...db.settings }
}

export async function updateSettings(updates: any) {
  if (supabase) {
    const current = await getSettings()
    const merged = { ...current, ...updates }

    // Always save to local file as backup (Vercel /tmp fallback)
    try {
      const db = await getDb()
      db.settings = merged
      await saveDb(db)
    } catch {}

    // Try ALL keys first (works when all Supabase columns exist)
    console.log('[settings] upserting with all keys, count:', Object.keys(merged).length)
    const { data, error } = await supabase.from('settings').upsert({ id: 1, ...merged }).select().single()
    if (!error && data) {
      console.log('[settings] upsert (all keys) succeeded')
      return data
    }

    console.warn('[settings] upsert (all keys) failed:', error?.message, JSON.stringify(error))

    // Fallback: only known columns (some might be missing from table)
    const filtered: Record<string, unknown> = { id: 1 }
    for (const [key, value] of Object.entries(merged)) {
      if (KNOWN_SETTINGS_COLUMNS.has(key)) filtered[key] = value
    }
    console.log('[settings] upserting with filtered keys, count:', Object.keys(filtered).length)
    const { data: data2, error: error2 } = await supabase.from('settings').upsert(filtered).select().single()
    if (!error2 && data2) {
      console.log('[settings] upsert (filtered) succeeded')
      return data2
    }

    console.error('[settings] upsert (filtered) also failed:', error2?.message, JSON.stringify(error2))
    return merged
  }
  const db = await getDb()
  db.settings = { ...db.settings, ...updates }
  await saveDb(db)
  return db.settings
}

// Marketing
export async function getPromos() {
  if (supabase) {
    const { data, error } = await supabase.from('marketing').select('*').order('created_at', { ascending: false })
    if (error) console.error('Supabase getPromos error:', error)
    return data || []
  }
  const db = await getDb()
  return db.marketing || []
}

export async function getPromoByCode(code: string) {
  if (supabase) {
    const { data, error } = await supabase.from('marketing').select('*').ilike('code', code).single()
    if (error && error.code !== 'PGRST116') console.error('Supabase getPromoByCode error:', error)
    return data || null
  }
  const db = await getDb()
  const marketing = db.marketing || []
  return marketing.find((p: any) => p.code.toUpperCase() === code.toUpperCase()) || null
}

export async function incrementPromoUsage(code: string) {
  if (supabase) {
    const { data: promo } = await supabase.from('marketing').select('*').ilike('code', code).single()
    if (promo) {
      await supabase.from('marketing').update({ usage_count: (promo.usage_count || 0) + 1 }).eq('id', promo.id)
    }
    return
  }
  const db = await getDb()
  const promo = db.marketing?.find((p: any) => p.code.toUpperCase() === code.toUpperCase())
  if (promo) {
    promo.usage_count = (promo.usage_count || 0) + 1
    await saveDb(db)
  }
}

export async function createPromo(promo: any) {
  promo.id = `PROMO-${crypto.randomUUID()}`
  promo.created_at = new Date().toISOString()
  promo.usage_count = 0
  
  if (supabase) {
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
  if (supabase) {
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
  if (supabase) {
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
