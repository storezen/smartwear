import http from "http"
import { Client, LocalAuth } from "whatsapp-web.js"
import qrcode from "qrcode-terminal"

// Session State
let botStatus: "CONNECTED" | "QR_RECEIVED" | "INITIALIZING" | "DISCONNECTED" = "DISCONNECTED"
let currentQr: string | null = null
let client: Client | null = null

const PORT = 3001
const NEXTJS_API_URL = "http://localhost:3000/api/whatsapp/bot/on-message"

function log(msg: string) {
  console.log(`[WhatsApp Bot Server] [${new Date().toISOString()}] ${msg}`)
}

function initializeClient() {
  if (client) {
    try {
      client.destroy()
    } catch (e) {
      log(`Error destroying client: ${e}`)
    }
  }

  botStatus = "INITIALIZING"
  currentQr = null
  log("Initializing whatsapp-web.js client...")

  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: "./.wwebjs_auth"
    }),
    puppeteer: {
      headless: true,
      executablePath: process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : undefined,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    }
  })

  client.on("qr", (qr: string) => {
    botStatus = "QR_RECEIVED"
    currentQr = qr
    log("QR Code received. Scan it to authenticate:")
    qrcode.generate(qr, { small: true })
  })

  client.on("ready", () => {
    botStatus = "CONNECTED"
    currentQr = null
    log("WhatsApp Bot Client is READY!")
  })

  client.on("authenticated", () => {
    log("Client authenticated successfully!")
  })

  client.on("auth_failure", (msg: string) => {
    botStatus = "DISCONNECTED"
    currentQr = null
    log(`Authentication failure: ${msg}`)
  })

  client.on("disconnected", (reason: string) => {
    botStatus = "DISCONNECTED"
    currentQr = null
    log(`Client disconnected: ${reason}`)
    // Auto-restart after disconnection
    setTimeout(() => initializeClient(), 5000)
  })

  client.on("message", async (msg: any) => {
    log(`Incoming message from ${msg.from}: "${msg.body}"`)
    
    // Skip status updates and group messages if they are not relevant, but let's pass all to Next.js
    try {
      const payload = JSON.stringify({
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp
      })

      const req = http.request(NEXTJS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      }, (res: any) => {
        let resData = ""
        res.on("data", (chunk: any) => { resData += chunk })
        res.on("end", () => {
          try {
            const data = JSON.parse(resData)
            if (data.reply) {
              log(`Auto-replying to ${msg.from} with keyword response: "${data.reply}"`)
              msg.reply(data.reply)
            }
          } catch (e) {
            // No valid JSON response or no reply
          }
        })
      })

      req.on("error", (e: any) => {
        log(`Failed to send message event to Next.js API: ${e.message}`)
      })

      req.write(payload)
      req.end()

    } catch (err) {
      log(`Error forwarding message: ${err}`)
    }
  })

  client.initialize().catch((err: any) => {
    log(`Initialization error: ${err}`)
    botStatus = "DISCONNECTED"
  })
}

// Start HTTP Server
const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  const url = new URL(req.url || "", `http://localhost:${PORT}`)

  if (url.pathname === "/status" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({
      status: botStatus,
      qr: currentQr
    }))
    return
  }

  if (url.pathname === "/send-message" && req.method === "POST") {
    let body = ""
    req.on("data", (chunk) => { body += chunk })
    req.on("end", async () => {
      try {
        const { to, message } = JSON.parse(body)
        if (!to || !message) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "to and message are required" }))
          return
        }

        if (botStatus !== "CONNECTED" || !client) {
          res.writeHead(503, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "WhatsApp Bot client is not connected" }))
          return
        }

        // Format number to whatsapp format (e.g. +923001234567 -> 923001234567@c.us)
        let formattedNumber = to.replace(/\+/g, "")
        if (!formattedNumber.endsWith("@c.us")) {
          formattedNumber = `${formattedNumber}@c.us`
        }

        log(`Sending message to ${formattedNumber}: "${message}"`)
        const result = await client.sendMessage(formattedNumber, message)
        
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ success: true, messageId: result.id.id }))
      } catch (err: any) {
        log(`Failed to send message: ${err.message}`)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: err.message }))
      }
    })
    return
  }

  if (url.pathname === "/restart" && req.method === "POST") {
    log("Restart requested via API endpoint.")
    initializeClient()
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ success: true, message: "Restarting WhatsApp Bot Client..." }))
    return
  }

  res.writeHead(404, { "Content-Type": "application/json" })
  res.end(JSON.stringify({ error: "Not Found" }))
})

// Initialize bot and start server
initializeClient()
server.listen(PORT, () => {
  log(`WhatsApp Web Bot bridge listening on http://localhost:${PORT}`)
})
