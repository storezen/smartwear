import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProducts, getSettings } from "@/lib/db"

type Intent = "order_check" | "price_query" | "product_search" | "policy" | "category" | "general"

function detectIntent(msg: string): { intent: Intent; keywords: string[] } {
  const low = msg.toLowerCase()
  if (/ORD-|order id|order number|order status|mera order/i.test(low)) return { intent: "order_check", keywords: ["order"] }
  if (/kitna|price|cost|rate|kay|price|costs?|how much|cost|rates/i.test(low)) return { intent: "price_query", keywords: msg.match(/\w+/g)?.slice(1, 5) || [] }
  if (/dikh|show|recommend|suggest|option|chahe|lau|prefer|dekhna|looking|search|find|have.*watch|want.*watch|need|want|best/i.test(low)) return { intent: "product_search", keywords: msg.match(/\w+/g)?.slice(1, 5) || [] }
  if (/return|warranty|delivery|shipping|payment|pay|policy|exchange|refund|delivery|policy|return|ship/i.test(low)) return { intent: "policy", keywords: [] }
  if (/smart.?watch|analog.?watch|accessor|band|strap|buds|earphone|charge/i.test(low)) return { intent: "category", keywords: [] }
  return { intent: "general", keywords: [] }
}

async function fetchContext(intent: Intent, keywords: string[], productSlug: string | null, orderId: string | null) {
  const ctx: string[] = []

  if (intent === "order_check" && orderId) {
    const { data: order } = await supabase?.from("orders").select("*").eq("id", orderId).maybeSingle() || {}
    if (order) ctx.push(`Order: ${order.id}, Status: ${order.status}, Total: Rs. ${order.total}, Items: ${(order.items || []).length}`)
  }

  if (intent === "price_query" || intent === "product_search" || intent === "category") {
    const products = await getProducts().catch(() => [])
    const catSlugs: string[] = []
    if (/smart/i.test(keywords.join(" "))) catSlugs.push("smart-watches")
    if (/analog/i.test(keywords.join(" "))) catSlugs.push("analog-watches")
    if (/accessor|band|strap|buds|earphone/i.test(keywords.join(" "))) catSlugs.push("accessories")

    let filtered = products
    if (catSlugs.length > 0) filtered = products.filter((p: any) => catSlugs.includes(p?.category_slug))
    if (intent === "price_query" && !catSlugs.length) filtered = products

    // Search by name keywords
    if (keywords.length > 1 || (intent === "product_search" && !catSlugs.length)) {
      const nameHits = products.filter((p: any) => keywords.some(k => k.length > 2 && p?.name?.toLowerCase().includes(k.toLowerCase()))).slice(0, 5)
      if (nameHits.length > 0) filtered = nameHits
    }

    const top = filtered.slice(0, 5)
    if (top.length > 0) {
      ctx.push("Products:")
      top.forEach((p: any) => ctx.push(`[PRODUCT:${p.slug}] ${p.name} — Rs. ${p.price?.toLocaleString()} | ★${p.rating || "—"} (${p.reviews_count || 0} reviews) | Stock: ${p.stock || 0}`))
    } else if (catSlugs.length > 0) {
      const counts = { "smart-watches": "Rs. 3,500 - 15,000", "analog-watches": "Rs. 2,500 - 12,000", accessories: "Rs. 500 - 5,000" }
      ctx.push(`Current inventory has products across categories. Ask me about specific categories or products.`)
    } else {
      ctx.push("No exact product match found. Ask about categories: smart watches, analog watches, or accessories.")
    }
  }

  if (intent === "policy") {
    const settings = await getSettings().catch(() => ({}))
    ctx.push(`Policy: Returns — 7-day easy return full money back. Warranty — 1 year smart watches, 6 months accessories. Shipping — Free over Rs. ${(settings?.free_delivery_threshold || 10000).toLocaleString()}, standard Rs. ${settings?.shipping_standard_rate || 200} (2-5 days), express Rs. ${settings?.shipping_express_rate || 500}. Payment — ${(() => { try { return JSON.parse(settings?.payment_methods || '[]').join(", ") } catch { return "COD, JazzCash, Easypaisa, Bank Transfer" } })()}. Open box delivery — check before paying.`)
  }

  return ctx.join("\n")
}

