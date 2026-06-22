"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Package, Truck, CheckCircle, Clock, ArrowLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { mockOrders, formatPrice } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { OrderStatus } from '@/types'

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  delivered: 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20',
  cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
  refunded: 'bg-white/10 text-white/70 border border-white/20',
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [searchedOrder, setSearchedOrder] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setSearchedOrder(null)

    try {
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(orderId)}`)
      if (res.ok) {
        const data = await res.json()
        setSearchedOrder(data.order)
      } else {
        // Fallback to mock
        const mockOrder = mockOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase())
        if (mockOrder) {
          setSearchedOrder(mockOrder)
        } else {
          setNotFound(true)
        }
      }
    } catch (error) {
      console.error(error)
      setNotFound(true)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      {/* Header */}
      <div className="relative overflow-hidden text-white pt-20 pb-12 md:pt-28 md:pb-16 border-b border-white/5 mb-8">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: "radial-gradient(circle, #B8860B, transparent)" }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-2 text-xs text-white/70 mb-6 justify-center uppercase tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Track Order</span>
          </div>
          <div className="w-16 h-16 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-[20px] flex items-center justify-center mx-auto mb-6">
            <Truck className="w-8 h-8 text-[#B8860B]" />
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            Track Your Order
          </h1>
          <p className="text-white/60 max-w-lg mx-auto text-sm md:text-base leading-relaxed">
            Enter your order ID to see real-time updates on your luxury timepiece.
          </p>
        </div>
      </div>
      <div className="sw-container pb-16">
        <div className="max-w-2xl mx-auto">

        {/* Search Form */}
        <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl mb-8">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g., ORD-2024-001)"
                  className="w-full h-12 pl-11 pr-4 bg-[#0F1923] border border-white/10 rounded-xl text-white placeholder-white/40 outline-none focus:border-[#B8860B] transition-colors"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="sw-btn-gold h-12 px-8 text-sm">
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>
            <p className="text-sm text-white/60 mt-4 text-center">
              Demo: Try "ORD-2024-001" or "ORD-2024-002"
            </p>
          </div>
        </div>

        {/* Order Not Found */}
        {notFound && (
          <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="font-semibold text-white mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Order Not Found</h3>
              <p className="text-white/60 text-sm">
                We couldn't find an order with that ID. Please check and try again.
              </p>
            </div>
          </div>
        )}

        {/* Order Found */}
        {searchedOrder && (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Order #{searchedOrder.id}</h3>
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold capitalize", (statusColors as any)[searchedOrder.status])}>
                  {searchedOrder.status}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm text-white/70">
                  Placed on {new Date(searchedOrder.created_at).toLocaleDateString('en-PK')}
                </p>
                {searchedOrder.tracking_number && (
                  <div className="mt-4 p-4 bg-[#0F1923] border border-white/5 rounded-xl flex items-center gap-3">
                    <Truck className="w-5 h-5 text-[#B8860B]" />
                    <span className="text-sm text-white/60">Tracking:</span>
                    <span className="font-mono text-sm text-[#B8860B]">{searchedOrder.tracking_number}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
              <div className="p-6 border-b border-white/5">
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Order Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(searchedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-[#0F1923]/50 p-3 rounded-xl border border-white/5">
                      <div className="relative w-16 h-16 bg-[#0F1923] rounded-lg border border-white/10 overflow-hidden shrink-0">
                        <Image
                          src={item.product_image || ''}
                          alt={item.product_name || 'Item'}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-white truncate">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-white/60 mt-0.5">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-white text-sm">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-[#B8860B]">{formatPrice(searchedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {searchedOrder.shipping_address && (
              <div className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
                <div className="p-6 border-b border-white/5">
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Shipping Address</h3>
                </div>
                <div className="p-6">
                  <p className="font-medium text-white mb-1">{searchedOrder.shipping_address.name}</p>
                  <p className="text-sm text-white/70">{searchedOrder.shipping_address.phone}</p>
                  <p className="text-sm text-white/70 mt-2">
                    {searchedOrder.shipping_address.address_line1}, {searchedOrder.shipping_address.city}
                  </p>
                  <p className="text-sm text-white/70">
                    {searchedOrder.shipping_address.province} - {searchedOrder.shipping_address.postal_code}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-[#B8860B]/20 bg-[#B8860B]/5 backdrop-blur-xl">
              <div className="p-8 text-center">
                <p className="mb-4 text-white font-medium">Want to manage your orders?</p>
                <Link href="/account/orders">
                  <button className="sw-btn-gold h-11 px-6 text-sm">View My Orders</button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}