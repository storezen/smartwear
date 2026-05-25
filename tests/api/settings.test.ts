import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testSettings() {
  console.log("\n=== Settings API ===")

  // PUT /api/settings/[key] — save setting
  try {
    const { status, body } = await api("/api/settings/test-key", {
      method: "PUT",
      body: JSON.stringify({ value: "test-value" }),
    })
    assert(status === 200, "save returns 200")
    assertEqual(body.key, "test-key", "save key")
    assertEqual(body.value, "test-value", "save value")
    ok(`PUT /api/settings/test-key saves setting`)
  } catch (e) { fail("PUT /api/settings/[key]", e) }

  // GET /api/settings/[key] — get single
  try {
    const { status, body } = await api("/api/settings/test-key")
    assert(status === 200, "get returns 200")
    assertEqual(body.value, "test-value", "get value")
    ok("GET /api/settings/test-key retrieves setting")
  } catch (e) { fail("GET /api/settings/[key]", e) }

  // GET /api/settings — get all
  try {
    const { status, body } = await api("/api/settings")
    assert(status === 200, "get all returns 200")
    assert(body["test-key"] === "test-value", "all includes test setting")
    ok("GET /api/settings returns all settings")
  } catch (e) { fail("GET /api/settings", e) }

  // PUT /api/settings/[key] with invalid value
  try {
    const { status } = await api("/api/settings/test-key", {
      method: "PUT",
      body: JSON.stringify({ value: 123 }),
    })
    assert(status === 400, "invalid value returns 400")
    ok("PUT /api/settings/[key] rejects non-string value")
  } catch (e) { fail("PUT /api/settings/[key] invalid", e) }
}
