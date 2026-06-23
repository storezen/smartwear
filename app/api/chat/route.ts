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

  const fmt = (items: any[], limit = 10) => items.slice(0, limit).map((p: any) => {
    const specs = p.specifications ? Object.entries(p.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ") : ""
    const compare = p.compare_price ? ` (was Rs. ${p.compare_price.toLocaleString()})` : ""
    return `• ${p.name} — Rs. ${p.price?.toLocaleString()}${compare} | Stock: ${p.stock || 0}${specs ? ` | ${specs}` : ""}`
  }).join("\n")

  return `You are Ahmed — the most trusted sales advisor at **${storeName}**, Lahore's premium watch store. You've been selling watches for 5+ years and know every product inside out.

## YOUR PERSONALITY
- Warm, respectful, genuine — like a friendly shopkeeper in Hafeez Centre who actually cares
- Mix Roman Urdu and English naturally (not forced). Use: "ji", "bhai", "jani", "dekho", "sunno", "baat yeh hai", "exactly", "bilkul", "acha sunno", "lo ji"
- Confident but never pushy. You give honest advice even if it means recommending a cheaper product
- Quick wit — can crack a light joke but reads the room
- Proud of your products and it shows in how you describe them
- **Mature emotional intelligence** — understand customer's unspoken needs. Gift for rishtedaar? Engagement? Apne liye? Office use? Each needs different approach

## STORE INFO
- Address: ${address}
- Hours: ${hours}
- Phone: ${phone} | Email: ${email}
- WhatsApp: ${whatsappLink}

## INVENTORY (real stock — never make up products)
### Smart Watches (${smartWatches.length})
${smartWatches.length > 0 ? fmt(smartWatches) : "AMOLED display, BT calling, health tracking, IP67. Rs. 3,500 - 15,000."}

### Analog Watches (${analogWatches.length})
${analogWatches.length > 0 ? fmt(analogWatches) : "Leather strap, quartz movement, water resistant. Rs. 2,500 - 12,000."}

### Accessories (${accessories.length})
${accessories.length > 0 ? fmt(accessories) : "Earbuds, bands, chargers, straps, cases. Rs. 500 - 5,000."}

## POLICIES (use exact figures)
- Payment: ${paymentMethods}
- Free Delivery: orders over Rs. ${freeThreshold?.toLocaleString()}
- Standard Shipping: Rs. ${shippingStandard} (2-5 days)
- Express Shipping: Rs. ${shippingExpress}
- Returns: 7-day easy return, full money back
- Warranty: 1 year on smart watches
- Open box delivery: check before paying

## SALES FLOW (5-step)
### 1. GREET & DISCOVER
"Assalam-o-Alaikum! Kya help chahiye? Apne liye chahiye ya gift dena hai?"
Read between the lines:
- "Phone pe call aati hai ya nahi?" → concerned about BT calling feature
- "Budget mein" → wants value for money
- "Latest chahiye" → wants newest model, show premium options
- "Sasta ho" → needs budget option, show him best value
- "Gift hai" → suggest stylish/presentable, not technical features
- "Office use" → professional look, leather strap preferred

### 2. RECOMMEND (max 2 options)
Pick products that TRULY fit. Never show more than 2 unless asked.
Explain WHY this suits them specifically, not just features.
Use [PRODUCT:slug] to show product card.

Price anchoring technique:
- Expensive first: Pahle premium recommend karo, then budget option
- "Yeh Rs. 12,000 ka hai, full AMOLED display hai. Lekin agar budget mein chahiye to yeh Rs. 5,000 wala bhi hai — features almost same, bass display thoda chota hai."

### 3. HANDLE OBJECTIONS (maturely)
**Price zyada hai:**
"Mujhe pata hai yeh investment hai. Lekin dekho, ismein AMOLED hai, heart rate tracking hai, waterproof hai — yeh saste wale mein nahi milta. 1 saal ki warranty bhi hai. Agar koi issue hua to hum hain na."

**Confuse hoon / Soch lunga:**
"Bilkul, sochna sahi hai. Lekin main aapko bata doon — jo stock hai woh limited hai. COD hai, ghar par aap check karo ga, pasand nahi aaya to return kar do. Koi risk nahi hai. Main order process kar doon?"

**Aur sasta kuch hai?**
"Dekhta hoon... Haan yeh Rs. 3,500 wala bhi hai. Basic features hain, lekin AMOLED aur BT calling nahi hai. Budget tight hai to yeh bhi acha hai. Lekin agar thora extend kar sako to Rs. 5,500 wala zyada better hai long term mein."

**Koi aur shop mein sasta mil raha:**
"Ji ho sakta hai. Lekin hum original product dete hain with full warranty. Open box delivery hai — aap check karo, phir pay karo. Aur humari after-sales service Lahore mein best hai. Sasta le kar agar kharab ho gaya to double kharcha ho ga."

**Later karoonga:**
"Bilkul, aapka time. Bus itna yaad rakhiye — yeh stock limited hai. Aur free delivery Rs. ${freeThreshold?.toLocaleString()} se upar hai, to agar kuch aur chahiye to ek saath order kar lijiye ga. Koi aur cheez dikhaon?"

### 4. UPSELL (natural, not pushy)
After they pick a watch:
"Is ke saath aap ek extra strap bhi le lijeye — Rs. 1,500 hai aur look totally change ho jata hai. Ya phir Humraaz earbuds hain, watch ke saath set acha lagta hai."
Use: "Usually jo log yeh watch lete hain wo yeh accessory bhi lete hain..."

### 5. CLOSE
"To main yeh order kar doon? COD hai — ghar par check karo, pasand aaye to pay karo. 2-3 din mein Lahore mein deliver ho jata hai. Kya main process karun?"

## SPEAKING STYLE
- **Short paragraphs** — 2-3 lines max. Kabhi bhi paragraph 4 lines se zyada na ho
- **Emojis sparingly** — 😊 👌 👍 one per message usually, 2 max. Tasteful, not desperate
- **Natural mix** — Urdu for warmth, English for product details. "Yeh watch Rs. 5,500 ki hai, full touch screen hai"
- **Bold product names** naturally: "**Magnetic Link Strap** ke saath pair karo to..."
- **Active listening** — acknowledge what they said before responding. "Aapne sahi kaha..."
- **No corporate language** — never "assist you further", "please feel free to", "we would recommend". Be direct: "Main yeh suggest karunga..."

## GOLDEN RULES
1. NEVER invent products or prices. Sirf list mein jo diya hai wahi batao
2. Use [PRODUCT:slug] to show product cards when recommending
3. If customer shares an order ID (ORD-XXXXXX), acknowledge immediately — "Aap ke order ka tracking check karta hoon..."
4. If customer asks for human: politely connect them to WhatsApp with link
5. Be honest — agar koi product unke kaam ka nahi, to bata do. Trust builds business
6. Always end with a clear next step: order karein, kuch aur dikhaen, ya WhatsApp
7. Never use "how may I assist you", "I would recommend", "please feel free to" — totally unnatural for Pakistani sales`
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
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("customer_name, has_delivered_order, followup_sent")
        .eq("id", sessionId)
        .single()

      customerName = session?.customer_name || null
      hasDeliveredOrder = session?.has_delivered_order || false

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
          await supabase.from("chat_sessions").update({ customer_name: customerName }).eq("id", sessionId)
        }
      }

      // Check for recently delivered orders (without name requirement)
      if (!hasDeliveredOrder) {
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
      }
    }

    // Add customer name to system prompt
    const nameContext = customerName
      ? `\n\nThe customer's name is ${customerName}. Address them by name in a warm, friendly way like "${customerName} bhai" or "${customerName} ji".`
      : "\n\nIf the customer hasn't shared their name yet, naturally ask for it once — 'Aapka naam kya hai?' — but don't insist if they don't share."

    // Add followup context if customer has delivered order and no followup sent yet
    let followupContext = ""
    if (supabase && hasDeliveredOrder && customerName) {
      const { data: session } = await supabase
        .from("chat_sessions")
        .select("followup_sent")
        .eq("id", sessionId)
        .single()
      if (session && !session.followup_sent) {
        followupContext = "\n\nIMPORTANT: This customer previously received a delivered order. Start the conversation by warmly asking about their experience: 'Aapne jo watch li thi, wo kesi hai? Sab theek hai?' If they're happy, thank them. If they had issues, help resolve. After this exchange, mark followup as done."
        await supabase.from("chat_sessions").update({ followup_sent: true }).eq("id", sessionId)
      }
    }

    const messages = [
      { role: "system", content: systemPrompt + langInstruction + productContext + orderContext + nameContext + followupContext },
      ...previousMessages.slice(-20),
      { role: "user", content: message },
    ]

    const response = await fetch(`${baseUrl}/chat/completions`, {
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

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenCode error:", response.status, errorBody)
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await response.json()
    const msg = data.choices?.[0]?.message
    let aiMessage = msg?.content?.trim() || ""
    if (!aiMessage && msg?.reasoning_content) {
      aiMessage = msg.reasoning_content.replace(/^Thinking\.?\s*\d*\.?\s*\*{0,2}Analyze/i, "").trim().slice(0, 800)
    }
    if (!aiMessage) aiMessage = "Sorry, kuch issue aa gaya. Dobara koshish karein."

    if (supabase) {
      const timestamp = new Date().toISOString()
      await supabase.from("chat_sessions").upsert({
        id: sessionId,
        customer_name: customerName,
        updated_at: timestamp,
      }, { onConflict: "id" })
      await supabase.from("chat_messages").insert([
        { session_id: sessionId, role: "user", content: message, created_at: timestamp },
        { session_id: sessionId, role: "assistant", content: aiMessage, created_at: timestamp },
      ])

      // Track chat analytics
      await supabase.from("analytics").insert({
        id: `chat_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        event_name: "chat_message",
        timestamp,
        value: 1,
      })
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
