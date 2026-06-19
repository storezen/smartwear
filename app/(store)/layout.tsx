import { PremiumNavbar } from '@/components/store/premium-navbar'
import { StoreFooter } from '@/components/store/store-footer'

/* Premium Store Layout
 * Clean, fast, with mobile bottom navigation
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <PremiumNavbar />
      <main className="flex-1 w-full">{children}</main>
      <StoreFooter />
    </div>
  )
}