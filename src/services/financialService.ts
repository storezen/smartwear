import { prisma } from "@/lib/db/prisma"

export const financialService = {
  /**
   * Calculates profit for a DELIVERED order and aggregates it into the daily summary.
   */
  async calculateOrderProfit(orderId: string, customCogs?: number, customShipping?: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return null

    // For simplicity, assuming default values if not explicitly provided
    // In a real scenario, COGS would be fetched from the Product model
    const cogs = customCogs || (order.total * 0.4) // Assuming 40% margin as default fallback
    const shipping = customShipping || 250 // Average PostEx shipping cost
    const adSpend = 150 // Estimated TikTok CPA per order
    const revenue = order.total
    const netProfit = revenue - (cogs + shipping + adSpend)

    const financials = { cogs, shipping, adSpend, revenue, netProfit }

    // Update order with financial data
    await prisma.order.update({
      where: { id: orderId },
      data: { financials: JSON.stringify(financials) }
    })

    // Aggregate into daily ProfitSummary
    const today = new Date().toISOString().split("T")[0] // YYYY-MM-DD
    
    await this.upsertProfitSummary(today, financials)

    return financials
  },

  /**
   * Records a loss for an RTO/FAILED order.
   */
  async recordRtoLoss(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return null

    // RTO means we lose shipping cost (both ways in some cases) plus packaging
    const shippingLoss = 250 * 2 // Two-way shipping
    const packagingLoss = 50
    const totalLoss = shippingLoss + packagingLoss

    const financials = { cogs: 0, shipping: totalLoss, adSpend: 150, revenue: 0, netProfit: -totalLoss, isLoss: true }

    // Update order
    await prisma.order.update({
      where: { id: orderId },
      data: { financials: JSON.stringify(financials) }
    })

    const today = new Date().toISOString().split("T")[0]
    
    // We update the lossRecovery column and subtract from netProfit
    await prisma.profitSummary.upsert({
      where: { date: today },
      update: {
        lossRecovery: { increment: totalLoss },
        netProfit: { decrement: totalLoss },
        totalAdSpend: { increment: 150 }
      },
      create: {
        date: today,
        lossRecovery: totalLoss,
        netProfit: -totalLoss,
        totalAdSpend: 150
      }
    })

    return financials
  },

  async upsertProfitSummary(date: string, financials: { cogs: number, shipping: number, adSpend: number, revenue: number, netProfit: number }) {
    await prisma.profitSummary.upsert({
      where: { date },
      update: {
        totalRevenue: { increment: financials.revenue },
        totalCOGS: { increment: financials.cogs },
        totalShipping: { increment: financials.shipping },
        totalAdSpend: { increment: financials.adSpend },
        netProfit: { increment: financials.netProfit }
      },
      create: {
        date,
        totalRevenue: financials.revenue,
        totalCOGS: financials.cogs,
        totalShipping: financials.shipping,
        totalAdSpend: financials.adSpend,
        netProfit: financials.netProfit
      }
    })
  }
}
