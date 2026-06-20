"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Truck, CheckCircle2, AlertCircle, ChevronRight, Phone, MapPin, X, History, MessageSquare, Plus } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import { toast } from "sonner"
import { OrderStatusEnum } from "@/lib/validations/orders"

const ALL_STATUSES = OrderStatusEnum.options;

export default function AdminOrdersPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [newNote, setNewNote] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])

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

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data)
        } else {
          console.error("API did not return an array of orders:", data)
          setOrders([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch orders", err)
        setOrders([])
        setLoading(false)
      })
  }, [])

  const updateOrderStatus = async (orderId: string, status: string, additionalNote?: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) return;

    try {
      let postexTrackingId = order.postex || null

      if (status === 'Shipped' && !postexTrackingId) {
        toast.info("Booking parcel with PostEx...")
        const postexRes = await fetch('/api/postex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: order.id,
            customerName: order.customer_name,
            phone: order.phone,
            address: order.shipping_address?.address_line1 || 'No Address provided',
            city: order.shipping_address?.city || 'Unknown',
            amount: order.total
          })
        })
        
        if (postexRes.ok) {
          const postexData = await postexRes.json()
          postexTrackingId = postexData.trackingNumber
          toast.success(`Booked on PostEx! Tracking: ${postexTrackingId}`)
        } else {
          toast.error("Failed to book on PostEx, continuing local update.")
        }
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

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedOrder) return;
    updateOrderStatus(selectedOrder.id, selectedOrder.status, newNote.trim())
  }

  const openOrderDetail = (order: any) => {
    setSelectedOrder(order)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-playfair mb-2">Orders Management</h1>
          <p className="text-white/60 text-sm">Professional OMS for tracking and fulfillment.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search ORD-..." 
              className="bg-white/5 border border-white/10 text-white rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <button 
            onClick={() => window.open('/api/admin/export', '_blank')}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Export CSV
          </button>
          <button 
            onClick={handleSelectAll}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium"
          >
            Select All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {['All', 'Pending', 'Processing', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'].map(tab => {
          const count = (orders || []).filter(o => o.status === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                activeTab === tab 
                ? 'bg-[#B8860B] text-white shadow-[0_0_15px_rgba(184,134,11,0.3)]' 
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {tab}
              {count > 0 && <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? 'bg-white/20' : 'bg-white/10'}`}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedOrders.length > 0 && (
        <div className="bg-[#B8860B]/20 border border-[#B8860B]/30 rounded-xl p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <span className="text-white font-medium text-sm">{selectedOrders.length} orders selected</span>
            <button onClick={() => setSelectedOrders([])} className="text-white/60 hover:text-white text-xs underline">Clear</button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs mr-2">Change status to:</span>
            {['Processing', 'Shipped', 'Delivered', 'Cancelled'].map(status => (
              <button 
                key={status}
                onClick={() => handleBulkStatusUpdate(status)}
                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                {status}
              </button>
            ))}
            <div className="w-px h-4 bg-white/20 mx-1"></div>
            <button 
              onClick={handleBulkDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Order List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-center py-12 text-white/50">Loading orders...</div>
        ) : (orders || []).filter(o => activeTab === 'All' || o.status === activeTab).length === 0 ? (
          <div className="text-center py-12 text-white/50">No orders found.</div>
        ) : (orders || []).filter(o => activeTab === 'All' || o.status === activeTab).map((order) => (
          <SpotlightCard key={order.id} className="p-0 overflow-hidden cursor-pointer hover:border-[#B8860B]/30 transition-colors" onClick={() => openOrderDetail(order)}>
            <div className="flex flex-col lg:flex-row lg:items-center pointer-events-none p-4 gap-4">
              
              {/* Left Section: Checkbox & Order ID */}
              <div className="flex items-center gap-4 min-w-[180px]">
                {/* Checkbox */}
                <div 
                  className="w-6 h-6 z-10 pointer-events-auto flex items-center justify-center cursor-pointer flex-shrink-0"
                  onClick={(e) => toggleOrderSelection(e, order.id)}
                >
                  <div className={`w-4 h-4 rounded border transition-colors flex items-center justify-center ${
                    selectedOrders.includes(order.id) 
                      ? 'bg-white text-black border-white' 
                      : 'border-white/30 bg-white/5 hover:border-white/60'
                  }`}>
                    {selectedOrders.includes(order.id) && <CheckCircle2 className="w-3 h-3 text-black" />}
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
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                    order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    order.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                    order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                    'bg-white/10 text-white/60 border-white/20'
                  }`}>
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

      {/* Order Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#0a0a0a] border-l border-white/10 text-white w-full sm:max-w-3xl overflow-y-auto z-[150] p-0">
          {selectedOrder && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-white/10 bg-[#0a0a0a] sticky top-0 z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <SheetTitle className="text-2xl font-bold text-white flex items-center gap-3">
                      {selectedOrder.id}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        selectedOrder.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        selectedOrder.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        selectedOrder.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        selectedOrder.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        selectedOrder.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-white/10 text-white/60 border-white/20'
                      }`}>
                        {selectedOrder.status}
                      </span>
                    </SheetTitle>
                    <p className="text-sm text-white/50 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                  </div>
                  <SheetClose className="text-white/40 hover:text-white bg-white/5 p-2 rounded-full"><X className="w-4 h-4"/></SheetClose>
                </div>
              </SheetHeader>

              <div className="flex-1 p-6 overflow-y-auto bg-black">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left Column (Main details) */}
                  <div className="md:col-span-2 space-y-6">
                    
                    {/* Items Card */}
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-[#141414]">
                        <h3 className="font-semibold text-white/90">Order Details</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        {selectedOrder.items?.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-start">
                            <div className="flex gap-4">
                              <div className="w-12 h-12 bg-[#1a1a1a] rounded-md border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                {item.image ? <img src={item.image} alt="" className="w-full h-full object-cover"/> : <div className="text-white/20 text-xs">No img</div>}
                                <span className="absolute -top-2 -right-2 bg-white/20 backdrop-blur-md text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-white/10">{item.quantity}</span>
                              </div>
                              <div className="pt-1">
                                <p className="text-sm font-medium text-white/90 leading-tight">{item.name}</p>
                                {item.color && <p className="text-xs text-white/50 mt-1">Color: {item.color}</p>}
                                <p className="text-xs text-white/50">{item.variant || 'Default Variant'}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-white/80 pt-1">₨ {(item.price * item.quantity).toLocaleString()}</p>
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
                          <span>Payment Method</span>
                          <span className="uppercase">{selectedOrder.payment_method || 'COD'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-[#141414]">
                        <h3 className="font-semibold text-white/90 flex items-center gap-2"><History className="w-4 h-4 text-white/50"/> Timeline</h3>
                      </div>
                      <div className="p-5">
                        <div className="space-y-5 pl-2 border-l-2 border-white/10 ml-2">
                          {selectedOrder.history?.map((event: any, i: number) => (
                            <div key={i} className="relative pl-6">
                              <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-[#141414] border-2 border-white/40" />
                              <p className="text-sm font-medium text-white/90">{event.status}</p>
                              {event.note && <p className="text-sm text-white/60 mt-0.5">{event.note}</p>}
                              <p className="text-xs text-white/40 mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                            </div>
                          ))}
                          {(!selectedOrder.history || selectedOrder.history.length === 0) && (
                            <p className="text-sm text-white/50 pl-4">No history recorded.</p>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Right Column (Customer & Actions) */}
                  <div className="space-y-6">
                    
                    {/* Status Update Actions */}
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-[#141414]">
                        <h3 className="font-semibold text-white/90">Update Status</h3>
                      </div>
                      <div className="p-4 flex flex-wrap gap-2">
                        {ALL_STATUSES.map(status => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(selectedOrder.id, status)}
                            disabled={selectedOrder.status === status}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors w-full text-left ${
                              selectedOrder.status === status 
                                ? 'bg-[#1a1a1a] border-white/20 text-white cursor-default' 
                                : 'bg-transparent border-transparent text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {selectedOrder.status === status ? <span className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3"/> {status}</span> : status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Customer & Shipping */}
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-[#141414]">
                        <h3 className="font-semibold text-white/90">Customer</h3>
                      </div>
                      <div className="p-4 space-y-4">
                        <div>
                          <p className="text-sm text-white/90 font-medium">{selectedOrder.customer_name}</p>
                          <p className="text-sm text-white/60">{selectedOrder.phone}</p>
                          {selectedOrder.email && <p className="text-sm text-white/60">{selectedOrder.email}</p>}
                        </div>
                        <div className="h-px bg-white/5" />
                        <div>
                          <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Shipping Address</h4>
                          <p className="text-sm text-white/80">{selectedOrder.shipping_address?.address_line1}</p>
                          {selectedOrder.shipping_address?.city && (
                            <p className="text-sm text-white/80">{selectedOrder.shipping_address.city}{selectedOrder.shipping_address.country ? `, ${selectedOrder.shipping_address.country}` : ''}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {selectedOrder.postex && (
                      <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-emerald-500/10 bg-emerald-500/5 flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-400"/>
                          <h3 className="font-semibold text-emerald-400">PostEx Tracking</h3>
                        </div>
                        <div className="p-4">
                          <p className="font-mono text-sm text-white/90">{selectedOrder.postex}</p>
                        </div>
                      </div>
                    )}

                    {/* Internal Notes */}
                    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                      <div className="p-4 border-b border-white/5 bg-[#141414]">
                        <h3 className="font-semibold text-white/90 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-white/50"/> Internal Notes</h3>
                      </div>
                      <div className="p-4">
                        {selectedOrder.notes ? (
                          <div className="bg-[#141414] p-3 rounded-lg text-sm text-white/80 whitespace-pre-wrap mb-3 border border-white/5">
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
                            className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-sm focus:outline-none focus:border-white/30 resize-none min-h-[80px]"
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
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
