import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProducts, getSettings } from "@/lib/db"

type Intent = "order_check" | "price_query" | "product_search" | "policy" | "category" | "cart_check" | "phone_order" | "payment" | "general"

function detectIntent(msg: string): { intent: Intent; keywords: string[]; phone?: string } {
  const low = msg.toLowerCase()

  const phoneMatch = msg.match(/(?:\+92|03|92|0)?[-\s]?3[0-9]{2}[-\s]?[0-9]{7}/)
  const phone = phoneMatch?.[0]?.replace(/[-\s]/g, "") || undefined

  if (/MERA\s*(?:NUMBER|NAMBER|PHONE)|APNA\s*NUMBER|03\d{9}|ORDER.*PHONE|PHONE.*ORDER/i.test(low) && phone) {
    return { intent: "phone_order", keywords: [], phone }
  }

  if (/ORD-|order id|order number|order status|mera order|track|truck/i.test(low)) {
    const idMatch = msg.match(/ORD-[A-Z0-9]+/i)
    return { intent: "order_check", keywords: [idMatch?.[0] || "order"] }
  }

  if (/cart|mere cart|shopping cart|basket|cart mein|cart me/i.test(low)) return { intent: "cart_check", keywords: [] }

  if (/pay|payment|pay kar|link|jazzcash|easypaisa|bank transfer|pay kar|payment link/i.test(low)) return { intent: "payment", keywords: [] }

  if (/kitna|price|cost|rate|kay|how much|costs?|rates|budget|range/i.test(low)) return { intent: "price_query", keywords: msg.match(/\w+/g)?.slice(1, 5) || [] }
  if (/dikh|show|recommend|suggest|option|chahe|lau|prefer|dekhna|looking|search|find|have.*watch|want.*watch|need|want|best|chahiye|chiye|sport|formal|waterproof|digital|analog/i.test(low)) return { intent: "product_search", keywords: msg.match(/\w+/g)?.slice(1, 6) || [] }

  if (/return|warranty|delivery|shipping|policy|exchange|refund|ship/i.test(low)) return { intent: "policy", keywords: [] }
  if (/smart.?watch|analog.?watch|accessor|band|strap|buds|earphone|charge/i.test(low)) return { intent: "category", keywords: [] }

  return { intent: "general", keywords: [] }
}

function extractPreferences(msg: string, prev: any): any {
  const prefs = { ...(prev || {}), updated_at: new Date().toISOString() }
  const low = msg.toLowerCase()

  const budgetMatch = msg.match(/(\d+[,]?\d*)\s*(?:k|hazar|hazaar)?/i)
  if (budgetMatch) prefs.budget = budgetMatch[0]

  if (/sport/i.test(low)) prefs.use_case = "sports"
  else if (/formal|office|business|professional/i.test(low)) prefs.use_case = "formal"
  else if (/gift|gift|sale|birthday|wedding|eid|shadi/i.test(low)) prefs.use_case = "gift"
  else if (/daily|everyday|regular|roz/i.test(low)) prefs.use_case = "daily"

  if (/smart/i.test(low)) prefs.category = "smart-watches"
  else if (/analog/i.test(low)) prefs.category = "analog-watches"
  else if (/accessor|band|strap/i.test(low)) prefs.category = "accessories"

  const productNames = msg.match(/\b(Ultra Sync Pro|Smart Band \d|Midnight Elite|Series \d+|ROLEX|Submariner|Datejust|Versace|Rolx)\b/i)
  if (productNames) prefs.interested_product = productNames[0]

  return prefs
}

