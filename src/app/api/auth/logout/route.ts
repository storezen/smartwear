import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set("smartwear-auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  res.cookies.set("smartwear-logged-in", "", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return res
}
