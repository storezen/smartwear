"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { toast } from "sonner"

const STORED_PASSWORD_KEY = "smartwear-admin-password"

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim()) {
      toast.error("Enter the admin password")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      })
      if (!res.ok) {
        toast.error("Incorrect password")
        setLoading(false)
        return
      }
      router.push("/dashboard")
    } catch {
      toast.error("Could not connect. Try again.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F8FA] px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="px-8 pt-10 pb-6 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[16px] bg-neutral-50 border border-neutral-200/60 shadow-sm">
            <Lock className="h-6 w-6 text-neutral-600" strokeWidth={1.5} />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-neutral-900 tracking-tight">Admin Access</h1>
          <p className="mt-2 text-sm text-neutral-500">Enter your password to manage the store</p>
        </div>
        <div className="px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-neutral-900">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-[48px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPw ? <EyeOff className="h-5 w-5" strokeWidth={1.5} /> : <Eye className="h-5 w-5" strokeWidth={1.5} />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full h-[48px] bg-neutral-950 hover:bg-neutral-800 text-white font-bold rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm tracking-wide shadow-[0_8px_30px_rgb(0,0,0,0.08)]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
