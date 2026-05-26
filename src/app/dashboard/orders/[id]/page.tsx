"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, ShoppingBag, User, Phone, MapPin, FileText, Package, CreditCard, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { useOrders, STATUS_FLOW, type OrderStatus } from "@/lib/orders-context"
import { toast } from "sonner"
import Link from "next/link"
import { ConfirmDialog } from "@/app/dashboard/sections/ConfirmDialog"

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  processing: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  shipped: "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  delivered: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
}

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending", processing: "Processing", shipped: "Shipped",
  delivered: "Delivered", cancelled: "Cancelled",
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { orders, updateOrderStatus, deleteOrder } = useOrders()
  const order = orders.find((o) => o.id === id)

  const [showDelete, setShowDelete] = useState(false)
  const [statusChangeLoading, setStatusChangeLoading] = useState<OrderStatus | null>(null)

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <ShoppingBag className="size-6 text-destructive/60" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">Order not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">No order with ID &quot;{id}&quot; exists.</p>
        <Link href="/dashboard/orders">
          <Button variant="outline" className="mt-6 gap-2">
            <ArrowLeft className="size-3.5" /> Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  const nextStatuses = STATUS_FLOW[order.status]

  function handleStatusChange(newStatus: OrderStatus) {
    setStatusChangeLoading(newStatus)
    setTimeout(() => {
      updateOrderStatus(order!.id, newStatus)
      setStatusChangeLoading(null)
      toast.success(`Order marked as ${statusLabels[newStatus]}`)
    }, 300)
  }

  function handleDelete() {
    deleteOrder(order!.id)
    toast.success("Order deleted")
    router.push("/dashboard/orders")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{order.id}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="ml-auto">
          <Button variant="outline" size="sm" onClick={() => setShowDelete(true)} className="gap-1.5 text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10">
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Package className="size-4 text-muted-foreground" /> Order Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {order.productImage && (
                    <img src={order.productImage} alt={order.productName} className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{order.productName}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Rs. {order.productPrice.toLocaleString()} × {order.quantity}</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">Rs. {order.total.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <CreditCard className="size-4 text-muted-foreground" /> Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.statusHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">No status history available.</p>
              ) : (
                <div className="relative space-y-0">
                  {order.statusHistory.map((entry, i) => (
                    <div key={i} className="flex gap-3 pb-4 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={`size-2.5 rounded-full ring-2 ring-background ${statusColors[entry.status].split(" ")[0]}`} />
                        {i < order.statusHistory.length - 1 && <div className="mt-1 w-px flex-1 bg-border" />}
                      </div>
                      <div className="min-w-0 flex-1 -mt-0.5">
                        <p className="text-sm font-medium text-foreground">{statusLabels[entry.status]}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <User className="size-4 text-muted-foreground" /> Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="size-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm text-foreground">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-muted-foreground shrink-0" />
                <a href={`tel:${order.phone}`} className="text-sm text-primary hover:underline">{order.phone}</a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">{order.address}</p>
                  <p className="text-xs text-muted-foreground">{order.city}</p>
                </div>
              </div>
              {order.notes && (
                <div className="flex items-start gap-2">
                  <FileText className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {order.aiTrustScore !== undefined && order.aiTrustScore !== null && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <span className="text-xl">{order.aiTrustScore >= 80 ? "🟢" : order.aiTrustScore >= 50 ? "🟡" : "🔴"}</span> AI Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">Trust Score</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${order.aiTrustScore >= 80 ? "bg-emerald-100 text-emerald-700" : order.aiTrustScore >= 50 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {order.aiTrustScore}%
                  </span>
                </div>
                {order.aiFraudReason && (
                  <div className="mt-2 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold block mb-1 text-foreground">AI Observation:</span>
                      {order.aiFraudReason}
                    </p>
                  </div>
                )}
                {order.aiAddressCorrected && (
                  <p className="text-[10px] text-fuchsia-600 font-bold bg-fuchsia-50 px-2 py-1 rounded w-fit">
                    ✨ Address was auto-corrected by AI
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              {nextStatuses.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  {order.status === "delivered" ? "Order has been delivered." : "Order has been cancelled."}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      onClick={() => handleStatusChange(s)}
                      disabled={statusChangeLoading === s}
                      className={`text-xs h-8 ${s === "cancelled" ? "bg-destructive hover:bg-destructive/90" : ""}`}
                    >
                      {statusChangeLoading === s ? "Updating..." : `Mark ${statusLabels[s]}`}
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">Rs. {order.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">Rs. {order.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete this order?"
        message={`This will permanently delete ${order.id}. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
