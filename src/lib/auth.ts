const SECRET = process.env.ADMIN_PASSWORD || "fallback-secret-smartwear-123"

const encoder = new TextEncoder()

async function getHmac(data: string): Promise<string> {
  const keyData = encoder.encode(SECRET)
  const messageData = encoder.encode(data)

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    messageData
  )

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function signToken(username: string): Promise<string> {
  const payload = JSON.stringify({ username, timestamp: Date.now() })
  const hmac = await getHmac(payload)
  return btoa(payload + "." + hmac)
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const raw = atob(token)
    const parts = raw.split(".")
    if (parts.length !== 2) return false
    const [payloadStr, signature] = parts
    const expectedSignature = await getHmac(payloadStr)
    if (signature !== expectedSignature) return false

    const payload = JSON.parse(payloadStr)
    const age = Date.now() - payload.timestamp
    // Token is valid for 24 hours
    if (age < 0 || age > 24 * 60 * 60 * 1000) return false

    return payload.username === "admin"
  } catch {
    return false
  }
}
