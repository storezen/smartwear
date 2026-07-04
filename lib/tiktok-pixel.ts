import { detectCity } from "@/lib/geolocation"

/**
 * TikTok Pixel — Smartwear GOD MODE Implementation
 * 
 * Features:
 * - Advanced Matching: SHA256(PII) on ALL events for 70%+ match rate
 * - Content Category & Description: richer event data for ML optimization
 * - Event ID Deduplication: every event gets a unique event_id for browser↔server sync
 * - UTM/TTCLID persistence: attribution survives page navigation
 * - Analytics pipeline: sendBeacon to internal analytics for dashboard
 * - CAPI fires for ALL events with PII for max EMQ (TikTok standard)
 * - PII stored in localStorage (persists across sessions)
 * - Phone normalized to E.164 format (92xxxxxxxxxx) for Pakistan
 * - Debug Mode
 */

function generateUUID() {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  } catch {}
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

export const TIKTOK_DEBUG_MODE = process.env.NODE_ENV !== "production"

declare global {
  interface Window {
    ttq?: any
  }
}

let isInitialized = false

export function initTikTokPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId || isInitialized) return

  // Inline script in layout.tsx already calls ttq.load(pixelId) which
  // loads events.js and initializes the pixel. Here we only do post-init setup.
  isInitialized = true

  // Identify user if PII stored from previous session
  const stored = getUserData()
  if (stored) identifyUser(stored.email, stored.phone, stored.name)

  if (TIKTOK_DEBUG_MODE) {
    console.log('%c[TikTok Pixel] Provider ready with ID:', 'color:#00f2fe; font-weight:bold', pixelId)
  }
}

/* ── Advanced Matching: SHA256 + ttq.identify ── */

