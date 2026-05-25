"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold text-foreground">Dashboard error</h2>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Something went wrong. Please try again.
      </p>
      <Button onClick={reset} className="mt-8 gap-2">
        <RefreshCw className="h-4 w-4" /> Try Again
      </Button>
    </div>
  )
}
