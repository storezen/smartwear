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
            "group toast group-[.toaster]:bg-[#0C0F14]/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border-white/10 group-[.toaster]:shadow-[0_8px_32px_rgba(0,0,0,0.4)] group-[.toaster]:rounded-2xl group-[.toaster]:text-white font-sans overflow-hidden",
          description: "group-[.toast]:text-white/60 group-[.toast]:text-[13px]",
          actionButton:
            "group-[.toast]:bg-[#B8860B] group-[.toast]:text-white group-[.toast]:font-semibold",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-white/40",
          icon: "group-[.toast]:text-[#B8860B]",
          title: "group-[.toast]:font-semibold group-[.toast]:text-[15px]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
