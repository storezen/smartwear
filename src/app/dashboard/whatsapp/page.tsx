"use client"

import { useState, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Send, Clock, CheckCircle, XCircle, Loader2, Sparkles, MessageCircle, Save, History } from "lucide-react"
import { cn } from "@/lib/utils"

const HISTORY_KEY = "smartwear-whatsapp-history"

interface SentMessage {
  to: string
  message: string
  status: "sent" | "failed"
  timestamp: string
  error?: string
}

function getHistory(): SentMessage[] {
  if (typeof window === "undefined") return []
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
  } catch {
    return []
  }
}

function saveHistory(msgs: SentMessage[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs))
}

function WhatsAppSettingsForm({ onSaved }: { onSaved: () => void }) {
  const [token, setToken] = useState("")
  const [phoneId, setPhoneId] = useState("")
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        fetch("/api/settings/WHATSAPP_ACCESS_TOKEN", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: token }),
        }),
        fetch("/api/settings/WHATSAPP_PHONE_NUMBER_ID", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: phoneId }),
        })
      ])
      toast.success("God Mode Active: WhatsApp API connected!")
      onSaved()
    } catch {
      toast.error("Failed to save credentials")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Access Token</Label>
        <Input
          type="password"
          placeholder="EAXXXXXXXXXXXX"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-bold text-neutral-900 focus-visible:ring-emerald-500"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Phone Number ID</Label>
        <Input
          placeholder="1234567890"
          value={phoneId}
          onChange={(e) => setPhoneId(e.target.value)}
          className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-mono font-bold text-neutral-900 focus-visible:ring-emerald-500"
        />
      </div>
      <Button onClick={handleSave} disabled={saving || !token || !phoneId} className="w-full gap-2 h-[48px] rounded-full font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-[0_8px_30px_rgb(16,185,129,0.2)]">
        {saving ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <CheckCircle className="size-4" strokeWidth={2} />}
        {saving ? "Connecting..." : "Connect WhatsApp"}
      </Button>
    </div>
  )
}

import type { WhatsAppNotificationConfig } from "@/lib/integrations/whatsapp"
import { DEFAULT_WHATSAPP_NOTIFICATION_CONFIG } from "@/lib/integrations/whatsapp"

