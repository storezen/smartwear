'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-border group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-2xl group-[.toaster]:text-foreground font-sans overflow-hidden",
          description: "group-[.toast]:text-foreground/60 group-[.toast]:text-[13px]",
          actionButton:
            "group-[.toast]:bg-[#B8860B] group-[.toast]:text-black group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-accent/5 group-[.toast]:text-foreground/40",
          icon: "group-[.toast]:text-[#B8860B]",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[15px]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
