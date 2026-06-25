/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      resolveExtensions: ['.js', '.jsx', '.ts', '.tsx', '.css', '.module.css'],
    },
  },
}

export default nextConfig
