export interface PostexCharges {
  transactionFee: number | null
  transactionTax: number | null
  upfrontPayment: number | null
  balancePayment: number | null
  reservePayment: number | null
  invoicePayment: number | null
}

export async function fetchPostexCharges(trackingNumber: string, apiToken: string): Promise<PostexCharges | null> {
  if (!trackingNumber || !apiToken) return null

  try {
    const res = await fetch(
      `https://api.postex.pk/services/integration/api/order/v1/track-order/${encodeURIComponent(trackingNumber)}`,
      {
        headers: { token: apiToken },
      }
    )

    if (!res.ok) {
      console.warn(`[POSTEX] track-order failed for ${trackingNumber}: ${res.status}`)
      return null
    }

    const data = await res.json()
    if (data.statusCode !== "200" || !data.dist) return null

    const d = data.dist
    return {
      transactionFee: d.transactionFee ?? null,
      transactionTax: d.transactionTax ?? null,
      upfrontPayment: d.upfrontPayment ?? null,
      balancePayment: d.balancePayment ?? null,
      reservePayment: d.reservePayment ?? null,
      invoicePayment: d.invoicePayment ?? null,
    }
  } catch (err) {
    console.error(`[POSTEX] Error fetching charges for ${trackingNumber}:`, err)
    return null
  }
}
