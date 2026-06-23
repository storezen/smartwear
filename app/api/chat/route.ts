import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProducts, getSettings } from "@/lib/db"
import { checkFaq } from "@/lib/chat-faq"
import { detectIntent, extractMemoryInsights, buildMemoryContext, detectSentiment, getSeasonalContext } from "@/lib/chat-utils"
import { fuzzySearchProducts } from "@/lib/fuzzy-match"

async function fetchContext(intent: string, keywords: string[], productSlug: string | null, orderId: string | null, phone?: string) {
  const ctx: string[] = []

  if (intent === "order_check" && orderId) {
    const { data: order } = await supabase?.from("orders").select("*").eq("id", orderId).maybeSingle() || {}
    if (order) {
      ctx.push(`Order: ${order.id}, Status: ${order.status}, Total: Rs. ${order.total}, Items: ${(order.items || []).length}`)
      if (order.postex) ctx.push(`PostEx Tracking: ${order.postex} | Status: ${order.postex_status || "in transit"}`)
      if (order.history && Array.isArray(order.history)) ctx.push(`History: ${order.history.map((h: any) => `${h.status} (${new Date(h.timestamp).toLocaleDateString()})`).join(" → ")}`)
    }
  }

  if (intent === "phone_order" && phone) {
    const cleanPhone = phone.replace(/^92/, "0").replace(/^0/, "").replace(/^92/, "")
    const { data: orders } = await supabase?.from("orders")
      .select("id, status, total, created_at, items, postex, postex_status")
      .or(`phone.ilike.%${cleanPhone}%,customer->>'phone'.ilike.%${cleanPhone}%`)
      .order("created_at", { ascending: false }).limit(5) || {}
    if (orders && orders.length > 0) {
      ctx.push(`Orders found for this phone:`)
      orders.forEach((o: any) => ctx.push(`- ${o.id}: ${o.status}, Rs. ${o.total} (${new Date(o.created_at).toLocaleDateString()})${o.postex ? ` PostEx: ${o.postex_status || "in transit"}` : ""}`))
    } else {
      ctx.push("No orders found for this phone number.")
    }
  }

  if (["price_query", "product_search", "category"].includes(intent)) {
    const products = await getProducts().catch(() => [])
    const catSlugs: string[] = []
    const kw = keywords.join(" ")
    if (/smart/i.test(kw)) catSlugs.push("smart-watches")
    if (/analog|classic|dress/i.test(kw)) catSlugs.push("analog-watches")
    if (/accessor|band|strap|buds|earphone|charge|silicone/i.test(kw)) catSlugs.push("accessories")

    let filtered: any[] = []
    if (catSlugs.length > 0) filtered = products.filter((p: any) => catSlugs.includes(p?.category_slug))

    const searchTerms = keywords.filter(k => k.length > 2)
    if (searchTerms.length > 0 && filtered.length === 0) {
      filtered = products.filter((p: any) => {
        const searchText = [p.name, p.description, p.brand, p.category_slug, p?.specifications ? Object.values(p.specifications).join(" ") : ""].filter(Boolean).join(" ").toLowerCase()
        return searchTerms.some(t => searchText.includes(t.toLowerCase()))
      }).slice(0, 5)
    }

    // Fuzzy match for misspelled/approximate names
    if (searchTerms.length > 0 && filtered.length === 0) {
      const fuzzy = fuzzySearchProducts(searchTerms.join(" "), products, 3)
      if (fuzzy.length > 0) filtered = fuzzy
    }

    if (filtered.length > 5) filtered = filtered.slice(0, 5)

    if (filtered.length > 0) {
      ctx.push("Products:")
      filtered.forEach((p: any) => {
        const badges = []
        if (p.reviews_count > 10) badges.push("🔥 Popular")
        if (p.stock < 5) badges.push(`⚡ Only ${p.stock} left`)
        ctx.push(`[PRODUCT:${p.slug}] ${p.name} — Rs. ${p.price?.toLocaleString()} | ★${p.rating || "—"} (${p.reviews_count || 0}) | Stock: ${p.stock || 0}${badges.length ? " | " + badges.join(" ") : ""}`)
      })
    } else if (intent !== "product_search") {
      ctx.push("Multiple categories available. Ask about smart watches, analog watches, or accessories.")
    } else {
      ctx.push("Try different keywords or browse categories: smart watches, analog watches, accessories.")
    }
  }

  if (intent === "policy") {
    const s = await getSettings().catch(() => ({}))
    ctx.push(`Returns: 7-day easy return. Warranty: 1yr smart, 6mo accessories. Shipping: Free over Rs. ${(s?.free_delivery_threshold || 10000).toLocaleString()}, Std Rs. ${s?.shipping_standard_rate || 200}, Exp Rs. ${s?.shipping_express_rate || 500}. Payment: ${(() => { try { return JSON.parse(s?.payment_methods || '[]').join(", ") } catch { return "COD, JazzCash, Easypaisa, Bank Transfer" } })()}. Open box delivery.`)
  }

  return ctx.join("\n")
}

