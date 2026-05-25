import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://smartwear.com"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/dashboard/", "/api/", "/login", "/cart", "/checkout", "/search"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
