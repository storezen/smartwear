import { NextResponse } from "next/server"
import { writeFile, readFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { existsSync } from "node:fs"

const DATA_DIR = join(process.cwd(), "data")
const CONTACTS_FILE = join(DATA_DIR, "contacts.json")

async function saveContact(data: Record<string, string>) {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
    await writeFile(join(DATA_DIR, ".gitkeep"), "")
  }
  let contacts: Record<string, unknown>[] = []
  try {
    const raw = await readFile(CONTACTS_FILE, "utf-8")
    contacts = JSON.parse(raw)
  } catch {
    contacts = []
  }
  contacts.push({ ...data, createdAt: new Date().toISOString() })
  await writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2))
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

    await saveContact({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