async function fetchContext(intent: Intent, keywords: string[], productSlug: string | null, orderId: string | null, phone?: string, message?: string) {
  const ctx: string[] = []

  if (intent === "order_check" && orderId) {
    const { data: order } = await supabase?.from("orders").select("*").eq("id", orderId).maybeSingle() || {}
    if (order) ctx.push(`Order: ${order.id}, Status: ${order.status}, Total: Rs. ${order.total}, Items: ${(order.items || []).length}`)
  }

  if (intent === "phone_order" && phone) {
    const cleanPhone = phone.replace(/^92/, "0").replace(/^0/, "")
    const { data: orders } = await supabase?.from("orders").select("id, status, total, created_at, items").or(`phone.ilike.%${cleanPhone}%,customer->>'phone'.ilike.%${cleanPhone}%`).order("created_at", { ascending: false }).limit(3) || {}
    if (orders && orders.length > 0) {
      ctx.push(`Orders found for this phone:`)
      orders.forEach((o: any) => ctx.push(`- ${o.id}: ${o.status}, Rs. ${o.total} (${new Date(o.created_at).toLocaleDateString()})`))
    } else {
      ctx.push("No orders found for this phone number.")
    }
  }

  if (intent === "price_query" || intent === "product_search" || intent === "category") {
    const products = await getProducts().catch(() => [])
    const catSlugs: string[] = []
    if (/smart/i.test(keywords.join(" "))) catSlugs.push("smart-watches")
    if (/analog/i.test(keywords.join(" "))) catSlugs.push("analog-watches")
    if (/accessor|band|strap|buds|earphone/i.test(keywords.join(" "))) catSlugs.push("accessories")

    let filtered: any[] = []
    if (catSlugs.length > 0) filtered = products.filter((p: any) => catSlugs.includes(p?.category_slug))

    // Smart search: name + description + specs + brand
    const searchTerms = keywords.filter(k => k.length > 2)
    if (searchTerms.length > 0) {
      const hits = products.filter((p: any) => {
        const searchText = [p.name, p.description, p.brand, p.category_slug, p?.specifications ? Object.values(p.specifications).join(" ") : ""].filter(Boolean).join(" ").toLowerCase()
        return searchTerms.some(t => searchText.includes(t.toLowerCase()))
      }).slice(0, 5)
      if (hits.length > 0) { filtered = hits }
    }

    // Price range detection from message
    const prices = message?.match(/(\d+[,]?\d*)/g)?.map(Number) || []
    const priceRange = prices.filter((n: number) => n > 500)
    if (priceRange.length > 0 && filtered.length > 0) {
      const maxPrice = Math.max(...priceRange)
      const minPrice = Math.min(...priceRange)
      filtered = filtered.filter((p: any) => p.price >= minPrice * 0.7 && p.price <= maxPrice * 1.3)
    }

    const top = filtered.slice(0, 5)
    if (top.length > 0) {
      ctx.push("Products:")
      top.forEach((p: any) => {
        const badges = []
        if (p.reviews_count > 10) badges.push("🔥 Popular")
        if (p.stock < 5) badges.push(`⚡ Only ${p.stock} left`)
        ctx.push(`[PRODUCT:${p.slug}] ${p.name} — Rs. ${p.price?.toLocaleString()}${p.compare_price ? ` (was Rs. ${p.compare_price?.toLocaleString()})` : ""} | ★${p.rating || "—"} (${p.reviews_count || 0} reviews) | Stock: ${p.stock || 0} | ${p.category_slug}${badges.length ? " | " + badges.join(", ") : ""}`)
      })
    } else if (intent !== "product_search") {
      ctx.push("Products available across categories. Ask about smart watches, analog watches, or accessories.")
    } else {
      ctx.push("No exact match found. Try different keywords or browse categories: smart watches, analog watches, accessories.")
    }
  }

  if (intent === "policy") {
    const settings = await getSettings().catch(() => ({}))
    ctx.push(`Policy: Returns — 7-day easy return full money back. Warranty — 1 year smart watches, 6 months accessories. Shipping — Free over Rs. ${(settings?.free_delivery_threshold || 10000).toLocaleString()}, standard Rs. ${settings?.shipping_standard_rate || 200} (2-5 days), express Rs. ${settings?.shipping_express_rate || 500}. Payment — ${(() => { try { return JSON.parse(settings?.payment_methods || '[]').join(", ") } catch { return "COD, JazzCash, Easypaisa, Bank Transfer" } })()}. Open box delivery — check before paying.`)
  }

  if (intent === "cart_check") {
    ctx.push("The customer is asking about their cart. Guide them to check their cart and offer help completing the purchase.")
  }

  if (intent === "payment") {
    ctx.push("The customer is asking about payment. Available: COD, JazzCash, Easypaisa, Bank Transfer. Offer to create a payment link or guide them through checkout.")
  }

  return ctx.join("\n")
}

