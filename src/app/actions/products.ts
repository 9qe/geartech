"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productSchema } from "@/lib/validation";
import { toFils } from "@/lib/money";
import { revalidatePath } from "next/cache";

export async function createProductAction(input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT", issues: parsed.error.issues };
  const d = parsed.data;
  const created = await prisma.product.create({
    data: {
      slug: d.slug,
      titleAr: d.titleAr,
      titleEn: d.titleEn,
      descriptionAr: d.descriptionAr,
      descriptionEn: d.descriptionEn,
      specifications: JSON.stringify([]),
      priceFils: toFils(d.priceJOD),
      compareAtFils: d.compareAtJOD ? toFils(d.compareAtJOD) : null,
      costFils: toFils(d.costJOD ?? 0),
      sku: d.sku || null,
      stockQuantity: d.stockQuantity,
      trackInventory: d.trackInventory,
      categoryId: d.categoryId || null,
      badgeLabel: d.badgeLabel || null,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      isBundleEligible: d.isBundleEligible,
      sortOrder: d.sortOrder,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true as const, id: created.id };
}

export async function updateProductAction(id: string, input: unknown) {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT", issues: parsed.error.issues };
  const d = parsed.data;
  await prisma.product.update({
    where: { id },
    data: {
      slug: d.slug,
      titleAr: d.titleAr,
      titleEn: d.titleEn,
      descriptionAr: d.descriptionAr,
      descriptionEn: d.descriptionEn,
      priceFils: toFils(d.priceJOD),
      compareAtFils: d.compareAtJOD ? toFils(d.compareAtJOD) : null,
      costFils: toFils(d.costJOD ?? 0),
      sku: d.sku || null,
      stockQuantity: d.stockQuantity,
      trackInventory: d.trackInventory,
      categoryId: d.categoryId || null,
      badgeLabel: d.badgeLabel || null,
      isActive: d.isActive,
      isFeatured: d.isFeatured,
      isBundleEligible: d.isBundleEligible,
      sortOrder: d.sortOrder,
    },
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/");
  return { ok: true as const };
}

export async function archiveProductAction(id: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { isActive: false, archivedAt: new Date() } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  const hasOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (hasOrders > 0) return { ok: false as const, error: "HAS_ORDERS_USE_ARCHIVE" };
  // remove media + product
  await prisma.productMedia.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { ok: true as const };
}

export async function adjustStockAction(id: string, delta: number, note?: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return { ok: false as const, error: "NOT_FOUND" };
  const newQty = p.stockQuantity + delta;
  if (newQty < 0) return { ok: false as const, error: "NEGATIVE_STOCK" };
  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { stockQuantity: newQty } }),
    prisma.inventoryMovement.create({
      data: { productId: id, quantityChange: delta, movementType: "ADJUSTMENT", note: note || "Manual adjustment" },
    }),
  ]);
  revalidatePath("/admin/products");
  return { ok: true as const, stockQuantity: newQty };
}