export default function WhatsAppPage() {
  const [testNumber, setTestNumber] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<SentMessage[]>([])
  const [configStatus, setConfigStatus] = useState<"checking" | "configured" | "missing">("checking")
  const [notificationConfig, setNotificationConfig] = useState<WhatsAppNotificationConfig>(DEFAULT_WHATSAPP_NOTIFICATION_CONFIG)
  const [savingConfig, setSavingConfig] = useState(false)

  useEffect(() => {
    setHistory(getHistory())
    Promise.all([
      fetch("/api/integrations/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: "+921234567890", message: "ping" }),
      }).then(res => res.status),
      fetch("/api/settings/WHATSAPP_CONFIG").then(res => res.json())
    ]).then(([sendResStatus, configRes]) => {
      if (sendResStatus === 400) setConfigStatus("configured")
      else if (sendResStatus === 500) setConfigStatus("missing")
      else setConfigStatus("checking")

      if (configRes?.value) {
        try { setNotificationConfig(JSON.parse(configRes.value)) } catch {}
      }
    }).catch(() => setConfigStatus("missing"))
  }, [])

  const handleSaveConfig = useCallback(async () => {
    setSavingConfig(true)
    try {
      await fetch("/api/settings/WHATSAPP_CONFIG", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: JSON.stringify(notificationConfig) }),
      })
      toast.success("God Mode Active: Notification Engine updated!")
    } catch {
      toast.error("Failed to save Notification Engine settings")
    } finally {
      setSavingConfig(false)
    }
  }, [notificationConfig])

  const handleTestSend = useCallback(async () => {
    if (!testNumber || !testMessage) {
      toast.error("Please enter a phone number and message")
      return
    }
    setSending(true)
    try {
      const res = await fetch("/api/integrations/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testNumber, message: testMessage }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to send")
      }
      const entry: SentMessage = { to: testNumber, message: testMessage, status: "sent", timestamp: new Date().toISOString() }
      const updated = [entry, ...history].slice(0, 20)
      setHistory(updated)
      saveHistory(updated)
      toast.success("Test message sent!")
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Failed to send"
      const entry: SentMessage = { to: testNumber, message: testMessage, status: "failed", timestamp: new Date().toISOString(), error: errMsg }
      const updated = [entry, ...history].slice(0, 20)
      setHistory(updated)
      saveHistory(updated)
      toast.error(errMsg)
    } finally {
      setSending(false)
    }
  }, [testNumber, testMessage, history])

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="font-heading text-xl font-semibold text-foreground flex items-center gap-2">
          WhatsApp API <Sparkles className="size-5 text-emerald-500" />
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">God Mode automated notifications and API connections.</p>
      </motion.div>

      {configStatus === "missing" && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-neutral-200/60 bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" strokeWidth={2} /> WhatsApp God Mode Setup
            </h3>
            <p className="text-sm font-medium text-neutral-500 mt-1">Connect your WhatsApp Business Account in 3 easy steps. No coding required.</p>
          </div>
          <div className="grid lg:grid-cols-2">
            <div className="p-6 lg:border-r border-neutral-200/60 bg-neutral-50/30">
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">1</div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Create an App</p>
                    <p className="text-xs text-neutral-500 mt-1">Go to <a href="https://developers.facebook.com/" target="_blank" className="text-blue-500 hover:underline font-semibold">Meta for Developers</a>, create a new App, and add the WhatsApp product.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">2</div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Get Phone Number ID</p>
                    <p className="text-xs text-neutral-500 mt-1">Under WhatsApp &gt; API Setup, copy the <strong>Phone Number ID</strong> (not the standard phone number).</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs">3</div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Generate Access Token</p>
                    <p className="text-xs text-neutral-500 mt-1">Generate a permanent System User Token or use the temporary token provided in the dashboard.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <WhatsAppSettingsForm onSaved={() => setConfigStatus("configured")} />
            </div>
          </div>
        </motion.div>
      )}

      {configStatus === "configured" && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
            <div className="p-6 border-b border-neutral-200/60 bg-gradient-to-r from-emerald-50/50 to-blue-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <MessageCircle className="size-5 text-emerald-500" strokeWidth={2} /> Automated Notification Engine
                </h3>
                <p className="text-sm font-medium text-neutral-500 mt-1">Configure messages to send automatically on specific events.</p>
              </div>
              <Button onClick={handleSaveConfig} disabled={savingConfig} className="gap-2 h-10 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800">
                {savingConfig ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Save Engine Rules
              </Button>
            </div>
            
            <div className="p-6 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold text-neutral-900">Order Placed Template</Label>
                    <p className="text-xs font-medium text-neutral-500">Sent instantly when a customer successfully checks out.</p>
                  </div>
                  <Switch 
                    checked={notificationConfig.orderPlaced.enabled} 
                    onCheckedChange={(v) => setNotificationConfig({...notificationConfig, orderPlaced: {...notificationConfig.orderPlaced, enabled: v}})}
                  />
                </div>
                <div className="relative">
                  <textarea 
                    value={notificationConfig.orderPlaced.template}
                    onChange={(e) => setNotificationConfig({...notificationConfig, orderPlaced: {...notificationConfig.orderPlaced, template: e.target.value}})}
                    disabled={!notificationConfig.orderPlaced.enabled}
                    className="w-full h-[100px] p-4 rounded-2xl border-neutral-200/60 bg-neutral-50/50 shadow-inner text-sm font-medium focus-visible:ring-emerald-500 disabled:opacity-50 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{name}}`}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{order_id}}`}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{total}}`}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-neutral-200/60">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-bold text-neutral-900">Order Shipped Template</Label>
                    <p className="text-xs font-medium text-neutral-500">Sent when you mark an order as shipped and provide tracking.</p>
                  </div>
                  <Switch 
                    checked={notificationConfig.orderShipped.enabled} 
                    onCheckedChange={(v) => setNotificationConfig({...notificationConfig, orderShipped: {...notificationConfig.orderShipped, enabled: v}})}
                  />
                </div>
                <div className="relative">
                  <textarea 
                    value={notificationConfig.orderShipped.template}
                    onChange={(e) => setNotificationConfig({...notificationConfig, orderShipped: {...notificationConfig.orderShipped, template: e.target.value}})}
                    disabled={!notificationConfig.orderShipped.enabled}
                    className="w-full h-[100px] p-4 rounded-2xl border-neutral-200/60 bg-neutral-50/50 shadow-inner text-sm font-medium focus-visible:ring-emerald-500 disabled:opacity-50 resize-none"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{name}}`}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{order_id}}`}</span>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-neutral-200 rounded-md text-neutral-500">{`{{tracking_id}}`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Send className="size-5 text-neutral-500" strokeWidth={2} /> Send Test Message
              </h3>
              <p className="text-sm font-medium text-neutral-500 mt-1">Send a test WhatsApp message to verify integration.</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Recipient Phone</Label>
                <Input
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+923001234567"
                  className="h-[48px] rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900"
                />
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide mt-1">Include country code (e.g., +92 for Pakistan)</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-neutral-700">Message</Label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Type your test message..."
                  rows={4}
                  className="w-full rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-4 text-sm font-medium text-neutral-900 placeholder:text-neutral-400 shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all resize-none"
                />
              </div>
              <Button onClick={handleTestSend} disabled={sending} className="w-full sm:w-auto gap-2 h-[48px] px-8 rounded-full font-bold bg-neutral-950 text-white hover:bg-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] disabled:opacity-60 disabled:cursor-not-allowed">
                {sending ? <Loader2 className="size-4 animate-spin" strokeWidth={2} /> : <Send className="size-4" strokeWidth={2} />}
                {sending ? "Sending..." : "Send Test"}
              </Button>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
          <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <History className="size-5 text-neutral-500" strokeWidth={2} /> Message History
              </h3>
            </div>
            <div className="p-6">
              {history.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-neutral-400">
                  <Send className="size-8 mb-3 opacity-50" strokeWidth={1.5} />
                  <p className="text-sm font-medium">No messages sent yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-2">
                  {history.map((msg, i) => (
                    <div key={i} className="rounded-2xl border border-neutral-200/60 bg-neutral-50/50 p-4 transition-colors hover:bg-neutral-100/80">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-bold text-neutral-900 truncate">{msg.to}</span>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide border shadow-sm shrink-0", 
                          msg.status === "sent" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
                        )}>
                          {msg.status === "sent" ? <CheckCircle className="size-3" strokeWidth={2.5} /> : <XCircle className="size-3" strokeWidth={2.5} />}
                          {msg.status}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed bg-white rounded-xl p-3 border border-neutral-200/60 mb-2">{msg.message}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-neutral-400">{new Date(msg.timestamp).toLocaleString("en-PK")}</span>
                        {msg.error && <span className="text-[10px] font-bold text-red-500 truncate max-w-[150px] uppercase tracking-wide">{msg.error}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <div className="bg-white border border-neutral-200/60 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="p-6 border-b border-neutral-200/60 bg-neutral-50/50">
            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <MessageCircle className="size-5 text-neutral-500" strokeWidth={2} /> Automated Notifications
            </h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: "Order Confirmation", desc: "Sent when customer places an order", template: "order_confirmation" },
                { title: "Shipment Update", desc: "Sent when order status changes to shipped", template: "shipment_update" },
                { title: "Delivery Confirmation", desc: "Sent when order is delivered", template: "delivery_confirmation" },
              ].map((n) => (
                <div key={n.template} className="rounded-2xl border border-neutral-200/60 p-5 bg-white shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold text-neutral-900">{n.title}</p>
                  <p className="text-[11px] font-medium text-neutral-500 mt-1 flex-1 leading-relaxed">{n.desc}</p>
                  <div className="mt-4 inline-flex items-center rounded-lg bg-neutral-100 px-2.5 py-1 text-[10px] font-bold text-neutral-600 font-mono border border-neutral-200/60">
                    {n.template}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
