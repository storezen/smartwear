import { z } from "zod";

export const ProductStatusEnum = z.enum([
  "Active",
  "Draft",
  "Out of Stock"
]);

export const ProductCreationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  category_slug: z.string().min(1, "Category is required"),
  price: z.number().positive("Price must be positive"),
  cost_price: z.number().nonnegative("Cost price cannot be negative").optional(),
  compare_price: z.number().optional().nullable(),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  images: z.array(z.string().url("Must be a valid image URL")).min(1, "At least one image is required"),
  colors: z.array(z.string()).optional(),
  specifications: z.record(z.unknown()).optional(),
  status: ProductStatusEnum.default("Draft"),
  is_active: z.boolean().optional(),
  upsell_accessories: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export const ProductUpdateSchema = ProductCreationSchema.partial().extend({
  id: z.string().min(1, "Product ID is required"),
  is_active: z.boolean().optional(),
});

export type ProductCreation = z.infer<typeof ProductCreationSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
