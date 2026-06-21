// Bulk test event generator for Live Analytics
// Usage: node scripts/bulk-events.mjs [count=100]
// Make sure your dev server is running on http://localhost:3000

const BASE_URL = "http://localhost:3000"
const COUNT = parseInt(process.argv[2] || "100", 10)

const PRODUCTS = [
  "Apple Watch Ultra 2", "Rolex Submariner", "Casio G-Shock",
  "Omega Speedmaster", "Seiko Prospex", "Tag Heuer Carrera",
  "Breitling Navitimer", "IWC Pilot", "Patek Philippe Nautilus",
  "Audemars Piguet Royal Oak", "Cartier Tank", "Hublot Big Bang",
]
const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"]
const EVENTS = ["PageView", "ViewContent", "AddToCart", "InitiateCheckout", "CompletePayment"]
const SOURCES = ["Direct / Organic", "TikTok Ad", "Instagram", "Facebook", "Google", "WhatsApp"]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function buildEventName() {
  const baseEvent = pick(EVENTS)
  const product = baseEvent === "PageView" ? "Store Visit" : pick(PRODUCTS)
  const city = pick(CITIES)
  const campaign = pick(SOURCES)
  const sessionId = `sess_bulk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  return `${baseEvent}::${product}::${city}::${campaign}::${sessionId}`
}

async function sendBatch(batch) {
  const results = await Promise.allSettled(
    batch.map((event_name) =>
      fetch(`${BASE_URL}/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name,
          value: Math.floor(Math.random() * 250000) + 1000,
        }),
      }).then((r) => r.json())
    )
  )
  const succeeded = results.filter((r) => r.status === "fulfilled").length
  return succeeded
}

async function run() {
  console.log(`\n  ⚡ Sending ${COUNT} bulk events to ${BASE_URL}/api/analytics\n`)
  console.log(`  Products: ${PRODUCTS.length} | Cities: ${CITIES.length} | Sources: ${SOURCES.length}\n`)

  const BATCH_SIZE = 20
  const batches = Math.ceil(COUNT / BATCH_SIZE)
  let totalSent = 0

  for (let i = 0; i < batches; i++) {
    const batch = []
    for (let j = 0; j < BATCH_SIZE && totalSent + j < COUNT; j++) {
      batch.push(buildEventName())
    }
    const ok = await sendBatch(batch)
    totalSent += ok
    const pct = Math.round((totalSent / COUNT) * 100)
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5))
    process.stdout.write(`\r  [${bar}] ${totalSent}/${COUNT} events sent (${pct}%)`)
    await new Promise((r) => setTimeout(r, 150))
  }

  console.log(`\n\n  ✅ Done! Sent ${totalSent} events.\n`)
  console.log(`  Now check http://localhost:3000/admin/live\n`)
}

run().catch(console.error)
