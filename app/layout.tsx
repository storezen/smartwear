import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/context/auth-context'
import { CartProvider } from '@/context/cart-context'
import { WishlistProvider } from '@/context/wishlist-context'
import { getSettings } from '@/lib/db'
import { TikTokPixelProvider } from '@/components/tiktok-pixel-provider'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Smartwear • Premium Watches & Accessories',
  description:
    'Premium Smart Watches, Analog Watches & Accessories in Pakistan. Timeless design, modern technology. Cash on Delivery across Pakistan. Shop the best watches online.',
  keywords:
    'smart watches pakistan, analog watches, luxury watches, watch accessories, premium watches karachi lahore, smartwatch pakistan, Smartwear',
  generator: 'next.js',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSettings()
  const pixelId = settings.tiktok_pixel_id || null

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} overflow-x-hidden`}
      data-scroll-behavior="smooth"
    >
      <body className="font-sans antialiased bg-[#0C0F14] text-white selection:bg-[#B8860B] selection:text-white overflow-x-hidden relative">
        <TikTokPixelProvider pixelId={pixelId} />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <Toaster position="top-center" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}