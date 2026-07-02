'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight, Truck, Home, Calendar, Printer } from 'lucide-react'
import { TikTokEvents, identifyUser } from '@/lib/tiktok-pixel'
import { formatPrice } from '@/lib/mock-data'
import { SpotlightCard } from '@/components/ui/spotlight-card'

const TIMELINE_STEPS = [
  { icon: CheckCircle, label: 'Order Confirmed', sub: 'Just now', done: true },
  { icon: Package, label: 'Processing', sub: 'Within 24 hours', done: false },
  { icon: Truck, label: 'Out for Delivery', sub: '2\u20134 business days', done: false },
  { icon: Home, label: 'Delivered', sub: 'At your doorstep', done: false },
]

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderIdFromQuery = searchParams.get('order')
  const totalFromQuery = parseFloat(searchParams.get('total') || '0')
  const orderId = orderIdFromQuery || ''

  const [orderDetails, setOrderDetails] = useState<any>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const dedupKey = `tiktokPurchaseSent_${orderId}`
    let alreadySent = false
    try { alreadySent = !!sessionStorage.getItem(dedupKey) } catch {}
    if (!orderId || alreadySent) return

    const firePurchase = async () => {
      let orderTotal = 0
      let orderItems: any[] = []
      let email = ''
      let phone = ''
      try {
        const res = await fetch(`/api/orders/track?id=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.order) {
            setOrderDetails(data.order)
            orderTotal = data.order.total || 0
            orderItems = data.order.items || []
            email = data.order.email || ''
            phone = data.order.phone || ''
          }
        }
      } catch (_) {}
      if (orderItems.length === 0 && !totalFromQuery) return
      if (email || phone) identifyUser(email, phone)
      TikTokEvents.purchase({ id: orderId, total: orderTotal || totalFromQuery || 0, items: orderItems })
      try { sessionStorage.setItem(dedupKey, '1') } catch {}
    }

    firePurchase()
  }, [orderId, totalFromQuery])

  const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const handlePrint = () => {
    const name = orderDetails?.customer_name || orderDetails?.shipping_address?.name || ''
    const phone = orderDetails?.phone || orderDetails?.shipping_address?.phone || ''
    const addr = orderDetails?.shipping_address?.address_line1 || ''
    const city = orderDetails?.shipping_address?.city || ''
    const items = orderDetails?.items || []
    const total = orderDetails?.total || totalFromQuery

    let itemsHtml = ''
    if (items.length > 0) {
      const rows = items.map((item: any) =>
        `<tr>
          <td>${item.name || item.product_name}${item.color ? ` (${item.color})` : ''}</td>
          <td style="text-align:right">${formatPrice(item.price)}</td>
          <td style="text-align:right">${item.quantity}</td>
          <td style="text-align:right">${formatPrice(item.price * item.quantity)}</td>
        </tr>`
      ).join('')

      itemsHtml = `
        <div style="margin:24px 0">
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 12px">Order Items</h2>
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th style="padding:10px 0;text-align:left;border-bottom:1px solid #eee;font-size:14px;color:#888;font-weight:normal">Item</th>
                <th style="padding:10px 0;text-align:right;border-bottom:1px solid #eee;font-size:14px;color:#888;font-weight:normal">Price</th>
                <th style="padding:10px 0;text-align:right;border-bottom:1px solid #eee;font-size:14px;color:#888;font-weight:normal">Qty</th>
                <th style="padding:10px 0;text-align:right;border-bottom:1px solid #eee;font-size:14px;color:#888;font-weight:normal">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:8px;border-top:2px solid #D4A017;font-size:16px;font-weight:bold">
            <span>Total</span>
            <span>${formatPrice(total)}</span>
          </div>
          <div style="margin-top:8px;font-size:13px;color:#666;display:flex;justify-content:space-between">
            <span>Payment Method</span>
            <span>Cash on Delivery</span>
          </div>
        </div>`
    }

    let addressHtml = ''
    if (name || addr || city || phone) {
      addressHtml = `
        <div style="margin:24px 0">
          <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 12px">Delivery Address</h2>
          <div style="background:#f9f9f9;padding:16px;border-radius:8px;font-size:14px;line-height:1.6">
            ${name ? `<p><strong>${name}</strong></p>` : ''}
            ${addr ? `<p>${addr}</p>` : ''}
            ${city ? `<p>${city}</p>` : ''}
            ${phone ? `<p>${phone}</p>` : ''}
          </div>
        </div>`
    }

    const timelineHtml = `
      <div style="margin:24px 0">
        <h2 style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 12px">Delivery Timeline</h2>
        <p style="font-size:14px;color:#333">Estimated Delivery: <strong>${deliveryDate}</strong></p>
        <ul style="margin-top:8px;padding-left:18px;font-size:13px;color:#555;line-height:1.8">
          ${TIMELINE_STEPS.map(s => `<li>${s.label} — ${s.sub}</li>`).join('')}
        </ul>
      </div>`

    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return

    doc.open()
    doc.write(`
      <html>
        <head>
          <title>Order #${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #000; padding: 40px; margin: 0; }
            .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #D4A017; }
            .header h1 { font-size: 22px; margin: 0 0 4px; color: #1a1a1a; }
            .header p { font-size: 13px; color: #666; margin: 0; }
            .order-id { text-align: center; font-size: 16px; margin: 24px 0; padding: 12px; background: #f5f5f5; border-radius: 8px; }
            .order-id strong { color: #B8860B; }
            .footer { text-align: center; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; }
            @page { margin: 1.5cm; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Confirmation</h1>
            <p>Smart Wear Pakistan</p>
          </div>
          <div class="order-id">Order Number: <strong>${orderId}</strong></div>
          ${itemsHtml}
          ${addressHtml}
          ${timelineHtml}
          <div class="footer">
            <p>Smart Wear Pakistan — Free Shipping | Cash on Delivery | 7-Day Replacement</p>
            <p>Generated on ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      iframe.contentWindow?.print()
    }, 400)
  }

  const name = orderDetails?.customer_name || orderDetails?.shipping_address?.name || ''
  const phone = orderDetails?.phone || orderDetails?.shipping_address?.phone || ''
  const addr = orderDetails?.shipping_address?.address_line1 || ''
  const city = orderDetails?.shipping_address?.city || ''

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start md:justify-center px-4 py-6 md:py-16 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg relative z-10 mb-8"
      >
        <SpotlightCard className="p-6 sm:p-8 text-center relative overflow-hidden">

          <button
            onClick={handlePrint}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-border transition-all sw-interactive"
            title="Print or Download PDF"
          >
            <Printer className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] p-1 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-[#B8860B]" />
              </div>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            Order Confirmed!
          </h1>

          <p className="text-foreground/60 text-sm mb-6">
            Your order has been placed successfully.
          </p>

          <div className="inline-flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-xl mb-6">
            <span className="text-foreground/70 text-xs">Order #</span>
            <span className="text-[#B8860B] font-mono font-bold tracking-wider text-sm">{orderId}</span>
          </div>

          {/* Address */}
          {(name || addr || city || phone) && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Delivery Address</h3>
              <div className="text-sm text-foreground/80 space-y-0.5">
                {name && <p className="text-foreground font-medium">{name}</p>}
                {addr && <p>{addr}</p>}
                {city && <p>{city}</p>}
                {phone && <p>{phone}</p>}
              </div>
            </div>
          )}

          {/* Order Items */}
          {orderDetails?.items && orderDetails.items.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-4 mb-4 text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Items</h3>
              {orderDetails.items.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.name || item.product_name}</p>
                    {item.color && <p className="text-[11px] text-foreground/50">{item.color}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-foreground">{formatPrice(item.price)}</p>
                    <p className="text-[11px] text-foreground/50">x{item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-border">
                <span className="text-sm text-foreground/70">Total</span>
                <span className="text-lg font-bold text-[#B8860B]">{formatPrice(orderDetails.total || totalFromQuery)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-foreground/50 mt-1">
                <span>Payment</span>
                <span className="font-medium text-foreground/70">Cash on Delivery</span>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <Calendar className="w-4 h-4 text-[#B8860B]" />
              <span className="text-sm text-foreground font-medium">
                Delivery: <span className="text-[#B8860B]">{deliveryDate}</span>
              </span>
            </div>
            <div className="space-y-4">
              {TIMELINE_STEPS.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-[#B8860B] text-black' : 'bg-card border border-border text-foreground/60'}`}>
                    <step.icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-0.5">
                    <p className={`text-sm font-semibold ${step.done ? 'text-foreground' : 'text-foreground/70'}`}>{step.label}</p>
                    <p className="text-xs text-foreground/60">{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-border text-foreground hover:bg-card font-medium tracking-wide transition-all text-sm"
            >
              Continue Shopping
            </Link>
            <button
              onClick={handlePrint}
              className="w-full sm:w-auto px-6 py-3 rounded-xl sw-btn-gold font-medium tracking-wide transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Download PDF
            </button>
          </div>

        </SpotlightCard>
      </motion.div>
      {/* Hidden iframe for printing */}
      <iframe ref={iframeRef} style={{ position: 'absolute', width: 0, height: 0, border: 'none', visibility: 'hidden' }} title="print-frame" />
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SuccessContent />
    </Suspense>
  )
}
