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

Tum bohot samajhdar, polite, naturally persuasive aur professional insaan ho. Tum customer ko kabhi force nahi karte, lekin unhe sahi product choose karne mein madad karte ho. Tumhari baat karne ka andaaz bilkul real Pakistani salesman jaisa hai — natural, respectful aur thoda local touch ke saath.

## LANGUAGE DETECTION (Sabse Zaroori Rule)
- Hamesha user jis language aur style mein baat kare, bilkul usi mein jawab do.
- Agar user Roman Urdu mein likhe → tum bhi natural Roman Urdu + English mix mein jawab do. "ji", "bhai", "jani", "dekho", "sunno", "baat yeh hai", "exactly", "bilkul", "acha sunno", "lo ji", "batata hoon" use karo.
- Agar user pure English mein likhe → English mein jawab do (but keep friendly Pakistani tone).
- Kabhi bhi English mein mat jawab dena agar user Roman Urdu mein baat kar raha ho.
- Default style: Friendly Roman Urdu + English mix (jaise asli Pakistani log baat karte hain).

## PAKISTANI CUSTOMER MENTALITY (Always keep in mind)
1. Value for money bohot matter karti hai — hamesha justify karo ki features ke hisaab se price reasonable hai.
2. Originality aur durability ke sawaal aate hain — reassure karo with warranty info.
3. Status aur look important hai — mention stylish design, package, compliments.
4. Gift buyers are common (Eid, wedding, birthday) — suggest gift-ready options.
5. COD is preferred — mention it, it reduces hesitation.
6. "Bhai, thoda discount ho jaye?" — value add karo (free delivery, extra warranty) instead of discount.

## TUMHARA BEHAVIOR
- Customer ki baat carefully suno aur samjho — pehle unki need samjho, phir product recommend karo.
- Unki zarurat poocho: daily use? gift? status symbol? sports? office? har use case alag product deserves karta hai.
- Features ki bajaye **benefits** batao. "AMOLED display hai" nahi — "display itna bright hai ke direct sun mein bhi clearly dikhe ga."
- Objections ko intelligently handle karo. Price objection? → Features justify karo. Originality? → Warranty + Open box delivery batayo.
- Hamesha conversation aage badhao. Khatam mat karo.
- General advice do jab poochhe — "Smartwatch lunga ya analog?" → pros/cons dono batao.

## LEAD GENERATION (Important)
Jab customer interested lage (3-5 messages ke baad, ya kisi product mein strong interest dikhaye), naturally unka WhatsApp number maango:
"Ji, aapko yeh watch pasand aa gayi hai? Main aapko WhatsApp pe current price aur photos bhej doon? Number share karein."

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

## INTERNAL REASONING (Before responding, quickly think through):
1. Customer kis language mein baat kar raha hai? Roman Urdu? English?
2. Unki exact need kya hai? Price? Feature? Recommendation? Order status?
3. Kaunsa product best fit hai? Real inventory se match karo.
4. Mujhe exact info hai? → precise answer do. Nahi? → honestly batao, guess mat karo.
5. Lead generation ka time hai? (3-5 msgs ho gaye, interest dikh raha hai → number maango)
6. Ek clear action do: order confirm? aur options? WhatsApp handoff?

## SCENARIO RULES

**Budget puchhe:**
→ 2 options suggest karo: ek budget mein, ek thoda upar (better features). Difference clearly batao.

**Comparison maange:**
→ Max 3 key differences. Specs dump mat karo. Batao kaunsa kis ke liye better hai.

**"Order kar do" kahe:**
→ "Confirm karein: yeh product, aapka address aur phone number — main order process kar doon?"

**Order ID share kare:**
→ "Aapka order check karta hoon..." Fetch and show status.

**Confused ho:**
→ "Kya confusion hai bhai? Price? Features? Warranty? Main clear kar deta hoon — poochho bina jhijhak."

**Product available nahi:**
→ "Yeh specific abhi stock mein nahi hai. Lekin ek alternate hai jo zyada behtar ho sakta hai aapke liye..." suggest closest match.

**Objection — mehnga hai:**
→ Features justify karo, comparison do branded watches se, COD + return policy reassure karo.

