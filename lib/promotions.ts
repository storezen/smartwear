import { getPromoByCode } from '@/lib/db'

export async function calculateDiscount(subtotal: number, promoCodeString?: string): Promise<{ discountAmount: number, error?: string, type?: string }> {
  if (!promoCodeString) return { discountAmount: 0 }

  const code = promoCodeString.toUpperCase().trim()
  const promo = await getPromoByCode(code)

  if (!promo) return { discountAmount: 0, error: 'Invalid promo code' }
  if (!promo.is_active) return { discountAmount: 0, error: 'Promo code is expired' }
  if (promo.min_order_value && subtotal < promo.min_order_value) {
    return { discountAmount: 0, error: `Minimum order value for this code is ₨ ${promo.min_order_value}` }
  }
  
  if (promo.max_uses !== null && promo.max_uses !== undefined && promo.usage_count >= promo.max_uses) {
    return { discountAmount: 0, error: 'Promo code usage limit reached' }
  }

  let discount = 0
  if (promo.discount_type === 'percentage') {
    discount = (subtotal * promo.discount_value) / 100
    if (promo.max_discount && discount > promo.max_discount) {
      discount = promo.max_discount
    }
  } else if (promo.discount_type === 'fixed') {
    discount = promo.discount_value
  } else if (promo.discount_type === 'free_shipping') {
    // We handle free shipping by returning a flag or just a specific error, but for now we'll just return discountAmount 0 and rely on the frontend or backend to read the promo type if needed, or we return the shipping cost as discount?
    // Actually, let's add `type: string` to the return.
    return { discountAmount: 0, type: 'free_shipping' }
  }

  return { discountAmount: discount, type: promo.discount_type }
}
