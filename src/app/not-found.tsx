import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4">
      <div className="text-center">
        <p className="font-heading text-7xl font-bold tracking-tighter text-primary/10 sm:text-8xl">404</p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Button className="mt-8 gap-2">
            <Home className="h-4 w-4" /> Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
