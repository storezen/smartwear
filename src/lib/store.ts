import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  quantity: number
  selectedStrap: string
  selectedColor: string
  stockCount: number
  warehouse: string
}

export interface CheckoutForm {
  fullName: string
  phone: string
  city: string
  address: string
  notes?: string
}

interface StoreState {
  cart: CartItem[]
  isCheckoutModalOpen: boolean
  isSuccessModalOpen: boolean
  checkoutForm: CheckoutForm
  couponCode: string
  appliedDiscount: number // percentage
  activeStrapColors: Record<string, { strap: string; color: string; image: string }> // productId -> choices
  
  // Actions
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string, selectedStrap: string, selectedColor: string) => void
  updateQuantity: (id: string, selectedStrap: string, selectedColor: string, qty: number) => void
  clearCart: () => void
  setCheckoutModal: (open: boolean) => void
  setSuccessModal: (open: boolean) => void
  updateCheckoutForm: (form: Partial<CheckoutForm>) => void
  applyCoupon: (code: string) => boolean
  updateProductChoices: (productId: string, strap: string, color: string, image: string) => void
  
  // Computations
  getItemCount: () => number
  getSubtotal: () => number
  getDiscountAmount: () => number
  getDeliveryFee: () => number
  getTotal: () => number
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCheckoutModalOpen: false,
      isSuccessModalOpen: false,
      checkoutForm: {
        fullName: "",
        phone: "",
        city: "Lahore",
        address: "",
        notes: "",
      },
      couponCode: "",
      appliedDiscount: 0,
      activeStrapColors: {},

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (i) =>
              i.id === item.id &&
              i.selectedStrap === item.selectedStrap &&
              i.selectedColor === item.selectedColor
          )

          if (existingIndex > -1) {
            const updatedCart = [...state.cart]
            updatedCart[existingIndex].quantity += 1
            return { cart: updatedCart }
          }

          return { cart: [...state.cart, { ...item, quantity: 1 }] }
        })
      },

      removeItem: (id, selectedStrap, selectedColor) => {
        set((state) => ({
          cart: state.cart.filter(
            (i) =>
              !(i.id === id && i.selectedStrap === selectedStrap && i.selectedColor === selectedColor)
          ),
        }))
      },

      updateQuantity: (id, selectedStrap, selectedColor, qty) => {
        if (qty <= 0) {
          get().removeItem(id, selectedStrap, selectedColor)
          return
        }
        set((state) => ({
          cart: state.cart.map((i) =>
            i.id === id && i.selectedStrap === selectedStrap && i.selectedColor === selectedColor
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },

      clearCart: () => set({ cart: [], couponCode: "", appliedDiscount: 0 }),
      
      setCheckoutModal: (open) => set({ isCheckoutModalOpen: open }),
      setSuccessModal: (open) => set({ isSuccessModalOpen: open }),
      
      updateCheckoutForm: (form) =>
        set((state) => ({
          checkoutForm: { ...state.checkoutForm, ...form },
        })),

      applyCoupon: (code) => {
        const cleanCode = code.toUpperCase().trim()
        if (cleanCode === "SMART20" || cleanCode === "LAUNCH10" || cleanCode === "LUMS25") {
          let discount = 10
          if (cleanCode === "SMART20") discount = 20
          if (cleanCode === "LUMS25") discount = 25
          set({ couponCode: cleanCode, appliedDiscount: discount })
          return true
        }
        return false
      },

      updateProductChoices: (productId, strap, color, image) => {
        set((state) => ({
          activeStrapColors: {
            ...state.activeStrapColors,
            [productId]: { strap, color, image },
          },
        }))
      },

      getItemCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal()
        return Math.round((subtotal * get().appliedDiscount) / 100)
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal()
        if (subtotal === 0) return 0
        // Free shipping for orders above 2,500 PKR
        return subtotal > 2500 ? 0 : 250
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const discount = get().getDiscountAmount()
        const delivery = get().getDeliveryFee()
        return subtotal - discount + delivery
      },
    }),
    {
      name: "smartwear-tech-store-state",
      partialize: (state) => ({
        cart: state.cart,
        checkoutForm: state.checkoutForm,
        couponCode: state.couponCode,
        appliedDiscount: state.appliedDiscount,
      }),
    }
  )
)
