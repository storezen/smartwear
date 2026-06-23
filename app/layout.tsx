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
  const pixelId = settings.tiktok_pixel_id || process.env.TIKTOK_PIXEL_ID || null

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} overflow-x-hidden`}
      data-scroll-behavior="smooth"
    >
      <head>
        {pixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
ttq.load("${pixelId}");
ttq.page();
}(window,document,"ttq");
              `,
            }}
          />
        )}
      </head>
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