function buildPersonaPrompt(): string {
  return `Tum Ahmed ho. 32 saal, 7+ years, Smartwear Pakistan, MM Alam Road Lahore.

## Rules
1. Language match: جس زبان میں سوال اسی میں جواب. Urdu script → pure Urdu. Roman Urdu → Roman Urdu. English → English.
2. Pakistani mentality: Value, originality, durability, status, gifts.
3. Features nahi, benefits batao.
4. Lead gen: 3-5 msgs mein interest → number maango.
5. Handoff: 3 "nahi pata" → WhatsApp.

## Sales Flow (follow this sequence naturally)
1. GREET: Warm, informal. "Ji boliye, kya chahiye?" — Zyada lengthy mat karo.
2. DISCOVER: "Budget? Kis liye chahiye?" — Customer ki need samjho pehle recommend karne se pehle.
3. RECOMMEND: 2 options max. Batao kaunsa kyun recommend kar rahe ho.
4. HANDLE: Price, warranty, delivery — har objection ka ready jawab hai.
5. CLOSE: Ready dikhe to number maango ya /cart bhejo. "Bhej doon order?"
6. FOLLOW-UP: "Aapne jo li thi, wo kesi hai?" — Next visit pe naturally poocho.

## Scenario Rules
- Budget → 2 options (andar + thoda upar). Agar customer ki requirement clear hai to target karo.
- Comparison → max 3 differences, batao kaunsa kis ke liye better.
- Order → confirm product/address/phone.
- Cart → guide to /cart page.
- Payment → COD, JazzCash, Easypaisa. Payment link generate kar sakte hain.
- Price objection → features justify + "COD hai, ghar pe check karo, pasand nahi to wapas".
- Originality → "100% original, authorized dealer, bill + warranty card."
- Gift → suggest with packaging. Occasion poocho.
- Exchange/wapas → 7-day easy return/explain.
- Battery puchhe → "7-8 din normal, 4-5 din heavy use."

## Emotional Adaptation
- Customer impatient hai (jaldi, jldi, hurry) → seedha jawab, extra baat nahi.
- Confused hai → 2 simple options, "Yeh lo, easy hai."
- Angry/gussa hai → pehle maafi maango, phir solution do. Bahanay nahi.
- Positive/shukriya → response mein warmth do. "Shukriya bhai!"

## Bundling & Upsell Rules
- Watch + extra strap combo suggest karo (Rs. 400-500 extra).
- "Is watch ke saath tempered guard bhi le lo — sirf Rs. 200."
- 2 watches le raha hai → "Dono ek saath order karo to ek shipping free."
- Accessory dekh raha hai → suggest compatible watch models.

## Care Tips
- Waterproof watch hai to batao: "Rain okay, shower okay, swimming nahi, sauna/steam nahi."
- Leather strap: "Paani se bachao, 6-12 months mein change karwana."
- Smart watch: "Screen guard laga lo, scratches se bache ga."
- Battery: "Night ko charge karo, full battery 7 din chale gi."

## Seasonal Awareness
- Eid time → gift suggestions, "Eid pe special offer"
- Friday → "Jumma Mubarak" if appropriate
- Summer → sports bands, waterproof
- Winter → leather straps, formal

## Style
- Bilkul human ki tarah. Short, natural, jese shop pe betha salesman baat karta hai.
- 1-2 sentences max. Point pe aao. Extra info mat do.
- Bold product names. Zero corporate speak.
- End with ONE action.

## SHORT RESPONSE RULES (Read these examples carefully)
❌ Mat karo: "Ultra Sync Pro ek premium smartwatch hai jisme AMOLED display, heart rate tracking, SPO2, 7 din ki battery aur BT calling jaise features hain. Yeh aapke daily use ke liye bohot acha option hai."
✅ Karo: "Ultra Sync Pro — Rs. 8,500. AMOLED display, BT calling, 7 din battery. Best seller hai."

❌ Mat karo: "Aap Ultra Sync Pro aur Smart Band 5 ka comparison kar rahe hain. Ultra Sync Pro mein AMOLED display hai jabke Smart Band 5 mein TFT display hai. Ultra Sync Pro ki battery 7 din hai aur Smart Band 5 ki 5 din..."
✅ Karo: "Ultra Sync Pro Rs. 8,500 — AMOLED, better features. Smart Band 5 Rs. 4,500 — basic, budget friendly."

❌ Mat karo: "Jee aapka swagat hai Smartwear Pakistan mein. Main Ahmed hoon aur mein aapki madad kar sakta hoon. Aap kaunsa product dekhna chahenge?"
✅ Karo: "Ji boliye, kya chahiye?"

❌ Mat karo: "Warranty 1 year hai smart watches ke liye aur 6 months accessories ke liye. Aapko warranty card bhi mile ga."
✅ Karo: "1 year warranty." (customer ne sirf warranty poochhi hai)

❌ Mat karo: "COD available hai. Aap jab order karein gay to rider aapke ghar aa kar deliver kare ga aur aap cash pay kar sakte hain. Open box delivery bhi hai."
✅ Karo: "Haan, COD hai. Ghar pe check kar ke paise do."
`
}

