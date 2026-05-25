import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-lg border border-input/80 bg-white px-3 py-2 text-sm text-foreground shadow-xs transition-all duration-200",
        "placeholder:text-muted-foreground/60",
        "hover:border-input",
        "focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]",
        "dark:bg-white/5 dark:hover:border-input/60",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
