import Link from "next/link"
import Image from "next/image"
import { TrustBanner } from "@/components/TrustBanner"
import { ProductCard } from "@/components/ProductCard"
import { prisma } from "@/lib/db/prisma"

export default async function HomePage() {
  // Fetch some featured products for the scroll snap section
  const featuredProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    take: 6,
    include: { images: true }
  })

  // Format products for ProductCard
  const productsForCards = featuredProducts.map(p => ({
    id: p.id,
    title: p.name,
    handle: p.handle,
    price: p.price,
    compareAtPrice: p.compareAtPrice || undefined,
    image: p.images[0]?.url || "/placeholder.jpg",
    isAvailable: p.status === "ACTIVE"
  }))

  return (
    <div className="flex flex-col bg-[#FAFAFA] min-h-screen">
      {/* 1. Edge-to-edge cinematic hero */}
      <section className="relative min-h-[85vh] w-full flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Background Video/Image simulation */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            fill 
            className="object-cover opacity-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAFAFA] mb-6">
            Demand More From Your Tech.
          </h1>
          <p className="text-lg md:text-xl text-[#FAFAFA]/70 mb-10 max-w-2xl font-medium">
            Premium smartwatches engineered for the modern aesthetic. Available nationwide with Cash on Delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              href="/products" 
              className="flex items-center justify-center rounded-full bg-[#FAFAFA] text-[#0A0A0A] px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              Shop Collection
            </Link>
            <a 
              href="https://wa.me/923001234567" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center rounded-full border border-[#FAFAFA]/20 text-[#FAFAFA] bg-transparent px-8 py-4 text-sm font-bold uppercase tracking-wider hover:bg-[#FAFAFA]/10 transition-colors"
            >
              Order via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 2. Trust Banner */}
      <TrustBanner />

      {/* 3. Bento-Box Categories */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Explore by Category</h2>
            <p className="text-[#0A0A0A]/60 mt-2 font-medium">Curated precision for every lifestyle.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px]">
          {/* Main Large Box */}
          <Link href="/categories/watches" className="group relative rounded-2xl overflow-hidden md:col-span-2 md:row-span-2 bg-[#F0F0F0] border border-[#E5E5E5]">
            <Image src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800" alt="Watches" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <h3 className="text-2xl font-bold text-white mb-2">Premium Watches</h3>
              <span className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2">
                Shop Now <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>

          {/* Small Box 1 */}
          <Link href="/categories/accessories" className="group relative rounded-2xl overflow-hidden md:col-span-2 bg-[#F0F0F0] border border-[#E5E5E5]">
            <Image src="https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?auto=format&fit=crop&q=80&w=800" alt="Accessories" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-xl font-bold text-white mb-1">Straps & Accessories</h3>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2">
                Shop Now <span className="transition-transform group-hover:translate-x-1">→</span>
              </span>
            </div>
          </Link>

          {/* Small Box 2 */}
          <Link href="/categories/charging" className="group relative rounded-2xl overflow-hidden md:col-span-1 bg-[#F0F0F0] border border-[#E5E5E5]">
            <Image src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400" alt="Charging" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-lg font-bold text-white mb-1">Charging</h3>
            </div>
          </Link>

          {/* Small Box 3 */}
          <Link href="/categories/protection" className="group relative rounded-2xl overflow-hidden md:col-span-1 bg-[#F0F0F0] border border-[#E5E5E5]">
            <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400" alt="Protection" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-lg font-bold text-white mb-1">Protection</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* 4. Featured Products (Horizontal Scroll Snap) */}
      <section className="py-24 border-t border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1600px] mx-auto">
          <div className="px-4 sm:px-6 lg:px-8 mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Trending Now</h2>
              <p className="text-[#0A0A0A]/60 mt-2 font-medium">The most coveted smartwear pieces.</p>
            </div>
            <Link href="/products" className="hidden sm:flex text-sm font-bold uppercase tracking-wider text-[#0A0A0A] hover:opacity-70 transition-opacity items-center gap-2">
              View All <span className="text-lg">→</span>
            </Link>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 sm:px-6 lg:px-8 gap-6 md:gap-8">
            {productsForCards.map((product) => (
              <div key={product.id} className="min-w-[280px] md:min-w-[320px] w-full max-w-[320px] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
