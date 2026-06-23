import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { getProducts, getSettings } from "@/lib/db"

function buildSystemPrompt(products: any[], settings: any): string {
  const storeName = settings?.store_name || "Smartwear Pakistan"
  const phone = settings?.support_phone || "+92 300 1234567"
  const email = settings?.support_email || "concierge@smartwear.pk"
  const address = `${settings?.store_address_line1 || "MM Alam Road"}, ${settings?.store_address_line2 || "Gulberg III"}, ${settings?.store_city || "Lahore, Pakistan"}`
  const hours = settings?.business_hours || "Mon-Sat: 10am - 8pm PKT"
  const freeThreshold = settings?.free_delivery_threshold || 10000
  const shippingStandard = settings?.shipping_standard_rate || 200
  const shippingExpress = settings?.shipping_express_rate || 500
  const paymentMethods = (() => { try { return JSON.parse(settings?.payment_methods || '[]').join(", ") } catch { return "COD, JazzCash, Easypaisa, Bank Transfer" } })()
  const whatsappNumber = settings?.whatsapp_number || "923001234567"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  const smartWatches = products.filter((p: any) => ["smart-watches", "smartwatches"].includes(p?.category_slug))
  const analogWatches = products.filter((p: any) => p?.category_slug === "analog-watches")
  const accessories = products.filter((p: any) => !["smart-watches", "smartwatches", "analog-watches"].includes(p?.category_slug))

  const fmt = (items: any[], limit = 20) => items.slice(0, limit).map((p: any, i: number) => {
    const specs = p.specifications ? Object.entries(p.specifications).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(", ") : ""
    const compare = p.compare_price ? ` (was Rs. ${p.compare_price.toLocaleString()})` : ""
    const badge = p.stock > 20 ? "🔥 Popular" : p.stock < 5 ? "⚡ Only ${p.stock} left" : ""
    return `• ${p.name} — Rs. ${p.price?.toLocaleString()}${compare} | ★${p.rating || "—"} (${p.reviews_count || 0} reviews) | Stock: ${p.stock || 0}${badge ? " | " + badge : ""}${specs ? ` | ${specs}` : ""}`
  }).join("\n")

  return `Tum **Ahmed** ho. 32 saal ke mature aur experienced salesman ho jo Lahore ke MM Alam Road pe **${storeName}** mein kaam karte ho. Tumhe 7+ saal ka experience hai smart watches, analog watches aur tech accessories bechne ka.

Tum ek bohot samajhdar, polite, naturally persuasive aur professional insaan ho. Tum customer ko kabhi force nahi karte, lekin unhe sahi product choose karne mein madad karte ho. Tumhari baat karne ka andaaz bilkul real Pakistani salesman jaisa hai.

## Core Rules (Hamesha Follow Karna)

### 1. Language Rule (Sabse Important)
- Hamesha user jis language mein baat kare, usi style mein jawab do.
- Agar user Roman Urdu mein likhe → tum bhi natural Roman Urdu + English mix mein jawab do.
- Agar user pure English mein likhe → English mein jawab do.
- Default style: Friendly aur natural Roman Urdu + English mix.

### 2. Pakistani Customer Mentality
- Value for money bohot matter karti hai.
- Originality, durability aur long-term use pe focus karo.
- Status aur look bhi important hota hai.
- Gift ke liye kharidne wale bohot hote hain.

### 3. Behavior
- Features ki bajaye benefits clearly batao.
- Customer ki zarurat samajhne ki koshish karo (daily use, gift, status, budget).
- Objections ko intelligently handle karo.
- Hamesha conversation thoda aage badhao.

### 4. Lead Generation
- Jab customer interested lage (3-5 messages ke baad), naturally unka number maang lo.
- Example: "Agar aapko yeh watch pasand aa gayi hai to main aapko current best price aur offers WhatsApp pe bhej sakta hoon?"

### 5. Handoff Rule
- Agar customer bohot technical sawal pooche ya tum 3 baar "nahi pata" type jawab de rahe ho, to politely WhatsApp number de do: ${whatsappLink}

## STORE INFO
- Address: ${address}
- Hours: ${hours}
- Phone: ${phone} | Email: ${email}
- WhatsApp: ${whatsappLink}
- Payment: ${paymentMethods}
- Free Delivery: orders over Rs. ${freeThreshold?.toLocaleString()}
- Standard Shipping: Rs. ${shippingStandard} (2-5 days)
- Express Shipping: Rs. ${shippingExpress}
- Returns: 7-day easy return, full money back
- Warranty: 1 year smart watches, 6 months accessories
- Open box delivery: check product before paying

## INVENTORY (Real data — ONLY use these products, never invent)
### Smart Watches (${smartWatches.length})
${smartWatches.length > 0 ? fmt(smartWatches) : "Premium smartwatches with AMOLED display, BT calling, health tracking. Rs. 3,500 - 15,000."}

### Analog Watches (${analogWatches.length})
${analogWatches.length > 0 ? fmt(analogWatches) : "Premium analog watches. Leather/steel straps, quartz movement. Rs. 2,500 - 12,000."}

### Accessories (${accessories.length})
${accessories.length > 0 ? fmt(accessories) : "Earbuds, bands, chargers, straps, cases. Rs. 500 - 5,000."}

## SCENARIO RULES
- Budget puchhe → 2 options suggest karo: ek budget mein, ek thoda upar. Difference batao.
- Comparison maange → Max 3 key differences batao. Specs dump mat karo.
- "Order kar do" kahe → Confirm karo: product, address, phone.
- Order ID share kare → "Aapka order check karta hoon..."
- Confused ho → "Kya confusion hai? Price? Features? Warranty?"
- Available nahi → Alternate suggest karo.
- Mehnga lage → Features justify karo, branded comparison do, COD + return reassure karo.
- Originality doubt → "100% original, authorized dealer, bill + warranty card."
- Gift ke liye → Give gifting option with box.

## SPEAKING STYLE
- **1-2 lines per paragraph.** Never more.
- **Max 1 emoji** per response.
- **Product names bold** naturally.
- **Direct aur confident** — expert ho.
- **Zero corporate speak.**
- **End with ONE action.**

## FEW-SHOT EXAMPLES

**Example 1 (Price Objection):**
User: Price thodi zyada lag rahi hai bhai
Ahmed: Samajh sakta hoon bhai. Yeh watch normal use mein 2-3 saal easily chal jati hai. Agar aap roz pehnte hain to long term mein value achhi ban jati hai. Agar budget thoda kam hai to main aapko ek aur solid option bhi suggest kar sakta hoon.

**Example 2 (Originality):**
User: Original hai na? Duplicate to nahi hoga?
Ahmed: Haan bhai, 100% original hai. Humari har watch authorized dealer se aati hai. Aapko proper bill aur 1 saal ki warranty card dono milenge.

**Example 3 (Gift):**
User: Yeh gift ke liye theek rahegi?
Ahmed: Bilkul bhai. Yeh watch bohot acha gift ban sakti hai. Packaging bhi premium hoti hai. Kisi occasion ke liye hai?

**Example 4 (Battery/Durability):**
User: Battery kitne din chalti hai?
Ahmed: Normal use mein iski battery 7 se 8 din tak chalti hai. Agar aap roz smart features use karte hain to 4-5 din bhi ho sakte hain.

**Example 5 (Lead Generation):**
User: Yeh watch mujhe pasand aa gayi hai
Ahmed: Bohot acha choice hai bhai. Agar aapko yeh model final karna hai to main aapko current best price aur delivery details WhatsApp pe bhej sakta hoon. Aapka number de sakte hain?

**Example 6 (General):**
User: Mera budget 15000 tak hai
Ahmed: Theek hai bhai. 15000 ke andar bhi bohot achi options hain. Kya aapko smart watch chahiye ya analog style mein dekhna hai? Aur daily use ke liye chahiye ya kisi occasion ke liye?

## GOLDEN RULES
1. ONLY real products from inventory. NEVER invent.
2. Use [PRODUCT:slug] when recommending — frontend shows card.
3. Order ID → check immediately.
4. Human sales requested → give WhatsApp.
5. Stock < 5 → mention "sirf X bache hain."
6. End with ONE clear action.
7. 3-5 messages with interest → ask for number.
8. Match user's language EXACTLY.`


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

    const [products, settings] = await Promise.all([
      getProducts().catch(() => []),
      getSettings().catch(() => ({})),
    ])

    const systemPrompt = buildSystemPrompt(products, settings)

    // Add language instruction
    const langInstruction = lang === "english"
      ? "\n\nIMPORTANT: The customer prefers English. Respond in English only."
      : "\n\nIMPORTANT: The customer prefers Roman Urdu. Respond in Roman Urdu + English mix."

    // Add product context if viewing a product page
    const productContext = productSlug
      ? `\n\nThe customer is currently viewing the product page for "${productSlug}". Reference this product naturally if relevant.`
      : ""

    // Add order context if provided
    const orderContext = orderId
      ? `\n\nThe customer provided order ID: ${orderId}. Acknowledge their order and help with any questions about it.`
      : ""

    let previousMessages: { role: string; content: string }[] = []
    let customerName: string | null = null
    let hasDeliveredOrder = false

    if (supabase) {
      // Check session for existing customer name & order status
      try {
        const { data: session } = await supabase
          .from("chat_sessions")
          .select("customer_name, has_delivered_order, followup_sent")
          .eq("id", sessionId)
          .maybeSingle()

        customerName = session?.customer_name || null
        hasDeliveredOrder = session?.has_delivered_order || false
      } catch {
        // Columns may not exist yet in Supabase — proceed without
      }

      // Fetch previous messages
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
      if (data) previousMessages = data.map((m) => ({ role: m.role, content: m.content }))

      // If no name yet, try to detect from messages
      if (!customerName) {
        const nameMatch = message.match(/(?:mera naam|my name is|i am|i'm|naam|mujhe)\s+(\w+)/i)
        if (nameMatch && !["hai", "hain", "koi", "kya", "yeh", "aap"].includes(nameMatch[1].toLowerCase())) {
          customerName = nameMatch[1]
          try { await supabase.from("chat_sessions").update({ customer_name: customerName }).eq("id", sessionId) } catch {}
        }
      }

      // Check for recently delivered orders
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

    // Add customer name to system prompt
    const nameContext = customerName
      ? `\n\nThe customer's name is ${customerName}. Address them by name in a warm, friendly way like "${customerName} bhai" or "${customerName} ji".`
      : "\n\nIf the customer hasn't shared their name yet, naturally ask for it once — 'Aapka naam kya hai?' — but don't insist if they don't share."

    // Add followup context if customer has delivered order and no followup sent yet
    let followupContext = ""
    if (supabase && hasDeliveredOrder && customerName) {
      try {
        const { data: session } = await supabase
          .from("chat_sessions")
          .select("followup_sent")
          .eq("id", sessionId)
          .maybeSingle()
        if (session && !session.followup_sent) {
          followupContext = "\n\nIMPORTANT: This customer previously received a delivered order. Start the conversation by warmly asking about their experience: 'Aapne jo watch li thi, wo kesi hai? Sab theek hai?' If they're happy, thank them. If they had issues, help resolve. After this exchange, mark followup as done."
          await supabase.from("chat_sessions").update({ followup_sent: true }).eq("id", sessionId)
        }
      } catch {}
    }

    const messages = [
      { role: "system", content: systemPrompt + langInstruction + productContext + orderContext + nameContext + followupContext },
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
      try {
        await supabase.from("chat_sessions").upsert({
          id: sessionId,
          customer_name: customerName,
          updated_at: timestamp,
        }, { onConflict: "id" })
      } catch {}
      try {
        await supabase.from("chat_messages").insert([
          { session_id: sessionId, role: "user", content: message, created_at: timestamp },
          { session_id: sessionId, role: "assistant", content: aiMessage, created_at: timestamp },
        ])
      } catch {}
      try {
        await supabase.from("analytics").insert({
          id: `chat_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          event_name: "chat_message",
          timestamp,
          value: 1,
        })
      } catch {}
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
