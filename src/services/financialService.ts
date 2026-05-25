import { prisma } from "@/lib/db/prisma"

async function getFinancialDefaults() {
  const [adSpendSetting, shippingSetting] = await Promise.all([
    prisma.storeSetting.findUnique({ where: { key: "DEFAULT_AD_SPEND" } }),
    prisma.storeSetting.findUnique({ where: { key: "DEFAULT_SHIPPING_COST" } }),
  ])
  return {
    adSpend: parseFloat(adSpendSetting?.value || "150"),
    shipping: parseFloat(shippingSetting?.value || "250"),
  }
}

export const financialService = {
  async calculateOrderProfit(orderId: string, customShipping?: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return null

    const [product, defaults] = await Promise.all([
      prisma.product.findUnique({ where: { id: order.productId } }),
      getFinancialDefaults(),
    ])

    const cogs = (product?.cost ?? order.total * 0.4) * order.quantity
    const shipping = customShipping ?? defaults.shipping
    const adSpend = defaults.adSpend
    const revenue = order.total
    const netProfit = revenue - (cogs + shipping + adSpend)

    const financials = { cogs, shipping, adSpend, revenue, netProfit }

    await prisma.order.update({
      where: { id: orderId },
      data: { financials }
    })

    const today = new Date().toISOString().split("T")[0]

    await this.upsertProfitSummary(today, financials)

    return financials
  },

  async recordRtoLoss(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    })

    if (!order) return null

    const defaults = await getFinancialDefaults()
    const shippingLoss = defaults.shipping * 2
    const packagingLoss = 50
    const totalLoss = shippingLoss + packagingLoss

    const financials = { cogs: 0, shipping: totalLoss, adSpend: defaults.adSpend, revenue: 0, netProfit: -totalLoss, isLoss: true }

    await prisma.order.update({
      where: { id: orderId },
      data: { financials }
    })

    const today = new Date().toISOString().split("T")[0]

    await prisma.profitSummary.upsert({
      where: { date: today },
      update: {
        lossRecovery: { increment: totalLoss },
        netProfit: { decrement: totalLoss },
        totalAdSpend: { increment: defaults.adSpend }
      },
      create: {
        date: today,
        lossRecovery: totalLoss,
        netProfit: -totalLoss,
        totalAdSpend: defaults.adSpend
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
