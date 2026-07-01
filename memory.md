# Session Memory: Ad Traffic Readiness

## Changes Made
1. **Image optimization enabled** - Removed `images.unoptimized: true`, added `remotePatterns` for `images.unsplash.com`, `cdn.shopify.com`, `plus.unsplash.com`
2. **Result**: Next.js will now serve optimized WebP images with responsive sizes, reducing bandwidth ~60-80%

## Traffic Capacity
- Vercel free tier can handle moderate ad traffic (200-2000 concurrent)
- Main bottleneck was image optimization (now fixed)
- API routes already have caching (`s-maxage=60, stale-while-revalidate=300`)
- Root layout stays `force-dynamic` for TikTok pixel freshness

## Recommended Future Improvements
- Move TikTok pixel ID fetch to client-side API call to allow layout caching
- Add Supabase directly for all DB operations (remove JSON file fallback)
- Consider Vercel Pro tier for higher concurrency limits
