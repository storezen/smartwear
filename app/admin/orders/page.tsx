"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Search, Truck, CheckCircle2, AlertCircle, ChevronRight, Phone, X, History, MessageSquare, RotateCw, Edit3, Package, MapPin, User, CreditCard } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { toast } from "sonner"
import { ORDER_STATUSES } from "@/lib/validations/orders"
import { detectProvince } from "@/lib/address-validator"
import { CitySelect } from "@/components/ui/city-select"
import dynamic from "next/dynamic"

const AddressMap = dynamic(() => import("@/components/ui/address-map"), { ssr: false })

const ALL_STATUSES = ORDER_STATUSES;

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UnBooked: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Booked: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  Transferred: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  'PostEx Warehouse': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Out For Delivery': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  Attempted: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Out For Return': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  Returned: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Delivery Under Review': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'Un-Assigned By Me': 'bg-white/10 text-white/40 border-white/10',
  Lost: 'bg-red-500/10 text-red-400 border-red-500/20',
  Stolen: 'bg-red-500/10 text-red-400 border-red-500/20',
  Damage: 'bg-red-500/10 text-red-400 border-red-500/20',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
}

function statusStyle(status: string): string {
  return STATUS_STYLES[status] || 'bg-white/10 text-white/60 border-white/20'
}

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [showPostexModal, setShowPostexModal] = useState(false)
  const [postexForm, setPostexForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    amount: 0,
    orderDetail: "",
    pickupAddressCode: "001",
    bookingWeight: 0.3,
    orderType: "Normal",
  })

  const POSTEX_ORDER_TYPES = [
    "Normal",
    "Express",
    "Fragile",
    "Liquid",
    "Electronics",
    "Food",
    "Clothing",
    "Documents",
    "Others",
  ]
  const [postexBooking, setPostexBooking] = useState(false)

  const openPostexModal = (order: any) => {
    const items = order.items || []
    const orderDetail = items.map((i: any) => `${i.quantity} x ${i.name}`).join(", ")
    setPostexForm({
      customerName: order.customer_name || order.shipping_address?.name || "Guest",
      phone: order.phone || order.shipping_address?.phone || "03000000000",
      address: order.shipping_address?.address_line1 || "No Address provided",
    city: order.shipping_address?.city || "Unknown",
    province: detectProvince(order.shipping_address?.city || ""),
    amount: order.total || 0,
    orderDetail: orderDetail ? `[${orderDetail}]` : "",
    pickupAddressCode: "001",
    bookingWeight: 0.3,
    orderType: "Normal",
    })
    setShowPostexModal(true)
  }

  const confirmPostexBooking = async (orderId: string) => {
    setPostexBooking(true)
    try {
      const res = await fetch("/api/postex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...postexForm }),
      })
      if (res.ok) {
        const data = await res.json()
        setShowPostexModal(false)
        return data.trackingNumber as string
      } else {
        const err = await res.text()
        toast.error(`PostEx: ${err}`)
        return null
      }
    } catch {
      toast.error("Failed to book on PostEx")
      return null
    } finally {
      setPostexBooking(false)
    }
  }

  const toggleOrderSelection = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation()
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    )
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (!confirm(`Update ${selectedOrders.length} orders to ${status}?`)) return
    
    // Process sequentially to not overload
    for (const id of selectedOrders) {
      await updateOrderStatus(id, status, "Bulk status update")
    }
    
    setSelectedOrders([])
    toast.success(`Successfully updated ${selectedOrders.length} orders`)
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to completely DELETE ${selectedOrders.length} orders? This cannot be undone.`)) return
    
    try {
      const res = await fetch('/api/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedOrders })
      })
      
      if (res.ok) {
        setOrders(orders.filter(o => !selectedOrders.includes(o.id)))
        setSelectedOrders([])
        toast.success(`Successfully deleted ${selectedOrders.length} orders`)
      } else {
        toast.error('Failed to delete orders')
      }
    } catch (e) {
      toast.error('An error occurred while deleting')
    }
  }

  const handleSelectAll = () => {
    const currentViewOrders = orders.filter(o => activeTab === 'All' || o.status === activeTab)
    if (selectedOrders.length === currentViewOrders.length && currentViewOrders.length > 0) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(currentViewOrders.map(o => o.id))
    }
  }

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders')
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data)) {
        setOrders(data)
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    pollRef.current = setInterval(fetchOrders, 8000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [fetchOrders])

  const updateOrderStatus = async (orderId: string, status: string, additionalNote?: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return;

    try {
      let postexTrackingId = order.postex || null

      if (status === 'Booked' && !postexTrackingId) {
        openPostexModal(order)
        return
      }

      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status, postexId: postexTrackingId, note: additionalNote })
      })

      if (res.ok) {
        const { order: updatedOrder } = await res.json()
        setOrders(orders.map(o => o.id === order.id ? updatedOrder : o))
        if (selectedOrder?.id === order.id) setSelectedOrder(updatedOrder)
        toast.success(`Order ${order.id} updated`)
        setNewNote("")
      } else {
        toast.error(`Failed to update order ${order.id}`)
      }
    } catch (e) {
      toast.error("An error occurred while updating the order")
      console.error(e)
    }
  }

  const handlePostexConfirm = async () => {
    const orderId = selectedOrder?.id
    if (!orderId) return
    const trackingNumber = await confirmPostexBooking(orderId)
    if (trackingNumber) {
      toast.success(`Booked on PostEx! Tracking: ${trackingNumber}`)
      await updateOrderStatusAfterBooking(orderId, trackingNumber)
    }
  }

  const updateOrderStatusAfterBooking = async (orderId: string, trackingNumber: string) => {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status: 'Booked', postexId: trackingNumber }),
    })
    if (res.ok) {
      const { order: updatedOrder } = await res.json()
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
      if (selectedOrder?.id === orderId) setSelectedOrder(updatedOrder)
    } else {
      toast.error('Order status update failed')
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedOrder) return;
    updateOrderStatus(selectedOrder.id, selectedOrder.status, newNote.trim())
  }

  const refreshOrderStatus = async () => {
    if (!selectedOrder) return
    fetchOrders()
    toast.success("Order status refreshed")
  }

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight mb-1">Orders Management</h1>
          <p className="text-white/60 text-[12px]">Professional OMS for tracking and fulfillment.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ORD-..." 
              className="bg-white/5 border border-white/10 text-white rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <button 
            onClick={() => window.open('/api/admin/export', '_blank')}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-[11px] font-medium"
          >
            Export CSV
          </button>
          <button 
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-[11px] font-medium"
          >
            Select All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-white/10 pb-3 overflow-x-auto">
        {['All', ...ALL_STATUSES].map(tab => {
          const count = (orders || []).filter(o => o.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === tab 
                ? 'bg-[#B8860B] text-white shadow-[0_0_12px_rgba(184,134,11,0.3)]' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab}
              {count > 0 && <span className={`px-1 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#B8860B]/20 border border-[#B8860B]/30 rounded-lg p-2.5 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-medium text-[12px]">{selectedOrders.length} orders selected</span>
            <button onClick={() => setSelectedOrders([])} className="text-white/60 hover:text-white text-[10px] underline">Clear</button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/60 text-[10px] mr-1">Change to:</span>
            {['Processing', 'Booked', 'Delivered', 'Cancelled'].map(status => (
              <button 
                key={status}
                onClick={() => handleBulkStatusUpdate(status)}
                className="bg-white/10 hover:bg-white/20 text-white text-[10px] px-2 py-1 rounded-lg transition-colors"
              >
                {status}
              </button>
            ))}
            <div className="w-px h-3 bg-white/20 mx-1"></div>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] px-2 py-1 rounded-lg transition-colors border border-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="text-center py-8 text-white/50 text-[12px]">Loading orders...</div>
        ) : (orders || []).filter(o => activeTab === 'All' || o.status === activeTab).length === 0 ? (
          <div className="text-center py-8 text-white/50 text-[12px]">No orders found.</div>
        ) : (orders || []).filter(o => activeTab === 'All' || o.status === activeTab).map((order) => (
          <SpotlightCard key={order.id} className="p-0 overflow-hidden cursor-pointer hover:border-[#B8860B]/30 transition-colors" onClick={() => openOrderDetail(order)}>
            <div className="flex flex-col lg:flex-row lg:items-center pointer-events-none p-3 gap-3">
              
              {/* Left Section: Checkbox & Order ID */}
              <div className="flex items-center gap-3 min-w-[160px]">
                {/* Checkbox */}
                <div 
                  className="w-5 h-5 z-10 pointer-events-auto flex items-center justify-center cursor-pointer flex-shrink-0"
                  onClick={(e) => toggleOrderSelection(e, order.id)}
                >
                  <div className={`w-3.5 h-3.5 rounded border transition-colors flex items-center justify-center ${
                    selectedOrders.includes(order.id) 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/30 bg-white/5 hover:border-white/60'
                  }`}>
                    {selectedOrders.includes(order.id) && <CheckCircle2 className="w-2.5 h-2.5 text-black" />}
                  </div>
                </div>

                {/* Order ID & Date */}
                <div>
                  <h3 className="text-sm font-bold text-white hover:underline cursor-pointer pointer-events-auto" onClick={() => openOrderDetail(order)}>{order.id}</h3>
                  <p className="text-xs text-white/50 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Middle Section: Customer & Location */}
              <div className="flex-1 min-w-[200px]">
                <p className="text-sm text-white/90 font-medium truncate flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white/70 font-bold uppercase">
                    {order.customer_name?.charAt(0) || '?'}
                  </div>
                  {order.customer_name}
                </p>
                <p className="text-xs text-white/50 mt-1 flex items-center gap-1 pl-7">
                  {order.shipping_address?.city || 'N/A'}, {order.phone}
                </p>
              </div>

              {/* Right Section: Status & Total */}
              <div className="flex items-center justify-between lg:justify-end gap-6 w-full lg:w-auto mt-2 lg:mt-0">
                {/* Status */}
                <div className="w-[100px]">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${statusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Total & Items */}
                <div className="w-[100px] text-right">
                  <p className="text-sm font-semibold text-white">₨ {order.total.toLocaleString()}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{order.items?.length || 0} items</p>
                </div>

                {/* Action / Arrow */}
                <div className="w-6 flex justify-end">
                  <ChevronRight className="w-4 h-4 text-white/30" />
                </div>
              </div>
              
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Order Detail Modal */}
      {sheetOpen && selectedOrder && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSheetOpen(false)}>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#0a0a0a] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    {selectedOrder.id}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyle(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </h2>
                  <p className="text-xs text-white/50 mt-0.5">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSheetOpen(false)} className="text-white/40 hover:text-white/70 bg-white/5 p-2 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left Column: Items + Customer ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* Items */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414] flex items-center gap-2">
                      <Package className="w-4 h-4 text-white/50" />
                      <h3 className="font-semibold text-white/90">Order Items</h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {selectedOrder.items?.map((item: any, i: number) => (
                        <div key={i} className="p-4 flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#1a1a1a] rounded-lg border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                            {item.image ? <Image src={item.image} alt="" fill sizes="56px" className="object-cover"/> : <Package className="w-5 h-5 text-white/20" />}
                            <span className="absolute -top-2 -right-2 bg-[#B8860B] text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/90 truncate">{item.name}</p>
                            <div className="flex items-center gap-3 mt-1">
                              {item.color && <p className="text-xs text-white/50">Color: {item.color}</p>}
                              <p className="text-xs text-white/50">{item.variant || 'Default'}</p>
                            </div>
                          </div>
                          <p className="text-sm font-semibold text-white/80 whitespace-nowrap">₨ {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>

                    {/* Payment Summary */}
                    <div className="p-4 border-t border-white/5 bg-[#141414] space-y-2">
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Subtotal</span>
                        <span>₨ {selectedOrder.subtotal?.toLocaleString() || selectedOrder.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm text-white/60">
                        <span>Shipping</span>
                        <span>₨ {selectedOrder.shipping_fee || 0}</span>
                      </div>
                      {(selectedOrder.discount > 0) && (
                        <div className="flex justify-between text-sm text-emerald-400/80">
                          <span>Discount</span>
                          <span>- ₨ {selectedOrder.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-medium text-white pt-2 border-t border-white/5 mt-2">
                        <span>Total</span>
                        <span>₨ {selectedOrder.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs text-white/50 pt-1">
                        <span className="flex items-center gap-1.5"><CreditCard className="w-3 h-3" /> Payment Method</span>
                        <span className="uppercase">{selectedOrder.payment_method || 'COD'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer & Address */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414] flex items-center gap-2">
                      <User className="w-4 h-4 text-white/50" />
                      <h3 className="font-semibold text-white/90">Customer Details</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Name</p>
                          <p className="text-sm font-medium text-white/90">{selectedOrder.customer_name}</p>
                        </div>
                        <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Phone</p>
                          <p className="text-sm font-medium text-white/90">{selectedOrder.phone}</p>
                        </div>
                        {selectedOrder.email && (
                          <div className="bg-[#141414] p-3 rounded-lg border border-white/5">
                            <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Email</p>
                            <p className="text-sm font-medium text-white/90 truncate">{selectedOrder.email}</p>
                          </div>
                        )}
                        <div className="md:col-span-2 bg-[#141414] p-3 rounded-lg border border-white/5">
                          <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Shipping Address</p>
                          <p className="text-sm text-white/90">{selectedOrder.shipping_address?.address_line1}</p>
                          {selectedOrder.shipping_address?.city && (
                            <p className="text-sm text-white/70">{selectedOrder.shipping_address.city}{selectedOrder.shipping_address.country ? `, ${selectedOrder.shipping_address.country}` : ''}</p>
                          )}
                        </div>
                        {selectedOrder.shipping_address?.city && (
                          <div className="md:col-span-2">
                            <AddressMap onSelect={(result) => {
                              toast.success(`Location: ${result.city || result.formattedAddress.slice(0, 50)}`)
                            }} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* ── Right Column: Status + Timeline + PostEx + Notes ── */}
                <div className="space-y-6">

                  {/* Status Update */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414]">
                      <h3 className="font-semibold text-white/90">Update Status</h3>
                    </div>
                    <div className="p-4 max-h-[280px] overflow-y-auto space-y-1">
                      {ALL_STATUSES.map(status => (
                        <button
                          key={status}
                          onClick={() => updateOrderStatus(selectedOrder.id, status)}
                          disabled={selectedOrder.status === status}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left ${
                            selectedOrder.status === status 
                              ? 'bg-[#1a1a1a] border-white/20 text-white cursor-default' 
                              : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {selectedOrder.status === status ? (
                            <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#B8860B]"/> {status}</span>
                          ) : status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PostEx Tracking */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414] flex items-center justify-between">
                      <h3 className="font-semibold text-white/90 flex items-center gap-2"><Truck className="w-4 h-4 text-white/50"/> PostEx</h3>
                      <button onClick={refreshOrderStatus} className="text-white/40 hover:text-white transition-colors" title="Refresh status">
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-4">
                      {selectedOrder.postex ? (
                        <div className="space-y-3">
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                            <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider mb-1">Tracking ID</p>
                            <p className="font-mono text-sm text-white/90 break-all">{selectedOrder.postex}</p>
                          </div>
                          {selectedOrder.postex_charges && (
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { label: "Shipping Fee", key: "transactionFee", format: (v: number) => `Rs. ${v?.toLocaleString()}` },
                                { label: "Tax", key: "transactionTax", format: (v: number) => `Rs. ${v?.toLocaleString()}` },
                                { label: "Upfront Payment", key: "upfrontPayment", format: (v: number) => `Rs. ${v?.toLocaleString()}` },
                                { label: "Balance Payment", key: "balancePayment", format: (v: number) => `Rs. ${v?.toLocaleString()}` },
                              ].filter(({ key }) => selectedOrder.postex_charges[key] != null).map(({ label, key, format }) => (
                                <div key={key} className="bg-white/5 rounded-lg p-2.5">
                                  <p className="text-[9px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
                                  <p className="text-sm font-mono text-white/80">{format(selectedOrder.postex_charges[key])}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <a href={`https://postex.pk/track?tracking=${selectedOrder.postex}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2 rounded-lg text-xs font-medium transition-colors">
                            Track on PostEx →
                          </a>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-white/50">Not yet booked on PostEx.</p>
                          <button onClick={() => { updateOrderStatus(selectedOrder.id, 'Booked') }} className="w-full bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all flex items-center justify-center gap-2">
                            <Truck className="w-3.5 h-3.5" /> Send to PostEx
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414]">
                      <h3 className="font-semibold text-white/90 flex items-center gap-2"><History className="w-4 h-4 text-white/50"/> Timeline</h3>
                    </div>
                    <div className="p-4 max-h-[300px] overflow-y-auto">
                      <div className="space-y-4 pl-2 border-l-2 border-white/10 ml-2">
                        {selectedOrder.history?.map((event: any, i: number) => (
                          <div key={i} className="relative pl-5">
                            <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full bg-[#B8860B] border-2 border-[#D4A017]" />
                            <p className="text-sm font-medium text-white/90">{event.status}</p>
                            {event.note && <p className="text-xs text-white/60 mt-0.5">{event.note}</p>}
                            <p className="text-[10px] text-white/40 mt-0.5">{new Date(event.timestamp).toLocaleString()}</p>
                          </div>
                        ))}
                        {(!selectedOrder.history || selectedOrder.history.length === 0) && (
                          <p className="text-sm text-white/50 pl-4">No history recorded.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Internal Notes */}
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-[#141414]">
                      <h3 className="font-semibold text-white/90 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-white/50"/> Internal Notes</h3>
                    </div>
                    <div className="p-4">
                      {selectedOrder.notes ? (
                        <div className="bg-[#141414] p-3 rounded-lg text-sm text-white/80 whitespace-pre-wrap mb-3 border border-white/5 max-h-[150px] overflow-y-auto">
                          {selectedOrder.notes}
                        </div>
                      ) : (
                        <p className="text-xs text-white/40 mb-3">No notes yet.</p>
                      )}
                      <div className="flex flex-col gap-2">
                        <textarea 
                          value={newNote}
                          onChange={e => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 resize-none min-h-[60px]"
                        />
                        <button onClick={handleAddNote} className="bg-white/10 hover:bg-white/20 py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors">
                          Save Note
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* PostEx Confirmation Modal */}
      {showPostexModal && selectedOrder && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-white/5 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#B8860B]" /> Review PostEx Booking
              </h2>
              <button onClick={() => setShowPostexModal(false)} className="text-white/40 hover:text-white/70 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Customer Name</label>
                  <input type="text" value={postexForm.customerName} onChange={e => setPostexForm(p => ({ ...p, customerName: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Phone</label>
                  <input type="text" value={postexForm.phone} onChange={e => setPostexForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Delivery Address</label>
                  <textarea value={postexForm.address} onChange={e => setPostexForm(p => ({ ...p, address: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 resize-none min-h-[60px]" />
                </div>
                <AddressMap onSelect={(result) => {
                  setPostexForm(p => ({
                    ...p,
                    address: result.formattedAddress,
                    city: result.city || p.city,
                  }))
                }} />
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5">City</label>
                  <CitySelect
                    value={postexForm.city}
                    onChange={(city) => setPostexForm(p => ({ ...p, city, province: detectProvince(city) }))}
                    className="bg-[#141414]"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Order Type</label>
                  <select value={postexForm.orderType} onChange={e => setPostexForm(p => ({ ...p, orderType: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30">
                    {POSTEX_ORDER_TYPES.map(type => (
                      <option key={type} value={type} className="bg-[#141414]">{type}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Order Total (Rs.)</label>
                    <input type="number" value={postexForm.amount} onChange={e => setPostexForm(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Booking Weight (kg)</label>
                    <input type="number" step="0.1" value={postexForm.bookingWeight} onChange={e => setPostexForm(p => ({ ...p, bookingWeight: Number(e.target.value) }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Province</label>
                    <input type="text" value={postexForm.province} onChange={e => setPostexForm(p => ({ ...p, province: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white/70 focus:outline-none focus:border-white/30" />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Pickup Address Code</label>
                    <input type="text" value={postexForm.pickupAddressCode} onChange={e => setPostexForm(p => ({ ...p, pickupAddressCode: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Order #</label>
                    <div className="w-full bg-[#141414] border border-white/5 rounded-lg px-3.5 py-2.5 text-sm text-white/60 font-mono">{selectedOrder.id}</div>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/40 mb-1.5 block">Order Detail</label>
                  <input type="text" value={postexForm.orderDetail} onChange={e => setPostexForm(p => ({ ...p, orderDetail: e.target.value }))} className="w-full bg-[#141414] border border-white/10 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/30" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowPostexModal(false)} className="flex-1 border border-white/10 hover:bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handlePostexConfirm} disabled={postexBooking} className="flex-1 bg-gradient-to-r from-[#B8860B] to-[#D4A017] text-black py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider hover:shadow-[0_0_20px_rgba(184,134,11,0.3)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {postexBooking ? (
                    <>Booking...</>
                  ) : (
                    <><Truck className="w-3.5 h-3.5" /> Confirm & Ship</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
