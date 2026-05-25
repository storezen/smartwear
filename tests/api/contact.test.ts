import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testContact() {
  console.log("\n=== Contact API ===")

  try {
    const { status, body } = await api("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User", email: "test@example.com",
        subject: "Test Subject", message: "This is a test message.",
      }),
    })
    assert(status === 200 || status === 201, `contact returns 200/201, got ${status}`)
    assert(body?.ok || body?.success || body?.id, "contact returns success indicator")
    ok("POST /api/contact submits contact form")
  } catch (e) { fail("POST /api/contact", e) }
}
