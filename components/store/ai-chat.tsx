"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, MessageCircle, Minus, CheckCheck, ThumbsUp, ThumbsDown, ShoppingCart, ExternalLink, Clock, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/context/cart-context"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  productCards?: ProductCardData[]
  orderInfo?: OrderInfoData
  feedback?: 1 | -1 | 0
}

type ProductCardData = {
  slug: string
  name: string
  price: number
  comparePrice?: number
  image: string
  stock: number
}

type OrderInfoData = {
  id: string
  status: string
  items: { name: string; qty: number; price: number }[]
  total: number
  daysLeft?: number
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

function getSessionId() {
  if (typeof window === "undefined") return ""
  let id = localStorage.getItem("chat_session_id")
  if (!id) {
    id = `session_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    localStorage.setItem("chat_session_id", id)
  }
  return id
}

function getLangPref() {
  if (typeof window === "undefined") return "urdu"
  return (localStorage.getItem("chat_lang") as "urdu" | "english") || "urdu"
}

const WELCOME_URDU: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "👋 Assalam-o-Alaikum! Smartwear Pakistan mein aapka swagat hai! 😊\n\nMain aapki kya madad kar sakta hoon? Smart watches, analog watches, ya accessories — jo bhi chahiye, poochh sakte hain!\n\nKuch sawaal jo aap poochh sakte hain:\n• \"Best smartwatch konsa hai?\"\n• \"Series 11 ki price kya hai?\"\n• \"COD available hai?\"\n• \"ORD-123456\" (order track karne ke liye)",
  timestamp: new Date(),
}

const WELCOME_ENGLISH: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "👋 Welcome to Smartwear Pakistan! 😊\n\nHow can I help you today? Ask me about Smart Watches, Analog Watches, or Accessories — prices, features, delivery, anything!\n\nTry asking:\n• \"What's the best smartwatch?\"\n• \"Series 11 price?\"\n• \"COD available?\"\n• \"ORD-123456\" (to track your order)",
  timestamp: new Date(),
}

const FALLBACK_PRODUCT_IMG = "/hero-watch-transparent.png"

interface ProductCardWithCartProps {
  data: ProductCardData
  onAddToCart: (data: ProductCardData) => void
  addingToCart: string | null
}

function ProductCard({ data, onAddToCart, addingToCart }: ProductCardWithCartProps) {
  const isAdding = addingToCart === data.slug
  return (
    <div className="mt-2 group">
      <Link
        href={`/products/${encodeURIComponent(data.slug)}`}
        className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.06] hover:border-[#B8860B]/20 transition-all"
      >
        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-[#06080A] shrink-0">
          <Image
            src={data.image || FALLBACK_PRODUCT_IMG}
            alt={data.name}
            fill
            className="object-contain p-1"
            sizes="56px"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-semibold truncate">{data.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[#B8860B] text-xs font-bold">Rs. {data.price?.toLocaleString()}</span>
            {data.comparePrice && (
              <span className="text-white/30 text-[10px] line-through">Rs. {data.comparePrice.toLocaleString()}</span>
            )}
          </div>
          <p className={`text-[10px] ${data.stock > 0 ? "text-emerald-400" : "text-red-400"}`}>
            {data.stock > 0 ? "In Stock" : "Out of Stock"}
          </p>
        </div>
        <ShoppingCart className="w-4 h-4 text-[#B8860B] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
      {data.stock > 0 && (
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart(data) }}
          disabled={isAdding}
          className="mt-1.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#B8860B]/10 border border-[#B8860B]/20 text-[#B8860B] text-[11px] font-semibold hover:bg-[#B8860B]/20 transition-all disabled:opacity-50"
        >
          {isAdding ? (
            <span className="w-3 h-3 border-2 border-[#B8860B] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      )}
    </div>
  )
}

function OrderCard({ data }: { data: OrderInfoData }) {
  return (
    <div className="p-3 rounded-xl bg-[#1F2A33] border border-white/8 mt-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-white text-xs font-semibold">Order #{data.id}</p>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          data.status === "Delivered" ? "bg-emerald-500/10 text-emerald-400" :
          data.status === "Shipped" ? "bg-blue-500/10 text-blue-400" :
          data.status === "Processing" ? "bg-amber-500/10 text-amber-400" :
          "bg-white/5 text-white/50"
        }`}>
          {data.status}
        </span>
      </div>
      {data.items.map((item, i) => (
        <p key={i} className="text-white/50 text-[11px]">{item.name} x{item.qty}</p>
      ))}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <span className="text-white text-xs font-bold">Rs. {data.total?.toLocaleString()}</span>
        {data.daysLeft !== undefined && (
          <span className="text-white/40 text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3" /> Return by: {data.daysLeft} days
          </span>
        )}
      </div>
    </div>
  )
}

