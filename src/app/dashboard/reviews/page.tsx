"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Star, Sparkles, Loader2, ThumbsUp, ThumbsDown,
  Lightbulb, MessageSquare, TrendingUp, Search, Check, X
} from "lucide-react"
import { DashboardHeader } from "@/components/dashboard/page-header"
import { useProducts } from "@/lib/products-context"

interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string
  verified: boolean
  createdAt: string
}

interface AISummary {
  productName: string
  totalReviews: number
  avgRating: number
  summary: string
  sentiment: "positive" | "mixed" | "negative"
  positives: string[]
  negatives: string[]
  recommendation: string
}

const SENTIMENT_CONFIG = {
  positive: { label: "Positive", color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  mixed:    { label: "Mixed",    color: "text-amber-700 bg-amber-50 border-amber-200",     dot: "bg-amber-500"   },
  negative: { label: "Negative", color: "text-red-700 bg-red-50 border-red-200",           dot: "bg-red-500"     },
}

function StarRow({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${n <= rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
          strokeWidth={1}
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const { products } = useProducts()
  const [selectedProductId, setSelectedProductId] = useState("")
  const [reviews, setReviews] = useState<Review[]>([])
  const [avgRating, setAvgRating] = useState(0)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [aiSummary, setAiSummary] = useState<AISummary | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const [verifying, setVerifying] = useState<string | null>(null)

  const activeProducts = products.filter((p) => p.status !== "archived")

  const fetchReviews = useCallback(async (productId: string) => {
    if (!productId) return
    setLoadingReviews(true)
    setAiSummary(null)
    setAiError("")
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setAvgRating(data.avgRating || 0)
    } catch {
      setReviews([])
    } finally {
      setLoadingReviews(false)
    }
  }, [])

  useEffect(() => {
    if (activeProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(activeProducts[0].id)
    }
  }, [activeProducts])

  useEffect(() => {
    if (selectedProductId) fetchReviews(selectedProductId)
  }, [selectedProductId, fetchReviews])

  const handleAiSummary = async () => {
    if (!selectedProductId || reviews.length === 0) return
    setAiLoading(true)
    setAiError("")
    setAiSummary(null)
    try {
      const res = await fetch("/api/ai/review-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAiSummary(data)
    } catch (e: any) {
      setAiError(e.message || "AI analysis fail ho gayi")
    } finally {
      setAiLoading(false)
    }
  }

  const handleVerify = async (reviewId: string, verified: boolean) => {
    setVerifying(reviewId)
    try {
      await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      })
      setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, verified } : r))
    } finally {
      setVerifying(null)
    }
  }

  const selectedProduct = activeProducts.find((p) => p.id === selectedProductId)

  return (
    <div className="space-y-6">
      <DashboardHeader title="Reviews" description="Customer product reviews aur AI sentiment analysis" />

      {/* Product Selector */}
      <div className="bg-white border border-neutral-200/60 rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <Search className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 h-10 rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-sm font-medium text-neutral-800 focus:border-neutral-400 focus:outline-none transition-all"
            >
              {activeProducts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Stats */}
          {!loadingReviews && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <StarRow rating={Math.round(avgRating)} size="sm" />
                <span className="text-sm font-bold text-neutral-800">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-neutral-400">({reviews.length} reviews)</span>
              </div>
              <button
                onClick={handleAiSummary}
                disabled={aiLoading || reviews.length === 0}
                className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-700 disabled:opacity-50 transition-all"
              >
                {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-amber-300" />}
                AI Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Summary Card */}
      {(aiLoading || aiSummary || aiError) && (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-[24px] p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <span className="font-bold text-sm">AI Review Analysis</span>
            {aiSummary && (
              <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full border ${SENTIMENT_CONFIG[aiSummary.sentiment].color}`}>
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${SENTIMENT_CONFIG[aiSummary.sentiment].dot} mr-1.5`} />
                {SENTIMENT_CONFIG[aiSummary.sentiment].label}
              </span>
            )}
          </div>

          {aiLoading && (
            <div className="flex items-center gap-3 text-white/60">
              <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
              <span className="text-sm">AI reviews analyze kar raha hai...</span>
            </div>
          )}

          {aiError && <p className="text-red-400 text-sm">⚠️ {aiError}</p>}

          {aiSummary && (
            <div className="space-y-4">
              <p className="text-sm text-white/80 leading-relaxed">{aiSummary.summary}</p>

              <div className="grid sm:grid-cols-2 gap-4">
                {aiSummary.positives.length > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Customers Ko Kya Pasand Aya</span>
                    </div>
                    <ul className="space-y-1.5">
                      {aiSummary.positives.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-emerald-400 mt-0.5">✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiSummary.negatives.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <ThumbsDown className="h-4 w-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Shikayaat / Issues</span>
                    </div>
                    <ul className="space-y-1.5">
                      {aiSummary.negatives.map((n, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <span className="text-red-400 mt-0.5">✗</span> {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {aiSummary.recommendation && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-3">
                  <Lightbulb className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">AI Recommendation</p>
                    <p className="text-sm text-white/80">{aiSummary.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white border border-neutral-200/60 rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-neutral-400" />
            <span className="text-sm font-semibold text-neutral-800">
              {selectedProduct?.name} — Reviews ({reviews.length})
            </span>
          </div>
        </div>

        {loadingReviews ? (
          <div className="flex items-center justify-center py-16 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm">Reviews load ho rahe hain...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-neutral-50 border border-neutral-200/60">
              <Star className="h-8 w-8 text-neutral-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-neutral-800 mb-1">Koi Review Nahi</h3>
            <p className="text-sm text-neutral-500 max-w-xs">
              Is product ka abhi tak koi customer review nahi aaya. Jab customers review denge, yahan dikhai denge.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {reviews.map((review) => (
              <div key={review.id} className="px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-neutral-900">{review.customerName}</span>
                      {review.verified && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          <Check className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                      <StarRow rating={review.rating} />
                      <span className="text-xs text-neutral-400 ml-auto">
                        {new Date(review.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 leading-relaxed">{review.comment}</p>
                  </div>

                  {/* Verify toggle */}
                  <button
                    onClick={() => handleVerify(review.id, !review.verified)}
                    disabled={verifying === review.id}
                    title={review.verified ? "Unverify" : "Mark as Verified"}
                    className={`flex-shrink-0 flex items-center justify-center h-7 w-7 rounded-lg border transition-colors ${
                      review.verified
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
                        : "border-neutral-200 text-neutral-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                    }`}
                  >
                    {verifying === review.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : review.verified ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
