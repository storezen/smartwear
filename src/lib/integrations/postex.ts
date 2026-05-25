export interface PostExConfig {
  apiKey: string
  baseUrl?: string
}

export interface PostExTrackingEvent {
  date: string
  status: string
  location: string
  description: string
}

export interface PostExShipment {
  trackingId: string
  orderId: string
  status: string
  origin: string
  destination: string
  estimatedDelivery: string
  events: PostExTrackingEvent[]
}

export interface PostExWebhookPayload {
  tracking_id: string
  order_id: string
  status: string
  timestamp: string
  location: string
  description: string
}

const DEFAULT_BASE_URL = "https://api.postex.pk/v1"

function buildHeaders(config: PostExConfig): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-API-Key": config.apiKey,
  }
}

export async function trackShipment(
  trackingId: string,
  config: PostExConfig
): Promise<PostExShipment> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL
  const res = await fetch(`${baseUrl}/shipments/${trackingId}/track`, {
    headers: buildHeaders(config),
  })

  if (!res.ok) {
    throw new Error(`PostEx API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function createShipment(
  data: {
    order_id: string
    customer_name: string
    customer_phone: string
    customer_address: string
    customer_city: string
    weight_kg: number
    cod_amount?: number
  },
  config: PostExConfig
): Promise<{ tracking_id: string; label_url: string }> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL
  const res = await fetch(`${baseUrl}/shipments`, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`PostEx API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function cancelShipment(
  trackingId: string,
  config: PostExConfig
): Promise<{ success: boolean }> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL
  const res = await fetch(`${baseUrl}/shipments/${trackingId}/cancel`, {
    method: "POST",
    headers: buildHeaders(config),
  })

  if (!res.ok) {
    throw new Error(`PostEx API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function getCourierRates(
  data: {
    origin_city: string
    destination_city: string
    weight_kg: number
  },
  config: PostExConfig
): Promise<{ courier: string; rate: number; estimated_days: number }[]> {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL
  const res = await fetch(`${baseUrl}/rates`, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`PostEx API error: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function verifyPostExSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  // PostEx signs payloads using HMAC SHA-256 with a shared secret
  // We recreate the signature and compare securely
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  )

  const hashArray = Array.from(new Uint8Array(signatureBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
  
  return hashHex === signature
}