function buildPersonaPrompt(settings: any): string {
  const storeName = settings?.store_name || "Smartwear Pakistan"
  const phone = settings?.support_phone || "+92 300 1234567"
  const email = settings?.support_email || "concierge@smartwear.pk"
  const address = `${settings?.store_address_line1 || "MM Alam Road"}, ${settings?.store_address_line2 || "Gulberg III"}, ${settings?.store_city || "Lahore, Pakistan"}`
  const hours = settings?.business_hours || "Mon-Sat: 10am - 8pm PKT"
  const whatsappNumber = settings?.whatsapp_number || "923001234567"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  return `Tum Ahmed ho. 32 saal, 7+ years experience, ${storeName}, MM Alam Road Lahore. Premium watches & accessories.

## Core Rules
1. Language: Match user's language exactly. Roman Urdu → Roman Urdu. English → English.
2. Pakistani mentality: Value for money, originality, durability, status, gifts.
3. Behavior: Features nahi, benefits batao. Zarurat samjho. Objection handle karo.
4. Lead gen: 3-5 msgs mein interest → number maango.
5. Handoff: Technical sawaal ya 3 "nahi pata" → WhatsApp de do: ${whatsappLink}

## Store
- ${address} | ${hours} | ${phone} | ${email} | WhatsApp: ${whatsappLink}

## Scenario Rules
- Budget → 2 options (budget + thoda upar)
- Comparison → max 3 differences
- Order → confirm product/address/phone
- Confused → clarify
- Not available → alternate suggest
- Price objection → features justify + COD/return reassure
- Originality → "100% original, bill + warranty"
- Gift → suggest with packaging

## Style
- 1-2 lines per para. Max 1 emoji. Product names bold.
- Direct, confident, zero corporate speak.
- End with ONE action.

## Golden Rules
- ONLY real inventory products. NEVER invent.
- Use [PRODUCT:slug] when recommending.
- Stock < 5 → "sirf X bache hain."
- Match user language EXACTLY.`
}

function buildFewShot(lang: string): string {
  if (lang === "english") return ``
  return `
## Examples
User: Price thodi zyada lag rahi hai bhai
Answer: Samajh sakta hoon bhai. Yeh normal use mein 2-3 saal easily chal jati hai. Long term mein value achhi ban jati hai. Budget thoda kam hai to ek aur solid option bhi hai.

User: Original hai na? Duplicate to nahi hoga?
Answer: Haan bhai, 100% original. Authorized dealer se aati hai. Bill aur 1 saal warranty card dono milenge.

User: Yeh gift ke liye theek rahegi?
Answer: Bilkul bhai. Packaging premium hoti hai. Kisi occasion ke liye hai?

User: Battery kitne din chalti hai?
Answer: 7-8 din normal use, 4-5 din agar smart features zyada use karo.

User: Mera budget 15000 tak hai
Answer: 15000 mein bohot achi options hain. Smart watch chahiye ya analog? Daily use ya occasion?`
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
              ? "⚠️ You've reached the message limit for this hour. Please try again later or contact us on WhatsApp."
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

    // Intent detection + dynamic data fetch
    const { intent } = detectIntent(message)
    const contextData = await fetchContext(intent, detectIntent(message).keywords, productSlug, orderId)

    const langInstruction = lang === "english"
      ? "\n\nIMPORTANT: Respond in English only."
      : "\n\nIMPORTANT: Respond in Roman Urdu + English mix."

    const productContext = productSlug
      ? `\n\nThe customer is viewing the product page for "${productSlug}". Reference it naturally if relevant.`
      : ""

    let previousMessages: { role: string; content: string }[] = []
    let customerName: string | null = null
    let hasDeliveredOrder = false

    if (supabase) {
      try {
        const { data: session } = await supabase
          .from("chat_sessions")
          .select("customer_name, has_delivered_order, followup_sent")
          .eq("id", sessionId)
          .maybeSingle()
        customerName = session?.customer_name || null
        hasDeliveredOrder = session?.has_delivered_order || false
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

    const nameContext = customerName
      ? `\n\nThe customer's name is ${customerName}. Address them warmly as "${customerName} bhai" or "${customerName} ji".`
      : "\n\nAsk their name once naturally — 'Aapka naam kya hai?' — don't insist."

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

    const fewShot = buildFewShot(lang)

    const systemContent = [
      personaPrompt,
      langInstruction,
      productContext,
      nameContext,
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
