"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Send, MessageCircle, Minus, CheckCheck, Clock } from "lucide-react"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
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

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "👋 Assalam-o-Alaikum! Welcome to Smartwear Pakistan! 😊\n\nMain aapki kya madad kar sakta hoon? Aap Smart Watches, Analog Watches ya accessories ke baare mein poochh sakte hain. Mein delivery, pricing aur sab kuch detail mein bata doonga!\n\nKuch sawaal jo aap poochh sakte hain:\n• \"Best smartwatch konsa hai?\"\n• \"Price kya hai Series 11 ki?\"\n• \"COD available hai?\"\n• \"Delivery kitne din mein aati hai?\"",
  timestamp: new Date(),
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId] = useState(getSessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), sessionId }),
      })

      const data = await res.json()

      if (data.reply) {
        const botMsg: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: data.reply,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
      } else {
        throw new Error("No reply")
      }
    } catch {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "Maaf karein, koi technical issue aa gaya hai. Thodi der baad dobara koshish karein ya humein WhatsApp par contact karein. 🫡",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }

    setIsTyping(false)
  }, [isTyping, sessionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })
  }

  const quickReplies = [
    "Best smartwatch konsa hai?",
    "COD available hai?",
    "Delivery kitne din mein aati hai?",
    "Warranty kya hai?",
  ]

  return (
    <>
      {/* FAB Button */}
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              ...(isMinimized ? { height: 60 } : {}),
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] rounded-2xl overflow-hidden shadow-2xl bg-[#0A0D11] border border-white/10 ${
              isMinimized ? "h-[60px]" : "h-[600px] max-h-[80vh]"
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
              <div className="flex-1 h-[calc(100%-116px)] overflow-y-auto px-3 py-3 space-y-2 bg-[#0A0D11]" style={{ backgroundImage: "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.01) 0%, transparent 60%)" }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#075E54] text-white rounded-br-sm"
                          : "bg-[#1F2A33] text-white/90 rounded-bl-sm"
                      }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      <p>{msg.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] text-white/40">{formatTime(msg.timestamp)}</span>
                        {msg.role === "user" && <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
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

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick Replies + Input */}
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
                    placeholder="Type a message..."
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
