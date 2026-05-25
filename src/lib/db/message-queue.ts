import { prisma } from "./prisma"

export async function queueWhatsAppMessage(
  recipient: string,
  messageType: string,
  payload: any,
  orderId?: string
) {
  // We schedule the first attempt to happen immediately.
  return prisma.messageQueue.create({
    data: {
      recipient,
      messageType,
      payload: JSON.stringify(payload),
      nextRetryAt: new Date(),
      status: "pending",
      orderId,
    },
  })
}

export async function logMessage(
  recipient: string,
  messageType: string,
  status: string,
  responsePayload?: any,
  orderId?: string
) {
  return prisma.messageLog.create({
    data: {
      recipient,
      messageType,
      status,
      responsePayload: responsePayload ? JSON.stringify(responsePayload) : null,
      orderId,
    },
  })
}
