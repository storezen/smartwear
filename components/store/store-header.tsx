"use client"

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCart } from '@/context/cart-context'
import { useWishlist } from '@/context/wishlist-context'
import { useAuth } from '@/context/auth-context'
import { categories, products, formatPrice } from '@/lib/mock-data'
import Image from 'next/image'

export function StoreHeader() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof products>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const { itemCount } = useCart()
  const { itemCount: wishlistCount } = useWishlist()
  const { isAuthenticated, user, logout } = useAuth()

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase()
      const results = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.name.toLowerCase().includes(query)
      ).slice(0, 6)
      setSearchResults(results)
      setShowDropdown(true)
    } else {
      setSearchResults([])
      setShowDropdown(false)
    }
  }, [searchQuery])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      setShowDropdown(false)
    }
  }

  const handleProductClick = (slug: string) => {
    router.push(`/products/${slug}`)
    setShowDropdown(false)
    setSearchQuery('')
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9 text-xs">
            <div className="flex items-center gap-4">
              <span className="hidden sm:flex items-center gap-1">
                <Phone className="w-3 h-3" />
                0800-TECHMART
              </span>
              <span>Free Delivery on Orders Above Rs. 10,000</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/track-order" className="hover:underline">Track Order</Link>
              <Link href="/help" className="hover:underline hidden sm:block">Help</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">TechMart</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                Categories <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.id} asChild>
                    <Link href={`/products?category=${category.slug}`}>
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/products" className="font-medium">
                    All Products
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href="/products?featured=true" className="text-sm font-medium hover:text-primary transition-colors">
              Featured
            </Link>
            <Link href="/products?sale=true" className="text-sm font-medium hover:text-primary transition-colors">
              Sale
            </Link>
            <Link href="/brands" className="text-sm font-medium hover:text-primary transition-colors">
              Brands
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-secondary border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowDropdown(true)}
              />
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer border-b border-border last:border-0"
                      onClick={() => handleProductClick(product.slug)}
                    >
                      <div className="w-12 h-12 relative rounded-md overflow-hidden bg-secondary shrink-0">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                      </div>
                      <div className="shrink-0">
                        <p className="text-sm font-medium text-primary">
                          {formatPrice(product.price)}
                        </p>
                        {product.compare_price && (
                          <p className="text-xs text-muted-foreground line-through">
                            {formatPrice(product.compare_price)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 border-t border-border">
                    <Button type="submit" variant="ghost" className="w-full text-sm">
                      View all results for "{searchQuery}"
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {wishlistCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist">Wishlist</Link>
                  </DropdownMenuItem>
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="text-primary font-medium">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  Login
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="pb-4 md:hidden">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-secondary border-0"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            <Link
              href="/products"
              className="block py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="block py-2 text-sm text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <Link
                href="/products?featured=true"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Featured
              </Link>
              <Link
                href="/products?sale=true"
                className="block py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sale
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}