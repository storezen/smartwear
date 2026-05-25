import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@prisma/client"

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" })
const prisma = new PrismaClient({ adapter })

const DEFAULT_CATEGORIES = [
  {
    name: "Series 11 Pro",
    slug: "series-11",
    description: "Latest Series 11 smartwatches with dynamic island, AMOLED screen & Bluetooth calling",
    image: "https://images.unsplash.com/photo-1546868871-af0de0ae72c2?w=600&q=85",
    showInNavbar: true,
    showOnHomepage: true,
    active: true,
    sortOrder: 1,
  },
  {
    name: "Ultra 2 Series",
    slug: "ultra-series",
    description: "Rugged aerospace-grade titanium finish smartwatches built for active lifestyles",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85",
    showInNavbar: true,
    showOnHomepage: true,
    active: true,
    sortOrder: 2,
  },
  {
    name: "Straps & Bands",
    slug: "straps-bands",
    description: "Premium silicone, alpine loop, trail loop, and magnetic link straps",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=85",
    showInNavbar: true,
    showOnHomepage: true,
    active: true,
    sortOrder: 3,
  },
  {
    name: "Tech Accessories",
    slug: "accessories",
    description: "Wireless watch chargers, stand docks, screen protectors, and cases",
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=600&q=85",
    showInNavbar: true,
    showOnHomepage: true,
    active: true,
    sortOrder: 4,
  },
]

const SAMPLE_PRODUCTS = [
  {
    name: "Smartwatch Series 11 Pro Max (AMOLED)",
    price: 8499,
    originalPrice: 12499,
    cost: 3400,
    image: "https://images.unsplash.com/photo-1546868871-af0de0ae72c2?w=600&q=85",
    category: "series-11",
    description: "The ultimate Series 11 replica with a flawless 2.2-inch Always-On AMOLED screen, dynamic notification island, luxury alloy chassis, dual-band Bluetooth calling (HD microphone), custom watch faces, and 5-7 days battery backup.",
    inStock: true,
    featured: true,
    sku: "SW-S11-PRO",
    quantity: 45,
    lowStockThreshold: 5,
    rating: 4.9,
    reviews: 384,
    specs: [
      { label: "Display", value: "2.2\" Always-On AMOLED" },
      { label: "Connectivity", value: "Bluetooth 5.3 (Calling)" },
      { label: "Battery Life", value: "Up to 7 Days (380mAh)" },
      { label: "Waterproof", value: "IP68 Certified" },
      { label: "Sensors", value: "Heart Rate, SpO2, Sleep Tracker" }
    ],
    variants: [
      { name: "Midnight Black", value: "Midnight Black", sku: "SW-S11-BLK", image: "https://images.unsplash.com/photo-1546868871-af0de0ae72c2?w=600&q=85" },
      { name: "Starlight Silver", value: "Starlight Silver", sku: "SW-S11-SLV", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85" },
      { name: "Deep Sapphire Blue", value: "Deep Sapphire Blue", sku: "SW-S11-BLU", image: "https://images.unsplash.com/photo-1434056886845-dac89ffee9b5?w=600&q=85" }
    ],
    optionNames: ["Color Strap"]
  },
  {
    name: "Smartwatch Ultra 2 Rugged Edition",
    price: 11999,
    originalPrice: 16999,
    cost: 4800,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85",
    category: "ultra-series",
    description: "Rugged aerospace-grade titanium alloy finish case, orange action button, dual speakers, siren alert, genuine trail loop strap, built-in compass, precise step tracking, heart health monitor, and wireless fast charging support.",
    inStock: true,
    featured: true,
    sku: "SW-ULTRA-2",
    quantity: 18,
    lowStockThreshold: 4,
    rating: 4.8,
    reviews: 219,
    specs: [
      { label: "Chassis", value: "Aerospace Titanium Alloy" },
      { label: "Display", value: "2.12\" Sapphire Glass 1000 nits" },
      { label: "Action Button", value: "Customizable Action Trigger" },
      { label: "Sensors", value: "Compass, GPS Sync, Altitude" },
      { label: "Speaker", value: "Dual Audio Chambers" }
    ],
    variants: [
      { name: "Titanium Orange", value: "Titanium Orange", sku: "SW-ULT2-ORN", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85" },
      { name: "Obsidian Black", value: "Obsidian Black", sku: "SW-ULT2-BLK", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=85" },
      { name: "Oceanic Blue", value: "Oceanic Blue", sku: "SW-ULT2-BLU", image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=85" }
    ],
    optionNames: ["Color Strap"]
  },
  {
    name: "Alpine Loop Premium Strap",
    price: 1499,
    originalPrice: 2499,
    cost: 600,
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=85",
    category: "straps-bands",
    description: "Crafted from two textile layers woven together into one continuous piece without stitching. High-strength titanium G-hook slides easily into the loops for a secure fit.",
    inStock: true,
    featured: false,
    sku: "ST-ALPINE-01",
    quantity: 120,
    lowStockThreshold: 10,
    rating: 4.7,
    reviews: 94,
    specs: [
      { label: "Material", value: "Woven High-Strength Polyester" },
      { label: "Hook", value: "Titanium G-Hook" },
      { label: "Compatibility", value: "49mm / 45mm / 44mm / 42mm" }
    ],
    variants: [
      { name: "Sunset Orange", value: "Sunset Orange", sku: "ST-ALP-ORN" },
      { name: "Alpine Green", value: "Alpine Green", sku: "ST-ALP-GRN" },
      { name: "Polar Starlight", value: "Polar Starlight", sku: "ST-ALP-SLV" }
    ],
    optionNames: ["Color"]
  },
  {
    name: "Watch MagSafe Fast Charging Dock",
    price: 1999,
    originalPrice: 2999,
    cost: 800,
    image: "https://images.unsplash.com/photo-1590658268037-6bf12f032f73?w=600&q=85",
    category: "accessories",
    description: "Magnetic fast charger with USB-C connector. Auto-aligns with your Series 11 or Ultra smartwatch to charge from 0% to 100% in under 90 minutes. Durable alloy plate.",
    inStock: true,
    featured: false,
    sku: "AC-MAG-CHG",
    quantity: 65,
    lowStockThreshold: 8,
    rating: 4.6,
    reviews: 142,
    specs: [
      { label: "Input", value: "5V/2A, 9V/2A USB-C" },
      { label: "Output", value: "5W Max Wireless" },
      { label: "Cable Length", value: "1.2 Meters Shielded" }
    ],
    variants: [],
    optionNames: []
  }
]

async function seed() {
  // Clear existing settings or custom elements to avoid layout mismatch
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.coupon.deleteMany()

  // Insert coupons
  await prisma.coupon.createMany({
    data: [
      { code: "SMART20", discount: 20, type: "percentage", active: true },
      { code: "LAUNCH10", discount: 10, type: "percentage", active: true },
      { code: "LUMS25", discount: 25, type: "percentage", active: true },
    ]
  })

  // Insert categories
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.create({
      data: cat
    })
  }

  // Insert products
  for (const prod of SAMPLE_PRODUCTS) {
    await prisma.product.create({
      data: prod
    })
  }

  console.log("Database seeded successfully with premium smartwatch tech assets!")
  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error("Seeding error:", e)
  process.exit(1)
})
