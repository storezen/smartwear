import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Dashboard routes UI check
  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get("smartwear-auth")?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // 2. Protected administrative API routes check
  if (pathname.startsWith("/api/")) {
    const isOrdersCreation = pathname === "/api/orders" && request.method === "POST"
    const isProductsFetch = pathname.startsWith("/api/products") && request.method === "GET"
    const isCategoriesFetch = pathname.startsWith("/api/categories") && request.method === "GET"
    const isSettingsFetch = pathname.startsWith("/api/settings") && request.method === "GET"
    const isAuth = pathname.startsWith("/api/auth")
    const isContactSubmission = pathname === "/api/contact" && request.method === "POST"

    const isPublic = isOrdersCreation || isProductsFetch || isCategoriesFetch || isSettingsFetch || isAuth || isContactSubmission

    if (!isPublic) {
      const token = request.cookies.get("smartwear-auth")?.value
      if (!token || !(await verifyToken(token))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}

export default proxy
