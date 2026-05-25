"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Sparkles, 
  MessageCircle, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Database,
  QrCode,
  AlertTriangle,
  Play,
  Terminal,
  ArrowRight,
  TrendingUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useWhatsAppBotStore } from "@/store/useWhatsAppBotStore"

export default function WhatsAppPage() {
  const {
    botStatus,
    qrCode,
    platformOrderCount,
    whatsappSentCount,
    logs,
    autoConfirm,
    autoTracking,
    keywords,
    isLoading,
    isSaving,
    error,
    fetchBotStatus,
    restartSession,
    fetchSyncStats,
    fetchSettings,
    saveSettings,
    sendTestMessage,
    startPolling,
    stopPolling
  } = useWhatsAppBotStore()

  // Local state for testing message
  const [testNumber, setTestNumber] = useState("")
  const [testMessage, setTestMessage] = useState("")
  const [sendingTest, setSendingTest] = useState(false)

  // Local state for adding keyword
  const [newKeyword, setNewKeyword] = useState("")
  const [newReply, setNewReply] = useState("")

  // Local copy of keywords for UI editing
  const [localKeywords, setLocalKeywords] = useState<{ keyword: string; reply: string }[]>([])
  const [localAutoConfirm, setLocalAutoConfirm] = useState(false)
  const [localAutoTracking, setLocalAutoTracking] = useState(false)

  // Start polling on mount, stop on unmount
  useEffect(() => {
    startPolling()
    fetchSettings()
    return () => stopPolling()
  }, [])

  // Sync store settings to local state when loaded
  useEffect(() => {
    setLocalKeywords(keywords)
    setLocalAutoConfirm(autoConfirm)
    setLocalAutoTracking(autoTracking)
  }, [keywords, autoConfirm, autoTracking])

  // Display errors if any
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  // Handle restarting bot
  const handleRestart = async () => {
    toast.promise(restartSession(), {
      loading: "Stopping existing WhatsApp process and launching Puppeteer...",
      success: "WhatsApp Bot restarted! Generating new session...",
      error: "Failed to restart session."
    })
  }

  // Handle adding a keyword responder
  const handleAddKeyword = () => {
    if (!newKeyword.trim() || !newReply.trim()) {
      toast.error("Please enter both a keyword and a response.")
      return
    }

    if (localKeywords.some(k => k.keyword.toLowerCase().trim() === newKeyword.toLowerCase().trim())) {
      toast.error("This keyword trigger already exists.")
      return
    }

    setLocalKeywords([...localKeywords, { keyword: newKeyword.trim(), reply: newReply.trim() }])
    setNewKeyword("")
    setNewReply("")
    toast.success("Keyword rule added to local draft.")
  }

  // Handle deleting a keyword responder
  const handleDeleteKeyword = (index: number) => {
    const updated = localKeywords.filter((_, i) => i !== index)
    setLocalKeywords(updated)
    toast.success("Keyword rule removed from local draft.")
  }

  // Handle saving the settings
  const handleSaveSettings = async () => {
    const success = await saveSettings({
      autoConfirm: localAutoConfirm,
      autoTracking: localAutoTracking,
      keywords: localKeywords
    })

    if (success) {
      toast.success("God Mode Activated: Automation engine settings synced successfully!")
    } else {
      toast.error("Failed to save settings.")
    }
  }

  // Handle sending test message
  const handleSendTest = async () => {
    if (!testNumber.trim() || !testMessage.trim()) {
      toast.error("Please fill in both the phone number and message.")
      return
    }
    setSendingTest(true)
    const success = await sendTestMessage(testNumber.trim(), testMessage.trim())
    setSendingTest(false)
    if (success) {
      toast.success("Test message sent successfully!")
      setTestMessage("")
    }
  }

  // Calculations for sync parity
  const parityPercentage = platformOrderCount > 0 
    ? Math.min(Math.round((whatsappSentCount / platformOrderCount) * 100), 100) 
    : 100

  // Format Status Badge Styles
  const getStatusConfig = () => {
    switch (botStatus) {
      case "CONNECTED":
        return {
          label: "Active & Connected",
          colorClass: "bg-emerald-500 text-emerald-950 border-emerald-500/20",
          pulseClass: "bg-emerald-400"
        }
      case "QR_RECEIVED":
        return {
          label: "Awaiting QR Scan",
          colorClass: "bg-blue-500 text-blue-950 border-blue-500/20",
          pulseClass: "bg-blue-400"
        }
      case "INITIALIZING":
        return {
          label: "Initializing Puppeteer...",
          colorClass: "bg-amber-500 text-amber-950 border-amber-500/20",
          pulseClass: "bg-amber-400"
        }
      case "DISCONNECTED":
      default:
        return {
          label: "Disconnected (Offline)",
          colorClass: "bg-red-500 text-red-950 border-red-500/20",
          pulseClass: "bg-red-400"
        }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }} 
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Title Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-neutral-200/50 pb-5">
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-900 flex items-center gap-2">
            WhatsApp Command Center <Sparkles className="size-5 text-neutral-500" />
          </h1>
          <p className="text-sm text-neutral-500">
            Control automated order confirmations, PostEx delivery updates, and custom keyword responders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              fetchBotStatus()
              fetchSyncStats()
              toast.success("State refreshed!")
            }}
            variant="outline"
            className="rounded-xl border-neutral-200/60 h-10 gap-1.5 font-semibold text-neutral-700 bg-white"
          >
            <RefreshCw className="size-4 text-neutral-500" />
            Refresh State
          </Button>
          <Button 
            onClick={handleRestart}
            variant="outline"
            className="rounded-xl border-neutral-200/60 h-10 gap-1.5 font-semibold text-red-600 bg-white hover:bg-red-50/50"
          >
            <Play className="size-4" />
            Restart Bot Process
          </Button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column - Connection & Parity Stats */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connection Status Card */}
          <Card className="rounded-[24px] border-neutral-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-5 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-neutral-900">Bot Connection</CardTitle>
                  <CardDescription className="text-xs text-neutral-400">whatsapp-web.js session state</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusConfig.pulseClass)}></span>
                    <span className={cn("relative inline-flex rounded-full h-2 w-2", statusConfig.pulseClass)}></span>
                  </span>
                  <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full", statusConfig.colorClass)}>
                    {statusConfig.label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
              <AnimatePresence mode="wait">
                {botStatus === "CONNECTED" && (
                  <motion.div 
                    key="connected"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-4"
                  >
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <CheckCircle className="size-8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-lg">System Fully Linked</h4>
                      <p className="text-xs font-semibold text-neutral-500 mt-1 max-w-[280px]">
                        The bot is running as a headless daemon on port 3001 and actively syncing with Shopify/PostEx hooks.
                      </p>
                    </div>
                  </motion.div>
                )}

                {botStatus === "QR_RECEIVED" && qrCode && (
                  <motion.div 
                    key="qr"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center space-y-4 w-full flex flex-col items-center"
                  >
                    <div className="bg-white p-3 rounded-2xl border border-neutral-200/80 shadow-inner">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`}
                        alt="WhatsApp Bot Scan QR"
                        className="size-[200px] object-contain"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-neutral-900 flex items-center justify-center gap-1.5">
                        <QrCode className="size-4 text-blue-600" /> Link WhatsApp Account
                      </h4>
                      <p className="text-xs text-neutral-500 font-semibold max-w-[300px] leading-relaxed">
                        Open WhatsApp on your mobile phone &gt; Settings &gt; Linked Devices &gt; Link Device and scan this QR code to authenticate.
                      </p>
                    </div>
                  </motion.div>
                )}

                {botStatus === "INITIALIZING" && (
                  <motion.div 
                    key="initializing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-3"
                  >
                    <Loader2 className="size-10 text-amber-500 animate-spin mx-auto" />
                    <div>
                      <h4 className="font-bold text-neutral-900">Spawning Chromium</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-[240px]">
                        Starting Chromium environment and creating localized auth session folder...
                      </p>
                    </div>
                  </motion.div>
                )}

                {botStatus === "DISCONNECTED" && (
                  <motion.div 
                    key="disconnected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4"
                  >
                    <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500 border border-red-100">
                      <AlertTriangle className="size-8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900">Bot Server Offline</h4>
                      <p className="text-xs text-neutral-500 mt-1 max-w-[260px]">
                        The standalone bridge server on port 3001 is offline or currently inaccessible.
                      </p>
                    </div>
                    <Button 
                      onClick={handleRestart} 
                      className="rounded-full bg-neutral-950 font-bold hover:bg-neutral-800 text-white h-9 px-5 text-xs"
                    >
                      Initialize Bot Session
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Platform Consistency Hub */}
          <Card className="rounded-[24px] border-neutral-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-5 px-6">
              <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Database className="size-4 text-neutral-400" /> Platform Consistency
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">Shopify synced orders vs sent WhatsApp alerts</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Stat Metric Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50/55 border border-neutral-200/40 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Shopify Orders</span>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">{platformOrderCount}</div>
                </div>
                <div className="bg-neutral-50/55 border border-neutral-200/40 rounded-2xl p-4 text-center">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">WhatsApp Sent</span>
                  <div className="text-2xl font-bold text-neutral-900 mt-1">{whatsappSentCount}</div>
                </div>
              </div>

              {/* Sync Parity Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-neutral-500">Parity Target Match</span>
                  <span className="text-neutral-950 flex items-center gap-1">
                    <TrendingUp className="size-3 text-emerald-500" /> {parityPercentage}% Synced
                  </span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/20">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${parityPercentage}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      parityPercentage === 100 ? "bg-emerald-500" : "bg-blue-500"
                    )}
                  />
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-1 text-center">
                  {parityPercentage === 100 
                    ? "✓ 100% Platform Consistency Reached. Zero missed notifications."
                    : `${platformOrderCount - whatsappSentCount} orders pending sync.`}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Send Test Message */}
          <Card className="rounded-[24px] border-neutral-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-5 px-6">
              <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Send className="size-4 text-neutral-400" /> Test Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Recipient Phone</Label>
                <Input 
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="+923001234567"
                  className="h-11 rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-bold text-neutral-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Test Message</Label>
                <textarea 
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Hello from SmartWear bot!"
                  rows={2}
                  className="w-full text-sm font-medium rounded-xl border border-neutral-200/60 bg-neutral-50/50 p-3 shadow-inner focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none text-neutral-900"
                />
              </div>
              <Button
                onClick={handleSendTest}
                disabled={sendingTest || botStatus !== "CONNECTED"}
                className="w-full rounded-full bg-neutral-950 text-white font-bold hover:bg-neutral-800 disabled:opacity-50"
              >
                {sendingTest ? <Loader2 className="size-4 animate-spin mr-1" /> : <Send className="size-4 mr-1" />}
                Fire Test Message
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Right Column - Automation Switches & Keywords & Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Automation Control Center & Custom Keywords */}
          <Card className="rounded-[24px] border-neutral-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-5 px-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-neutral-900">Automation Control Center</CardTitle>
                <CardDescription className="text-xs text-neutral-400">Manage real-time execution switches</CardDescription>
              </div>
              <Button
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="rounded-full bg-neutral-950 text-white font-bold h-9 px-5 text-xs hover:bg-neutral-800"
              >
                {isSaving ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Save className="size-3.5 mr-1.5" />}
                Save Engine Rules
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              {/* Switches Area */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-neutral-900">Auto-Confirmation (Shopify Orders)</Label>
                    <p className="text-xs text-neutral-400 font-semibold">Sends instant WhatsApp notifications on Shopify checkout.</p>
                  </div>
                  <Switch 
                    checked={localAutoConfirm}
                    onCheckedChange={setLocalAutoConfirm}
                  />
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold text-neutral-900">Auto-Tracking Updates (PostEx Integration)</Label>
                    <p className="text-xs text-neutral-400 font-semibold">Triggers shipment notification alert when order status changes to SHIPPED.</p>
                  </div>
                  <Switch 
                    checked={localAutoTracking}
                    onCheckedChange={setLocalAutoTracking}
                  />
                </div>
              </div>

              {/* Keyword Responders Section */}
              <div className="space-y-4 pt-6 border-t border-neutral-100">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">Custom Keyword Responders</h4>
                  <p className="text-xs text-neutral-400 font-semibold mt-0.5">Define automated responses to specific incoming client words.</p>
                </div>

                {/* Form to add row */}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input 
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Keyword (e.g. price)"
                    className="h-10 rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner font-semibold text-neutral-900"
                  />
                  <Input 
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Response (e.g. Our watch prices start from...)"
                    className="h-10 rounded-xl border-neutral-200/60 bg-neutral-50/50 shadow-inner text-neutral-900 flex-1"
                  />
                  <Button 
                    onClick={handleAddKeyword}
                    variant="outline" 
                    className="h-10 rounded-xl border-neutral-200/60 font-semibold text-neutral-800 bg-white"
                  >
                    <Plus className="size-4 mr-1 text-neutral-500" /> Add Trigger
                  </Button>
                </div>

                {/* Responders List */}
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {localKeywords.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-neutral-200 rounded-xl bg-neutral-50/30">
                      <p className="text-xs font-semibold text-neutral-400">No keyword responders configured.</p>
                    </div>
                  ) : (
                    localKeywords.map((kr, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-neutral-50 border border-neutral-200/40 rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2 py-0.5 bg-neutral-200/60 border border-neutral-300/40 rounded-md text-[10px] font-bold text-neutral-700 font-mono">
                            {kr.keyword}
                          </span>
                          <p className="text-xs font-medium text-neutral-600 truncate mt-1.5">{kr.reply}</p>
                        </div>
                        <Button 
                          onClick={() => handleDeleteKeyword(idx)}
                          size="icon"
                          variant="ghost" 
                          className="size-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Sync Console Logs */}
          <Card className="rounded-[24px] border-neutral-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-neutral-100 bg-neutral-50/50 py-5 px-6">
              <CardTitle className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Terminal className="size-4 text-neutral-400" /> Live Sync & Console logs
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400">Real-time incoming / outgoing synchronization reports</CardDescription>
            </CardHeader>
            <CardContent className="p-0 bg-neutral-950 font-mono text-xs text-neutral-300 leading-relaxed overflow-hidden">
              <div className="p-4 max-h-[300px] min-h-[220px] overflow-y-auto space-y-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-neutral-500 py-12 text-center">
                    [SYSTEM_LOG] Awaiting live logs ...
                  </div>
                ) : (
                  logs.map((logItem) => {
                    const dateStr = new Date(logItem.createdAt).toLocaleTimeString()
                    const isIncoming = logItem.messageType === "incoming"
                    const isFailed = logItem.status === "failed"

                    return (
                      <div key={logItem.id} className="border-b border-neutral-900 pb-1.5">
                        <span className="text-neutral-500 font-semibold mr-1.5">[{dateStr}]</span>
                        
                        <span className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mr-1.5",
                          isIncoming && "bg-blue-900/60 text-blue-300 border border-blue-800/40",
                          !isIncoming && !isFailed && "bg-emerald-950 text-emerald-400 border border-emerald-800/40",
                          isFailed && "bg-red-950 text-red-400 border border-red-800/40"
                        )}>
                          {logItem.messageType}
                        </span>

                        <span className="text-neutral-400 mr-1.5">
                          {logItem.recipient}:
                        </span>

                        <span className={cn(
                          isFailed && "text-red-400 font-semibold",
                          isIncoming && "text-neutral-200"
                        )}>
                          {logItem.responsePayload || "Empty payload"}
                        </span>
                      </div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>
    </motion.div>
  )
}
