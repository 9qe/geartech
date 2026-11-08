import { z } from "zod";

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(3, "الاسم مطلوب"),
  phone: z.string().trim().min(9, "رقم الهاتف مطلوب"),
  governorateId: z.string().min(1, "المحافظة مطلوبة"),
  city: z.string().trim().optional().default(""),
  area: z.string().trim().optional().default(""),
  street: z.string().trim().min(3, "العنوان مطلوب"),
  addressDetails: z.string().trim().optional().default(""),
  notes: z.string().trim().optional().default(""),
  paymentMethod: z.enum(["COD", "CLIQ"]),
  cliqReference: z.string().trim().optional().default(""),
  idempotencyKey: z.string().optional(),
});

export const productSchema = z.object({
  slug: z.string().trim().min(2),
  titleAr: z.string().trim().min(2),
  titleEn: z.string().trim().min(2),
  descriptionAr: z.string().trim().min(5),
  descriptionEn: z.string().trim().min(5),
  priceJOD: z.number().positive(),
  compareAtJOD: z.number().positive().optional().nullable(),
  costJOD: z.number().min(0).optional().default(0),
  sku: z.string().trim().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  trackInventory: z.boolean().default(true),
  categoryId: z.string().optional().nullable(),
  badgeLabel: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBundleEligible: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
