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
  const paymentMethods = settings?.payment_methods || '["COD","JazzCash","Easypaisa","Bank Transfer"]'
  const paymentMethodsParsed = (() => { try { return JSON.parse(paymentMethods).join(", ") } catch { return paymentMethods } })()
  const whatsappNumber = settings?.whatsapp_number || "923001234567"
  const whatsappLink = `https://wa.me/${whatsappNumber}`

  // Build product catalog summary
  const smartWatches = products.filter((p: any) => p.category_slug === "smart-watches" || p.category_slug === "smartwatches")
  const analogWatches = products.filter((p: any) => p.category_slug === "analog-watches")
  const accessories = products.filter((p: any) => !["smart-watches", "smartwatches", "analog-watches"].includes(p.category_slug))

  const formatProducts = (items: any[], limit = 8) =>
    items.slice(0, limit).map((p: any) => {
      const specs = p.specifications
        ? Object.entries(p.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(", ")
        : ""
      const compare = p.compare_price ? ` (was Rs. ${p.compare_price.toLocaleString()})` : ""
      return `• ${p.name} — Rs. ${p.price?.toLocaleString()}${compare} | Stock: ${p.stock || 0}${specs ? ` | ${specs}` : ""}`
    }).join("\n")

  const productCatalog = `
## 📦 Smart Watches (${smartWatches.length} available)
${smartWatches.length > 0 ? formatProducts(smartWatches) : "Smart watches with AMOLED display, BT calling, health tracking, IP67 waterproof. Price range Rs. 3,500 - 15,000."}

## ⌚ Analog Watches (${analogWatches.length} available)
${analogWatches.length > 0 ? formatProducts(analogWatches) : "Premium leather strap watches, classic designs, quartz movement, water resistant. Price range Rs. 2,500 - 12,000."}

## 🎧 Accessories (${accessories.length} available)
${accessories.length > 0 ? formatProducts(accessories) : "Wireless earbuds, smart bands, chargers, watch straps, phone cases. Price range Rs. 500 - 5,000."}`

  return `You are a friendly, professional sales & support representative for **${storeName}** — a premium Pakistani e-commerce store selling Smart Watches, Analog Watches, and Tech Accessories.

## 🏪 STORE INFORMATION (REAL DATA — use these exact details)
- Store: ${storeName}
- Address: ${address}
- Hours: ${hours}
- Phone: ${phone}
- Email: ${email}
- WhatsApp: ${whatsappLink}

## 📋 REAL PRODUCT CATALOG (from database — use exact names & prices)
${productCatalog}

## 📜 STORE POLICIES (REAL — use exact figures)
- Payment Methods: ${paymentMethodsParsed}
- Free Delivery: on orders over Rs. ${freeThreshold?.toLocaleString()}
- Standard Shipping: Rs. ${shippingStandard} (2-5 business days via PostEx)
- Express Shipping: Rs. ${shippingExpress}
- Returns: 7-day easy return policy, full money back guarantee
- Warranty: 1 year local warranty on all smart watches
- Open box delivery available — check product before paying

## 🧠 PERSONALITY & BEHAVIOR
- Speak naturally in Roman Urdu + English mix, like a real Pakistani sales rep
  Examples: "Bhai yeh watch bohot premium hai, leather strap ke saath classy lagta hai."
  "Yeh Series 11 ka AMOLED display kamaal ka hai, dhool aur paani se bhi protected hai."
- Be helpful, polite, and slightly persuasive — customer ko convince karo without forcing
- Product ki exact details do — price, features, stock sab kuch real data se batao
- Agar customer kisi product ke baare mein pooche to USKA EXACT NAAM, PRICE aur FEATURES do
- Compare products when asked — dono ke fayde aur nuqsan batao
- Recommend based on customer needs (budget, use case, style preference)
- NEVER make up prices or products — sirf jo upar diya hai wohi batao
- Agar kisi cheez ka answer nahi pata to honestly kaho "Mujhe is baare mein tafseel nahi hai, lekin main aapko WhatsApp ya call par connect kar sakta hoon"
- Close the sale naturally: "Order kar dain, COD hai, koi risk nahi. Free delivery bhi hai."
- Keep responses concise (2-3 paragraphs max). Use emojis occasionally for warmth.

## ⚠️ IMPORTANT RULES
- ONLY use the product names, prices, and data listed above. DO NOT invent products.
- If a customer asks about a product not in the list, say "Yeh product abhi humare paas available nahi hai, lekin main similar koi aur dikha sakta hoon."
- For order status, tell them to contact via WhatsApp for personalized support
- Be honest about stock — agar stock 0 hai to batayein`
}

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json()

    if (!message || !sessionId) {
      return NextResponse.json({ error: "Message and sessionId are required" }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Fetch real data from database
    const [products, settings] = await Promise.all([
      getProducts().catch(() => []),
      getSettings().catch(() => ({})),
    ])

    const systemPrompt = buildSystemPrompt(products, settings)

    let previousMessages: { role: string; content: string }[] = []

    if (supabase) {
      const { data } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })

      if (data) {
        previousMessages = data.map((m) => ({ role: m.role, content: m.content }))
      }
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...previousMessages.slice(-20),
      { role: "user", content: message },
    ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Smartwear Pakistan Chat",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-v4-flash-free",
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenRouter error:", response.status, errorBody)
      return NextResponse.json({ error: "AI service error" }, { status: 502 })
    }

    const data = await response.json()
    const aiMessage = data.choices?.[0]?.message?.content || "Sorry, kuch issue aa gaya. Dobara koshish karein."

    if (supabase) {
      const timestamp = new Date().toISOString()
      await supabase.from("chat_sessions").upsert({ id: sessionId, updated_at: timestamp }, { onConflict: "id" })
      await supabase.from("chat_messages").insert([
        { session_id: sessionId, role: "user", content: message, created_at: timestamp },
        { session_id: sessionId, role: "assistant", content: aiMessage, created_at: timestamp },
      ])
    }

    return NextResponse.json({ reply: aiMessage })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
