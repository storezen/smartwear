import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testAuth() {
  console.log("\n=== Auth API ===")

  // POST /api/auth/verify — wrong password
  try {
    const { status } = await api("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ password: "wrong-password" }),
    })
    assert(status === 401, "wrong password returns 401")
    ok("POST /api/auth/verify rejects wrong password")
  } catch (e) { fail("POST /api/auth/verify wrong password", e) }

  // POST /api/auth/logout
  try {
    const { status } = await api("/api/auth/logout", { method: "POST" })
    assert(status === 200, "logout returns 200")
    ok("POST /api/auth/logout succeeds")
  } catch (e) { fail("POST /api/auth/logout", e) }
}
