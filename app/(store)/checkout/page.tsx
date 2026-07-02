"use client"

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, MapPin, Truck, AlertCircle, Plus, ShoppingBag, ArrowRight, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/cart-context'
import { formatPrice } from '@/lib/mock-data'
import { detectProvince } from '@/lib/address-validator'
import { CitySelect } from '@/components/ui/city-select'
import { TikTokEvents, identifyUser, storeUserData } from '@/lib/tiktok-pixel'
import { cn } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart, addToCart } = useCart()

  const [codAvailable, setCodAvailable] = useState(true)
  const [paymentMethods, setPaymentMethods] = useState(["COD"])
  const [guestAddress, setGuestAddress] = useState({
    name: '',
    phone: '',
    email: '',
    address_line1: '',
    city: 'Karachi',
    province: detectProvince('Karachi'),
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{code: string; discount: number} | null>(null)
  const [promoError, setPromoError] = useState('')
  useEffect(() => {
    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => {
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
    if (items.length > 0)     TikTokEvents.initiateCheckout(
      items.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        category: item.product.category?.name || '',
      })),
      subtotal
    )
  }, [items.length, subtotal])

  // Store PII & identify user for TikTok Advanced Matching when user fills form
  useEffect(() => {
    if (guestAddress.phone || guestAddress.name) {
      storeUserData({ phone: guestAddress.phone, name: guestAddress.name, email: guestAddress.email })
      identifyUser(guestAddress.email || undefined, guestAddress.phone, guestAddress.name)
    }
  }, [guestAddress.phone, guestAddress.name, guestAddress.email])

  // Fire AddPaymentInfo when user fills name + phone (strong purchase intent signal)
  useEffect(() => {
    if (guestAddress.name.length > 2 && guestAddress.phone.length > 10) {
      TikTokEvents.addPaymentInfo('COD', subtotal)
    }
  }, [guestAddress.name, guestAddress.phone])

  // Cart abandonment timer — fires after 30 min of idle cart
  useEffect(() => {
    if (items.length === 0) return
    const abandonTimer = setTimeout(() => {
      TikTokEvents.cartAbandonment(
        items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          category: item.product.category?.name || '',
        })),
        subtotal
      )
    }, 30 * 60 * 1000) // 30 minutes
    return () => clearTimeout(abandonTimer)
  }, [items.length])

  // Identify user on order placement for purchase event matching
  const handleIdentifyUser = () => {
    if (guestAddress.phone || guestAddress.name) {
      storeUserData({ email: guestAddress.email || undefined, phone: guestAddress.phone, name: guestAddress.name })
      identifyUser(guestAddress.email || undefined, guestAddress.phone, guestAddress.name)
    }
  }

  const shippingCost = 0
  const total = subtotal - (appliedPromo?.discount || 0)

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
    handleIdentifyUser()
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
    let orderId = 'ORD-' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8).toUpperCase() : Math.floor(100000 + Math.random() * 900000))

    try {
      const idempotencyKey = `IDMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const orderPayload = {
        customer_name: guestAddress.name,
        email: guestAddress.email || 'guest@smartwear.pk',
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
        router.push(`/checkout/success?order=${orderId}&total=${total}`)
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
      <>
        <div className="min-h-screen bg-background text-foreground py-10 md:py-16">
          <div className="max-w-sm mx-auto text-center px-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 rounded-[24px] bg-card border border-border flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-foreground/60" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-heading),"Poppins",system-ui,sans-serif' }}>Your cart is empty</h1>
            <p className="text-sm text-foreground/60 mb-6">Add some products before checkout</p>
            <Link href="/products">
              <button className="sw-btn-gold w-full h-12">Continue Shopping</button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden text-foreground  pb-6 md:pt-28 md:pb-16 border-b border-border mb-4 sm:mb-6">
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
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-foreground/70 mb-3 sm:mb-4 justify-center uppercase tracking-wide sm:tracking-widest flex-wrap">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
            <span>Cart</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B] shrink-0" />
            <span className="text-[#B8860B]">Secure Checkout</span>
          </div>
          <h1
            className="font-bold text-foreground leading-tight mb-1.5 sm:mb-2"
            style={{ fontFamily: 'var(--font-heading),"Poppins",system-ui,sans-serif', fontSize: 'clamp(1.75rem, 5vw, 4.5rem)' }}
          >
            Secure Checkout
          </h1>
          <p className="text-foreground/50 text-xs sm:text-sm">Pay only when your parcel arrives. No online payment needed.</p>
        </div>
      </div>

      <div className="sw-container pb-10 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left: Delivery Form */}
          <div className="lg:col-span-2 min-w-0">
            <div className="rounded-2xl sm:rounded-[24px] border border-border bg-card backdrop-blur-xl p-5 sm:p-8 w-full">
              <h2 className="text-base sm:text-xl font-bold text-foreground mb-4 sm:mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-heading),"Poppins",system-ui,sans-serif' }}>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#B8860B]" />
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-foreground/70 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={guestAddress.name}
                    onChange={(e) => setGuestAddress({ ...guestAddress, name: e.target.value })}
                    placeholder="e.g. Ahmad Raza"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={guestAddress.phone}
                    onChange={(e) => {
                      setGuestAddress({ ...guestAddress, phone: e.target.value })
                      sessionStorage.setItem('sw_phone', e.target.value)
                    }}
                    placeholder="0300 1234567"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                  />
                  <p className="text-[11px] sm:text-[10px] text-foreground/40 mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#B8860B] mt-[1px]" />
                    Courier will call this number before delivery
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-1.5">Email (for receipt)</label>
                  <input
                    type="email"
                    value={guestAddress.email}
                    onChange={(e) => {
                      setGuestAddress({ ...guestAddress, email: e.target.value })
                      sessionStorage.setItem('sw_email', e.target.value)
                    }}
                    placeholder="ahmad@example.com"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                  />
                  <p className="text-[11px] sm:text-[10px] text-foreground/40 mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#B8860B] mt-[1px]" />
                    Order receipt aur tracking link yahan bhejein ge
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-1.5">Delivery Address</label>
                  <textarea
                    value={guestAddress.address_line1}
                    onChange={(e) => setGuestAddress({ ...guestAddress, address_line1: e.target.value })}
                    placeholder="House 4, Street 5, Phase 6, DHA"
                    rows={3}
                    className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px] resize-none"
                  />
                  <p className="text-[11px] sm:text-[10px] text-foreground/40 mt-1.5 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 text-[#B8860B] mt-[1px]" />
                    Makaan number, Street, aur Area laazmi likhein
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-foreground/70 mb-1.5">City</label>
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
                      <p className="text-[11px] sm:text-xs font-semibold text-foreground">Cash on Delivery</p>
                      <p className="text-[10px] text-foreground/50 hidden sm:block">Pay when parcel arrives</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-foreground">Open Box Check</p>
                      <p className="text-[10px] text-foreground/50 hidden sm:block">Inspect before paying</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-foreground">Free Shipping</p>
                      <p className="text-[10px] text-foreground/50 hidden sm:block">Across Pakistan — no minimum</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 rotate-180 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-foreground">7-Day Replacement</p>
                      <p className="text-[10px] text-foreground/50 hidden sm:block">Hassle-free replacement</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full h-16 mt-6 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black font-bold text-base uppercase tracking-widest hover:shadow-[0_0_30px_rgba(184,134,11,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
              <p className="text-center text-[11px] text-foreground/40 mt-3 px-2">
                Free delivery — all Pakistan &bull; 7-day replacement
              </p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1 min-w-0">
            <div className="sticky top-24 rounded-2xl sm:rounded-[24px] border border-border bg-card backdrop-blur-xl w-full">
              <div className="p-5 sm:p-8">
                <h3 className="font-bold text-sm sm:text-lg text-foreground mb-4 sm:mb-6" style={{ fontFamily: 'var(--font-heading),"Poppins",system-ui,sans-serif' }}>
                  Order Summary
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-card border border-border rounded-xl overflow-hidden shrink-0">
                        <Image src={item.product.images[0]} alt={item.product.name} fill sizes="(max-width: 640px) 48px, 56px" className="object-cover" />
                        <span className="absolute top-0 right-0 w-5 h-5 bg-[#B8860B] text-black font-bold text-[10px] flex items-center justify-center rounded-bl-lg">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] sm:text-sm truncate font-medium text-foreground">{item.product.name}</p>
                        {item.selectedColor && (
                          <p className="text-[11px] sm:text-xs text-foreground/50 mt-0.5">{item.selectedColor}</p>
                        )}
                      </div>
                      <p className="text-[13px] sm:text-sm font-bold text-foreground shrink-0 ml-2">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-3 sm:pt-4 space-y-2.5 sm:space-y-3">
                  <div className="flex justify-between text-[13px] sm:text-sm">
                    <span className="text-foreground/70">Subtotal</span>
                    <span className="text-foreground font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[13px] sm:text-sm">
                    <span className="text-foreground/70">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-400 font-medium' : 'text-foreground font-medium'}>
                      {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Discount ({appliedPromo.code})</span>
                      <span className="text-emerald-400 font-medium">-{formatPrice(appliedPromo.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-end pt-2.5 sm:pt-3 border-t border-border">
                    <span className="text-foreground/70 text-[13px] sm:text-sm">Total</span>
                    <span className="font-bold text-xl sm:text-2xl text-[#B8860B]">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Trust & Security */}
                <div className="mt-6 p-3 sm:p-4 rounded-xl bg-card border border-border">
                  <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider mb-2.5 text-center">Secure & Trusted</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
                      <span className="text-[10px] sm:text-[11px]">SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 11-6.219-8.56"/><path d="M21 3v6h-6"/><path d="M21 3l-7.5 7.5"/></svg>
                      <span className="text-[10px] sm:text-[11px]">COD Available</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
                      <span className="text-[10px] sm:text-[11px]">Free Delivery</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-foreground/50">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      <span className="text-[10px] sm:text-[11px]">Open Box Check</span>
                    </div>
                  </div>
                </div>

                {/* Promo Code (Collapsible) */}
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={() => setPromoOpen(!promoOpen)}
                    className="flex items-center gap-2 text-[11px] sm:text-xs text-foreground/50 hover:text-foreground transition-colors w-full"
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
                        className="flex-1 bg-card border border-border rounded-xl px-3 py-2.5 text-foreground text-[13px] sm:text-sm placeholder-white/40 focus:outline-none focus:border-[#B8860B] transition-colors"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2.5 rounded-xl bg-card hover:bg-card text-foreground text-[11px] sm:text-xs font-semibold transition-colors"
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
                <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-border">
                  <p className="text-[11px] sm:text-xs font-bold text-[#B8860B] uppercase tracking-wider mb-2.5 sm:mb-3">Complete Your Look</p>
                  <div className="bg-card border border-border rounded-xl p-2.5 sm:p-4 flex gap-2.5 sm:gap-4 items-center">
                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-card rounded-lg overflow-hidden shrink-0">
                      <Image src="https://images.unsplash.com/photo-1546868871-7041f2a55e12" alt="Premium Watch Box" width={40} height={40} className="object-cover sm:w-16 sm:h-16" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] sm:text-sm font-medium text-foreground truncate">Premium Leather Box</p>
                      <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                        <p className="text-[13px] sm:text-sm font-bold text-[#D4A017]">{formatPrice(2500)}</p>
                        <p className="text-[11px] sm:text-xs text-foreground/40 line-through">{formatPrice(4000)}</p>
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
    </div>
  )
}
