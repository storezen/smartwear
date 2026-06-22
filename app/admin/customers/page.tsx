"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Search, User, Phone, MapPin, ShoppingBag, DollarSign, Calendar, ChevronRight, X } from "lucide-react"
import { SpotlightCard } from "@/components/ui/spotlight-card"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(orders => {
        // Compute unique customers from orders based on phone number
        const custMap = new Map<string, any>()
        
        const safeOrders = Array.isArray(orders) ? orders : []
        safeOrders.forEach((o: any) => {
          if (!o.phone) return
          if (!custMap.has(o.phone)) {
            custMap.set(o.phone, {
              phone: o.phone,
              name: o.customer_name,
              address: o.shipping_address,
              total_spent: 0,
              total_orders: 0,
              first_order_date: o.created_at,
              last_order_date: o.created_at,
              orders: []
            })
          }
          
          const c = custMap.get(o.phone)
          c.total_orders += 1
          c.total_spent += (o.total || 0)
          c.orders.push(o)
          
          if (new Date(o.created_at) > new Date(c.last_order_date)) c.last_order_date = o.created_at
          if (new Date(o.created_at) < new Date(c.first_order_date)) c.first_order_date = o.created_at
        })

        // Convert to array and sort by total spent
        const sortedCustomers = Array.from(custMap.values()).sort((a, b) => b.total_spent - a.total_spent)
        setCustomers(sortedCustomers)
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch customers", err)
        setLoading(false)
      })
  }, [])

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  )

  const openCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight mb-1">Customers</h1>
          <p className="text-white/60 text-[12px]">View and analyze your customer base derived from order history.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by name or phone..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 text-white rounded-lg pl-8 pr-3 py-1.5 text-[12px] focus:outline-none focus:border-[#B8860B] transition-colors w-52"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8 text-white/50 text-[12px]">Loading customer data...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 text-center">
          <User className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h3 className="text-base font-medium text-white mb-1">No Customers Found</h3>
          <p className="text-white/50 text-[12px] mb-4 max-w-md mx-auto">No customer records match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredCustomers.map((customer, i) => (
            <SpotlightCard key={customer.phone} className="p-4 cursor-pointer hover:border-[#B8860B]/30 transition-colors" onClick={() => openCustomer(customer)}>
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center text-white font-bold text-base">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-white leading-tight">{customer.name}</h3>
                    <p className="text-[10px] text-white/40 flex items-center gap-1"><Phone className="w-2.5 h-2.5"/> {customer.phone}</p>
                  </div>
                </div>
                {customer.total_orders > 1 && (
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                    Returning
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-[10px] text-white/40 mb-0.5 flex items-center gap-1"><ShoppingBag className="w-2.5 h-2.5"/> Orders</p>
                  <p className="text-base font-semibold text-white">{customer.total_orders}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 mb-0.5 flex items-center gap-1"><DollarSign className="w-2.5 h-2.5"/> Lifetime Value</p>
                  <p className="text-base font-semibold text-[#D4A017]">₨ {customer.total_spent.toLocaleString()}</p>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}

      {/* Customer Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="bg-[#0C0F14] border-l border-white/10 text-white w-full sm:max-w-md overflow-y-auto z-[150] p-0">
          {selectedCustomer && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b border-white/10 bg-white/[0.02]">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8860B] to-[#D4A017] flex items-center justify-center text-white font-bold text-3xl shadow-[0_0_20px_rgba(184,134,11,0.3)]">
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <SheetTitle className="text-2xl font-bold text-white mb-1">{selectedCustomer.name}</SheetTitle>
                      <p className="text-sm text-white/60 flex items-center gap-1"><Phone className="w-4 h-4"/> {selectedCustomer.phone}</p>
                    </div>
                  </div>
                  <SheetClose className="text-white/40 hover:text-white" aria-label="Close"><X className="w-5 h-5"/></SheetClose>
                </div>
              </SheetHeader>

              <div className="flex-1 p-6 space-y-8 overflow-y-auto">
                
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-white">{selectedCustomer.total_orders}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-white/40 mb-1">Lifetime Value</p>
                    <p className="text-2xl font-bold text-[#D4A017]">₨ {selectedCustomer.total_spent.toLocaleString()}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 col-span-2">
                    <p className="text-xs text-white/40 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Primary Address</p>
                    <p className="text-sm text-white/80">{selectedCustomer.address?.address_line1}, {selectedCustomer.address?.city}</p>
                  </div>
                </div>

                {/* Order History */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5"/> Order History</h3>
                  <div className="space-y-3">
                    {selectedCustomer.orders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((order: any) => (
                      <div key={order.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 hover:border-[#B8860B]/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-bold text-white">{order.id}</p>
                            <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            order.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            order.status === 'Cancelled' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#D4A017] font-medium mb-3">₨ {order.total.toLocaleString()}</p>
                        
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                          {order.items.map((item: any, idx: number) => (
                            <div key={idx} className="relative w-8 h-8 rounded bg-white/10 flex-shrink-0 overflow-hidden" title={item.name}>
                              {item.image && <Image src={item.image} alt="" fill sizes="32px" className="object-cover"/>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
