const BASE = process.env.TEST_URL || "http://localhost:3000"

let cookieHeader: string | null = null

export async function authenticate() {
  const password = process.env.ADMIN_PASSWORD || "admin123"
  const res = await fetch(`${BASE}/api/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  })
  if (!res.ok) {
    console.error("Test Authentication failed!")
    return
  }
  const setCookie = res.headers.get("set-cookie")
  if (setCookie) {
    const match = setCookie.match(/smartwear-auth=[^;]+/)
    if (match) {
      cookieHeader = match[0]
    }
  }
}

export async function api(path: string, init?: RequestInit) {
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (cookieHeader) {
    headers["Cookie"] = cookieHeader
  }
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      ...headers,
      ...init?.headers,
    },
    ...init,
  })
  const body = res.status === 204 ? null : await res.json().catch(() => null)
  return { status: res.status, body, ok: res.ok }
}

export function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(`FAIL: ${message}`)
}

export function assertEqual(actual: unknown, expected: unknown, label: string) {
  const a = JSON.stringify(actual)
  const e = JSON.stringify(expected)
  if (a !== e) throw new Error(`FAIL ${label}: expected ${e}, got ${a}`)
}

let passed = 0
let failed = 0

export function ok(label: string) {
  passed++
  console.log(`  ✓ ${label}`)
}

export function fail(label: string, err: unknown) {
  failed++
  console.log(`  ✗ ${label} — ${err}`)
}

export function summary() {
  console.log(`\nResults: ${passed} passed, ${failed} failed`)
  process.exit(failed > 0 ? 1 : 0)
}
