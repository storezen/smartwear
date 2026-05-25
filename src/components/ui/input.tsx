import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input/80 bg-white px-3 py-1.5 text-sm text-foreground shadow-xs transition-all duration-200",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground/60",
        "hover:border-input",
        "focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] focus-visible:outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_rgba(220,38,38,0.1)]",
        "dark:bg-white/5 dark:hover:border-input/60",
        className
      )}
      {...props}
    />
  )
}

export { Input }
