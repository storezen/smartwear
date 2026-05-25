import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testCoupons() {
  console.log("\n=== Coupons API ===")

  // POST /api/coupons — create
  let createdId: string
  try {
    const { status, body } = await api("/api/coupons", {
      method: "POST",
      body: JSON.stringify({
        code: "TEST10", discount: 10, type: "percentage",
        minOrder: 1000, active: true,
      }),
    })
    assert(status === 201, "create returns 201")
    assertEqual(body.code, "TEST10", "coupon code")
    createdId = body.id
    ok("POST /api/coupons creates coupon")
  } catch (e) { fail("POST /api/coupons", e); return }

  // GET /api/coupons — list
  try {
    const { status, body } = await api("/api/coupons")
    assert(status === 200, "list returns 200")
    const found = (body as any[]).find((c: any) => c.id === createdId)
    assert(found, "created coupon in list")
    ok("GET /api/coupons lists coupons")
  } catch (e) { fail("GET /api/coupons", e) }

  // Duplicate code
  try {
    const { status } = await api("/api/coupons", {
      method: "POST",
      body: JSON.stringify({ code: "TEST10", discount: 20, type: "percentage" }),
    })
    assert(status === 409, "duplicate code returns 409")
    ok("POST /api/coupons rejects duplicate code")
  } catch (e) { fail("POST /api/coupons duplicate", e) }

  // DELETE /api/coupons/[id]
  try {
    const { status } = await api(`/api/coupons/${createdId}`, { method: "DELETE" })
    assert(status === 200, "delete returns 200")
    ok(`DELETE /api/coupons/${createdId} deletes coupon`)
  } catch (e) { fail("DELETE /api/coupons/[id]", e) }
}
