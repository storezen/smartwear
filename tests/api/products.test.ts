import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testProducts() {
  console.log("\n=== Products API ===")

  // GET /api/products — list
  try {
    const { status, body } = await api("/api/products")
    assert(status === 200, "list returns 200")
    assert(Array.isArray(body), "list returns array")
    ok("GET /api/products returns product list")
  } catch (e) { fail("GET /api/products", e) }

  // POST /api/products — create
  let createdId: string
  try {
    const { status, body } = await api("/api/products", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Watch", price: 4999, category: "Smart Watches",
        description: "A test product", image: "https://via.placeholder.com/400",
        inStock: true, quantity: 50, sku: "TEST-001",
      }),
    })
    assert(status === 200 || status === 201, `create returns 200/201, got ${status}`)
    assert(body?.id, "create returns id")
    assertEqual(body.name, "Test Watch", "create name")
    createdId = body.id
    ok("POST /api/products creates product")
  } catch (e) { fail("POST /api/products", e); return }

  // GET /api/products/[id] — single
  try {
    const { status, body } = await api(`/api/products/${createdId}`)
    assert(status === 200, "get single returns 200")
    assertEqual(body.id, createdId, "get single id")
    assertEqual(body.name, "Test Watch", "get single name")
    ok(`GET /api/products/${createdId} returns product`)
  } catch (e) { fail("GET /api/products/[id]", e) }

  // PUT /api/products/[id] — update
  try {
    const { status, body } = await api(`/api/products/${createdId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: "Updated Watch", price: 5999, category: "Smart Watches",
        description: "Updated", image: "https://via.placeholder.com/400",
        inStock: true, quantity: 30, sku: "TEST-001",
      }),
    })
    assert(status === 200, "update returns 200")
    assertEqual(body.name, "Updated Watch", "update name")
    ok(`PUT /api/products/${createdId} updates product`)
  } catch (e) { fail("PUT /api/products/[id]", e) }

  // DELETE /api/products/[id] — delete
  try {
    const { status } = await api(`/api/products/${createdId}`, { method: "DELETE" })
    assert(status === 200 || status === 204, `delete returns 200/204, got ${status}`)
    const { body: afterDelete } = await api(`/api/products/${createdId}`)
    assert(!afterDelete || (afterDelete as any)?.error, "deleted product not found")
    ok(`DELETE /api/products/${createdId} deletes product`)
  } catch (e) { fail("DELETE /api/products/[id]", e) }
}
