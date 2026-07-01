/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
  experimental: {
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.module.css'],
    },
  },
}

export default nextConfig
