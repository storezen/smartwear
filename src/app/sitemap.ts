import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartwear.com"

const routes = [
  "", "/products", "/categories", "/cart", "/checkout",
  "/about", "/contact", "/shipping", "/returns", "/warranty",
  "/privacy", "/terms", "/careers",
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }))
}