async function sha256(value: string): Promise<string> {
  try {
    if (typeof crypto === 'undefined' || !crypto.subtle || typeof crypto.subtle.digest !== 'function') return value
    const encoder = new TextEncoder()
    const data = encoder.encode(value.trim().toLowerCase())
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch { return value }
}

const USER_DATA_KEY = 'sw_user_data'

interface UserPII {
  email?: string
  phone?: string
  name?: string
}

export function storeUserData(pii: UserPII) {
  try { localStorage.setItem(USER_DATA_KEY, JSON.stringify(pii)) } catch {}
}
function getUserData(): UserPII | null {
  try {
    const raw = localStorage.getItem(USER_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function clearUserData() {
  try { localStorage.removeItem(USER_DATA_KEY) } catch {}
}

/**
 * Call ttq.identify() with SHA256-hashed PII for advanced matching.
 * TikTok will use these hashes to match users server-side.
 */
export async function identifyUser(email?: string, phone?: string, name?: string) {
  if (typeof window === 'undefined') return
  const pii: Record<string, string> = {}
  if (email) pii.email = await sha256(email)
  if (phone) {
    let cleaned = phone.replace(/[^0-9]/g, '')
    if (cleaned.startsWith('0')) cleaned = '92' + cleaned.slice(1)
    else if (cleaned.startsWith('92')) { /* already correct */ }
    else if (!cleaned.startsWith('92')) cleaned = '92' + cleaned
    pii.phone_number = await sha256(cleaned)
  }
  if (name) pii.external_id = await sha256(name)

  if (Object.keys(pii).length === 0) return

  if (window.ttq) {
    if (typeof window.ttq.identify === 'function') {
      window.ttq.identify(pii)
    } else {
      window.ttq.push(['identify', pii])
    }
  }
  if (TIKTOK_DEBUG_MODE) {
    console.log('%c[TikTok Pixel] Identify:', 'color:#00f2fe; font-weight:bold', pii)
  }
  storeUserData({ email, phone, name })
}

export function identifyFromStoredData() {
  if (typeof window === 'undefined') return
  const stored = getUserData()
  if (stored && (stored.email || stored.phone)) {
    identifyUser(stored.email, stored.phone, stored.name)
  }
}

/* ── Internal Analytics ── */

interface AnalyticsMeta {
  itemName?: string
  value?: number
}

function sendToAnalytics(event: string, meta?: AnalyticsMeta) {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const ttclid = urlParams.get('ttclid')
    const utmCampaign = urlParams.get('utm_campaign')
    let campaign = 'Direct / Organic'
    if (ttclid) {
      campaign = 'TikTok Ad'
      sessionStorage.setItem('utm_campaign', utmCampaign || 'TikTok Ad')
    } else if (utmCampaign) {
      campaign = utmCampaign
      sessionStorage.setItem('utm_campaign', utmCampaign)
    } else {
      campaign = sessionStorage.getItem('utm_campaign') || 'Direct / Organic'
    }
    if (ttclid) sessionStorage.setItem('ttclid', ttclid)

    // Fallback: detect TikTok from referrer (works even without ttclid/UTM)
    if (!ttclid && !utmCampaign && campaign === 'Direct / Organic') {
      try {
        const ref = document.referrer || ''
        if (ref.includes('tiktok.com') || ref.includes('tiktokcdn')) {
          campaign = 'TikTok'
          sessionStorage.setItem('utm_campaign', 'TikTok')
          sessionStorage.setItem('ttclid', 'referrer-' + Date.now())
        }
      } catch {}
    }

    const itemName = meta?.itemName || 'Store Visit'
    let sessionId = sessionStorage.getItem('live_session_id')
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`
      sessionStorage.setItem('live_session_id', sessionId)
    }

    // Use cached city or detect asynchronously — default to timezone fallback immediately
    const cachedCity = sessionStorage.getItem('sw_city')
    const city = cachedCity || (() => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        return tz.split('/')[1]?.replace(/_/g, ' ') || 'PK'
      } catch { return 'PK' }
    })()

    fetch('/api/analytics', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: `${event}::${itemName}::${city}::${campaign}::${sessionId}`,
        value: meta?.value || 0
      })
    })

    // Kick off geo detection in background for next event
    if (!cachedCity) detectCity()
  } catch {}
}

/* ── CAPI Backup for ALL events (max EMQ — TikTok best practice) ── */

async function fireCapi(event: string, payload: Record<string, unknown>) {
  try {
    const userData = getUserData()
    const phone = userData?.phone || ''
    const email = userData?.email || ''
    const name = userData?.name || ''
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const ttclid = typeof window !== 'undefined' ? sessionStorage.getItem('ttclid') || '' : ''
    await fetch('/api/tiktok/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, phone, email, name, url, ttclid, ...payload }),
    })
  } catch {}
}

/* ── Track Options ── */

interface TrackOptions {
  event_id?: string
  content_id?: string
  content_type?: 'product' | 'product_group'
  content_category?: string
  description?: string
  value?: number
  currency?: string
  contents?: Array<{
    content_id: string
    content_type: string
    content_category?: string
    content_name?: string
    price?: number
    quantity?: number
  }>
  content_name?: string
  /** Test event code (TikTok CAPI testing) */
  test_event_code?: string
  /** Extra data forwarded to CAPI */
  _extra?: Record<string, unknown>
}

/* ── Core Track ── */

export function trackTikTokEvent(event: string, options: TrackOptions = {}) {
  if (typeof window === 'undefined' || !isInitialized) return

  const funnelDupKey = `sw_funnel_${event}`
  if (['AddToCart', 'InitiateCheckout', 'CompletePayment'].includes(event)) {
    try {
      if (sessionStorage.getItem(funnelDupKey)) return
      sessionStorage.setItem(funnelDupKey, '1')
    } catch {}
  }

  const event_id = options.event_id || generateUUID()
  const testEventCode = options.test_event_code || (options._extra?.test_event_code as string | undefined)
  const { test_event_code: _tc, _extra, ...browserPayload } = { ...options, event_id, currency: options.currency || 'PKR' }

  if (window.ttq) {
    if (typeof window.ttq.track === 'function') {
      window.ttq.track(event, browserPayload)
    } else {
      window.ttq.push(['track', event, browserPayload])
    }
  } else if (TIKTOK_DEBUG_MODE) {
    console.warn(`%c[TikTok Pixel] ⚠️ window.ttq not found — pixel not initialized?`, 'color:#ff6b35; font-weight:bold')
  }

  if (TIKTOK_DEBUG_MODE) {
    console.log(`%c[TikTok Event] ${event}`, 'color:#00f2fe; font-weight:bold', browserPayload)
  }

  const itemName = options.content_name || options.contents?.[0]?.content_name || 'Store Visit'
  sendToAnalytics(event, { itemName, value: options.value })

  // CAPI backup for all events (server-side dedup via same event_id)
  fireCapi(event, { event_id, test_event_code: testEventCode, ...options })
}

/* ── Public Helpers ── */

type ExtraOpts = { _extra?: Record<string, unknown>; test_event_code?: string }

export const TikTokEvents = {
  addToWishlist: (product: { id?: string; name?: string; price?: number; slug?: string }, category = '', extra?: ExtraOpts) => {
    const pid = product.id || product.slug || `prod_${Date.now()}`
    const pname = product.name || 'Product'
    const pprice = product.price || 0
    trackTikTokEvent('AddToWishlist', {
      content_id: pid,
      content_type: 'product',
      content_category: category,
      content_name: pname,
      value: pprice,
      contents: [{ content_id: pid, content_type: 'product', content_category: category, content_name: pname, price: pprice, quantity: 1 }],
      ...extra,
    })
  },

  pageView: () => {
    if (typeof window !== 'undefined' && isInitialized && window.ttq) {
      if (typeof window.ttq.page === 'function') window.ttq.page()
      else window.ttq.push(['page'])
    }
    sendToAnalytics('PageView')
  },

  viewContent: (product: { id?: string; name?: string; price?: number; slug?: string }, category = '', extra?: ExtraOpts) => {
    const pid = product.id || product.slug || `prod_${Date.now()}`
    const pname = product.name || 'Product'
    const pprice = product.price || 0
    trackTikTokEvent('ViewContent', {
      content_id: pid,
      content_type: 'product',
      content_category: category,
      content_name: pname,
      value: pprice,
      contents: [{ content_id: pid, content_type: 'product', content_category: category, content_name: pname, price: pprice, quantity: 1 }],
      ...extra,
    })
  },

  addToCart: (product: { id?: string; name?: string; price?: number; slug?: string }, quantity = 1, category = '', extra?: ExtraOpts) => {
    const pid = product.id || product.slug || `prod_${Date.now()}`
    const pname = product.name || 'Product'
    const pprice = product.price || 0
    trackTikTokEvent('AddToCart', {
      content_id: pid,
      content_type: 'product',
      content_category: category,
      content_name: pname,
      value: pprice * quantity,
      contents: [{ content_id: pid, content_type: 'product', content_category: category, content_name: pname, price: pprice, quantity }],
      ...extra,
    })
  },

  initiateCheckout: (items: { id: string; name: string; price: number; quantity: number; category?: string }[], subtotal: number, extra?: ExtraOpts) => {
    trackTikTokEvent('InitiateCheckout', {
      value: subtotal,
      contents: items.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_category: item.category || '',
        content_name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      ...extra,
    })
  },

  purchase: (orderData: { id: string; total: number; items?: Array<{ id?: string; name?: string; price?: number; quantity?: number; category?: string }>, _extra?: Record<string, unknown> }) => {
    const total = Math.max(1, orderData.total > 0 ? orderData.total
      : (orderData.items || []).reduce((s, i) => s + ((i.price || 0)) * (i.quantity || 1), 0))
    trackTikTokEvent('CompletePayment', {
      event_id: orderData.id,
      value: total,
      contents: (orderData.items || []).map(item => ({
        content_id: item.id || `item_${Date.now()}`,
        content_type: 'product',
        content_category: item.category || '',
        content_name: item.name || 'Product',
        price: item.price || 0,
        quantity: item.quantity || 1,
      })),
      _extra: orderData._extra,
    })
  },

  /* ── Audience Maturity Events ── */

  search: (query: string) => {
    trackTikTokEvent('Search', {
      value: 1,
      content_id: 'search',
      content_type: 'product_group',
      content_name: query,
    })
  },

  addPaymentInfo: (method: string, value = 1) => {
    trackTikTokEvent('AddPaymentInfo', {
      value,
      content_id: 'payment_info',
      content_type: 'product_group',
      content_name: method || 'COD',
    })
  },

  subscribe: (email: string, value = 1) => {
    trackTikTokEvent('Subscribe', {
      value,
      content_id: 'newsletter',
      content_type: 'product_group',
      content_name: email.split('@')[0],
    })
  },

  /* ── Custom: Cart Abandonment (fires after inactivity) ── */
  cartAbandonment: (items: Array<{ id: string; name: string; price: number; quantity: number; category?: string }>, total: number) => {
    trackTikTokEvent('CartAbandonment', {
      value: total,
      contents: items.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_category: item.category || '',
        content_name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))
    })
  },
}