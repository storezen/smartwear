import { testProducts } from "./api/products.test"
import { testCategories } from "./api/categories.test"
import { testOrders } from "./api/orders.test"
import { testAuth } from "./api/auth.test"
import { testSettings } from "./api/settings.test"
import { testCoupons } from "./api/coupons.test"
import { testContact } from "./api/contact.test"
import { summary, authenticate } from "./api/helpers"

async function main() {
  console.log("SMARTWEAR API Integration Tests")
  console.log("==============================")
  console.log("Ensure the dev server is running: npm run dev\n")

  await authenticate()

  await testProducts()
  await testCategories()
  await testOrders()
  await testAuth()
  await testSettings()
  await testCoupons()
  await testContact()

  summary()
}

main().catch((e) => {
  console.error("Fatal:", e)
  process.exit(1)
})
