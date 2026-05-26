"use client"

import { useState, useEffect } from "react"
import { Sparkles, Copy, Check, Loader2, Megaphone, Zap, Crown, MessageSquare } from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/page-header"

interface Product {
  id: string
  name: string
  price: number
  category: string
}

type Tone = "casual" | "urgent" | "premium"

const TONES: { id: Tone; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  {
    id: "casual",
    label: "Casual & Friendly",
    icon: <MessageSquare className="h-4 w-4" />,
    description: "Dost ki tarah baat karo",
    color: "border-blue-200 bg-blue-50 text-blue-700",
  },
  {
    id: "urgent",
    label: "Urgent Sale 🔥",
    icon: <Zap className="h-4 w-4" />,
    description: "Limited time offer urgency",
    color: "border-orange-200 bg-orange-50 text-orange-700",
  },
  {
    id: "premium",
    label: "Premium & Luxury 👑",
    icon: <Crown className="h-4 w-4" />,
    description: "High-end product feel",
    color: "border-purple-200 bg-purple-50 text-purple-700",
  },
]

export default function MarketingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProductId, setSelectedProductId] = useState("")
  const [tone, setTone] = useState<Tone>("casual")
  const [loading, setLoading] = useState(false)
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [generatedMessage, setGeneratedMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.products ?? []
        setProducts(list.filter((p: any) => p.status !== "archived"))
        if (list.length > 0) setSelectedProductId(list[0].id)
      })
      .catch(() => setError("Products load nahi hue"))
      .finally(() => setLoadingProducts(false))
  }, [])

  const handleGenerate = async () => {
    if (!selectedProductId) return
    setLoading(true)
    setError("")
    setGeneratedMessage("")
    setCopied(false)

    try {
      const res = await fetch("/api/ai/generate-marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Unknown error")
      setGeneratedMessage(data.message)
    } catch (e: any) {
      setError(e.message || "Kuch masla hua, dobara try karo")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const charCount = generatedMessage.length
  const charColor = charCount > 280 ? "text-red-500" : charCount > 200 ? "text-amber-500" : "text-neutral-400"

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="AI Marketing Generator"
        description="Product ki details de kar AI se catchy WhatsApp broadcast message banwao"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Controls */}
        <div className="space-y-5">
          {/* Product Selector */}
          <div className="bg-white border border-neutral-200/60 rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <label className="block text-sm font-semibold text-neutral-800 mb-3">
              1. Product Select Karo
            </label>
            {loadingProducts ? (
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Products load ho rahe hain...
              </div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full h-11 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-800 focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300 transition-all"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Rs. {p.price.toLocaleString()}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Tone Selector */}
          <div className="bg-white border border-neutral-200/60 rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <label className="block text-sm font-semibold text-neutral-800 mb-3">
              2. Message Ka Tone Chunno
            </label>
            <div className="space-y-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all ${
                    tone === t.id
                      ? t.color + " border-current"
                      : "border-neutral-100 bg-neutral-50 text-neutral-600 hover:border-neutral-200"
                  }`}
                >
                  {t.icon}
                  <div>
                    <p className="text-sm font-semibold">{t.label}</p>
                    <p className="text-xs opacity-70">{t.description}</p>
                  </div>
                  {tone === t.id && (
                    <Check className="ml-auto h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !selectedProductId || loadingProducts}
            className="w-full flex items-center justify-center gap-2.5 h-12 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI likh raha hai...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                Generate Marketing Message
              </>
            )}
          </button>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Right: Generated Message */}
        <div className="bg-white border border-neutral-200/60 rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-neutral-400" />
              <span className="text-sm font-semibold text-neutral-800">Generated Message</span>
            </div>
            {generatedMessage && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-400">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
                <p className="text-sm">AI message likh raha hai...</p>
              </div>
            ) : generatedMessage ? (
              <div className="relative">
                {/* WhatsApp-style message bubble */}
                <div className="bg-[#DCF8C6] rounded-2xl rounded-tl-sm p-4 shadow-sm">
                  <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                    {generatedMessage}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-2">
                    <span className={`text-xs ${charColor}`}>{charCount} chars</span>
                    <span className="text-xs text-neutral-400">✓✓</span>
                  </div>
                </div>
                {charCount > 280 && (
                  <p className="mt-2 text-xs text-red-500">
                    ⚠️ Message thoda lamba hai, WhatsApp ke liye 280 chars best hain
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-300">
                <Sparkles className="h-12 w-12" />
                <p className="text-sm text-center">
                  Product select karo aur<br />
                  "Generate" dabao ✨
                </p>
              </div>
            )}
          </div>

          {generatedMessage && (
            <div className="mt-4 pt-4 border-t border-neutral-100">
              <p className="text-xs text-neutral-400 text-center">
                💡 Tip: Is message ko copy kar ke WhatsApp Broadcast mein paste karo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
