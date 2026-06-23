type FaqEntry = { patterns: RegExp[]; answer: string; lang?: "ur" | "en" }

const faqs: FaqEntry[] = [
  // Delivery
  { patterns: [/delivery (time|kitne|duration|how long|kab tak)/i, /order (kab|when) aye/i, /kitne din mein (delivery|aata|aati)/i], answer: "Standard delivery 2-5 working days hai poore Pakistan mein. Express delivery bhi available hai jisme 1-2 din lagte hain. Free delivery orders over Rs. 10,000." },
  { patterns: [/free delivery/i, /free shipping/i, /delivery free/i, /free (delivery|shipping) (threshold|limit|kitne)/i], answer: "Free delivery on orders above Rs. 10,000. Otherwise standard Rs. 200, express Rs. 500." },
  { patterns: [/open (box|parcel|delivery)/i, /check.*before.*pay/i, /dekh.*kar.*pay/i], answer: "Haan bhai, open box delivery hai. Rider ke samne parcel khol kar check karo, phir payment karo." },
  { patterns: [/same day delivery/i, /today delivery/i, /aaj delivery/i], answer: "Lahore mein same day delivery available hai (order 2 PM se pehle). Bahar cities ke liye express delivery hai." },
  { patterns: [/COD|Cash on Delivery|cash on delivery/i], answer: "COD available hai. Jab rider aaye to cash pay karo. Open box delivery hai — pehle check karo, phir pay karo." },

  // Payment
  { patterns: [/payment.*method/i, /kaise pay/i, /pay (kese|karna|kaise)/i, /kya.*payment.*accept/i], answer: "COD, JazzCash, Easypaisa aur Bank Transfer sab available hain. COD preferred hai." },
  { patterns: [/jazzcash|easypaisa|bank transfer|jazz.?cash|easy.?paisa/i], answer: "JazzCash aur Easypaisa dono available hain. Checkout ke time option select karein. Bank transfer details bhi provide kar denge." },
  { patterns: [/installment|kisti|qist|installment/i], answer: "Currently installment facility available nahi hai. Lekin humare prices bohot reasonable hain. COD bhi hai to aap check kar ke le sakte hain." },
  { patterns: [/discount|code|promo|coupon|offer/i], answer: "Available promo codes hain. Checkout page mein promo code enter karein. Agar koi specific offer chal raha ho to WhatsApp par bhi bata sakte hain." },
  { patterns: [/jazz.*discount|easyp.*discount|payment.*discount/i], answer: "JazzCash aur Easypaisa payments par 5% additional discount available hai. Checkout mein payment method select karte waqt dikh jaye ga." },

  // Returns & Warranty
  { patterns: [/return (policy|kar|karna|how)/i, /wapas (kar|le)/i, /refund/i], answer: "7-day easy return policy hai. Pasand nahi aaya to wapas kar sakte hain. Full money back guarantee." },
  { patterns: [/warranty/i, /guarantee/i], answer: "1 year warranty on smart watches, 6 months on accessories. Warranty card ke saath aata hai." },
  { patterns: [/exchange/i, /badal|change (kar|karna)/i], answer: "7 din ke andar exchange kar sakte hain. Different color ya model le sakte hain. Difference amount adjust ho jayega." },

  // Products
  { patterns: [/best (smart)?watch/i, /top (smart)?watch/i, /kaunsa.*(best|acha|recommend|suggest)/i], answer: "Ultra Sync Pro Rs. 8,500 bestseller hai — AMOLED display, BT calling, heart rate, 7 days battery. Budget option Smart Band 5 Rs. 4,500 hai." },
  { patterns: [/BT calling|bluetooth calling|blue.?tooth/i], answer: "BT calling wale models: Ultra Sync Pro Rs. 8,500 (AMOLED + HR), Smart Band 5 Rs. 4,500 (basic)." },
  { patterns: [/waterproof|water resistant|swim|swimming|pani|paani/i], answer: "Most smart watches IP67/IP68 hain — rain, hand wash, sweat safe. Swimming ke liye nahi recommend karte." },
  { patterns: [/battery (life|kitne|how long|duration|time)/i, /charge (kitne|how long) (din|days|chale)/i], answer: "Ultra Sync Pro — 7-8 days normal, 4-5 days heavy use. Smart Band 5 — 5-6 days. Analog watches — 2-3 saal battery life." },
  { patterns: [/heart.?rate|hr|blood pressure|bp|spo2|oxygen|health (track|monitor)/i], answer: "Ultra Sync Pro aur Smart Band 5 dono mein heart rate, SPO2, sleep tracking hai." },
  { patterns: [/screen size|display.*inch|AMOLED|display (size|quality)/i], answer: "Ultra Sync Pro mein 1.78 inch AMOLED hai — direct sun mein bhi clear dikhe ga. Smart Band 5 mein 1.4 inch TFT hai." },
  { patterns: [/gift|gift (ke liye|kar|dena|pair)/i, /occasion|eid|shadi|birthday|wedding|anniversary/i], answer: "Gift ke liye Midnight Elite Rs. 6,500 best hai — premium box, gift wrapping free." },
  { patterns: [/sport|gym|exercise|workout|fitness|running|run/i], answer: "Ultra Sync Pro — IP68 waterproof, heart rate, step count, calories. Gym ke liye best hai." },

  // Analog
  { patterns: [/analog.*price|analog.*kitne|classic.*watch|dress.*watch|formal.*watch/i], answer: "Analog watches Rs. 2,500 se Rs. 12,000 tak hain. Luxe collection mein Versacee, ROLX, Submariner styles hain." },
  { patterns: [/leather (strap|belt|band)/i, /steel (strap|belt|band)/i], answer: "Steel strap aur leather strap dono options hain. Steel zyada durable hai, leather formal look ke liye best." },
  { patterns: [/brand.*watch|branded|designer/i], answer: "Rolex style, ROLX, Versacee — sab premium quality hain. Duplicate nahi, original authorized dealer se aati hain." },
  { patterns: [/ladies.*watch|women.*watch|girl.*watch|female|woman/i], answer: "Ladies watches available hain. Luxury collection hai. Gift ke liye best." },

  // Store
  { patterns: [/shop (kahan|location|address|kiddar)/i, /store.*(kahan|location|address)/i, /MM Alam/i], answer: "MM Alam Road, Gulberg III, Lahore. Mon-Sat 10am-8pm, Sunday closed." },
  { patterns: [/whatsapp|wa\.me|number/i], answer: "WhatsApp number is +92 300 1234567. Aap wahan bhi contact kar sakte hain." },
  { patterns: [/phone.*number|call|contact/i], answer: "Store phone: +92 300 1234567. WhatsApp: https://wa.me/923001234567" },
  { patterns: [/time|hours|kab (khol|khul|band)/i, /timing|store.*time/i], answer: "Mon-Sat: 10am to 8pm PKT. Sunday closed." },

  // Stock
  { patterns: [/stock (mein|available)/i, /available (hai)?/i, /hai aapke paas/i], answer: "Most products stock mein hain. Koi specific product batao to exact stock check kar deta hoon." },
  { patterns: [/how to (order|buy|purchase)/i, /order (kaise|kese|karna|karun)/i], answer: "Website se directly order kar sakte hain. Product select karein → Add to Cart → Checkout → Address/Phone enter karein → Order Confirm." },
  { patterns: [/track.*order/i, /order (kahan|status|check)/i, /order.*(pohonch|aaya|reach)/i], answer: "Order ID batao to main check kar deta hoon. Ya phone number share karein." },
]

export function checkFaq(msg: string): string | null {
  const low = msg.toLowerCase()
  for (const faq of faqs) {
    for (const pattern of faq.patterns) {
      if (pattern.test(low)) return faq.answer
    }
  }
  return null
}
