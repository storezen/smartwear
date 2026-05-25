import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testOrders() {
  console.log("\n=== Orders API ===")

  // POST /api/orders — create
  let createdId: string
  try {
    const { status, body } = await api("/api/orders", {
      method: "POST",
      body: JSON.stringify({
        id: `TEST-${Date.now()}`,
        productId: "test-product", productName: "Test Item",
        productPrice: 2999, productImage: "", quantity: 2,
        total: 5998, customerName: "Test Customer", phone: "03001234567",
        address: "Test Address", city: "Karachi",
        status: "pending",
        statusHistory: [{ status: "pending", timestamp: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
      }),
    })
    assert(status === 200 || status === 201, `create returns 200/201, got ${status}`)
    createdId = body?.id
    assert(!!createdId, "create returns id")
    ok("POST /api/orders creates order")
  } catch (e) { fail("POST /api/orders", e); return }

  // GET /api/orders — list
  try {
    const { status, body } = await api("/api/orders")
    assert(status === 200, "list returns 200")
    assert(Array.isArray(body), "list returns array")
    const found = (body as any[]).find((o: any) => o.id === createdId)
    assert(found, "created order appears in list")
    ok("GET /api/orders lists orders")
  } catch (e) { fail("GET /api/orders", e) }

  // PUT /api/orders/[id] — update status
  try {
    const { status, body } = await api(`/api/orders/${createdId}`, {
      method: "PUT",
      body: JSON.stringify({ status: "delivered" }),
    })
    assert(status === 200, "update returns 200")
    ok(`PUT /api/orders/${createdId} updates status`)
  } catch (e) { fail("PUT /api/orders/[id]", e) }

  // DELETE /api/orders/[id] — delete
  try {
    const { status } = await api(`/api/orders/${createdId}`, { method: "DELETE" })
    assert(status === 200 || status === 204, `delete returns 200/204, got ${status}`)
    ok(`DELETE /api/orders/${createdId} deletes order`)
  } catch (e) { fail("DELETE /api/orders/[id]", e) }
}
