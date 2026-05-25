import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/[&<>"']/g, "")
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    await prisma.contactSubmission.create({
      data: {
        name: stripHtml(name.trim()),
        email: email.trim(),
        subject: stripHtml(subject.trim()),
        message: stripHtml(message.trim()),
      }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Contact form error:", err)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
