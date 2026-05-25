import type { MetadataRoute } from "next"

const routes = [
  "", "/products", "/categories", "/cart", "/checkout",
  "/about", "/contact", "/shipping", "/returns", "/warranty",
  "/privacy", "/terms", "/careers",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://smartwear.com${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }))
}
