"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Package, Truck, CheckCircle2, AlertCircle, Clock, MapPin, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useOrderStore } from "@/store/useOrderStore"

function TrackingContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId") || ""
  const phone = searchParams.get("phone") || ""

  const { order, isLoading, error, fetchOrder } = useOrderStore()

  useEffect(() => {
    if (orderId && phone) {
      fetchOrder(orderId, phone)
    }
  }, [orderId, phone, fetchOrder])

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newOrderId = formData.get("orderId") as string
    const newPhone = formData.get("phone") as string
    if (newOrderId && newPhone) {
      router.push(`/track?orderId=${encodeURIComponent(newOrderId)}&phone=${encodeURIComponent(newPhone)}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="size-6 text-amber-500" />
      case "SHIPPED":
      case "DISPATCHED": return <Package className="size-6 text-blue-500" />
      case "OUT_FOR_DELIVERY": return <Truck className="size-6 text-fuchsia-500" />
      case "DELIVERED": return <CheckCircle2 className="size-6 text-emerald-500" />
      case "FAILED":
      case "RTO": return <XCircle className="size-6 text-red-500" />
      case "DELAYED": return <AlertCircle className="size-6 text-orange-500" />
      default: return <Package className="size-6 text-neutral-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Order Confirmed"
      case "SHIPPED":
      case "DISPATCHED": return "Dispatched"
      case "OUT_FOR_DELIVERY": return "Out for Delivery"
      case "DELIVERED": return "Delivered"
      case "FAILED":
      case "RTO": return "Delivery Failed"
      case "DELAYED": return "Delayed"
      default: return status
    }
  }

  const steps = ["pending", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"]
  let currentStepIndex = 0
  if (order) {
    if (order.status === "DELIVERED") currentStepIndex = 3
    else if (order.status === "OUT_FOR_DELIVERY") currentStepIndex = 2
    else if (order.status === "SHIPPED" || order.status === "DISPATCHED") currentStepIndex = 1
    else currentStepIndex = 0
  }

  return (
    <div className="min-h-screen bg-[#F6F8FA] pt-24 pb-12 px-4 sm:px-6">
      <div className="mx-auto max-w-xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold text-neutral-900 flex items-center justify-center gap-3">
            <Search className="size-8 text-fuchsia-500" /> Track Your Order
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-medium">Enter your details below to see live delivery status.</p>
        </motion.div>

        {!orderId || !phone || error ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60">
            <form onSubmit={handleSearch} className="space-y-6">
              {error && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="size-5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Order Number</Label>
                <Input 
                  name="orderId" 
                  defaultValue={orderId}
                  placeholder="e.g. ord_123456" 
                  required 
                  className="h-14 rounded-2xl border-neutral-200 bg-neutral-50 shadow-inner font-mono font-medium focus-visible:ring-fuchsia-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Phone Number</Label>
                <Input 
                  name="phone" 
                  defaultValue={phone}
                  placeholder="03001234567" 
                  required 
                  className="h-14 rounded-2xl border-neutral-200 bg-neutral-50 shadow-inner font-mono font-medium focus-visible:ring-fuchsia-500"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-base">
                {isLoading ? "Searching..." : "Track Order"}
              </Button>
            </form>
          </motion.div>
        ) : (
          order && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
              <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Order ID</p>
                    <p className="text-lg font-mono font-bold text-neutral-900">{order.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Status</p>
                    <p className={`text-lg font-bold ${order.status === 'DELIVERED' ? 'text-emerald-500' : 'text-fuchsia-500'}`}>
                      {getStatusText(order.status)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-12 mt-6">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-neutral-100 -translate-y-1/2 rounded-full" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-fuchsia-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                    style={{ width: `${(currentStepIndex / 3) * 100}%` }}
                  />
                  
                  <div className="relative flex justify-between">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIndex
                      const isCurrent = idx === currentStepIndex
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`size-10 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 shadow-sm
                            ${isCompleted ? 'bg-fuchsia-500 text-white' : 'bg-neutral-100 text-neutral-300'}`}
                          >
                            {isCompleted && idx === 3 ? <CheckCircle2 className="size-5" /> : 
                             isCompleted ? <div className="size-2.5 rounded-full bg-white" /> : null}
                          </div>
                          <span className={`absolute top-12 text-[10px] font-bold uppercase tracking-wider text-center w-24 -ml-12
                            ${isCurrent ? 'text-fuchsia-500' : isCompleted ? 'text-neutral-700' : 'text-neutral-300'}`}>
                            {getStatusText(step)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Order Details */}
                <div className="mt-16 bg-neutral-50/50 rounded-2xl p-5 border border-neutral-200/60 flex gap-4 items-center">
                  {order.productImage && (
                    <img src={order.productImage} alt={order.productName} className="size-16 rounded-xl object-cover bg-white shadow-sm border border-neutral-100" />
                  )}
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{order.productName}</p>
                    <p className="text-sm font-medium text-neutral-500 mt-0.5">Rs. {order.total.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Status History Timeline */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-200/60">
                  <h3 className="font-bold text-neutral-900 mb-6 flex items-center gap-2">
                    <MapPin className="size-5 text-neutral-400" /> Tracking History
                  </h3>
                  <div className="space-y-6">
                    {order.statusHistory.slice().reverse().map((history, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="bg-white rounded-full">
                            {getStatusIcon(history.status)}
                          </div>
                          {idx !== order.statusHistory.length - 1 && (
                            <div className="w-0.5 h-full bg-neutral-100 my-2" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="font-bold text-neutral-900">{getStatusText(history.status)}</p>
                          {history.location && (
                            <p className="text-sm font-medium text-neutral-500 mt-1 flex items-center gap-1">
                              <MapPin className="size-3" /> {history.location}
                            </p>
                          )}
                          {history.description && (
                            <p className="text-sm text-neutral-500 mt-1">{history.description}</p>
                          )}
                          <p className="text-xs font-bold text-neutral-400 mt-2 uppercase tracking-wide">
                            {new Date(history.timestamp).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        )}
      </div>
    </div>
  )
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F8FA] flex items-center justify-center"><p className="font-bold text-neutral-500 animate-pulse">Loading tracking engine...</p></div>}>
      <TrackingContent />
    </Suspense>
  )
}