function parseProductCards(content: string): { clean: string; cards: ProductCardData[] } {
  const cardRegex = /\[PRODUCT:([^\]]+)\]/g
  const slugs: string[] = []
  let match
  while ((match = cardRegex.exec(content)) !== null) {
    slugs.push(match[1])
  }
  const clean = content.replace(cardRegex, "").trim()
  return { clean, cards: [] } // fetched async in component
}

function fetchProductCards(slugs: string[]): Promise<ProductCardData[]> {
  return Promise.all(
    slugs.map(async (slug) => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(slug)}`)
        const p = await res.json()
        if (!p) return null
        return {
          slug: p.slug,
          name: p.name,
          price: p.price,
          comparePrice: p.compare_price,
          image: p.images?.[0] || FALLBACK_PRODUCT_IMG,
          stock: p.stock || 0,
        }
      } catch { return null }
    })
  ).then((r) => r.filter(Boolean) as ProductCardData[])
}

function isOrderId(text: string): string | null {
  const match = text.match(/ORD-\d{6}/)
  return match ? match[0] : null
}

async function fetchOrderInfo(orderId: string): Promise<OrderInfoData | null> {
  try {
    const res = await fetch(`/api/orders/track?order_id=${orderId}`)
    const data = await res.json()
    if (!data) return null
    return {
      id: data.id,
      status: data.status || "Processing",
      items: (data.items || []).map((i: any) => ({
        name: i.name || i.product_name || "Product",
        qty: i.quantity || 1,
        price: i.price || 0,
      })),
      total: data.total || 0,
      daysLeft: data.daysLeft,
    }
  } catch { return null }
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const lang = getLangPref()
    return [lang === "english" ? WELCOME_ENGLISH : WELCOME_URDU]
  })
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [lang, setLang] = useState<"urdu" | "english">(getLangPref)
  const [sessionId] = useState(getSessionId)
  const [msgCount, setMsgCount] = useState(0)
  const [failedCount, setFailedCount] = useState(0)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const { addToCart } = useCart()

  useEffect(() => {
    setFailedCount(parseInt(sessionStorage.getItem("chat_failed_count") || "0"))
  }, [])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const handleAddToCart = useCallback(async (card: ProductCardData) => {
    setAddingToCart(card.slug)
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(card.slug)}`)
      const product = await res.json()
      if (!product) return
      addToCart(product)
    } catch {} finally {
      setAddingToCart(null)
    }
  }, [addToCart])

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 300)
  }, [isOpen, isMinimized])

  // Proactive engagement
  useEffect(() => {
    if (isOpen || isMinimized) return
    const productSlug = window.location.pathname.match(/\/products\/(.+)/)?.[1]
    if (!productSlug) return

    const timer = setTimeout(() => {
      const hasBeenPrompted = sessionStorage.getItem("chat_proactive_" + productSlug)
      if (!hasBeenPrompted) {
        fetch(`/api/products/${encodeURIComponent(productSlug)}`).then(r => r.json()).then(p => {
          if (p?.name) {
            const msg: ChatMessage = {
              id: generateId(),
              role: "assistant",
              content: `👋 Hi! I see you're looking at the **${p.name}**. Koi sawaal hai? Mein price, features aur delivery sab bata sakta hoon! 😊`,
              timestamp: new Date(),
            }
            setMessages(prev => [...prev, msg])
            if (!isOpen && !isMinimized) setIsOpen(true)
            sessionStorage.setItem("chat_proactive_" + productSlug, "1")
          }
        }).catch(() => {})
      }
    }, 8000)

    return () => clearTimeout(timer)
  }, [isOpen, isMinimized])

  // Proactive for homepage
  useEffect(() => {
    if (isOpen || isMinimized) return
    if (window.location.pathname !== "/") return

    const timer = setTimeout(() => {
      const hasBeenPrompted = sessionStorage.getItem("chat_proactive_home")
      if (!hasBeenPrompted) {
        const msg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: `👋 Assalam-o-Alaikum! Kya aap help chahte hain? Mein aapko best smartwatch建议 kar sakta hoon aapke budget aur needs ke according! 😊`,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, msg])
        setIsOpen(true)
        sessionStorage.setItem("chat_proactive_home", "1")
      }
    }, 15000)

    return () => clearTimeout(timer)
  }, [isOpen, isMinimized])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return

    // Rate limit check
    const sentToday = parseInt(localStorage.getItem("chat_count_today") || "0")
    if (sentToday >= 30) {
      const limitMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "⚠️ Aapne aaj kafi zyada messages bhej diye hain. Thodi der baad baat karte hain ya WhatsApp par contact karein. Shukriya! 🙏",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, limitMsg])
      return
    }

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    // Check for order ID
    const orderId = isOrderId(text)
    let orderInfo: OrderInfoData | null = null
    if (orderId) {
      orderInfo = await fetchOrderInfo(orderId)
    }

    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    // Track rate limit
    localStorage.setItem("chat_count_today", String(sentToday + 1))
    setMsgCount(prev => prev + 1)

    // Auto handoff check (3rd failed interaction)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          sessionId,
          lang,
          orderId: orderInfo?.id || null,
          productSlug: window.location.pathname.match(/\/products\/(.+)/)?.[1] || null,
        }),
      })

      const data = await res.json()

      if (data.reply) {
        const cleanContent = data.reply

        // Parse product cards from response
        let productSlugs: string[] = []
        const cardRegex = /\[PRODUCT:([^\]]+)\]/g
        let m
        while ((m = cardRegex.exec(cleanContent)) !== null) productSlugs.push(m[1])
        const cleanText = cleanContent.replace(cardRegex, "").trim()

        let productCards: ProductCardData[] = []
        if (productSlugs.length > 0) {
          productCards = await fetchProductCards(productSlugs)
        }

        const botMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: cleanText || data.reply,
          timestamp: new Date(),
          productCards: productCards.length > 0 ? productCards : undefined,
          orderInfo: orderInfo || undefined,
        }

        setMessages(prev => [...prev, botMsg])

        // Track failed interactions (if AI seems uncertain)
        if (data.reply && (data.reply.includes("nahi pata") || data.reply.includes("available nahi") || data.reply.includes("sorry"))) {
          const nf = failedCount + 1
          sessionStorage.setItem("chat_failed_count", String(nf))
          setFailedCount(nf)
        } else {
          sessionStorage.setItem("chat_failed_count", "0")
          setFailedCount(0)
        }
      } else {
        throw new Error("No reply")
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Maaf karein, koi technical issue aa gaya hai. 😓 Thodi der baad dobara koshish karein ya humein WhatsApp par contact karein.",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
    }

    setIsTyping(false)
  }, [isTyping, sessionId, lang])

  // Auto handoff after 3 failed attempts
  const showHandoff = failedCount >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const toggleLang = () => {
    const newLang = lang === "urdu" ? "english" : "urdu"
    setLang(newLang)
    localStorage.setItem("chat_lang", newLang)
    const welcome = newLang === "english" ? WELCOME_ENGLISH : WELCOME_URDU
    setMessages([welcome])
    sessionStorage.setItem("chat_failed_count", "0")
  }

  const sendFeedback = async (messageId: string, rating: 1 | -1) => {
    try {
      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, messageId, rating }),
      })
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, feedback: rating } : m))
    } catch {}
  }

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })

  const quickRepliesUrdu = [
    "Best smartwatch konsa hai?",
    "COD available hai?",
    "Delivery kitne din mein aati hai?",
    "Warranty kya hai?",
  ]

  const quickRepliesEng = [
    "What's the best smartwatch?",
    "Is COD available?",
    "Delivery time?",
    "Return policy?",
  ]

  const quickReplies = lang === "urdu" ? quickRepliesUrdu : quickRepliesEng

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-[0_8px_32px_rgba(37,211,102,0.35)] flex items-center justify-center text-white hover:bg-[#20BD5A] transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] rounded-2xl overflow-hidden shadow-2xl bg-[#0A0D11] border border-white/10 ${
              isMinimized ? "h-[60px]" : "h-[620px] max-h-[85vh]"
            }`}
          >
            {/* Header */}
            <div className="bg-[#075E54] px-4 py-3 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full bg-[#25D366]/20 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  S
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#075E54]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Smartwear Pakistan</p>
                  <p className="text-[#25D366] text-[10px] font-medium">{isTyping ? "Typing..." : "Online"}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); toggleLang() }}
                  className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white text-[10px] font-bold uppercase transition-colors"
                  title={lang === "urdu" ? "Switch to English" : "Urdu mein badlein"}
                >
                  {lang === "urdu" ? "EN" : "UR"}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsOpen(false) }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <div className="flex-1 h-[calc(100%-125px)] overflow-y-auto px-3 py-3 space-y-2 bg-[#0A0D11]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.01) 0%, transparent 60%)" }}>
                {messages.map((msg) => (
                  <div key={msg.id}>
                    <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#075E54] text-white rounded-br-sm"
                            : "bg-[#1F2A33] text-white/90 rounded-bl-sm"
                        }`}
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        <p>{msg.content}</p>

                        {/* Product Cards */}
                        {msg.productCards?.map((card) => (
                          <ProductCard key={card.slug} data={card} onAddToCart={handleAddToCart} addingToCart={addingToCart} />
                        ))}

                        {/* Order Info */}
                        {msg.orderInfo && <OrderCard data={msg.orderInfo} />}

                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] text-white/40">{formatTime(msg.timestamp)}</span>
                          {msg.role === "user" && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>
                      </div>
                    </div>

                    {/* Feedback buttons (only for assistant msgs, not welcome) */}
                    {msg.role === "assistant" && msg.id !== "welcome" && (
                      <div className="flex items-center gap-2 mt-0.5 ml-2">
                        <button
                          onClick={() => sendFeedback(msg.id, 1)}
                          className={`p-1 rounded transition-colors ${msg.feedback === 1 ? "text-emerald-400" : "text-white/20 hover:text-white/50"}`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => sendFeedback(msg.id, -1)}
                          className={`p-1 rounded transition-colors ${msg.feedback === -1 ? "text-red-400" : "text-white/20 hover:text-white/50"}`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1F2A33] px-4 py-3 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Human Handoff */}
                {showHandoff && !isTyping && (
                  <div className="flex justify-center">
                    <div className="bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-xl px-4 py-3 text-center max-w-[90%]">
                      <p className="text-white/70 text-xs mb-2">
                        {lang === "urdu"
                          ? "Kya aap kisi insaan se baat karna chahain gay?"
                          : "Would you like to talk to a human?"}
                      </p>
                      <div className="flex items-center gap-2 justify-center">
                        <a
                          href={`https://wa.me/923001234567?text=Hi Smartwear! I need help with my order.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20BD5A] transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> WhatsApp
                        </a>
                        <button
                          onClick={() => { sessionStorage.setItem("chat_failed_count", "0"); setFailedCount(0) }}
                          className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-xs hover:text-white/80 transition-colors"
                        >
                          {lang === "urdu" ? "Nahi, AI se baat karo" : "No, continue with AI"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input */}
            {!isMinimized && (
              <div className="border-t border-white/5 bg-[#0A0D11]">
                {messages.length <= 1 && (
                  <div className="px-3 pt-2 pb-1 flex flex-wrap gap-1.5">
                    {quickReplies.map((qr) => (
                      <button
                        key={qr}
                        onClick={() => sendMessage(qr)}
                        className="px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-white/60 text-[11px] hover:bg-white/[0.08] hover:text-white/80 transition-all shrink-0"
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={lang === "urdu" ? "Yahan likhein..." : "Type a message..."}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#25D366]/40 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#20BD5A] transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
