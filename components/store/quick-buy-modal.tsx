"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Product } from "@/types"
import { formatPrice } from "@/lib/mock-data"
import { TikTokEvents } from "@/lib/tiktok-pixel"
import { Loader2, Truck, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { CitySelect } from "@/components/ui/city-select"
import { detectProvince } from "@/lib/address-validator"

interface QuickBuyModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  quantity?: number
}

export function QuickBuyModal({ product, isOpen, onClose, quantity = 1 }: QuickBuyModalProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: ""
  })

  // Fire InitiateCheckout immediately when modal opens
  useEffect(() => {
    if (isOpen && product) {
      TikTokEvents.initiateCheckout(
        [{ id: product.id, name: product.name, price: product.price, quantity, category: product.category?.name || '' }],
        product.price * quantity
      )
    }
  }, [isOpen, product, quantity])

  if (!product) return null

  const subtotal = product.price * quantity
  const shippingCost = subtotal >= 10000 ? 0 : 200
  const total = subtotal + shippingCost

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const phoneRegex = /^(03|\+923)[0-9]{2}[-\s]?[0-9]{7}$/
    const fieldErrors: Record<string, string> = {}
    if (formData.name.length < 3) fieldErrors.name = 'Please enter your full name'
    if (!phoneRegex.test(formData.phone)) fieldErrors.phone = 'Enter valid Pakistani number (0300 1234567)'
    if (formData.address.length < 10) fieldErrors.address = 'Enter complete delivery address'
    if (formData.city.length < 2) fieldErrors.city = 'Select your city'
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setIsProcessing(true)

    try {
      const orderId = `ORD-${Date.now().toString().slice(-8)}`

      const orderPayload = {
        id: orderId,
        customer_name: formData.name,
        phone: formData.phone,
        email: "",
        shipping_address: {
          address_line1: formData.address,
          city: formData.city,
          state: '',
          postal_code: '',
          country: 'Pakistan'
        },
        items: [{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.images?.[0]
        }],
        subtotal,
        shipping_fee: shippingCost,
        total,
        payment_method: 'COD',
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      })
      if (!res.ok) throw new Error('Order creation failed')
      
      const data = await res.json()
      const serverOrderId = data.order?.id || orderId

      router.push(`/checkout/success?order=${serverOrderId}&total=${total}`)
    } catch (error) {
      console.error("Quick buy failed:", error)
      toast.error("Could not place order. Please check details and try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-[#B8860B]/20 text-foreground overflow-hidden rounded-[24px] [animation-duration:0ms!important]" showCloseButton={true}>
        {/* Glow effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#B8860B] to-[#D4A017]" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="text-xl font-semibold flex items-center justify-between" style={{ fontFamily: "var(--font-heading),'Poppins',system-ui,sans-serif" }}>
            <span>Quick Buy COD</span>
            <span className="text-[#B8860B] bg-[#B8860B]/10 text-xs px-2 py-1 rounded-full flex items-center gap-1 font-sans font-bold uppercase tracking-widest">
              <Truck className="w-3 h-3" /> Cash on Delivery
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="bg-background rounded-xl p-4 flex gap-4 items-center mb-6 mt-2 border border-border">
          <div className="w-16 h-16 rounded-lg bg-card overflow-hidden shrink-0 relative border border-border protected-img">
            <Image src={product.images[0]} alt={product.name} fill sizes="64px" className="object-cover" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm line-clamp-1">{product.name}</p>
            <p className="text-foreground/70 text-xs mt-1">Qty: {quantity}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#B8860B]">{formatPrice(total)}</p>
            {shippingCost === 0 && <p className="text-[10px] text-green-400 uppercase tracking-wider">Free Shipping</p>}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-foreground/70 uppercase tracking-widest mb-1.5 block">Full Name</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData(p => ({ ...p, name: e.target.value }))
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }))
              }}
              onBlur={(e) => {
                if (!e.target.value || e.target.value.length < 3) {
                  setErrors(prev => ({ ...prev, name: 'Please enter your full name' }))
                }
              }}
              className={`w-full h-12 bg-card border rounded-xl px-4 text-foreground focus:outline-none transition-all ${errors.name ? 'border-red-400/50 focus:border-red-400' : 'border-border focus:border-[#B8860B] focus:bg-card'}`}
              placeholder="e.g. Ali Khan"
            />
            {errors.name && <p className="text-[10px] text-red-400/80 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs text-foreground/70 uppercase tracking-widest mb-1.5 block">Phone Number</label>
            <input
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData(p => ({ ...p, phone: e.target.value }))
                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
              }}
              onBlur={(e) => {
                const phoneRegex = /^(03|\+923)[0-9]{2}[-\s]?[0-9]{7}$/
                if (e.target.value && !phoneRegex.test(e.target.value)) {
                  setErrors(prev => ({ ...prev, phone: 'Enter valid Pakistani number (0300 1234567)' }))
                }
              }}
              className={`w-full h-12 bg-card border rounded-xl px-4 text-foreground focus:outline-none transition-all ${errors.phone ? 'border-red-400/50 focus:border-red-400' : 'border-border focus:border-[#B8860B] focus:bg-card'}`}
              placeholder="0300 1234567"
            />
            {errors.phone && <p className="text-[10px] text-red-400/80 mt-1">{errors.phone}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-foreground/70 uppercase tracking-widest mb-1.5 block">Delivery Address</label>
              <input
                required
                type="text"
                value={formData.address}
                onChange={(e) => {
                  setFormData(p => ({ ...p, address: e.target.value }))
                  if (errors.address) setErrors(prev => ({ ...prev, address: '' }))
                }}
                onBlur={(e) => {
                  if (e.target.value && e.target.value.length < 10) {
                    setErrors(prev => ({ ...prev, address: 'Enter complete address (house, street, area)' }))
                  }
                }}
                className={`w-full h-12 bg-card border rounded-xl px-4 text-foreground focus:outline-none transition-all ${errors.address ? 'border-red-400/50 focus:border-red-400' : 'border-border focus:border-[#B8860B] focus:bg-card'}`}
                placeholder="House, Street, Area"
              />
              {errors.address && <p className="text-[10px] text-red-400/80 mt-1">{errors.address}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-xs text-foreground/70 uppercase tracking-widest mb-1.5 block">City</label>
              <CitySelect
                value={formData.city}
                onChange={(city) => {
                  setFormData(p => ({ ...p, city }))
                  if (errors.city) setErrors(prev => ({ ...prev, city: '' }))
                }}
              />
              {errors.city && <p className="text-[10px] text-red-400/80 mt-1">{errors.city}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full h-12 mt-4 rounded-xl bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black font-bold text-sm tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
            ) : (
              `Confirm Order - ${formatPrice(total)}`
            )}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
