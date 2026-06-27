import { PremiumNavbar } from '@/components/store/premium-navbar'
import { StoreFooter } from '@/components/store/store-footer'
import { HeartbeatProvider } from '@/components/store/heartbeat-provider'
import { WhatsAppButton } from '@/components/store/whatsapp-button'

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col w-full max-w-full overflow-x-hidden">
      <HeartbeatProvider>
        <PremiumNavbar />
        <div className="h-[116px] md:h-[120px]" /> {/* spacer for fixed announcement bar + navbar */}
        <main className="flex-1 w-full">{children}</main>
        <StoreFooter />
        <WhatsAppButton />
      </HeartbeatProvider>
    </div>
  )
}