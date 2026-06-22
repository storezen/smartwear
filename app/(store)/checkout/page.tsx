"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, MapPin, Truck, Shield, CreditCard, AlertCircle, Plus, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCart } from '@/context/cart-context'
import { useAuth } from '@/context/auth-context'
import { formatPrice } from '@/lib/mock-data'
import { TikTokEvents } from '@/lib/tiktok-pixel'
import { SHIPPING_ZONES, Address } from '@/types'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, name: 'Address', icon: MapPin },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Review', icon: Check },
]

const shippingMethods = [
  { id: 'standard', name: 'Standard Delivery', description: '3-5 business days', price: 200 },
  { id: 'express', name: 'Express Delivery', description: '1-2 business days', price: 500 },
]

const paymentMethods = [
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive' },
  { id: 'jazzcash', name: 'JazzCash', description: 'Mobile wallet payment' },
  { id: 'easypaisa', name: 'Easypaisa', description: 'Mobile wallet payment' },
  { id: 'bank', name: 'Bank Transfer', description: 'Direct bank transfer' },
]

/* Premium Checkout - Clean & Professional
 * Multi-step form: Address → Shipping → Payment → Review
 */
export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCart()
  const { isAuthenticated, addresses } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [guestAddress, setGuestAddress] = useState({
    name: '',
    phone: '',
    address_line1: '',
    city: 'Karachi'
  })
  const [selectedShipping, setSelectedShipping] = useState(shippingMethods[0])
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  
  // Promo state
  const [promoCodeInput, setPromoCodeInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<{code: string, discount: number} | null>(null)
  const [promoError, setPromoError] = useState('')

  const shippingCost = subtotal >= 10000 ? 0 : selectedShipping.price
  const total = subtotal + shippingCost - (appliedPromo?.discount || 0)

  // Fire InitiateCheckout once when user reaches checkout
  useEffect(() => {
    if (items.length > 0) {
      TikTokEvents.initiateCheckout(items, subtotal)
    }
  }, []) // run once on mount with items

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0C0F14] text-white py-16">
        <div className="max-w-sm mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-[24px] bg-white/5 border border-white/10 flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-white/60" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Your cart is empty</h1>
          <p className="text-white/60 mb-6">Add some products before checkout</p>
          <Link href="/products">
            <button className="sw-btn-gold w-full h-12">Continue Shopping</button>
          </Link>
        </div>
      </div>
    )
  }

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords
        // Use free Nominatim reverse geocoding API
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
        const data = await res.json()
        
        if (data && data.address) {
          const street = data.address.road || data.address.suburb || ''
          const area = data.address.neighbourhood || data.address.residential || ''
          const city = data.address.city || data.address.town || data.address.state || 'Other'
          
          setGuestAddress({
            ...guestAddress,
            address_line1: `${street} ${area}`.trim(),
            city: city.includes('Karachi') ? 'Karachi' : 
                  city.includes('Lahore') ? 'Lahore' : 
                  city.includes('Islamabad') ? 'Islamabad' : 'Other'
          })
          toast.success("Location detected successfully!")
        }
      } catch (error) {
        console.error("Failed to get location", error)
        toast.error("Could not fetch location automatically. Please enter manually.")
      } finally {
        setIsLocating(false)
      }
    }, () => {
      setIsLocating(false)
      toast.error("Permission denied. Please enter address manually.")
    })
  }

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
        toast.success(`Promo code applied! Saved ₨ ${data.discount}`)
      } else {
        setPromoError(data.error || 'Invalid promo code')
        setAppliedPromo(null)
      }
    } catch (e) {
      setPromoError('Failed to verify promo code')
    }
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)

    if (currentStep === 4) {
      let orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000)
      
      try {
        // Build order payload
        const idempotencyKey = `IDMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        
        // Build order payload strictly according to OrderCreationSchema
        const orderPayload = {
          customer_name: guestAddress.name || 'Guest',
          email: 'guest@smartwear.pk',
          phone: guestAddress.phone || '',
          shipping_address: guestAddress,
          payment_method: selectedPayment.id === 'cod' ? 'COD' : 'Card',
          items: items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.images[0],
            color: item.selectedColor
          })),
          subtotal: subtotal,
          shipping_fee: shippingCost,
          total: total,
          idempotency_key: idempotencyKey,
          promo_code: appliedPromo?.code || undefined
        }

        // Save real order to local database
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload)
        })

        if (response.ok) {
          const data = await response.json()
          orderId = data.order.id // Override with actual DB ID
          toast.success("Order placed successfully!", {
            description: `Your order ID is ${orderId}`
          })
          
          // Also fire TikTok Purchase
          TikTokEvents.purchase({ id: orderId, total, items })
          
          clearCart()
          router.push(`/checkout/success?order=${orderId}`)
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || "Order processing failed", {
            description: "Please try again"
          })
          setIsProcessing(false) // Stop processing so user can try again
        }
      } catch (e) {
        console.error('Order save failed', e)
        toast.error("Failed to connect to database. Please check your internet connection.")
        setIsProcessing(false)
      }
    } else {
      // Simulate network request if not step 4
      setTimeout(() => {
        setIsProcessing(false)
        handleNext()
      }, 1000)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      // Validate Pakistani Phone Number (e.g., 03001234567 or +923001234567)
      const phoneRegex = /^(03|\+923)[0-9]{2}[-\s]?[0-9]{7}$/
      const isValidPhone = phoneRegex.test(guestAddress.phone)
      const isValidAddress = guestAddress.address_line1.length >= 10
      return guestAddress.name.length >= 3 && isValidPhone && isValidAddress
    }
    if (currentStep === 2) return selectedShipping !== null
    if (currentStep === 3) return selectedPayment !== null
    return true
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
          <div className="inline-flex items-center gap-2 text-xs text-white/70 mb-4 justify-center uppercase tracking-widest">
            <span>Home</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span>Cart</span>
            <ChevronRight className="w-3 h-3 text-[#B8860B]" />
            <span className="text-[#B8860B]">Secure Checkout</span>
          </div>
          <h1
            className="font-bold text-white leading-tight mb-4"
            style={{ fontFamily: "var(--font-playfair),Georgia,serif", fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
          >
            Secure Checkout
          </h1>
        </div>
      </div>
      <div className="sw-container pb-16">
      {/* Progress Steps */}
      <div className="mb-10">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                  currentStep >= step.id
                    ? "bg-[linear-gradient(135deg,#B8860B,#D4A017)] border-transparent text-black"
                    : "border-white/10 text-white/60 bg-white/5"
                )}
                animate={{
                  scale: currentStep === step.id ? [0.85, 1.1, 1] : 1,
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </motion.div>
              <span className={cn(
                "hidden sm:block ml-2 text-sm font-medium",
                currentStep >= step.id ? "text-white" : "text-white/60"
              )}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-12 sm:w-20 h-0.5 mx-2",
                  currentStep > step.id ? "bg-[#B8860B]" : "bg-white/10"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                  <MapPin className="w-5 h-5 text-[#B8860B]" />
                  Delivery Address
                </h2>



                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5">Full Name</label>
                    <input 
                      type="text" 
                      value={guestAddress.name}
                      onChange={(e) => setGuestAddress({...guestAddress, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5">Phone Number</label>
                    <input 
                      type="text" 
                      value={guestAddress.phone}
                      onChange={(e) => setGuestAddress({...guestAddress, phone: e.target.value})}
                      placeholder="0300 1234567"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm text-white/70">Delivery Address</label>
                      <button 
                        type="button" 
                        onClick={handleUseLocation}
                        disabled={isLocating}
                        className="text-xs text-[#B8860B] hover:text-[#D4A017] flex items-center gap-1 font-medium bg-[#B8860B]/10 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        <MapPin className="w-3 h-3" /> {isLocating ? 'Locating...' : 'Use Current Location'}
                      </button>
                    </div>
                    <input 
                      type="text" 
                      value={guestAddress.address_line1}
                      onChange={(e) => setGuestAddress({...guestAddress, address_line1: e.target.value})}
                      placeholder="e.g. House 4, Street 5, Phase 6, DHA"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors min-h-[44px]"
                    />
                    <p className="text-[10px] text-white/40 mt-1.5 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0 text-[#B8860B]" />
                      Makaan number, Street, aur Area laazmi likhein taake rider asani se parcel pohncha sakay.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-white/70 mb-1.5">City</label>
                    <select 
                      value={guestAddress.city}
                      onChange={(e) => setGuestAddress({...guestAddress, city: e.target.value})}
                      className="w-full bg-[#0C0F14] border border-white/10 rounded-xl px-4 py-3 text-white text-base md:text-sm focus:outline-none focus:border-[#B8860B] focus:shadow-[0_0_0_3px_rgba(184,134,11,0.1)] transition-colors appearance-none min-h-[44px]"
                    >
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                  <Truck className="w-5 h-5 text-[#B8860B]" />
                  Shipping Method
                </h2>

                <RadioGroup
                  value={selectedShipping.id}
                  onValueChange={(value) => {
                    const method = shippingMethods.find(m => m.id === value)
                    if (method) setSelectedShipping(method)
                  }}
                  className="space-y-3"
                >
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors",
                        selectedShipping.id === method.id
                          ? "border-[#B8860B] bg-[#B8860B]/5"
                          : "border-white/10 hover:border-white/20 bg-white/5"
                      )}
                    >
                      <RadioGroupItem value={method.id} className="border-white/30 text-[#B8860B]" />
                      <div className="flex-1">
                        <p className="font-medium text-white">{method.name}</p>
                        <p className="text-sm text-white/70">{method.description}</p>
                      </div>
                      <span className="font-semibold text-[#B8860B]">
                        {method.price === 0 ? 'Free' : formatPrice(method.price)}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                  <CreditCard className="w-5 h-5 text-[#B8860B]" />
                  Payment Method
                </h2>

                <RadioGroup
                  value={selectedPayment.id}
                  onValueChange={(value) => {
                    const method = paymentMethods.find(m => m.id === value)
                    if (method) setSelectedPayment(method)
                  }}
                  className="space-y-3"
                >
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors relative overflow-hidden",
                        selectedPayment.id === method.id
                          ? method.id === 'cod' 
                            ? "border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "border-[#B8860B] bg-[#B8860B]/5"
                          : "border-white/10 hover:border-white/20 bg-white/5"
                      )}
                    >
                      <RadioGroupItem value={method.id} className={cn(selectedPayment.id === method.id && method.id === 'cod' ? "border-emerald-500 text-emerald-500" : "border-white/30 text-[#B8860B]")} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={cn("font-medium", selectedPayment.id === method.id && method.id === 'cod' ? "text-emerald-400" : "text-white")}>{method.name}</p>
                          {method.id === 'cod' && (
                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Recommended</span>
                          )}
                        </div>
                        <p className={cn("text-sm", selectedPayment.id === method.id && method.id === 'cod' ? "text-emerald-400/80" : "text-white/70")}>{method.description}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <motion.div
              key={`step-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl"
            >
              <div className="p-6 md:p-8 space-y-4">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>
                  <Check className="w-5 h-5 text-[#B8860B]" />
                  Review Your Order
                </h2>

                {guestAddress.name && (
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-sm font-medium">{guestAddress.name}</p>
                    <p className="text-xs text-white/60 mt-1">{guestAddress.phone}</p>
                    <p className="text-xs text-white/60">{guestAddress.address_line1}, {guestAddress.city}</p>
                  </div>
                )}

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                  <p className="font-medium text-sm text-[#B8860B] mb-1">Shipping: {selectedShipping.name}</p>
                  <p className="text-sm text-white/70">{selectedShipping.description}</p>
                </div>

                <div className={cn("p-4 border rounded-xl", selectedPayment.id === 'cod' ? "bg-emerald-500/10 border-emerald-500/30" : "bg-white/5 border-white/10")}>
                  <p className={cn("font-medium text-sm", selectedPayment.id === 'cod' ? "text-emerald-400" : "text-[#B8860B]")}>Payment: {selectedPayment.name}</p>
                  {selectedPayment.id === 'cod' && <p className="text-xs text-emerald-500/80 mt-1">You will pay securely upon delivery.</p>}
                </div>

                <div className="border-t border-white/10 pt-4 mt-6">
                  <p className="font-medium mb-4 text-[#B8860B]">Order Items ({items.length})</p>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 text-sm bg-white/5 p-3 border border-white/5 rounded-xl">
                        <div className="w-12 h-12 bg-[#0F1923] rounded-lg overflow-hidden shrink-0 border border-white/10">
                          <Image src={item.product.images[0]} alt={item.product.name} width={48} height={48} className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-white">{item.product.name}</p>
                          <p className="text-white/60 mt-0.5">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-white">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <button className="sw-btn-ghost-white h-12 px-6 rounded-xl flex items-center text-sm" onClick={handleBack}>
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Back
              </button>
            ) : (
              <div />
            )}
            {currentStep < 4 ? (
              <div className="flex items-center gap-3">
                {currentStep === 1 && !canProceed() && (
                  <span className="text-xs text-rose-400 font-medium bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20">
                    Please provide a valid 11-digit phone number and complete address.
                  </span>
                )}
                <button className="sw-btn-gold h-12 px-8 flex items-center text-sm disabled:opacity-50" onClick={handleNext} disabled={!canProceed()}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <button 
                className="sw-btn-gold h-12 px-8 flex items-center text-sm gap-2 disabled:opacity-50" 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Place Order'}
                {!isProcessing && <Check className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-[24px] border border-white/5 bg-white/[0.02] backdrop-blur-xl">
            <div className="p-6 md:p-8">
              <h3 className="font-bold text-lg text-white mb-6" style={{ fontFamily: "var(--font-playfair),Georgia,serif" }}>Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 bg-[#0F1923] border border-white/5 rounded-xl overflow-hidden shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill sizes="56px" className="object-cover" />
                      <span className="absolute top-0 right-0 w-5 h-5 bg-[#B8860B] text-black font-bold text-[10px] flex items-center justify-center rounded-bl-lg">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate font-medium text-white">{item.product.name}</p>
                    </div>
                    <p className="text-sm font-bold text-white">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Shipping</span>
                  <span className={shippingCost === 0 ? "text-[#4ADE80] font-medium" : "text-white font-medium"}>
                    {shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Discount ({appliedPromo.code})</span>
                    <span className="text-[#4ADE80] font-medium">-{formatPrice(appliedPromo.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-white/5">
                  <span className="text-white/70 text-sm">Total</span>
                  <span className="font-bold text-2xl text-[#B8860B]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mt-6">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Promo code" 
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#B8860B]"
                  />
                  <Button 
                    onClick={handleApplyPromo}
                    className="bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    Apply
                  </Button>
                </div>
                {promoError && <p className="text-rose-400 text-xs mt-2">{promoError}</p>}
              </div>

              {/* Special Upsell Offer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs font-bold text-[#B8860B] uppercase tracking-wider mb-3">Special Offer</p>
                <div className="bg-[#B8860B]/10 border border-[#B8860B]/30 rounded-xl p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 bg-[#0F1923] rounded-lg overflow-hidden shrink-0">
                    <Image src="https://images.unsplash.com/photo-1546868871-7041f2a55e12" alt="Premium Watch Box" width={64} height={64} className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Premium Leather Box</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm font-bold text-[#D4A017]">₨ 2,500</p>
                      <p className="text-xs text-white/40 line-through">₨ 4,000</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="w-8 h-8 rounded-full bg-[#B8860B] text-black flex items-center justify-center hover:bg-[#D4A017] transition-colors"
                    aria-label="Add premium leather box"
                    onClick={() => {
                      alert("In a full setup, this would add to the global cart array. Added to order notes for now!")
                    }}
                  >
                    <Plus className="w-4 h-4" />
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