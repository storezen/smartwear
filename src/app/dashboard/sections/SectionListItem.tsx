"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Layout, LayoutList, Sparkles, Award, ShieldCheck, Megaphone, Mail, MessageSquare, HelpCircle, BookOpen, Camera, Image as ImageIcon, TrendingUp, LayoutGrid, Shuffle, Newspaper } from "lucide-react"
import { cn } from "@/lib/utils"

export const iconMap: Record<string, React.ElementType> = {
  hero: Layout, categories: LayoutList, newArrivals: Sparkles,
  bestSellers: Award, features: ShieldCheck, promoBanner: Megaphone,
  newsletter: Mail, testimonials: MessageSquare, faq: HelpCircle,
  brandStory: BookOpen, instagram: Camera, featuredCollection: ImageIcon,
  brandLogos: Award, stats: TrendingUp, lookbook: LayoutGrid,
  process: Shuffle, press: Newspaper,
}

export const labelMap: Record<string, string> = {
  hero: "Hero", categories: "Categories", newArrivals: "New Arrivals",
  bestSellers: "Best Sellers", features: "Trust Badges", promoBanner: "Promo Banner",
  newsletter: "Newsletter", testimonials: "Testimonials", faq: "FAQ",
  brandStory: "Brand Story", instagram: "Instagram Feed",
  featuredCollection: "Featured Collection", brandLogos: "Brand Logos",
  stats: "Stats", lookbook: "Lookbook", process: "How It Works", press: "Press",
}

interface SectionListItemProps {
  sectionKey: string
  isActive: boolean
  isSelected: boolean
  onSelect: () => void
  onToggle: (active: boolean) => void
}

export function SectionListItem({ sectionKey, isActive, isSelected, onSelect, onToggle }: SectionListItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: sectionKey })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  }

  const Icon = iconMap[sectionKey] || Layout
  const label = labelMap[sectionKey] || sectionKey

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg border px-3 py-2.5 transition-all cursor-pointer",
        isSelected
          ? "border-primary bg-primary/5"
          : isActive
            ? "border-border bg-card hover:border-primary/30 hover:bg-muted/30"
            : "border-border/60 bg-muted/40 opacity-55 hover:opacity-80",
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/70"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical className="size-4" />
      </button>

      <div className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-md",
        isSelected ? "bg-primary text-primary-foreground" : isActive ? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground/60",
      )}>
        <Icon className="size-3.5" />
      </div>

      <div className="min-w-0 flex-1">
        <p className={cn("text-sm font-medium leading-tight", isActive || isSelected ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {isActive ? (
          <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">Visible</span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground/60">Hidden</span>
        )}
        <label onClick={(e) => e.stopPropagation()} className="flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => onToggle(e.target.checked)}
            className="size-4 rounded accent-primary"
          />
        </label>
      </div>
    </div>
  )
}
