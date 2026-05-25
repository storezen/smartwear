"use client"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { OrdersProvider } from "@/lib/orders-context"
import { ProductsProvider } from "@/lib/products-context"
import { CategoriesProvider } from "@/lib/categories-context"
import { CartProvider } from "@/lib/cart-context"
import { Toaster } from "sonner"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
    <ProductsProvider>
    <CategoriesProvider>
    <OrdersProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <div className="hidden lg:block">
          <div className="fixed left-0 top-0 z-30 h-full border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <Sidebar />
          </div>
        </div>

        <div className="flex flex-1 flex-col lg:pl-64">
          <div className="lg:hidden">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
              <Sheet>
                <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  <Sidebar />
                </SheetContent>
              </Sheet>
              <div className="flex flex-1 items-center justify-between">
                <span className="font-heading text-sm font-semibold tracking-tight text-foreground">SmartWear Admin</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
                  S
                </div>
              </div>
            </header>
          </div>

          <div className="hidden lg:block">
            <Topbar />
          </div>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
      <Toaster position="top-right" richColors closeButton />
    </OrdersProvider>
    </CategoriesProvider>
    </ProductsProvider>
    </CartProvider>
  )
}
