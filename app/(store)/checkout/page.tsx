"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, MapPin, Truck, AlertCircle, Plus, ShoppingBag, CheckCircle, Package, ArrowRight, Home, Calendar, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/mock-data'
import { detectProvince } from '@/lib/address-validator'
import { CitySelect } from '@/components/ui/city-select'
import { TikTokEvents } from '@/lib/tiktok-pixel'
import { cn } from '@/lib/utils'
import { SpotlightCard } from '@/components/ui/spotlight-card'

const PARTICLES = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  size: 3 + Math.random() * 10,
  delay: Math.random() * 2,
  duration: 2.5 + Math.random() * 3,
  drift: (Math.random() - 0.5) * 150,
  rotate: Math.random() * 720,
  color: i % 3 === 0 ? '#D4A017' : i % 3 === 1 ? '#F0C040' : '#B8860B',
}))

const TIMELINE_STEPS = [
  { icon: CheckCircle, label: 'Order Confirmed', sub: 'Just now', done: true },
  { icon: Package, label: 'Processing', sub: 'Within 24 hours', done: false },
  { icon: Truck, label: 'Out for Delivery', sub: '2\u20134 business days', done: false },
  { icon: Home, label: 'Delivered', sub: 'At your doorstep', done: false },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, addToCart } = useCart()

  const [freeThreshold, setFreeThreshold] = useState(10000)
  const [shippingRate, setShippingRate] = useState(200)
  const [codAvailable, setCodAvailable] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState(["COD"])
  const [guestAddress, setGuestAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    city: 'Karachi',
    province: detectProvince('Karachi'),
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{code: string; discount: number} | null>(null)
  const [promoError, setPromoError] = useState('')
  const [successModal, setSuccessModal] = useState<{orderId: string; total: number} | null>(null)

  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
        if (data?.free_delivery_threshold) setFreeThreshold(Number(data.free_delivery_threshold))
        if (data?.shipping_standard_rate) setShippingRate(Number(data.shipping_standard_rate))
        if (typeof data?.cod_available === 'boolean') setCodAvailable(data.cod_available)
        if (data?.payment_methods) {
          try {
            const parsed = JSON.parse(data.payment_methods)
            if (Array.isArray(parsed)) setPaymentMethods(parsed)
          } catch {}
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    let detectedCity = 'Karachi'
    if (tz.includes('Islamabad')) detectedCity = 'Islamabad'
    else if (tz.includes('Lahore')) detectedCity = 'Lahore'
    else if (tz.includes('Karachi')) detectedCity = 'Karachi'
    setGuestAddress(prev => ({
      ...prev,
      city: detectedCity,
      province: detectProvince(detectedCity),
    }))
  }, [])

  useEffect(() => {
    if (items.length > 0) TikTokEvents.initiateCheckout(
      items.map(item => ({ id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })),
      subtotal
    )
  }, [])

  const shippingCost = subtotal >= freeThreshold ? 0 : shippingRate
  const total = subtotal + shippingCost - (appliedPromo?.discount || 0)

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) return
    try {
      const res = await fetch('/api/orders/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCodeInput, subtotal })
      })
      const data = await res.json()
      if (res.ok) {
        setAppliedPromo({ code: promoCodeInput.toUpperCase(), discount: data.discount })
        setPromoError('')
        toast.success(`Promo code applied! Saved \u20A8 ${data.discount}`)
      } else {
        setPromoError(data.error || 'Invalid promo code')
        setAppliedPromo(null)
      }
    } catch {
      setPromoError('Failed to verify promo code')
    }
  }

  const handleAddUpsell = () => {
    addToCart({
      id: 'leather-box',
      name: 'Premium Leather Box',
      slug: 'premium-leather-box',
      description: 'Premium leather watch box',
      price: 2500,
      compare_price: 4000,
      images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12'],
      colors: [],
      category_id: 'accessories',
      category: { id: 'accessories', name: 'Accessories', slug: 'accessories', image: '' },
      brand: 'Smartwear',
      stock: 100,
      rating: 4.5,
      reviews_count: 0,
      specifications: {},
      is_featured: false,
      is_active: true,
      created_at: new Date().toISOString(),
    } as any, 1)
    toast.success('Premium Leather Box added to your order!')
  }

  const handlePlaceOrder = async () => {
    if (guestAddress.name.length < 3) {
      toast.error('Please enter your full name')
      return
    }
    const phoneRegex = /^(03|\+923)[0-9]{2}[-\s]?[0-9]{7}$/
    if (!phoneRegex.test(guestAddress.phone)) {
      toast.error('Please enter a valid Pakistani phone number (e.g. 0300 1234567)')
      return
    }
    if (guestAddress.address_line1.length < 10) {
      toast.error('Please enter your complete delivery address')
      return
    }

    setIsProcessing(true)
    let orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000)

    try {
      const idempotencyKey = `IDMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const orderPayload = {
        customer_name: guestAddress.name,
        email: 'guest@smartwear.pk',
        phone: guestAddress.phone,
        shipping_address: guestAddress,
        payment_method: 'COD',
        items: items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.images[0],
          color: item.selectedColor,
        })),
        subtotal,
        shipping_fee: shippingCost,
        total,
        idempotency_key: idempotencyKey,
        promo_code: appliedPromo?.code || undefined,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      if (response.ok) {
        const data = await response.json()
        orderId = data.order.id
        toast.success('Order placed successfully!', {
          description: `Your order ID is ${orderId}`,
        })
        clearCart()
        setSuccessModal({ orderId, total })
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Order processing failed', {
          description: 'Please try again',
        })
        setIsProcessing(false)
      }
    } catch (e) {
      console.error('Order save failed', e)
      toast.error('Failed to connect to database. Please check your internet connection.')
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0C0F14] text-white py-10 md:py-16">
        <div className="max-w-sm mx-auto text-center px-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-white/60" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-playfair),Georgia,serif' }}>Your cart is empty</h1>
          <p className="text-sm text-white/60 mb-6">Add some products before checkout</p>
          <Link href="/products">
            <button className="sw-btn-gold w-full h-12">Continue Shopping</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0C0F14] text-white">
      <div className="relative overflow-hidden text-white pt-14 pb-6 md:pt-28 md:pb-16 border-b border-white/5 mb-4 sm:mb-6">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ background: 'radial-gradient(circle, #B8860B, transparent)' }}
        />
        <div className="sw-container relative z-10 text-center">
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-white/70 mb-3 sm:mb-4 justify-center uppercase tracking-wide sm:tracking-widest flex-wrap">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
            <span>Cart</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
            <span className="text-[#B8860B]">Secure Checkout</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-1.5 sm:mb-2"
            style={{ fontFamily: 'var(--font-playfair),Georgia,serif', fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}
          >
            Secure Checkout
          </h1>
          <p className="text-white/50 text-xs sm:text-sm">Pay only when your parcel arrives. No online payment needed.</p>
        </div>
      </div>

      <div className="sw-container pb-10 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Delivery Form */}
          <div className="lg:col-span-2 min-w-0">
            <div className="rounded-2xl sm:rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 w-full">
              <h2 className="text-base sm:text-xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-playfair),Georgia,serif' }}>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8860B]" />
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={guestAddress.name}
                    onChange={(e) => setGuestAddress({ ...guestAddress, name: e.target.value })}
                    placeholder="e.g. Ahmad Raza"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={guestAddress.phone}
                    onChange={(e) => setGuestAddress({ ...guestAddress, phone: e.target.value })}
                    placeholder="0300 1234567"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                  />
                  <p className="text-[11px] sm:text-[10px] text-white/40 mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#B8860B] mt-[1px]" />
                    Courier will call this number before delivery
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Delivery Address</label>
                  <textarea
                    value={guestAddress.address_line1}
                    onChange={(e) => setGuestAddress({ ...guestAddress, address_line1: e.target.value })}
                    placeholder="House 4, Street 5, Phase 6, DHA"
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px] resize-none"
                  />
                  <p className="text-[11px] sm:text-[10px] text-white/40 mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#B8860B] mt-[1px]" />
                    Makaan number, Street, aur Area laazmi likhein
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-white/70 mb-1.5">City</label>
                  <CitySelect
                    value={guestAddress.city}
                    onChange={(city) => setGuestAddress({
                      ...guestAddress,
                      city,
                      province: detectProvince(city),
                    })}
                  />
                </div>
              </div>

              {/* Trust Strip */}
              <div className="mt-6 p-3 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-y-3 sm:gap-x-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white">Cash on Delivery</p>
                      <p className="text-[10px] text-white/50 hidden sm:block">Pay when parcel arrives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white">Open Box Check</p>
                      <p className="text-[10px] text-white/50 hidden sm:block">Inspect before paying</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white">Free Shipping</p>
                      <p className="text-[10px] text-white/50 hidden sm:block">On orders above {formatPrice(freeThreshold)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-180 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-white">7 Days Return</p>
                      <p className="text-[10px] text-white/50 hidden sm:block">Money back guarantee</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full h-16 mt-6 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-[#0C0F14] font-bold text-base uppercase tracking-widest hover:shadow-[0_0_30px_rgba(184,134,11,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-30" />
                      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2 sm:gap-3">
                    <Truck className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                    <span className="text-[13px] sm:text-base">Place Order — COD</span>
                    <span className="text-sm sm:text-lg font-black ml-auto sm:ml-0">{formatPrice(total)}</span>
                  </span>
                )}
              </button>
              <p className="text-center text-[11px] text-white/40 mt-3 px-2">
                Free delivery above {formatPrice(freeThreshold)} &bull; 7 days return
              </p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 min-w-0">
            <div className="sticky top-24 rounded-2xl sm:rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl w-full">
              <div className="p-5 sm:p-8">
                <h3 className="font-bold text-sm sm:text-lg text-white mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-playfair),Georgia,serif' }}>
                  Order Summary
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-[#0F1923] border border-white/5 rounded-xl overflow-hidden shrink-0">
                        <Image src={item.product.images[0]} alt={item.product.name} fill sizes="(max-width: 640px) 48px, 56px" className="object-cover" />
                        <span className="absolute top-0 right-0 w-5 h-5 bg-[#B8860B] text-black font-bold text-[10px] flex items-center justify-center rounded-bl-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-sm truncate font-medium text-white">{item.product.name}</p>
                        {item.selectedColor && (
                          <p className="text-[11px] sm:text-xs text-white/50 mt-0.5">{item.selectedColor}</p>
                        )}
                      </div>
                      <p className="text-[13px] sm:text-sm font-bold text-white shrink-0 ml-2">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between text-[13px] sm:text-sm">
                    <span className="text-white/70">Subtotal</span>
                    <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] sm:text-sm">
                    <span className="text-white/70">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-400 font-medium' : 'text-white font-medium'}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Discount ({appliedPromo.code})</span>
                      <span className="text-emerald-400 font-medium">-{formatPrice(appliedPromo.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2.5 sm:pt-3 border-t border-white/5">
                    <span className="text-white/70 text-[13px] sm:text-sm">Total</span>
                    <span className="font-bold text-xl sm:text-2xl text-[#B8860B]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust & Security */}
                <div className="mt-6 p-3 sm:p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2.5 text-center">Secure & Trusted</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      <span className="text-[10px] sm:text-[11px]">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 11-6.219-8.56"/><path d="M21 3v6h-6"/><path d="M21 3l-7.5 7.5"/></svg>
                      <span className="text-[10px] sm:text-[11px]">COD Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
                      <span className="text-[10px] sm:text-[11px]">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-white/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[10px] sm:text-[11px]">Open Box Check</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code (Collapsible) */}
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => setPromoOpen(!promoOpen)}
                    className="flex items-center gap-2 text-[11px] sm:text-xs text-white/50 hover:text-white transition-colors w-full"
                  >
                    <ChevronDown className={cn('w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform', promoOpen && 'rotate-180')} />
                    Have a promo code?
                  </button>
                  {promoOpen && (
                    <div className="mt-2.5 sm:mt-3 flex gap-2">
                      <input
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-[13px] sm:text-sm placeholder-white/40 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] sm:text-xs font-semibold transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-rose-400 text-[11px] sm:text-xs mt-1.5">{promoError}</p>}
                  {appliedPromo && (
                    <p className="text-emerald-400 text-[11px] sm:text-xs mt-1.5">Code {appliedPromo.code} applied!</p>
                  )}
                </div>

                {/* Upsell */}
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-white/10">
                  <p className="text-[11px] sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider mb-2.5 sm:mb-3">Complete Your Look</p>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2.5 sm:p-4 flex gap-2.5 sm:gap-4 items-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#0F1923] rounded-lg overflow-hidden shrink-0">
                      <Image src="https://images.unsplash.com/photo-1546868871-7041f2a55e12" alt="Premium Watch Box" width={40} height={40} className="object-cover sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] sm:text-sm font-medium text-white truncate">Premium Leather Box</p>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                        <p className="text-[13px] sm:text-sm font-bold text-[#D4A017]">{formatPrice(2500)}</p>
                        <p className="text-[11px] sm:text-xs text-white/40 line-through">{formatPrice(4000)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddUpsell}
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#B8860B] text-black flex items-center justify-center hover:bg-[#D4A017] transition-colors shrink-0"
                      aria-label="Add premium leather box"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {successModal && (
          <SuccessModal
            orderId={successModal.orderId}
            total={successModal.total}
            onClose={() => setSuccessModal(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function GoldParticles({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, y: -20, x: `${p.x}vw`, rotate: 0, scale: 1 }}
          animate={{
            y: '120vh',
            x: `calc(${p.x}vw + ${p.drift}px)`,
            rotate: p.rotate,
            scale: [1, 0.8, 0.3],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: -20,
            width: p.size,
            height: p.size * 0.35,
            background: p.color,
            borderRadius: '1px',
            boxShadow: `0 0 ${p.size * 1.5}px ${p.color}80`,
          }}
        />
      ))}
    </div>
  )
}

function SuccessModal({ orderId, total, onClose }: { orderId: string; total: number; onClose: () => void }) {
  const [showParticles, setShowParticles] = useState(false)

  useEffect(() => {
    const firePurchase = async () => {
      let orderTotal = total
      let orderItems: any[] = []
      try {
        const res = await fetch(`/api/orders/track?id=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.order) {
            orderTotal = data.order.total
            orderItems = data.order.items || []
            TikTokEvents.purchase(data.order)
            fireCapiBackup(data.order)
            return
          }
        }
      } catch {}
      TikTokEvents.purchase({ id: orderId, total: orderTotal, items: orderItems })
      fireCapiBackup({ id: orderId, total: orderTotal, items: orderItems, phone: '' })
    }

    const fireCapiBackup = async (order: any) => {
      try {
        await fetch('/api/tiktok/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            total: order.total,
            items: order.items || [],
            phone: order.phone || order.customer?.phone || '',
            eventId: order.id,
          }),
        })
      } catch {}
    }

    firePurchase()
    const t1 = setTimeout(() => setShowParticles(true), 400)
    const t2 = setTimeout(() => setShowParticles(false), 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [orderId])

  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(12,15,20,0.95)' }}
    >
      <GoldParticles active={showParticles} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-[0.15] bg-[#B8860B] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl relative z-10 my-8"
      >
        <SpotlightCard className="p-8 md:p-12 text-center relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute inset-0 border border-[#B8860B]/20 rounded-[24px]"
            style={{ boxShadow: 'inset 0 0 40px rgba(184,134,11,0.05)' }}
          />

          <div className="relative mb-8 flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
              className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] p-1 shadow-[0_0_40px_rgba(184,134,11,0.4)] flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-[#0C0F14] flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#B8860B]" />
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-[#B8860B]"
            />
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-[#B8860B]/50"
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: 'var(--font-playfair),Georgia,serif' }}
          >
            Thank You for Your Order!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 mb-8"
          >
            Your premium timepiece experience begins here. We have emailed your receipt to you.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-4 bg-[#0F1923] border border-white/10 px-6 py-3 rounded-xl mb-10"
          >
            <span className="text-white/70 text-sm">Order Number</span>
            <span className="text-[#B8860B] font-mono font-bold tracking-wider">{orderId}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10 text-left"
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <Calendar className="w-5 h-5 text-[#B8860B]" />
              <span className="text-white font-medium">Estimated Delivery: <span className="text-[#B8860B]">{deliveryDate}</span></span>
            </div>

            <div className="relative">
              <div className="absolute left-4 top-2 bottom-6 w-0.5 bg-white/10" />
              <div className="space-y-6">
                {TIMELINE_STEPS.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${step.done ? 'bg-[#B8860B] text-[#0C0F14] shadow-[0_0_15px_rgba(184,134,11,0.5)]' : 'bg-[#0F1923] border border-white/20 text-white/60'}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="mt-1">
                      <p className={`text-sm font-semibold ${step.done ? 'text-white' : 'text-white/70'}`}>{step.label}</p>
                      <p className="text-xs text-white/60 mt-0.5">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/account/orders"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-white/10 text-white hover:bg-white/5 hover:border-white/20 font-medium tracking-wide transition-all"
            >
              View Order Details
            </Link>
            <Link
              href="/"
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl sw-btn-gold font-medium tracking-wide transition-all group flex items-center justify-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </SpotlightCard>
      </motion.div>
    </motion.div>
  )
}