function buildFAQContext(msg: string): string[] {
  const faq = checkFaq(msg)
  return faq ? [`FAQ match found — customer is asking about something we have a prepared answer for. Use this info naturally:\n${faq}`] : []
}

function buildProductKnowledge(): string {
  return `## Product Knowledge
Smart Watches (Rs. 2,500 - Rs. 12,000): AMOLED/TFT displays, BT calling, heart rate, SPO2, sleep tracking, step count, IP68 waterproof. Battery 5-8 days. Best for daily use, fitness, health tracking.
Analog Watches (Rs. 2,500 - Rs. 12,000): Japanese/Chinese movements, stainless steel case, mineral glass, leather/steel straps. Best for formal wear, office, classic style.
Accessories (Rs. 200 - Rs. 2,000): Silicone/leather/metal straps, screen guards, chargers, wireless buds, charging cables.`
}

export async function POST(req: Request) {
  try {
    const { message, sessionId, lang, orderId, productSlug } = await req.json()
    if (!message || !sessionId) return NextResponse.json({ error: "Message and sessionId required" }, { status: 400 })

    const apiKey = process.env.OPENCODE_API_KEY
    const baseUrl = process.env.OPENCODE_BASE_URL || "https://opencode.ai/zen/v1"
    if (!apiKey) return NextResponse.json({ reply: "Maaf karein, AI assistant abhi available nahi hai. 😓 Aap humein WhatsApp par contact kar sakte hain ya thodi der baad dobara koshish karein. Shukriya! 🙏" })

    // Rate limiting
    if (supabase) {
      const { data: rateData } = await supabase.from("chat_rate_limits").select("message_count, window_start").eq("session_id", sessionId).single()
      const now = Date.now()
      const hour = 60 * 60 * 1000
      if (rateData) {
        const elapsed = now - new Date(rateData.window_start).getTime()
        if (elapsed < hour && rateData.message_count >= 30) return NextResponse.json({ reply: lang === "english" ? "⚠️ Message limit reached." : "⚠️ Aapne is hour ke liye message limit poochi kar li hai." })
        await supabase.from("chat_rate_limits").update({ message_count: elapsed < hour ? rateData.message_count + 1 : 1, window_start: elapsed < hour ? rateData.window_start : new Date().toISOString() }).eq("session_id", sessionId)
      } else {
        await supabase.from("chat_rate_limits").insert({ session_id: sessionId, message_count: 1, window_start: new Date().toISOString() })
      }
    }

    const settings = await getSettings().catch(() => ({}))
    const personaPrompt = buildPersonaPrompt()
    const { intent, phone } = detectIntent(message)
    const contextData = await fetchContext(intent, detectIntent(message).keywords, productSlug, orderId, phone)
    const faqContext = buildFAQContext(message)
    const seasonalContext = getSeasonalContext()

    // Detect actual language: Urdu script, Roman Urdu, or English
    const hasUrduScript = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(message)
    const langInstruction = hasUrduScript
      ? "\n\nIMPORTANT: Customer ne Urdu script mein likha hai. Sirf خالص اردو (Urdu script) mein jawab do. Roman Urdu ya English mix bilkul use na karo."
      : lang === "english"
        ? "\n\nIMPORTANT: Respond in English only. Do not mix Urdu."
        : "\n\nIMPORTANT: Customer Roman Urdu mein baat kar raha hai. Sirf Roman Urdu mein jawab do. English words sirf tab use karo jab product name ya price ho. Pure English sentences mat likho."

    let previousMessages: { role: string; content: string }[] = []
    let customerName: string | null = null
    let hasDeliveredOrder = false
    let preferences: any = null

    if (supabase) {
      try {
        const { data: session } = await supabase.from("chat_sessions").select("customer_name, has_delivered_order, followup_sent, preferences").eq("id", sessionId).maybeSingle()
        customerName = session?.customer_name || null
        hasDeliveredOrder = session?.has_delivered_order || false
        preferences = session?.preferences || null
      } catch {}

      const { data: msgs } = await supabase.from("chat_messages").select("role, content").eq("session_id", sessionId).order("created_at", { ascending: true })
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
          const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          const { data: do2 } = await supabase.from("orders").select("id, customer, created_at").gte("created_at", d).limit(1)
          if (do2 && do2.length > 0) { hasDeliveredOrder = true; await supabase.from("chat_sessions").update({ has_delivered_order: true }).eq("id", sessionId) }
        } catch {}
      }
    }

    const updatedPrefs = extractMemoryInsights(message, preferences)
    const sentiment = detectSentiment(message)
    const sentimentContext = sentiment !== "neutral" ? `\nCustomer sentiment: ${sentiment}. Adapt tone accordingly.` : ""
    if (supabase && updatedPrefs && JSON.stringify(updatedPrefs) !== JSON.stringify(preferences)) {
      try { await supabase.from("chat_sessions").update({ preferences: updatedPrefs }).eq("id", sessionId) } catch {}
    }

    const nameContext = customerName ? `\nCustomer: ${customerName}. Address as "${customerName} bhai" or "${customerName} ji".` : "\nAsk name once naturally."

    const memoryContext = buildMemoryContext(updatedPrefs || preferences)

    let followupContext = ""
    if (supabase && hasDeliveredOrder && customerName) {
      try {
        const { data: session } = await supabase.from("chat_sessions").select("followup_sent").eq("id", sessionId).maybeSingle()
        if (session && !session.followup_sent) {
          followupContext = "\nIMPORTANT: Delivered order exists. Ask warmly: 'Aapne jo watch li thi, wo kesi hai?'"
          await supabase.from("chat_sessions").update({ followup_sent: true }).eq("id", sessionId)
        }
      } catch {}
    }

    const systemContent = [personaPrompt, langInstruction, nameContext, memoryContext, sentimentContext, seasonalContext, followupContext, ...faqContext, contextData ? `\n## Context\n${contextData}` : "", buildProductKnowledge(), `\n## Knowledge\nStore: MM Alam Road, Lahore. Mon-Sat 10am-8pm. COD. 7-day return. 1yr warranty (smart), 6mo (accessories). Free delivery >Rs. 10,000. Open box delivery.`].join("\n")

    const messages = [{ role: "system", content: systemContent }, ...previousMessages.slice(-20), { role: "user", content: message }]

    async function callOpenAI(signal: AbortSignal) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        signal, method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "deepseek-v4-flash-free", messages, max_tokens: 1500, temperature: 0.7 }),
      })
      if (!res.ok) { const e = await res.text(); console.error("OpenCode error:", res.status, e); throw new Error(`OpenCode ${res.status}`) }
      return res.json()
    }

    let data
    const c1 = new AbortController(); const t1 = setTimeout(() => c1.abort(), 25000)
    try { data = await callOpenAI(c1.signal) } catch (firstErr) {
      clearTimeout(t1); console.error("Retrying after:", firstErr)
      const c2 = new AbortController(); const t2 = setTimeout(() => c2.abort(), 25000)
      try { data = await callOpenAI(c2.signal) } catch { clearTimeout(t2); throw firstErr }
      clearTimeout(t2)
    }
    clearTimeout(t1)
    const msg = data.choices?.[0]?.message
    let aiMessage = msg?.content?.trim() || ""
    if (!aiMessage && msg?.reasoning_content) aiMessage = msg.reasoning_content.replace(/^Thinking\.?\s*\d*\.?\s*\*{0,2}Analyze/i, "").trim().slice(0, 800)
    if (!aiMessage) aiMessage = "Sorry, kuch issue aa gaya. Dobara koshish karein."

    if (supabase) {
      const ts = new Date().toISOString()
      try { await supabase.from("chat_sessions").upsert({ id: sessionId, customer_name: customerName, updated_at: ts }, { onConflict: "id" }) } catch {}
      try { await supabase.from("chat_messages").insert([{ session_id: sessionId, role: "user", content: message, created_at: ts }, { session_id: sessionId, role: "assistant", content: aiMessage, created_at: ts }]) } catch {}
      try { await supabase.from("analytics").insert({ id: `chat_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, event_name: "chat_message", timestamp: ts, value: 1 }) } catch {}
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
