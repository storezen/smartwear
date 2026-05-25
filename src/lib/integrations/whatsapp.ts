export interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  apiVersion?: string
}

export interface WhatsAppTextMessage {
  to: string
  type: "text"
  text: { body: string }
  preview_url?: boolean
}

export interface WhatsAppTemplateMessage {
  to: string
  type: "template"
  template: {
    name: string
    language: { code: string }
    components?: {
      type: "header" | "body" | "footer" | "button"
      sub_type?: "url" | "quick_reply"
      index?: string | number
      parameters: { type: string; text?: string; payload?: string; image?: { link: string } }[]
    }[]
  }
}

export interface WhatsAppWebhookPayload {
  object: string
  entry: {
    id: string
    changes: {
      value: {
        messaging_product: string
        metadata: { display_phone_number: string; phone_number_id: string }
        contacts?: { profile: { name: string }; wa_id: string }[]
        messages?: {
          from: string
          id: string
          timestamp: string
          type: string
          text?: { body: string }
        }[]
        statuses?: {
          id: string
          status: string
          timestamp: string
          recipient_id: string
        }[]
      }
      field: string
    }[]
  }[]
}

const DEFAULT_API_VERSION = "v21.0"

function buildUrl(config: WhatsAppConfig): string {
  const version = config.apiVersion || DEFAULT_API_VERSION
  return `https://graph.facebook.com/${version}/${config.phoneNumberId}/messages`
}

function buildHeaders(config: WhatsAppConfig): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.accessToken}`,
  }
}

export async function sendTextMessage(
  message: WhatsAppTextMessage,
  config: WhatsAppConfig
): Promise<{ messaging_product: string; contacts: { input: string; wa_id: string }[]; messages: { id: string }[] }> {
  const res = await fetch(buildUrl(config), {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(message),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`WhatsApp API error: ${res.status} — ${error}`)
  }

  return res.json()
}

export async function sendTemplateMessage(
  message: WhatsAppTemplateMessage,
  config: WhatsAppConfig
): Promise<{ messaging_product: string; contacts: { input: string; wa_id: string }[]; messages: { id: string }[] }> {
  const res = await fetch(buildUrl(config), {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify(message),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`WhatsApp API error: ${res.status} — ${error}`)
  }

  return res.json()
}

export interface WhatsAppNotificationConfig {
  orderPlaced: {
    enabled: boolean
    template: string
  }
  orderShipped: {
    enabled: boolean
    template: string
  }
}

export const DEFAULT_WHATSAPP_NOTIFICATION_CONFIG: WhatsAppNotificationConfig = {
  orderPlaced: {
    enabled: false,
    template: "Hi {{name}}, your order {{order_id}} for {{total}} has been confirmed! We will notify you when it ships."
  },
  orderShipped: {
    enabled: false,
    template: "Great news {{name}}! Your order {{order_id}} has shipped. Tracking: {{tracking_id}}"
  }
}

export function parseWhatsAppTemplate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim()
    return variables[trimmedKey] !== undefined ? String(variables[trimmedKey]) : match
  })
}

export async function sendOrderConfirmation(
  to: string,
  orderId: string,
  customerName: string,
  config: WhatsAppConfig
) {
  return sendTemplateMessage(
    {
      to,
      type: "template",
      template: {
        name: "order_confirmation",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: customerName },
              { type: "text", text: orderId },
            ],
          },
        ],
      },
    },
    config
  )
}

export async function sendShipmentUpdate(
  to: string,
  orderId: string,
  status: string,
  trackingId: string,
  config: WhatsAppConfig
) {
  return sendTemplateMessage(
    {
      to,
      type: "template",
      template: {
        name: "shipment_update",
        language: { code: "en" },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: orderId },
              { type: "text", text: status },
              { type: "text", text: trackingId },
            ],
          },
        ],
      },
    },
    config
  )
}