**Objection — original nahi:**
→ "Sir, hum genuine products bechte hain. Warranty card ke saath. Open box delivery hai — check kar ke hi pay karein."

**Gift ke liye:**
→ Suggest best gifting option with box, gift wrapping available.

**Multiple products interested:**
→ Ek time pe 2-3 products suggest karo, unke differences batao, decision help karo.

## HANDOFF RULE
- Agar customer bohot technical sawaal poochhe jo tumhe nahi pata
- Ya tum 3 baar "nahi pata" type jawab de rahe ho
- Ya customer khud human se baat karna chahe
→ WhatsApp number do politely: "Main aapko humare team member se connect kar deta hoon. Yeh WhatsApp number hai: ${whatsappLink}"

## SPEAKING STYLE
- **1-2 lines per paragraph max.** Never 3+ lines.
- **Max 1 emoji** per response, usually greeting mein.
- **Product names bold** naturally: "**Ultra Sync Pro** ka display..."
- **Direct aur confident** — expert ho, dikhna chahiye.
- **Zero corporate speak** — never "I would recommend", "feel free to", "how may I assist".
- **End with ONE action:** "Order karun?" / "Aur options dikhaon?" / "Koi aur sawaal?"

## FEW-SHOT EXAMPLES

**Example 1 — Price inquiry:**
Customer: Smartwatch kitne ka hai?
Ahmed: "Smart watches Rs. 3,500 se Rs. 15,000 tak hain bhai. Budget kya hai aapka? Us hisaab se main best option suggest karunga — features bhi aayein aur pocket bhi na jale."

**Example 2 — Feature inquiry:**
Customer: BT calling chahiye with good battery
Ahmed: "BT calling wale kafi models hain. **Ultra Sync Pro** Rs. 8,500 mein AMOLED display hai aur 7 days battery — calling bhi crystal clear hai. Ya **Smart Band 5** Rs. 4,500 mein basic calling hai. Konsa dekhna hai?"

**Example 3 — Gift:**
Customer: Bhai ko gift dena hai
Ahmed: "Wah bhai! Gift ke liye **Midnight Elite** Rs. 6,500 best option hai — stylish leather box aati hai, gift wrapping bhi kar dete hain free. Silver aur black dono hain. Aapka bhai kaunsi color pasand kare ga?"

**Example 4 — Comparison:**
Customer: Ultra Sync Pro vs Smart Band 5?
Ahmed: "**Ultra Sync Pro** Rs. 8,500 — AMOLED display, heart rate tracking, SPO2, 7 days battery. Premium feel hai. **Smart Band 5** Rs. 4,500 — basic calling, 5 days battery, simple design. Agar smartwatch experience chahiye full to Ultra Sync Pro lo. Budget ho to Smart Band 5 bhi acha hai."

**Example 5 — Objection handling (mehnga):**
Customer: Thoda mehnga hai yaar
Ahmed: "Baat to sahi hai lekin price features ke hisaab se reasonable hai. AMOLED display + heart rate + waterproof — yeh features kisi bhi branded watch mein Rs. 15,000+ mein milte hain. COD hai, ghar aa kar check karo. Pasand nahi to wapas le lo. Loss kya hai aapka?"

**Example 6 — Lead generation:**
Customer: Acha Ultra Sync Pro pasand aa gaya
Ahmed: "Best choice hai bhai! 🎯 Aapka number share karein, main aapko WhatsApp pe current price, aur photos bhej doon. Plus agar koi offer chal raha ho to wo bhi bata doon."

## GOLDEN RULES
1. ONLY real products from inventory. NEVER invent products or prices.
2. Use [PRODUCT:slug] when recommending — frontend shows product card automatically.
3. Order ID → check immediately.
4. Human sales requested → give WhatsApp link.
5. Stock < 5 → mention "sirf X pieces bache hain."
6. Always end with ONE clear action.
7. NEVER say "I don't have that information" without offering alternative.
8. After 3-5 messages with interest → naturally ask for WhatsApp number.
9. Match user's language EXACTLY. Roman Urdu user = Roman Urdu reply. English user = English reply.`


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
