"use client"

import { CartProvider } from "@/lib/cart-context"
import { OrdersProvider } from "@/lib/orders-context"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { MobileBottomNav } from "@/components/MobileBottomNav"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { Toaster } from "sonner"
import { cn } from "@/lib/utils"

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <OrdersProvider>
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]",
          "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg"
        )}
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content" className="flex-1 animate-fade-up pb-16 lg:pb-0 bg-[#FAFAFA] min-h-screen">
        {children}
      </main>
      <MobileBottomNav />
      <FloatingWhatsApp />
      <Footer />
      <Toaster position="top-right" richColors closeButton />
    </OrdersProvider>
    </CartProvider>
  )
}
