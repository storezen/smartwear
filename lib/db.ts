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
  'specifications', 'is_featured', 'is_active', 'upsell_accessories', 'cost_price',
  'colors'
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
      id: "prod-smart-1", name: "Smart Watch Pro Max (Test)", slug: "smart-watch-pro-max-test",
      description: "Premium smartwatch with HD display, health tracking, and 7-day battery life.",
      price: 5500, compare_price: 8000,
      images: ["https://images.unsplash.com/photo-1546868871-af0de0ae72b8?w=800&q=80"],
      category_slug: "smart-watches", brand: "Smartwear", stock: 50, rating: 4.5, reviews_count: 12,
      specifications: { "Case Size": "45mm", "Display": "2.05 HD IPS", "Battery": "420mAh", "Water Resistant": "IP67" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-15", upsell_accessories: []
    },
    {
      id: "prod-smart-2", name: "UltraFit Pro S3", slug: "ultrafit-pro-s3",
      description: "Advanced fitness tracking with GPS, heart rate monitor, SpO2, and 100+ workout modes.",
      price: 7200, compare_price: 9500,
      images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80"],
      category_slug: "smart-watches", brand: "Smartwear", stock: 35, rating: 4.7, reviews_count: 28,
      specifications: { "Display": "1.43 AMOLED", "Battery": "14 Days", "GPS": "Built-in", "Sensors": "HR, SpO2, Sleep" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-18", upsell_accessories: []
    },
    {
      id: "prod-smart-3", name: "StyleWatch Air 2026", slug: "stylewatch-air-2026",
      description: "Slim design, vibrant AMOLED display, Bluetooth calling, and AI-powered health insights.",
      price: 4800, compare_price: 6500,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
      category_slug: "smart-watches", brand: "Smartwear", stock: 60, rating: 4.3, reviews_count: 45,
      specifications: { "Display": "1.39 AMOLED", "Battery": "7 Days", "Bluetooth": "5.3", "Water Resistant": "IP68" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-12", upsell_accessories: []
    },
    {
      id: "prod-smart-4", name: "Titan X Sport", slug: "titan-x-sport",
      description: "Rugged design for extreme conditions. 10 ATM water resistance, impact-resistant body, and dual-band GPS.",
      price: 8900, compare_price: 12000,
      images: ["https://images.unsplash.com/photo-1557438159-51eec7dbc7a1?w=800&q=80"],
      category_slug: "smart-watches", brand: "Smartwear", stock: 20, rating: 4.8, reviews_count: 19,
      specifications: { "Case": "Titanium Alloy", "Display": "1.5 AMOLED", "Water Resistance": "10 ATM", "GPS": "Dual-band" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-20", upsell_accessories: []
    },
    {
      id: "prod-smart-5", name: "Series 11", slug: "series-11",
      description: "Ultra-slim design meets powerhouse performance. AMOLED display, Bluetooth calling, AI health tracking, and 7-day battery — redefining what a smartwatch can do.",
      price: 5500, compare_price: 8500,
      images: ["https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80", "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"],
      category_slug: "smart-watches", brand: "Smartwear", stock: 100, rating: 4.9, reviews_count: 86,
      specifications: { "Display": "1.43 AMOLED", "Battery": "7 Days", "Bluetooth": "5.3 Calling", "Health": "HR, SpO2, Sleep, Stress", "Water Resistant": "IP68" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-07-01", upsell_accessories: []
    },
    {
      id: "prod-analog-1", name: "Heritage Classic Automatic", slug: "heritage-classic-automatic",
      description: "Japanese automatic movement, sapphire crystal, and genuine leather strap.",
      price: 12999, compare_price: 15999,
      images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80"],
      category_slug: "analog-watches", brand: "Heritage", stock: 25, rating: 4.6, reviews_count: 34,
      specifications: { "Movement": "Automatic NH35A", "Case": "40mm Stainless Steel", "Crystal": "Sapphire", "Strap": "Genuine Leather" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-10", upsell_accessories: []
    },
    {
      id: "prod-analog-2", name: "Aviator Chronograph", slug: "aviator-chronograph",
      description: "Inspired by vintage pilot watches. Chronograph function, luminous hands, and a sturdy stainless steel bracelet.",
      price: 8999, compare_price: 10999,
      images: ["https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80"],
      category_slug: "analog-watches", brand: "Aviator", stock: 32, rating: 4.4, reviews_count: 27,
      specifications: { "Movement": "Quartz Chronograph", "Case": "42mm Steel", "Crystal": "Mineral Glass", "Water Resistance": "50m" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-08", upsell_accessories: []
    },
    {
      id: "prod-analog-3", name: "Minimalist Dress Watch", slug: "minimalist-dress-watch",
      description: "Clean, ultra-thin design with a sunburst dial and Italian leather strap.",
      price: 6999, compare_price: 8500,
      images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80"],
      category_slug: "analog-watches", brand: "Heritage", stock: 40, rating: 4.2, reviews_count: 18,
      specifications: { "Movement": "Quartz", "Case": "38mm Steel", "Strap": "Italian Leather", "Thickness": "7mm" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-05", upsell_accessories: []
    },
    {
      id: "prod-analog-4", name: "Diver 200 Automatic", slug: "diver-200-automatic",
      description: "Professional 200m water resistance, unidirectional bezel, and automatic movement.",
      price: 15999, compare_price: 18999,
      images: ["https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=80"],
      category_slug: "analog-watches", brand: "Heritage", stock: 15, rating: 4.9, reviews_count: 22,
      specifications: { "Movement": "Automatic 4R36", "Case": "44mm Steel", "Water Resistance": "200m", "Bezel": "Unidirectional" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-01", upsell_accessories: []
    },
    {
      id: "prod-ladies-1", name: "Elegance Rose Gold", slug: "elegance-rose-gold",
      description: "Beautiful rose gold case with mother-of-pearl dial and genuine crystal accents.",
      price: 8499, compare_price: 10999,
      images: ["https://images.unsplash.com/photo-1612817159949-195b6eb9e1af?w=800&q=80"],
      category_slug: "ladies-watches", brand: "Elegance", stock: 30, rating: 4.7, reviews_count: 41,
      specifications: { "Case": "30mm Rose Gold", "Dial": "Mother of Pearl", "Strap": "Genuine Leather", "Movement": "Quartz" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-14", upsell_accessories: []
    },
    {
      id: "prod-ladies-2", name: "Parisian Charm Bracelet Watch", slug: "parisian-charm-bracelet",
      description: "Elegant bracelet-style watch with a mesh strap and minimalist dial.",
      price: 6499, compare_price: 7999,
      images: ["https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=800&q=80"],
      category_slug: "ladies-watches", brand: "Elegance", stock: 45, rating: 4.5, reviews_count: 33,
      specifications: { "Case": "28mm Steel", "Strap": "Mesh Bracelet", "Movement": "Quartz", "Water Resistant": "Splash Proof" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-11", upsell_accessories: []
    },
    {
      id: "prod-ladies-3", name: "Crystal Glitz Diamond", slug: "crystal-glitz-diamond",
      description: "Dazzling crystal-embellished bezel with a white mother-of-pearl dial.",
      price: 11999, compare_price: 14999,
      images: ["https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80"],
      category_slug: "ladies-watches", brand: "Elegance", stock: 18, rating: 4.8, reviews_count: 26,
      specifications: { "Case": "32mm Steel", "Crystal": "Crystal Bezel", "Strap": "Leather", "Movement": "Quartz" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-03", upsell_accessories: []
    },
    {
      id: "prod-ladies-4", name: "Petite Vintage Round", slug: "petite-vintage-round",
      description: "Vintage-inspired small round case with Roman numerals and a soft pastel leather strap.",
      price: 4499, compare_price: 5500,
      images: ["https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800&q=80"],
      category_slug: "ladies-watches", brand: "Elegance", stock: 55, rating: 4.3, reviews_count: 38,
      specifications: { "Case": "26mm Steel", "Strap": "Pastel Leather", "Movement": "Quartz", "Dial": "Roman Numerals" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-05-28", upsell_accessories: []
    },
    {
      id: "prod-phone-1", name: "Lux Silicone Case - iPhone 15 Pro Max", slug: "lux-silicone-case-iphone15pm",
      description: "Premium liquid silicone case with microfiber lining. Drop protection up to 6 feet.",
      price: 1499, compare_price: 2500,
      images: ["https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&q=80"],
      category_slug: "phone-cases", brand: "Lux", stock: 80, rating: 4.4, reviews_count: 67,
      specifications: { "Material": "Liquid Silicone", "Compatibility": "iPhone 15 Pro Max", "Protection": "6ft Drop", "Color": "Multiple Options" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-16", upsell_accessories: []
    },
    {
      id: "prod-phone-2", name: "ArmorX Clear Case - Samsung S24 Ultra", slug: "armorx-clear-case-s24ultra",
      description: "Ultra-clear, scratch-resistant case with military-grade drop protection and 3-year anti-yellow guarantee.",
      price: 1799, compare_price: 3000,
      images: ["https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80"],
      category_slug: "phone-cases", brand: "ArmorX", stock: 65, rating: 4.6, reviews_count: 52,
      specifications: { "Material": "Polycarbonate + TPU", "Compatibility": "Samsung S24 Ultra", "Protection": "Military Grade", "Feature": "Anti-Yellow" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-13", upsell_accessories: []
    },
    {
      id: "prod-phone-3", name: "Leather Folio Wallet Case", slug: "leather-folio-wallet-case",
      description: "Genuine leather folio case with card slots, magnetic closure, and kickstand.",
      price: 2499, compare_price: 3500,
      images: ["https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=800&q=80"],
      category_slug: "phone-cases", brand: "Lux", stock: 40, rating: 4.3, reviews_count: 31,
      specifications: { "Material": "Genuine Leather", "Feature": "Card Slots + Kickstand", "Closure": "Magnetic" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-09", upsell_accessories: []
    },
    {
      id: "prod-phone-4", name: "Glossy Clear MagSafe Case", slug: "glossy-magsafe-case",
      description: "Ultra-thin, crystal clear case with built-in MagSafe magnets. Wireless charging compatible.",
      price: 1299, compare_price: 2200,
      images: ["https://images.unsplash.com/photo-1555316227-402f9645e213?w=800&q=80"],
      category_slug: "phone-cases", brand: "ArmorX", stock: 90, rating: 4.1, reviews_count: 44,
      specifications: { "Material": "Hybrid Clear", "MagSafe": "Yes", "Thickness": "1.5mm", "Wireless Charging": "Compatible" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-07", upsell_accessories: []
    },
    {
      id: "prod-bands-1", name: "Silicone Sport Band - 22mm", slug: "silicone-sport-band-22mm",
      description: "Soft, sweatproof silicone band with quick-release pins. 7 colors available.",
      price: 999, compare_price: 1500,
      images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"],
      category_slug: "watch-bands", brand: "Lumina", stock: 120, rating: 4.5, reviews_count: 89,
      specifications: { "Material": "Premium Silicone", "Width": "22mm", "Feature": "Quick-Release Pins", "Waterproof": "Yes" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-19", upsell_accessories: []
    },
    {
      id: "prod-bands-2", name: "Genuine Leather Band - 20mm", slug: "genuine-leather-band-20mm",
      description: "Handcrafted Italian leather band with stitched detailing. Fits most 20mm watches.",
      price: 1999, compare_price: 3000,
      images: ["https://images.unsplash.com/photo-1491336477066-31156b5e4f35?w=800&q=80"],
      category_slug: "watch-bands", brand: "Lumina", stock: 55, rating: 4.7, reviews_count: 42,
      specifications: { "Material": "Italian Leather", "Width": "20mm", "Stitching": "Handcrafted", "Hardware": "Brushed Steel" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-17", upsell_accessories: []
    },
    {
      id: "prod-bands-3", name: "Metal Link Bracelet - 22mm", slug: "metal-link-bracelet-22mm",
      description: "Premium stainless steel mesh bracelet with adjustable clasp. Breathable and comfortable.",
      price: 2499, compare_price: 3999,
      images: ["https://images.unsplash.com/photo-1585123334904-845d60e97b29?w=800&q=80"],
      category_slug: "watch-bands", brand: "Lumina", stock: 40, rating: 4.4, reviews_count: 37,
      specifications: { "Material": "Stainless Steel Mesh", "Width": "22mm", "Clasp": "Magnetic Adjustable", "Finish": "Brushed Silver" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-06", upsell_accessories: []
    },
    {
      id: "prod-audio-1", name: "SoundPods Pro Wireless Earbuds", slug: "soundpods-pro-earbuds",
      description: "Active noise cancellation, 30-hour battery, and crystal-clear calls. IPX5 water resistant.",
      price: 4999, compare_price: 6999,
      images: ["https://images.unsplash.com/photo-1484704849701-f2a667e90430?w=800&q=80"],
      category_slug: "audio", brand: "SoundPods", stock: 60, rating: 4.6, reviews_count: 73,
      specifications: { "Type": "True Wireless Earbuds", "ANC": "Yes", "Battery": "30 Hours", "Water Resistant": "IPX5" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-22", upsell_accessories: []
    },
    {
      id: "prod-audio-2", name: "BassBoost Wireless Over-Ear Headphones", slug: "bassboost-wireless-headphones",
      description: "Deep bass, 40-hour playback, and ultra-comfortable memory foam ear cups. Foldable design.",
      price: 6999, compare_price: 8999,
      images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"],
      category_slug: "audio", brand: "BassBoost", stock: 25, rating: 4.5, reviews_count: 58,
      specifications: { "Type": "Over-Ear", "Battery": "40 Hours", "Driver": "40mm Dynamic", "Foldable": "Yes" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-20", upsell_accessories: []
    },
    {
      id: "prod-audio-3", name: "AirPods Style TWS Earbuds", slug: "airpods-style-tws-earbuds",
      description: "Seamless pairing, comfortable fit, and impressive sound quality. Works with all Bluetooth devices.",
      price: 2999, compare_price: 4500,
      images: ["https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=800&q=80"],
      category_slug: "audio", brand: "SoundPods", stock: 75, rating: 4.2, reviews_count: 64,
      specifications: { "Type": "TWS Earbuds", "Battery": "24 Hours", "Bluetooth": "5.3", "Charging": "USB-C" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-04", upsell_accessories: []
    },
    {
      id: "prod-audio-4", name: "Neckband Pro Bluetooth", slug: "neckband-pro-bluetooth",
      description: "Magnetic earbuds, 20-hour battery, and tangle-free flat cable. Ideal for commutes.",
      price: 1799, compare_price: 2500,
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80"],
      category_slug: "audio", brand: "BassBoost", stock: 85, rating: 4.0, reviews_count: 49,
      specifications: { "Type": "Neckband", "Battery": "20 Hours", "Feature": "Magnetic Earbuds", "Cable": "Flat Tangle-Free" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-05-30", upsell_accessories: []
    },
    {
      id: "prod-charger-1", name: "SuperFast 65W GaN Charger", slug: "superfast-65w-gan-charger",
      description: "Compact GaN technology charger with dual USB-C ports. Charges laptop, tablet, and phone.",
      price: 3499, compare_price: 4999,
      images: ["https://images.unsplash.com/photo-1591290619762-d2d4e1d8b8c8?w=800&q=80"],
      category_slug: "chargers", brand: "PowerUp", stock: 45, rating: 4.6, reviews_count: 81,
      specifications: { "Power": "65W GaN", "Ports": "2x USB-C", "Compatibility": "Laptop, Tablet, Phone", "Compact": "Yes" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-21", upsell_accessories: []
    },
    {
      id: "prod-charger-2", name: "3-in-1 Wireless Charging Station", slug: "3in1-wireless-charging-station",
      description: "Charge your phone, watch, and earbuds simultaneously. LED indicator and anti-slip design.",
      price: 4499, compare_price: 5999,
      images: ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=80"],
      category_slug: "chargers", brand: "PowerUp", stock: 30, rating: 4.4, reviews_count: 36,
      specifications: { "Type": "Wireless", "Devices": "3 Devices", "Compatibility": "Phone + Watch + Buds", "Feature": "LED Indicator" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-02", upsell_accessories: []
    },
    {
      id: "prod-charger-3", name: "Magnetic Watch Charger Cable", slug: "magnetic-watch-charger-cable",
      description: "Official-grade magnetic charging cable for smartwatches. Fast charging with 1.5m length.",
      price: 1499, compare_price: 2500,
      images: ["https://images.unsplash.com/photo-1586954551646-3c5b1a0a5b5e?w=800&q=80"],
      category_slug: "chargers", brand: "PowerUp", stock: 70, rating: 4.3, reviews_count: 55,
      specifications: { "Type": "Magnetic Charger", "Length": "1.5m", "Compatibility": "Smartwatches", "Fast Charge": "Yes" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-05-25", upsell_accessories: []
    },
    {
      id: "prod-power-1", name: "PowerBank 20000mAh", slug: "powerbank-20000mah",
      description: "High-capacity 20000mAh power bank with dual USB-A and USB-C output.",
      price: 3999, compare_price: 5499,
      images: ["https://images.unsplash.com/photo-1609091839311-9ed94aeb2f64?w=800&q=80"],
      category_slug: "power-banks", brand: "PowerUp", stock: 35, rating: 4.5, reviews_count: 62,
      specifications: { "Capacity": "20000mAh", "Output": "2x USB-A + USB-C", "Fast Charge": "18W PD", "Feature": "LED Battery Indicator" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-18", upsell_accessories: []
    },
    {
      id: "prod-power-2", name: "MagSafe Power Bank 10000mAh", slug: "magsafe-powerbank-10000mah",
      description: "Slim MagSafe-compatible wireless power bank. Snap on and charge without cables.",
      price: 5499, compare_price: 7500,
      images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"],
      category_slug: "power-banks", brand: "PowerUp", stock: 28, rating: 4.2, reviews_count: 19,
      specifications: { "Capacity": "10000mAh", "Wireless": "15W MagSafe", "Cable": "USB-C Cable", "Thickness": "12mm" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-12", upsell_accessories: []
    },
    {
      id: "prod-watchcase-1", name: "SlimGuard Watch Case 45mm", slug: "slimguard-watch-case-45mm",
      description: "Ultra-thin TPU bumper case with raised bezel protection. Full access to buttons.",
      price: 799, compare_price: 1200,
      images: ["https://images.unsplash.com/photo-1617625802912-888f43813e2f?w=800&q=80"],
      category_slug: "watch-cases", brand: "SlimGuard", stock: 100, rating: 4.3, reviews_count: 47,
      specifications: { "Material": "TPU", "Compatibility": "45mm Smartwatches", "Protection": "Raised Bezel", "Feature": "Ultra-Thin" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-15", upsell_accessories: []
    },
    {
      id: "prod-watchcase-2", name: "Tempered Glass Screen Protector", slug: "tempered-glass-watch-protector",
      description: "HD clear tempered glass with oleophobic coating. 9H hardness, bubble-free installation.",
      price: 599, compare_price: 999,
      images: ["https://images.unsplash.com/photo-1574701148212-8518049c7b2a?w=800&q=80"],
      category_slug: "watch-cases", brand: "SlimGuard", stock: 150, rating: 4.4, reviews_count: 38,
      specifications: { "Material": "Tempered Glass", "Hardness": "9H", "Coating": "Oleophobic", "Compatibility": "44-46mm Smartwatches" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-10", upsell_accessories: []
    },
    {
      id: "prod-acc-1", name: "Watch Travel Case - 2 Slot", slug: "watch-travel-case-2slot",
      description: "Compact, protective case for two watches. Soft microfiber lining and elegant leather exterior.",
      price: 2499, compare_price: 3499,
      images: ["https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80"],
      category_slug: "accessories", brand: "Lumina", stock: 41, rating: 4.7, reviews_count: 29,
      specifications: { "Capacity": "2 Watches", "Material": "Leather + Microfiber", "Dimensions": "18 x 10 x 6 cm", "Feature": "Compact" },
      status: "Active", is_featured: true, is_active: true, created_at: "2026-06-08", upsell_accessories: []
    },
    {
      id: "prod-acc-2", name: "Watch Cleaning Kit", slug: "watch-cleaning-kit",
      description: "Complete care kit with microfiber cloth, cleaning solution, and soft brush.",
      price: 699, compare_price: 1200,
      images: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&q=80"],
      category_slug: "accessories", brand: "Lumina", stock: 200, rating: 4.1, reviews_count: 15,
      specifications: { "Includes": "Microfiber Cloth, Solution, Brush", "Purpose": "Watch & Jewelry Cleaning", "Portable": "Yes" },
      status: "Active", is_featured: false, is_active: true, created_at: "2026-06-01", upsell_accessories: []
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
    let allData: any[] = []
    const PAGE_SIZE = 1000
    let from = 0
    let to = PAGE_SIZE - 1
    let hasMore = true
    while (hasMore) {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false }).range(from, to)
      if (error) {
        console.error('Supabase getProducts error:', error)
        break
      }
      if (data && data.length > 0) {
        allData = allData.concat(data)
        if (data.length < PAGE_SIZE) hasMore = false
        else { from += PAGE_SIZE; to += PAGE_SIZE }
      } else {
        hasMore = false
      }
    }
    if (allData.length > 0) {
      const db = await getDb()
      const localMap = new Map((db.products || []).map((p: any) => [p.slug, p]))
      return normalizeProductList(allData.map((p: any) => ({ ...(localMap.get(p.slug) || {}), ...p })))
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
    if (data) {
      const db = await getDb()
      const local = (db.products || []).find((p: any) => p.slug === canonicalSlug || p.slug === slug)
      return normalizeProductList([{ ...(local || {}), ...data }])[0]
    }
  }

  const db = await getDb()
  const local = normalizeProductList(db.products || [])
  if (local.length > 0) {
    const product = local.find((p: any) => p.slug === canonicalSlug || p.slug === slug)
    if (product) return product
  }

  return null
}

export async function addProduct(product: any, skipSupabase = false) {
  product.id = `PROD-${crypto.randomUUID()}`
  if (!product.created_at) product.created_at = new Date().toISOString()
  if (product.is_active === undefined) product.is_active = product.status === 'Active'
  
  if (supabase && !skipSupabase) {
    const stripped = stripNonProductFields(product)
    const { data, error } = await supabase.from('products').insert([stripped]).select().single()
    if (!error && data) {
      const merged = { ...data, ...product }
      const db = await getDb()
      db.products.unshift(merged)
      globalAny.memoryDb = db
      return merged
    }
    if (error?.message?.includes('column') || error?.code === 'PGRST204') {
      return addProduct(product, true)
    }
    throw new Error(error?.message || 'Supabase add failed')
  }
  const db = await getDb()
  db.products.unshift(product)
  await saveDb(db)
  return product
}

export async function updateProduct(id: string, updates: any, skipSupabase = false) {
  if (updates.status !== undefined && updates.is_active === undefined) {
    updates.is_active = updates.status === 'Active' || updates.status === 'Out of Stock'
  }
  if (supabase && !skipSupabase) {
    const stripped = stripNonProductFields(updates)
    const { data, error } = await supabase.from('products').update(stripped).eq('id', id).select().single()
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
    if (error?.message?.includes('column') || error?.code === 'PGRST204') {
      return updateProduct(id, updates, true)
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
      await saveDb(db)
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
  tiktok_test_event_code: "",
  homepage_picks: "{}",
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
  'tiktok_pixel_id', 'tiktok_access_token', 'tiktok_test_event_code',
  'homepage_picks',
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

    console.warn('[settings] upsert (filtered) failed:', error2?.message)

    // Retry by excluding columns that don't exist in the table
    // Extract column name from PostgREST error:
    //   - column "xxx" of relation "yyy" does not exist (Postgres)
    //   - Could not find the 'xxx' column of 'yyy' in the schema cache (PostgREST)
    const missingColumnMatch = error2?.message?.match(/column "([^"]+)"(?: of relation "[^"]+")? does not exist|Could not find the '([^']+)' column/)
    if (missingColumnMatch) {
      const badColumn = missingColumnMatch[1] || missingColumnMatch[2]
      console.warn('[settings] retrying without column:', badColumn)
      delete filtered[badColumn]
      const { data: data3, error: error3 } = await supabase.from('settings').upsert(filtered).select().single()
      if (!error3 && data3) {
        console.log('[settings] upsert (excluded column) succeeded')
        return data3
      }
      console.error('[settings] upsert (excluded column) also failed:', error3?.message)
    }

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
