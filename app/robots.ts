import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_STORE_URL
    || process.env.NEXT_PUBLIC_VERCEL_URL
    || 'https://smartwear.pk'
  const storeUrl = `https://${baseUrl.replace(/^https?:\/\//, '')}`

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${storeUrl}/sitemap.xml`,
  }
}
