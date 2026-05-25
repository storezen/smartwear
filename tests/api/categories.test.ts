import { api, assert, assertEqual, ok, fail } from "./helpers"

export async function testCategories() {
  console.log("\n=== Categories API ===")

  // GET /api/categories — list
  try {
    const { status, body } = await api("/api/categories")
    assert(status === 200, "list returns 200")
    assert(Array.isArray(body), "list returns array")
    ok("GET /api/categories returns category list")
  } catch (e) { fail("GET /api/categories", e) }

  // POST /api/categories — create
  let createdId: string
  try {
    const { status, body } = await api("/api/categories", {
      method: "POST",
      body: JSON.stringify({
        name: "Test Category", slug: "test-category",
        description: "A test category", active: true,
      }),
    })
    assert(status === 200 || status === 201, `create returns 200/201, got ${status}`)
    assert(body?.id, "create returns id")
    assertEqual(body.name, "Test Category", "create name")
    assertEqual(body.slug, "test-category", "create slug")
    createdId = body.id || body.slug
    ok("POST /api/categories creates category")
  } catch (e) { fail("POST /api/categories", e); return }

  // PUT /api/categories/[id] — update
  try {
    const { status, body } = await api(`/api/categories/${createdId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: "Updated Category", slug: "test-category",
        description: "Updated description", active: true,
      }),
    })
    assert(status === 200, "update returns 200")
    assertEqual(body.name, "Updated Category", "update name")
    ok(`PUT /api/categories/${createdId} updates category`)
  } catch (e) { fail("PUT /api/categories/[id]", e) }

  // DELETE /api/categories/[id] — delete
  try {
    const { status } = await api(`/api/categories/${createdId}`, { method: "DELETE" })
    assert(status === 200 || status === 204, `delete returns 200/204, got ${status}`)
    ok(`DELETE /api/categories/${createdId} deletes category`)
  } catch (e) { fail("DELETE /api/categories/[id]", e) }
}