function buildPersonaPrompt(settings: any): string {
  const storeName = settings?.store_name || "Smartwear Pakistan"
  const phone = settings?.support_phone || "+92 300 1234567"
  const email = settings?.support_email || "concierge@smartwear.pk"
  const address = `${settings?.store_address_line1 || "MM Alam Road"}, ${settings?.store_address_line2 || "Gulberg III"}, ${settings?.store_city || "Lahore, Pakistan"}`
  const hours = settings?.business_hours || "Mon-Sat: 10am - 8pm PKT"
  const whatsappLink = `https://wa.me/${settings?.whatsapp_number || "923001234567"}`

  return `Tum Ahmed ho. 32 saal, 7+ years experience, ${storeName}, MM Alam Road Lahore. Premium watches & accessories.

## Core Rules
1. Language: Match user's language exactly. Roman Urdu → Roman Urdu. English → English.
2. Pakistani mentality: Value for money, originality, durability, status, gifts.
3. Behavior: Features nahi, benefits batao. Zarurat samjho. Objection handle karo.
4. Lead gen: 3-5 msgs mein interest → number maango.
5. Handoff: Technical sawaal ya 3 "nahi pata" → WhatsApp de do: ${whatsappLink}
6. Remember: Customer ke past preferences track karo (budget, product interest, use case).

## Store
- ${address} | ${hours} | ${phone} | ${email} | WhatsApp: ${whatsappLink}

## Scenario Rules
- Budget → 2 options (budget + thoda upar)
- Comparison → max 3 differences
- Order → confirm product/address/phone
- Phone order → find orders by phone number
- Cart → guide to /cart page for checkout
- Payment → offer COD, JazzCash, Easypaisa link
- Confused → clarify
- Not available → alternate suggest
- Price objection → features justify + COD/return reassure
- Originality → "100% original, bill + warranty"
- Gift → suggest with packaging

## Style
- 1-2 lines per para. Max 1 emoji. Product names bold.
- Direct, confident, zero corporate speak.
- End with ONE action.`
}

function buildFewShot(): string {
  return `
## Examples
User: Price thodi zyada lag rahi hai bhai
Answer: Samajh sakta hoon bhai. Yeh normal use mein 2-3 saal easily chal jati hai. Long term mein value achhi ban jati hai. Budget thoda kam hai to ek aur solid option bhi hai.

User: Original hai na? Duplicate to nahi hoga?
Answer: Haan bhai, 100% original. Authorized dealer se aati hai. Bill aur 1 saal warranty card dono milenge.

User: Battery kitne din chalti hai?
Answer: 7-8 din normal use, 4-5 din agar smart features zyada use karo.

User: 03XX-XXXXXXX se order check karo
Answer: Order search karta hoon aapke number se. Ek minute.

User: Cart mein kya hai?
Answer: Cart page check karein ya main kuch suggest karun?

User: JazzCash payment link bhejo
Answer: Checkout complete karein to payment link generate ho jata hai. Aap kya order karna chahte hain?`
}

