import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-development"
const publicAdminPaths = ["/admin/login"]

/** Storefront + webhook APIs that stay public */
function isPublicApi(pathname: string, method: string): boolean {
  if (pathname.startsWith("/api/webhooks/")) return true
  if (pathname === "/api/admin/login" && method === "POST") return true
  if (pathname === "/api/products" && method === "GET") return true
  if (method === "GET" && /^\/api\/products\/[^/]+$/.test(pathname)) return true
  if (pathname === "/api/orders" && method === "POST") return true
  if (pathname === "/api/orders/promo" && method === "POST") return true
  if (pathname.startsWith("/api/orders/track")) return true
  // Analytics — needed by TikTok pixel (POST) and dashboard (GET)
  if (pathname.startsWith("/api/analytics")) return true
  // AI Chat — public, used by storefront widget
  if (pathname.startsWith("/api/chat")) return true
  return false
}

async function denyUnlessAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = req.cookies.get("smartwear_admin_token")?.value

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    await jwtVerify(token, secret)
    return null
  } catch {
    return NextResponse.json({ error: "Unauthorized or token expired" }, { status: 401 })
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const method = req.method

  const isPublicAdminPath = publicAdminPaths.some((p) => pathname === p)

  if (pathname.startsWith("/admin") && !isPublicAdminPath) {
    const token = req.cookies.get("smartwear_admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  if (pathname.startsWith("/api/") && !isPublicApi(pathname, method)) {
    const denied = await denyUnlessAdmin(req)
    if (denied) return denied
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
}