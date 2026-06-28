'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TikTokEvents } from '@/lib/tiktok-pixel'

export default function TestTikTokEventsPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [productId, setProductId] = useState('sw1')
  const [productName, setProductName] = useState('Apple Watch Ultra 2')
  const [price, setPrice] = useState(224999)
  const [orderId, setOrderId] = useState('ORD-TEST1234')
  const [orderTotal, setOrderTotal] = useState(224999)
  const [testCode, setTestCode] = useState('')

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev].slice(0, 15))
  }

  const opts = () => testCode ? { _extra: { test_event_code: testCode } } : {}

  const testViewContent = () => {
    TikTokEvents.viewContent({ id: productId, name: productName, price }, '', opts() as any)
    addLog(`Fired: ViewContent for ${productName}${testCode ? ` (test: ${testCode})` : ''}`)
  }

  const testAddToCart = () => {
    TikTokEvents.addToCart({ id: productId, name: productName, price }, 1, '', opts() as any)
    addLog(`Fired: AddToCart for ${productName}${testCode ? ` (test: ${testCode})` : ''}`)
  }

  const testInitiateCheckout = () => {
    TikTokEvents.initiateCheckout([{ id: productId, name: productName, price, quantity: 1 }], price, opts() as any)
    addLog(`Fired: InitiateCheckout total=${price}${testCode ? ` (test: ${testCode})` : ''}`)
  }

  const testPurchase = () => {
    TikTokEvents.purchase({ id: orderId, total: orderTotal, items: [{ id: productId, name: productName, price, quantity: 1 }], ...opts() as any })
    addLog(`Fired: Purchase order=${orderId} total=${orderTotal}${testCode ? ` (test: ${testCode})` : ''}`)
  }

  return (
    <div className="container-main py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">TikTok Events Test Page</h1>
        <p className="text-muted-foreground mt-2">
          Use this page to easily test your TikTok Pixel events. 
          Open <strong>TikTok Events Manager → Test Events</strong> in another tab and watch events appear in real-time.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Also check browser console for [TikTok Pixel] logs.
        </p>
      </div>

      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Event Parameters</CardTitle>
            <CardDescription>Adjust these to simulate different products/orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Product ID / Slug</Label>
                <Input value={productId} onChange={e => setProductId(e.target.value)} />
              </div>
              <div>
                <Label>Product Name</Label>
                <Input value={productName} onChange={e => setProductName(e.target.value)} />
              </div>
              <div>
                <Label>Price (PKR)</Label>
                <Input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
              </div>
              <div>
                <Label>Order ID (for Purchase)</Label>
                <Input value={orderId} onChange={e => setOrderId(e.target.value)} />
              </div>
              <div>
                <Label>Order Total (for Purchase)</Label>
                <Input type="number" value={orderTotal} onChange={e => setOrderTotal(Number(e.target.value))} />
              </div>
              <div>
                <Label>Test Event Code (CAPI)</Label>
                <Input value={testCode} onChange={e => setTestCode(e.target.value)} placeholder="e.g. TEST74095" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Fire Events</CardTitle>
            <CardDescription>Click to manually trigger events for testing</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={testViewContent} variant="outline" size="lg">
              ViewContent (Product Page)
            </Button>
            <Button onClick={testAddToCart} variant="outline" size="lg">
              AddToCart
            </Button>
            <Button onClick={testInitiateCheckout} variant="outline" size="lg">
              InitiateCheckout
            </Button>
            <Button onClick={testPurchase} size="lg">
              Purchase (CompletePayment)
            </Button>
          </CardContent>
        </Card>

        {/* Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Event Log (this session)</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events fired yet. Click buttons above.</p>
            ) : (
              <div className="font-mono text-xs bg-muted p-4 rounded space-y-1 max-h-64 overflow-auto">
                {logs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => setLogs([])}>
              Clear Logs
            </Button>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <Link href="/products" className="underline">Go to actual store to test real flows →</Link>
        </div>
      </div>
    </div>
  )
}
