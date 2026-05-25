import { NextResponse } from "next/server"
import { signToken } from "@/lib/auth"
import { rateLimit } from "@/lib/rate-limit"

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const { allowed, remaining } = rateLimit(`auth:${ip}`, 10, 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in 60 seconds." },
      { status: 429, headers: { "Retry-After": "60" } }
    )
  }

  const { password } = await req.json()
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json({ error: "No admin password configured" }, { status: 500 })
  }
  if (password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }
  const token = await signToken("admin")
  const res = NextResponse.json({ token })
  res.cookies.set("smartwear-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  res.cookies.set("smartwear-logged-in", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  })
  return res
}
