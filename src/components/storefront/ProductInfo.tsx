"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Spec } from "@/lib/products"

interface ProductInfoTab {
  id: string
  label: string
}

interface ProductInfoProps {
  description: string
  specs: Spec[]
  tags?: string[]
  rating?: number
  reviewCount?: number
  className?: string
}

const tabs: ProductInfoTab[] = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "reviews", label: "Reviews" },
]

const easePremium = [0.16, 1, 0.3, 1] as const

export function ProductInfo({ description, specs, tags, rating, reviewCount, className }: ProductInfoProps) {
  const [activeTab, setActiveTab] = useState("description")

  return (
    <div className={cn("w-full", className)}>
      {/* Tabs */}
      <div className="border-b border-neutral-200/60">
        <div className="flex gap-0 -mb-px overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-5 py-3.5 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 whitespace-nowrap",
                activeTab === tab.id
                  ? "text-neutral-900"
                  : "text-neutral-400 hover:text-neutral-600"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="activeTab"
                  transition={{ duration: 0.3, ease: easePremium }}
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-neutral-900 rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: easePremium }}
          className="pt-6"
        >
          {activeTab === "description" && (
            <DescriptionTab content={description} />
          )}
          {activeTab === "specifications" && (
            <SpecificationsTab specs={specs} />
          )}
          {activeTab === "shipping" && <ShippingTab />}
          {activeTab === "reviews" && (
            <ReviewsTab rating={rating} reviewCount={reviewCount} tags={tags} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function DescriptionTab({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-sm text-neutral-400 italic">No description provided.</p>
    )
  }

  return (
    <div className="prose prose-sm prose-gray max-w-none prose-headings:text-neutral-900 prose-headings:font-semibold prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600 prose-strong:text-neutral-900 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-table:text-sm prose-th:text-neutral-900 prose-td:text-neutral-600 prose-ul:pl-4 prose-ol:pl-4">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className="text-sm leading-relaxed text-neutral-600 [&_img]:rounded-lg [&_img]:border [&_img]:border-neutral-200/50"
      />
    </div>
  )
}

function SpecificationsTab({ specs }: { specs: Spec[] }) {
  if (!specs || specs.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">No specifications available.</p>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/50 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <tbody>
          {specs.map((spec, i) => (
            <motion.tr
              key={`${spec.label}-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: easePremium }}
              className={cn(
                "transition-colors",
                i % 2 === 0 ? "bg-white" : "bg-neutral-50/50",
                i < specs.length - 1 && "border-b border-neutral-200/40"
              )}
            >
              <td className="px-5 py-3.5 text-sm font-medium text-neutral-500 w-[180px] sm:w-[220px] align-top border-r border-neutral-200/30">
                {spec.label}
              </td>
              <td className="px-5 py-3.5 text-sm font-semibold text-neutral-900">
                {spec.value}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ShippingTab() {
  const shippingInfo = [
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      title: "Free Shipping",
      desc: "On all orders over Rs. 3,000. Standard delivery within 2–4 business days across Pakistan.",
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      ),
      title: "Easy Returns",
      desc: "7-day return window from delivery date. Items must be unused with original packaging.",
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25-4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      title: "1-Year Warranty",
      desc: "All SMARTWEAR products include a 1-year manufacturer warranty against defects.",
    },
    {
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
        </svg>
      ),
      title: "Cash on Delivery",
      desc: "Pay when your order arrives. No advance payment needed. Available nationwide.",
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {shippingInfo.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.25, ease: easePremium }}
          className="flex gap-3.5 rounded-xl border border-neutral-200/50 bg-white p-4 transition-colors hover:border-neutral-300 shadow-sm"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-neutral-500">{item.desc}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ReviewsTab({ rating, reviewCount, tags }: { rating?: number; reviewCount?: number; tags?: string[] }) {
  const hasRating = rating !== undefined && rating > 0

  return (
    <div className="space-y-6">
      {hasRating ? (
        <div className="flex items-start gap-6 rounded-xl border border-neutral-200/50 bg-white p-5 sm:items-center shadow-sm">
          <div className="text-center shrink-0">
            <p className="font-heading text-3xl font-bold text-neutral-900">{rating.toFixed(1)}</p>
            <div className="mt-1 flex items-center gap-0.5 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={cn("h-3.5 w-3.5", star <= Math.round(rating) ? "text-amber-400" : "text-neutral-200")}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{reviewCount || 0} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = Math.floor((reviewCount || 0) * Math.random() * (star === 5 ? 0.6 : star === 4 ? 0.25 : 0.1))
              const pct = reviewCount ? Math.round((count / reviewCount) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-2 text-neutral-500">{star}</span>
                  <svg className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-neutral-500">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-neutral-400 italic">No reviews yet.</p>
      )}

      {tags && tags.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase mb-2.5">Product Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