export async function POST(req: Request) {
  try {
    const { message, sessionId, lang, orderId, productSlug } = await req.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and sessionId required" }, { status: 400 })
    }

    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    if (!apiKey) {
      return NextResponse.json({
        reply: "Maaf karein, AI assistant abhi available nahi hai. 😓 Aap humein WhatsApp par contact kar sakte hain ya thodi der baad dobara koshish karein. Shukriya! 🙏"
      })
    }

    // Rate limiting
    if (supabase) {
      const { data: rateData } = await supabase
        .from("chat_rate_limits")
        .select("message_count, window_start")
        .eq("session_id", sessionId)
        .single()

      const now = Date.now()
      const hour = 60 * 60 * 1000

      if (rateData) {
        const elapsed = now - new Date(rateData.window_start).getTime()
        if (elapsed < hour && rateData.message_count >= 30) {
          return NextResponse.json({
            reply: lang === "english"
              ? "⚠️ Message limit reached for this hour. Try later or WhatsApp."
              : "⚠️ Aapne is hour ke liye message limit poochi kar li hai. Thodi der baad try karein ya WhatsApp par contact karein.",
          })
        }
        if (elapsed < hour) {
          await supabase.from("chat_rate_limits").update({ message_count: rateData.message_count + 1 }).eq("session_id", sessionId)
        } else {
          await supabase.from("chat_rate_limits").update({ message_count: 1, window_start: new Date().toISOString() }).eq("session_id", sessionId)
        }
      } else {
        await supabase.from("chat_rate_limits").insert({ session_id: sessionId, message_count: 1, window_start: new Date().toISOString() })
      }
    }

    const settings = await getSettings().catch(() => ({}))
    const personaPrompt = buildPersonaPrompt(settings)
    const { intent, phone } = detectIntent(message)
    const contextData = await fetchContext(intent, detectIntent(message).keywords, productSlug, orderId, phone, message)

    const langInstruction = lang === "english"
      ? "\n\nIMPORTANT: Respond in English only."
      : "\n\nIMPORTANT: Respond in Roman Urdu + English mix."

    const productContext = productSlug
      ? `\n\nThe customer is viewing the product page for "${productSlug}". Reference it naturally if relevant.`
      : ""

    let previousMessages: { role: string; content: string }[] = []
    let customerName: string | null = null
    let hasDeliveredOrder = false
    let preferences: any = null

    if (supabase) {
      try {
        const { data: session } = await supabase
          .from("chat_sessions")
          .select("customer_name, has_delivered_order, followup_sent, preferences")
          .eq("id", sessionId)
          .maybeSingle()
        customerName = session?.customer_name || null
        hasDeliveredOrder = session?.has_delivered_order || false
        preferences = session?.preferences || null
      } catch {}

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
      if (msgs) previousMessages = msgs.map((m) => ({ role: m.role, content: m.content }))

      if (!customerName) {
        const nameMatch = message.match(/(?:mera naam|my name is|i am|i'm|naam|mujhe)\s+(\w+)/i)
        if (nameMatch && !["hai", "hain", "koi", "kya", "yeh", "aap"].includes(nameMatch[1].toLowerCase())) {
          customerName = nameMatch[1]
          try { await supabase.from("chat_sessions").update({ customer_name: customerName }).eq("id", sessionId) } catch {}
        }
      }

      if (!hasDeliveredOrder) {
        try {
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          const { data: deliveredOrders } = await supabase
            .from("orders")
            .select("id, customer, created_at")
            .gte("created_at", thirtyDaysAgo)
            .limit(1)
          if (deliveredOrders && deliveredOrders.length > 0) {
            hasDeliveredOrder = true
            await supabase.from("chat_sessions").update({ has_delivered_order: true }).eq("id", sessionId)
          }
        } catch {}
      }
    }

    // Session memory — save preferences
    const updatedPrefs = extractPreferences(message, preferences)
    if (supabase && updatedPrefs && JSON.stringify(updatedPrefs) !== JSON.stringify(preferences)) {
      try { await supabase.from("chat_sessions").update({ preferences: updatedPrefs }).eq("id", sessionId) } catch {}
    }

    const nameContext = customerName
      ? `\n\nThe customer's name is ${customerName}. Address them warmly as "${customerName} bhai" or "${customerName} ji".`
      : "\n\nAsk their name once naturally — 'Aapka naam kya hai?' — don't insist."

    // Session memory context
    let memoryContext = ""
    if (preferences?.budget) memoryContext += `\n- Known budget: ${preferences.budget}`
    if (preferences?.use_case) memoryContext += `\n- Interested in: ${preferences.use_case} use`
    if (preferences?.category) memoryContext += `\n- Category interest: ${preferences.category}`
    if (preferences?.interested_product) memoryContext += `\n- Previously interested in: ${preferences.interested_product}`
    if (memoryContext) memoryContext = `\n\n## Customer Memory (from past conversations)\n${memoryContext}`

    let followupContext = ""
    if (supabase && hasDeliveredOrder && customerName) {
      try {
        const { data: session } = await supabase
          .from("chat_sessions")
          .select("followup_sent")
          .eq("id", sessionId)
          .maybeSingle()
        if (session && !session.followup_sent) {
          followupContext = "\n\nIMPORTANT: This customer has a delivered order. Warmly ask: 'Aapne jo watch li thi, wo kesi hai?' If happy → thank. Issues → resolve. Then mark done."
          await supabase.from("chat_sessions").update({ followup_sent: true }).eq("id", sessionId)
        }
      } catch {}
    }

    const fewShot = buildFewShot()

    const systemContent = [
      personaPrompt,
      langInstruction,
      productContext,
      nameContext,
      memoryContext,
      followupContext,
      fewShot,
      contextData ? `\n\n## Current Context (use this data)\n${contextData}` : "",
    ].join("")

    const messages = [
      { role: "system", content: systemContent },
      ...previousMessages.slice(-20),
      { role: "user", content: message },
    ]

    async function callOpenAI(signal: AbortSignal) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        signal,
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-v4-flash-free",
          messages,
          max_tokens: 1500,
          temperature: 0.7,
        }),
      })
      if (!res.ok) {
        const errorBody = await res.text()
        console.error("OpenCode error:", res.status, errorBody)
        throw new Error(`OpenCode ${res.status}`)
      }
      return res.json()
    }

    let data
    const c1 = new AbortController()
    const t1 = setTimeout(() => c1.abort(), 25000)
    try {
      data = await callOpenAI(c1.signal)
    } catch (firstErr) {
      clearTimeout(t1)
      console.error("Retrying after:", firstErr)
      const c2 = new AbortController()
      const t2 = setTimeout(() => c2.abort(), 25000)
      try { data = await callOpenAI(c2.signal) } catch { clearTimeout(t2); throw firstErr }
      clearTimeout(t2)
    }
    clearTimeout(t1)
    const msg = data.choices?.[0]?.message
    let aiMessage = msg?.content?.trim() || ""
    if (!aiMessage && msg?.reasoning_content) {
      aiMessage = msg.reasoning_content.replace(/^Thinking\.?\s*\d*\.?\s*\*{0,2}Analyze/i, "").trim().slice(0, 800)
    }
    if (!aiMessage) aiMessage = "Sorry, kuch issue aa gaya. Dobara koshish karein."

    if (supabase) {
      const timestamp = new Date().toISOString()
      try { await supabase.from("chat_sessions").upsert({ id: sessionId, customer_name: customerName, updated_at: timestamp }, { onConflict: "id" }) } catch {}
      try { await supabase.from("chat_messages").insert([{ session_id: sessionId, role: "user", content: message, created_at: timestamp }, { session_id: sessionId, role: "assistant", content: aiMessage, created_at: timestamp }]) } catch {}
      try { await supabase.from("analytics").insert({ id: `chat_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, event_name: "chat_message", timestamp, value: 1 }) } catch {}
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
