import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { AdminLoginSchema } from "@/lib/validations/admin"

const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'development' ? 'dev-secret-not-for-production' : undefined)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || (process.env.NODE_ENV === 'development' ? 'admin' : undefined)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV === 'development' ? 'admin123' : undefined)

const loginRateLimit = new Map<string, { count: number; resetAt: number }>()
const LOGIN_RATE_WINDOW = 60000
const LOGIN_MAX_ATTEMPTS = 5

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1'
    const now = Date.now()
    const record = loginRateLimit.get(ip) || { count: 0, resetAt: now + LOGIN_RATE_WINDOW }
    if (now > record.resetAt) { record.count = 0; record.resetAt = now + LOGIN_RATE_WINDOW }
    record.count++
    loginRateLimit.set(ip, record)
    if (record.count > LOGIN_MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }
    const body = await req.json()
    
    // Validate request body using Zod
    const result = AdminLoginSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.errors },
        { status: 400 }
      )
    }

    const { username, password } = result.data

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create JWT token using `jose`
      const secret = new TextEncoder().encode(JWT_SECRET)
      const token = await new SignJWT({ role: "admin" })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h") // Token valid for 24 hours
        .sign(secret)

      const response = NextResponse.json({ success: true }, { status: 200 })

      // Set HTTP-Only Cookie
      response.cookies.set({
        name: "smartwear_admin_token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24 hours
      })

      return response
    }

    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    console.error("Login API Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
