export type Intent = "order_check" | "price_query" | "product_search" | "policy" | "category" | "cart_check" | "phone_order" | "payment" | "general"

export function detectIntent(msg: string): { intent: Intent; keywords: string[]; phone?: string } {
  const low = msg.toLowerCase()

  const phoneMatch = msg.match(/(?:\+92|03|92|0)?[-\s]?3[0-9]{2}[-\s]?[0-9]{7}/)
  const phone = phoneMatch?.[0]?.replace(/[-\s]/g, "") || undefined

  if (phone && (/mera.*number|apna.*number|order.*(check|phone)|phone.*order|is number/i.test(low) || low.trim() === phone)) {
    return { intent: "phone_order", keywords: [], phone }
  }

  if (/ORD-|order id|order number|order status|mera order|track|truck/i.test(low)) {
    const idMatch = msg.match(/ORD-[A-Z0-9]+/i)
    return { intent: "order_check", keywords: [idMatch?.[0] || "order"] }
  }

  if (/cart|mere cart|shopping cart|basket|cart mein|cart me/i.test(low)) return { intent: "cart_check", keywords: [] }
  if (/pay|payment|pay kar|link|jazzcash|easypaisa|pay kar|payment link/i.test(low)) return { intent: "payment", keywords: [] }
  if (/kitna|price|cost|rate|kay|how much|costs?|rates?|budget|range/i.test(low)) return { intent: "price_query", keywords: msg.match(/\b[a-zA-Z]{3,}\b/g)?.slice(0, 5) || [] }
  if (/dikh|show|recommend|suggest|option|chahe|lau|prefer|dekhna|looking|search|find|need|want|best|chahiye|sport|formal|waterproof|digital|analog/i.test(low)) return { intent: "product_search", keywords: msg.match(/\b[a-zA-Z]{3,}\b/g)?.slice(0, 6) || [] }
  if (/return|warranty|delivery|shipping|policy|exchange|refund|ship/i.test(low)) return { intent: "policy", keywords: [] }
  if (/smart.?watch|analog.?watch|accessor|band|strap|buds|earphone|charge/i.test(low)) return { intent: "category", keywords: [] }

  return { intent: "general", keywords: [] }
}

export function extractPreferences(msg: string, prev: any): any {
  const prefs = { ...(prev || {}), updated_at: new Date().toISOString() }
  const low = msg.toLowerCase()

  const budgetMatch = msg.match(/(\d+[,]?\d*)\s*(k|hazar|hazaar|hundred|thousand)?/i)
  if (budgetMatch) prefs.budget = budgetMatch[0]

  if (/sport|gym|workout|fitness|running/i.test(low)) prefs.use_case = "sports"
  else if (/formal|office|business|professional|dress/i.test(low)) prefs.use_case = "formal"
  else if (/gift|gift|sale|birthday|wedding|eid|shadi|occasion/i.test(low)) prefs.use_case = "gift"
  else if (/daily|everyday|regular|roz|casual/i.test(low)) prefs.use_case = "daily"

  if (/smart/i.test(low) && !/analog/i.test(low)) prefs.category = "smart-watches"
  else if (/analog|classic|dress.*watch/i.test(low)) prefs.category = "analog-watches"
  else if (/accessor|band|strap|buds|earphone|charge/i.test(low)) prefs.category = "accessories"

  const productNames = msg.match(/\b(Ultra Sync Pro|Smart Band \d|Midnight Elite|Series \d+|Rolex|Submariner|Datejust|Versace|Rolx|KD99)\b/i)
  if (productNames) prefs.interested_product = productNames[0]

  return prefs
}

export function getSeasonalContext(): string {
  const now = new Date()
  const month = now.getMonth()
  const day = now.getDate()
  const hours = now.getHours()
  const weekday = now.getDay()
  const parts: string[] = []

  if (hours < 12) parts.push("Time: morning")
  else if (hours < 17) parts.push("Time: afternoon")
  else if (hours < 21) parts.push("Time: evening")
  else parts.push("Time: night")

  if (weekday === 5) parts.push("Today is Friday (Jumma) — customers often visit after Jumma prayers.")

  if (month === 2 && day >= 20 && day <= 31) parts.push("Ramzan season — customers looking for Eid gifts.")
  else if (month === 3 && day <= 15) parts.push("Ramzan season — customers looking for Eid gifts.")
  else if (month === 3 && day >= 20) parts.push("Eid ul-Fitr approaching! Gift suggestions work well.")
  else if (month === 5 && day >= 1 && day <= 15) parts.push("Eid ul-Adha season.")
  else if (month === 11 && day >= 15) parts.push("New Year season — gifting is high.")
  else if (month === 11 && day >= 20) parts.push("Eid Milad-un-Nabi around.")
  else if (month >= 5 && month <= 7) parts.push("Summer season — sports bands and waterproof watches popular.")
  else if (month >= 10 || month <= 1) parts.push("Winter season — leather straps and formal watches popular.")

  return parts.join("\n")
}

export function buildCustomerProfile(order: any): string {
  if (!order) return ""
  const lines: string[] = []
  lines.push(`Total Orders: ${order.count || 1}`)
  if (order.total_spent) lines.push(`Total Spent: Rs. ${order.total_spent}`)
  if (order.total_spent && order.total_spent > 30000) lines.push("VIP Customer — offer premium products")
  if (order.last_order) lines.push(`Last Order: ${new Date(order.last_order).toLocaleDateString()}`)
  return lines.join(", ")
}
