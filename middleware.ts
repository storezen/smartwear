import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-development"

// Which paths to protect
const protectedAdminPaths = ["/admin"]
const publicAdminPaths = ["/admin/login"]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Check if the path is inside /admin
  const isAdminPath = pathname.startsWith("/admin")
  const isPublicAdminPath = publicAdminPaths.some(p => pathname === p)

  if (isAdminPath && !isPublicAdminPath) {
    const token = req.cookies.get("smartwear_admin_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    try {
      // Verify JWT token using `jose`
      const secret = new TextEncoder().encode(JWT_SECRET)
      await jwtVerify(token, secret)
    } catch (err) {
      // Token is invalid or expired
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // 2. Protect sensitive API routes (e.g. creating/deleting products, updating orders)
  const isApiRoute = pathname.startsWith("/api/")
  
  if (isApiRoute) {
    // Only protect non-GET product routes, and order update routes
    const isProtectedApi = 
      (pathname.startsWith("/api/products") && req.method !== "GET") ||
      (pathname.startsWith("/api/orders") && req.method === "PUT") ||
      pathname.startsWith("/api/analytics")

    if (isProtectedApi) {
      const token = req.cookies.get("smartwear_admin_token")?.value
      
      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      try {
        const secret = new TextEncoder().encode(JWT_SECRET)
        await jwtVerify(token, secret)
      } catch (err) {
        return NextResponse.json({ error: "Unauthorized or token expired" }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*"
  ]
}
