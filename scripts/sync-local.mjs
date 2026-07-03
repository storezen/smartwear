import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const backupPath = path.resolve(__dirname, '../database.json.backup')
const dbPath = path.resolve(__dirname, '../database.json')

const raw = fs.readFileSync(backupPath, 'utf-8')
const data = JSON.parse(raw)

// Fix all products: Active, stock 100
let products = (data.products || []).map(p => ({
  ...p,
  status: 'Active',
  is_active: true,
  stock: 100,
  is_featured: p.is_featured ?? false,
  created_at: p.created_at || new Date().toISOString(),
}))

const db = {
  products,
  orders: [],
  marketing: [],
  analytics: [],
  subscribers: [],
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
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
console.log(`Written ${products.length} products to database.json`)
