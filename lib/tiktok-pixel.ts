/**
 * TikTok Pixel — Smartwear Advanced Implementation
 * 
 * Features:
 * - Debug Mode for easy console tracking
 * - Event ID Deduplication for Client/Server sync
 * - Strict Types
 */

// Generate a unique ID (fallback for crypto.randomUUID)
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export const TIKTOK_DEBUG_MODE = process.env.NODE_ENV !== "production";

declare global {
  interface Window {
    ttq?: any;
  }
}

let isInitialized = false;
let currentPixelId: string | null = null;

/**
 * Initialize the Pixel.
 * We pass the pixel ID dynamically (fetched from settings or env)
 */
export function initTikTokPixel(pixelId: string) {
  if (typeof window === 'undefined' || !pixelId || isInitialized) return;
  currentPixelId = pixelId;

  const script = document.createElement('script');
  script.src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
  script.async = true;
  document.head.appendChild(script);

  window.ttq = window.ttq || [];
  window.ttq.push(['init', pixelId]);

  isInitialized = true;

  if (TIKTOK_DEBUG_MODE) {
    console.log('%c[TikTok Pixel] Initialized with ID:', 'color:#00f2fe; font-weight:bold', pixelId);
  }
}

interface TrackOptions {
  event_id?: string;
  content_id?: string;
  content_type?: 'product' | 'product_group';
  value?: number;
  currency?: string;
  contents?: Array<{ content_id: string; content_type: string; content_name?: string; price?: number; quantity?: number }>;
  content_name?: string;
}

export function trackTikTokEvent(event: string, options: TrackOptions = {}) {
  if (typeof window === 'undefined') return;

  const event_id = options.event_id || generateUUID();
  const payload = {
    ...options,
    event_id,
    currency: options.currency || 'PKR',
  };

  if (window.ttq) {
    // Use sendBeacon for purchase events to survive page navigation
    if (event === 'CompletePayment') {
      try {
        const ttq = window.ttq
        ttq.track(event, payload)
      } catch(e) {}
    } else {
      window.ttq.track(event, payload);
    }
  }

  if (TIKTOK_DEBUG_MODE) {
    console.log(`%c[TikTok Event] ${event}`, 'color:#00f2fe; font-weight:bold', payload);
  }

  // Admin Dashboard Live View Sync — use sendBeacon for purchase
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const campaign = urlParams.get('utm_campaign') || urlParams.get('ttclid') ? 'TikTok Ad' : (sessionStorage.getItem('utm_campaign') || 'Direct / Organic');
    if (urlParams.get('utm_campaign')) sessionStorage.setItem('utm_campaign', urlParams.get('utm_campaign')!);
    if (urlParams.get('ttclid')) sessionStorage.setItem('utm_campaign', 'TikTok Ad');
    
    let city = 'PK';
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      city = timeZone.split('/')[1]?.replace('_', ' ') || 'PK';
    } catch(err) {}

    const itemName = options.content_name || options.contents?.[0]?.content_name || 'Store Visit';

    let sessionId = sessionStorage.getItem('live_session_id');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2,9)}`;
      sessionStorage.setItem('live_session_id', sessionId);
    }

    const body = JSON.stringify({
      event_name: `${event}::${itemName}::${city}::${campaign}::${sessionId}`,
      value: options.value || 0
    })

    // sendBeacon survives page navigation
    navigator.sendBeacon('/api/analytics', new Blob([body], { type: 'application/json' }))
  } catch (e) {}
}

export const TikTokEvents = {
  pageView: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
    }
    trackTikTokEvent('PageView', { content_name: 'Store Visit' });
  },

  viewContent: (product: { id: string; name: string; price: number }) => {
    trackTikTokEvent('ViewContent', {
      content_id: product.id,
      content_type: 'product',
      content_name: product.name,
      value: product.price,
      contents: [{ content_id: product.id, content_type: 'product', content_name: product.name, price: product.price, quantity: 1 }]
    });
  },

  addToCart: (product: { id: string; name: string; price: number }, quantity = 1) => {
    trackTikTokEvent('AddToCart', {
      content_id: product.id,
      content_type: 'product',
      content_name: product.name,
      value: product.price * quantity,
      contents: [{ content_id: product.id, content_type: 'product', content_name: product.name, price: product.price, quantity }]
    });
  },

  initiateCheckout: (items: any[], subtotal: number) => {
    trackTikTokEvent('InitiateCheckout', {
      value: subtotal,
      contents: items.map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  },

  // EventID must strictly be passed here (the order ID) to match the Server CAPI call
  purchase: (orderData: { id: string, total: number, items: any[] }) => {
    trackTikTokEvent('CompletePayment', {
      event_id: orderData.id,
      value: orderData.total,
      contents: (orderData.items || []).map(item => ({
        content_id: item.id,
        content_type: 'product',
        content_name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};