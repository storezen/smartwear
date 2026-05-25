import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ProductsProvider } from "@/lib/products-context";
import { CategoriesProvider } from "@/lib/categories-context";
import { TikTokPixelProvider } from "@/components/providers/tiktok-pixel-provider";
import { SEOHeadUpdater } from "@/components/providers/seo-head-updater";
import { ThemeInit } from "@/components/providers/theme-init";
import { SettingsHydrator } from "@/components/settings-hydrator";
import { prisma } from "@/lib/db/prisma";
import { CSS_VARS, LIGHT_THEME, type ThemeColorKey } from "@/lib/theme";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://smartwear.com"),
  title: {
    default: "SMARTWEAR — Premium Smart Watches & Accessories",
    template: "%s — SMARTWEAR",
  },
  description: "Premium smart watches and accessories curated for those who demand more from their tech. Shop the latest wearables at SMARTWEAR.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SMARTWEAR",
    title: "SMARTWEAR — Premium Smart Watches & Accessories",
    description: "Premium smart watches and accessories curated for those who demand more from their tech. Shop the latest wearables at SMARTWEAR.",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SMARTWEAR — Premium Smart Watches & Accessories",
    description: "Premium smart watches and accessories curated for those who demand more from their tech. Shop the latest wearables at SMARTWEAR.",
    images: ["/og-default.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme configuration server-side
  let styleObj: Record<string, string> = {}
  let tikTokPixelId = ""
  let tikTokEnabled = false
  let tikTokConfig = ""

  try {
    const [themeSetting, pixelSetting, enabledSetting, configSetting] = await Promise.all([
      prisma.storeSetting.findUnique({ where: { key: "theme" } }),
      prisma.storeSetting.findUnique({ where: { key: "TIKTOK_PIXEL_ID" } }),
      prisma.storeSetting.findUnique({ where: { key: "TIKTOK_PIXEL_ENABLED" } }),
      prisma.storeSetting.findUnique({ where: { key: "TIKTOK_CONFIG" } })
    ])
    
    tikTokPixelId = pixelSetting?.value || ""
    tikTokEnabled = enabledSetting?.value === "true"
    tikTokConfig = configSetting?.value || ""

    if (themeSetting) {
      const theme = JSON.parse(themeSetting.value)
      const config = theme.mode === "light" ? theme.light : theme.dark
      styleObj = Object.fromEntries(
        Object.entries(CSS_VARS).map(([key, val]) => [val, config[key as ThemeColorKey]])
      ) as Record<string, string>
    } else {
      styleObj = Object.fromEntries(
        Object.entries(CSS_VARS).map(([key, val]) => [val, LIGHT_THEME[key as ThemeColorKey]])
      ) as Record<string, string>
    }
  } catch {
    styleObj = Object.fromEntries(
      Object.entries(CSS_VARS).map(([key, val]) => [val, LIGHT_THEME[key as ThemeColorKey]])
    ) as Record<string, string>
  }

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F6F8FA] text-neutral-900">
        <ThemeInit />
        <SettingsHydrator />
        <TikTokPixelProvider pixelId={tikTokPixelId} enabled={tikTokEnabled} config={tikTokConfig}>
          <ProductsProvider>
          <CategoriesProvider>
          <SEOHeadUpdater />
          {children}
          </CategoriesProvider>
          </ProductsProvider>
        </TikTokPixelProvider>
      </body>
    </html>
  );
}
