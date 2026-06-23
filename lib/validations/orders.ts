import { z } from "zod";

export const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "In Transit",
  "Delivered",
  "Returned",
  "Cancelled",
] as const

export const OrderStatusEnum = z.string()

export const OrderStatusUpdateSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
  status: OrderStatusEnum,
  postexId: z.string().optional().nullable(),
  note: z.string().optional(),
});

export const OrderCreationSchema = z.object({
  customer_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be valid"),
  shipping_address: z.object({
    address_line1: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default("Pakistan"),
  }),
  payment_method: z.enum(["COD", "Card"]),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      image: z.string().optional(),
      variant: z.string().optional(),
      color: z.string().optional(),
    })
  ).min(1, "Order must contain at least one item"),
  subtotal: z.number(),
  shipping_fee: z.number(),
  total: z.number(),
  idempotency_key: z.string().optional(),
  promo_code: z.string().optional(),
});

export type OrderStatusUpdate = z.infer<typeof OrderStatusUpdateSchema>;
export type OrderCreation = z.infer<typeof OrderCreationSchema>;
