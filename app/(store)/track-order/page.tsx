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

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20',
  processing: 'bg-purple-500/10 text-purple-500 border border-purple-500/20',
  shipped: 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20',
  delivered: 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20',
  cancelled: 'bg-red-500/10 text-red-500 border border-red-500/20',
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [searchedOrder, setSearchedOrder] = useState<any>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(false)

  const [postexTracking, setPostexTracking] = useState<any>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNotFound(false)
    setSearchedOrder(null)
    setPostexTracking(null)

    try {
      const res = await fetch(`/api/postex/track?orderId=${encodeURIComponent(orderId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.order) {
          setSearchedOrder(data.order)
          setPostexTracking(data.postexTracking)
        } else {
          setNotFound(true)
        }
      } else {
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative overflow-hidden text-foreground  pb-6 md:pt-28 md:pb-16 border-b border-border mb-4 sm:mb-6">
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
          <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-foreground/70 mb-4 sm:mb-6 justify-center uppercase tracking-wide sm:tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Track Order</span>
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#B8860B]/10 border border-[#B8860B]/20 rounded-[20px] flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Truck className="w-8 h-8 text-[#B8860B]" />
          </div>
          <h1
            className="font-bold text-foreground leading-tight mb-2 sm:mb-4"
            style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif", fontSize: "clamp(1.75rem, 4vw, 3.5rem)" }}
          >
            Track Your Order
          </h1>
          <p className="text-foreground/60 max-w-lg mx-auto text-xs sm:text-sm md:text-base leading-relaxed">
            Enter your order ID to see real-time updates on your luxury timepiece.
          </p>
        </div>
      </div>
      <div className="sw-container pb-10 md:pb-16">
        <div className="max-w-2xl mx-auto">

        {/* Search Form */}
        <div className="rounded-[24px] border border-border bg-card backdrop-blur-xl mb-8">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/60" />
                <input
                  type="text"
                  placeholder="Enter Order ID (e.g., ORD-2024-001)"
                  className="w-full h-12 pl-11 pr-4 bg-card border border-border rounded-xl text-foreground placeholder-white/40 outline-none focus:border-[#B8860B] transition-colors"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="sw-btn-gold h-12 px-8 text-sm">
                {loading ? 'Searching...' : 'Track'}
              </button>
            </form>
            <p className="text-sm text-foreground/60 mt-4 text-center">
              Demo: Try "ORD-2024-001" or "ORD-2024-002"
            </p>
          </div>
        </div>

        {/* Order Not Found */}
        {notFound && (
          <div className="rounded-[24px] border border-border bg-card backdrop-blur-xl">
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-foreground/60" />
              </div>
              <h3 className="font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Order Not Found</h3>
              <p className="text-foreground/60 text-sm">
                We couldn't find an order with that ID. Please check and try again.
              </p>
            </div>
          </div>
        )}

        {/* Order Found */}
        {searchedOrder && (
          <div className="space-y-6">
            <div className="rounded-[24px] border border-border bg-card backdrop-blur-xl">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Order #{searchedOrder.id}</h3>
                <span className={cn("px-3 py-1 rounded-full text-xs font-semibold", statusColors[searchedOrder.status.toLowerCase()] || 'bg-card text-foreground/70 border border-border')}>
                  {searchedOrder.status}
                </span>
              </div>
              <div className="p-6">
                <p className="text-sm text-foreground/70">
                  Placed on {new Date(searchedOrder.created_at).toLocaleDateString('en-PK')}
                </p>
                {(searchedOrder.tracking_number || searchedOrder.postex) && (
                  <div className="mt-4 p-4 bg-card border border-border rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <Truck className="w-5 h-5 text-[#B8860B]" />
                      <span className="text-sm text-foreground/60">PostEx Tracking:</span>
                      <span className="font-mono text-sm text-[#B8860B]">{searchedOrder.postex || searchedOrder.tracking_number}</span>
                    </div>

                    {/* PostEx Live Timeline */}
                    {postexTracking?.timeline && postexTracking.timeline.length > 0 && (
                      <div className="space-y-0">
                        {postexTracking.timeline.map((event: any, i: number) => (
                          <div key={i} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${i === 0 ? 'bg-[#B8860B]' : 'bg-card'}`} />
                              {i < postexTracking.timeline.length - 1 && <div className="w-px flex-1 bg-card" />}
                            </div>
                            <div className={`pb-4 ${i === 0 ? '' : ''}`}>
                              <p className={`text-sm ${i === 0 ? 'text-foreground font-medium' : 'text-foreground/60'}`}>{event.status}</p>
                              {event.date && <p className="text-xs text-foreground/40 mt-0.5">{new Date(event.date).toLocaleString('en-PK')}</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Current PostEx Status Badge */}
                    {postexTracking?.status && (
                      <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-foreground/50">
                        <Clock className="w-3 h-3" />
                        Current: <span className="text-[#B8860B] font-medium">{postexTracking.status}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[24px] border border-border bg-card backdrop-blur-xl">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Order Items</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(searchedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 bg-card/50 p-3 rounded-xl border border-border">
                      <div className="relative w-16 h-16 bg-card rounded-lg border border-border overflow-hidden shrink-0">
                        <Image
                          src={item.product_image || ''}
                          alt={item.product_name || 'Item'}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.product_name || 'Product'}</p>
                        <p className="text-sm text-foreground/60 mt-0.5">Qty: {item.quantity || 1}</p>
                      </div>
                      <p className="font-bold text-foreground text-sm">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                    </div>
                  ))}
                </div>

                {postexTracking?.transactionFee != null && (
                  <div className="mt-4 p-3 bg-card border border-border rounded-xl">
                    <p className="text-xs text-foreground/40 uppercase tracking-wider mb-2">PostEx Charges</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <span className="text-foreground/60">Shipping Fee:</span>
                      <span className="text-foreground/& text-right font-mono">Rs. {postexTracking.transactionFee?.toLocaleString()}</span>
                      {postexTracking.transactionTax != null && (
                        <><span className="text-foreground/60">Tax:</span><span className="text-foreground/& text-right font-mono">Rs. {postexTracking.transactionTax?.toLocaleString()}</span></>
                      )}
                      {postexTracking.upfrontPayment != null && (
                        <><span className="text-foreground/60">Upfront Payment:</span><span className="text-emerald-400 text-right font-mono">Rs. {postexTracking.upfrontPayment?.toLocaleString()}</span></>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-foreground">Total</span>
                    <span className="text-[#B8860B]">{formatPrice(searchedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {searchedOrder.shipping_address && (
              <div className="rounded-[24px] border border-border bg-card backdrop-blur-xl">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>Shipping Address</h3>
                </div>
                <div className="p-6">
                  <p className="font-medium text-foreground mb-1">{searchedOrder.shipping_address.name}</p>
                  <p className="text-sm text-foreground/70">{searchedOrder.shipping_address.phone}</p>
                  <p className="text-sm text-foreground/70 mt-2">
                    {searchedOrder.shipping_address.address_line1}, {searchedOrder.shipping_address.city}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {searchedOrder.shipping_address.province} - {searchedOrder.shipping_address.postal_code}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-[24px] border border-[#B8860B]/20 bg-[#B8860B]/5 backdrop-blur-xl">
            <div className="p-6 md:p-8 text-center">
                <p className="mb-4 text-foreground font-medium">Want to manage your orders?</p>
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