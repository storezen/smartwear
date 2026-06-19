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

export const TIKTOK_DEBUG_MODE = true; // Set to false in production if desired

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
    window.ttq.track(event, payload);
  }

  if (TIKTOK_DEBUG_MODE) {
    console.log(`%c[TikTok Event] ${event}`, 'color:#00f2fe; font-weight:bold', payload);
  }

  // Admin Dashboard Live View Sync
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: event,
        value: options.value || 0
      })
    }).catch(() => {})
  } catch (e) {}
}

export const TikTokEvents = {
  pageView: () => {
    if (typeof window !== 'undefined' && window.ttq) {
      window.ttq.page();
      if (TIKTOK_DEBUG_MODE) console.log('%c[TikTok Event] PageView', 'color:#00f2fe; font-weight:bold');
    }
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