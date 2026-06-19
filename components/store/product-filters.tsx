"use client"

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { categories } from '@/lib/mock-data'
import { formatPrice } from '@/lib/mock-data'

const brands = ['Apple', 'Samsung', 'Sony', 'Dell', 'Xiaomi', 'Anker']
const ratings = [4, 3, 2, 1]

interface ProductFiltersProps {
  className?: string
}

export function ProductFilters({ className }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [priceRange, setPriceRange] = useState([0, 1000000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',') || []
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brand')?.split(',') || []
  )
  const [selectedRating, setSelectedRating] = useState<number | null>(
    searchParams.get('rating') ? parseInt(searchParams.get('rating')!) : null
  )

  const updateFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (selectedCategories.length > 0) {
      params.set('category', selectedCategories.join(','))
    } else {
      params.delete('category')
    }
    
    if (selectedBrands.length > 0) {
      params.set('brand', selectedBrands.join(','))
    } else {
      params.delete('brand')
    }
    
    if (selectedRating) {
      params.set('rating', selectedRating.toString())
    } else {
      params.delete('rating')
    }
    
    if (priceRange[0] > 0 || priceRange[1] < 1000000) {
      params.set('minPrice', priceRange[0].toString())
      params.set('maxPrice', priceRange[1].toString())
    } else {
      params.delete('minPrice')
      params.delete('maxPrice')
    }

    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedBrands([])
    setSelectedRating(null)
    setPriceRange([0, 1000000])
    router.push('/products')
  }

  const hasFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || selectedRating || priceRange[0] > 0 || priceRange[1] < 1000000

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
          <X className="w-4 h-4 mr-2" />
          Clear All Filters
        </Button>
      )}

      {/* Categories */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Categories
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`cat-${category.id}`}
                checked={selectedCategories.includes(category.slug)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedCategories([...selectedCategories, category.slug])
                  } else {
                    setSelectedCategories(selectedCategories.filter(c => c !== category.slug))
                  }
                }}
              />
              <Label htmlFor={`cat-${category.id}`} className="text-sm cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Price Range
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 pb-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={1000000}
            step={10000}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Brands */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Brands
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedBrands([...selectedBrands, brand])
                  } else {
                    setSelectedBrands(selectedBrands.filter(b => b !== brand))
                  }
                }}
              />
              <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Rating */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 font-medium">
          Rating
          <ChevronDown className="w-4 h-4" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {ratings.map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedRating === rating}
                onCheckedChange={(checked) => {
                  setSelectedRating(checked ? rating : null)
                }}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-1">
                {rating}+ Stars & Up
              </Label>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Apply Button */}
      <Button onClick={updateFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <aside className={`hidden lg:block w-64 shrink-0 ${className}`}>
        <div className="sticky top-24 bg-card rounded-lg border border-border p-4">
          <h2 className="font-semibold mb-4">Filters</h2>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filters */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="lg:hidden">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasFilters && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                {selectedCategories.length + selectedBrands.length + (selectedRating ? 1 : 0)}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FilterContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
