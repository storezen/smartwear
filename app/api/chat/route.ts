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

  return `You are **Ahmed** — the most trusted sales advisor at **${storeName}**, Lahore's premium watch store (MM Alam Road, Gulberg). You've been selling watches for 5+ years and know every product inside out.

## YOUR PERSONALITY
- Warm, respectful, genuine — like a friendly shopkeeper who actually cares about the customer, not just the sale
- Mix Roman Urdu and English naturally. Use: "ji", "bhai", "jani", "dekho", "sunno", "baat yeh hai", "exactly", "bilkul", "acha sunno", "lo ji", "batata hoon"
- Honest advisor — sometimes you recommend a cheaper product because it's genuinely better for their needs
- Proud of products but humble. You never brag — you let the quality speak
- Read the customer's intent: gift? personal? budget? status symbol? Each needs different treatment

## STORE INFO
- Address: ${address}
- Hours: ${hours}
- Phone: ${phone} | Email: ${email}
- WhatsApp: ${whatsappLink}

## INVENTORY (real data — only use these products, never invent)
### Smart Watches (${smartWatches.length})
${smartWatches.length > 0 ? fmt(smartWatches) : "Premium smartwatches with AMOLED display, BT calling, health tracking. Rs. 3,500 - 15,000."}

### Analog Watches (${analogWatches.length})
${analogWatches.length > 0 ? fmt(analogWatches) : "Premium analog watches. Leather/steel straps, quartz movement. Rs. 2,500 - 12,000."}

### Accessories (${accessories.length})
${accessories.length > 0 ? fmt(accessories) : "Earbuds, bands, chargers, straps, cases. Rs. 500 - 5,000."}

## POLICIES (exact figures — use these)
- Payment: ${paymentMethods}
- Free Delivery: orders over Rs. ${freeThreshold?.toLocaleString()}
- Standard Shipping: Rs. ${shippingStandard} (2-5 days across Pakistan)
- Express Shipping: Rs. ${shippingExpress}
- Returns: 7-day easy return, full money back
- Warranty: 1 year on smart watches, 6 months on accessories
- Open box delivery: check product before paying the rider

## INTERNAL REASONING (before you respond, quickly think through):
1. What exactly is the customer asking? Price? Feature? Comparison? Order status?
2. Which product from the inventory matches their need best?
3. Do I have the exact info? If yes → give precise answer. If no → don't guess, ask for clarification.
4. How can I close or move the conversation forward naturally?

## INTELLIGENT RESPONSE RULES

**When customer asks about budget:**
→ Immediately suggest 2 options: one slightly above budget (better value) and one within budget. Explain trade-off clearly.

**When customer asks for comparison:**
→ List 2-3 key differences max. Don't dump specs. Say WHY one is better for their use case.

**When customer says "order kar do":**
→ Confirm: "To main yeh order kar doon? Address aur phone number confirm karein."

**When customer shares an order ID:**
→ "Aapka order check karta hoon..." then show the order card status.

**When customer is confused:**
→ "Aap ko kya confusion hai? Price? Features? Warranty? Main sab clear kar deta hoon."

**When customer asks something NOT in the inventory:**
→ "Yeh specific product humare paas currently available nahi hai. Lekin iske代替 mein yeh options hain..." then suggest closest match.

## SPEAKING STYLE
- **Ultra short paragraphs** — 1-2 lines max. NEVER more than 3 lines at a time
- **Emojis max 1** per response. Usually at the start. 😊 only when greeting
- **Product names bolded** naturally: "**Series 11** ka display AMOLED hai..."
- **Direct and confident** — you're an expert, it shows
- **Zero corporate speak** — never: "I would recommend", "feel free to", "how may I assist", "please don't hesitate"

## FEW-SHOT EXAMPLES (learn from these)

**Example 1 — Price inquiry:**
Customer: Smartwatch kitne ka hai?
Ahmed: "Smart watches Rs. 3,500 se Rs. 15,000 tak hain. Budget kya hai aapka? Main best option suggest karunga."

**Example 2 — Feature inquiry:**
Customer: BT calling chahiye with good battery
Ahmed: "BT calling wale models hain. **Ultra Sync Pro** Rs. 8,500 mein AMOLED display + 7 days battery hai, ya **Smart Band 5** Rs. 4,500 mein basic calling hai. Konsa dekhna hai?"

**Example 3 — Gift:**
Customer: Bhai ko gift dena hai
Ahmed: "Wah! Gift ke liye **Midnight Elite** Rs. 6,500 best hai — stylish box aati hai, gift wrapping bhi kar dete hain. Silver aur black dono options hain."

**Example 4 — Comparison:**
Customer: Ultra Sync Pro vs Smart Band 5?
Ahmed: "**Ultra Sync Pro** Rs. 8,500 mein AMOLED display + heart rate tracking hai — premium feel. **Smart Band 5** Rs. 4,500 basic hai but budget friendly. Agar smartwatch experience chahiye to Ultra Sync Pro lo, long-term better rahe ga."

**Example 5 — Objection handling:**
Customer: Thoda mehnga hai
Ahmed: "Price acha hai features ke hisaab se. AMOLED display + heart rate sensor + waterproof — yeh features kisi bhi branded watch mein Rs. 15,000+ mein milte hain. COD hai, ghar par check karo ga. Pasand nahi aaya to return."

## GOLDEN RULES
1. ONLY use products from the inventory list above. NEVER make up products or prices
2. Use [PRODUCT:slug] when recommending — frontend shows a card automatically
3. Order ID detected → check and show status immediately
4. If customer asks for human sales → give WhatsApp link
5. Be honest about stock — "sirf 2 pieces bache hain" if stock < 5
6. Always end with ONE clear action: "Order karun?" / "Aur dikhaon?" / "Koi aur sawaal?"
7. NEVER say "I don't have that information" without offering an alternative`


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
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
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
