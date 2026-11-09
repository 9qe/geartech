"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createBundleRuleAction(input: {
  minimumEligibleItems: number;
  discountPercentage: number;
  freeDelivery: boolean;
  priority: number;
  enabled: boolean;
}) {
  await requireAdmin();
  if (input.minimumEligibleItems < 1) return { ok: false as const, error: "INVALID_MIN" };
  if (input.discountPercentage < 0 || input.discountPercentage > 100) return { ok: false as const, error: "INVALID_DISCOUNT" };
  await prisma.bundleRule.create({ data: input });
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateBundleRuleAction(id: string, input: {
  minimumEligibleItems: number;
  discountPercentage: number;
  freeDelivery: boolean;
  priority: number;
  enabled: boolean;
}) {
  await requireAdmin();
  await prisma.bundleRule.update({ where: { id }, data: input });
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteBundleRuleAction(id: string) {
  await requireAdmin();
  await prisma.bundleRule.delete({ where: { id } });
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  return { ok: true as const };
}

export async function toggleBundleRuleAction(id: string, enabled: boolean) {
  await requireAdmin();
  await prisma.bundleRule.update({ where: { id }, data: { enabled } });
  revalidatePath("/admin/bundles");
  revalidatePath("/");
  return { ok: true as const };
}
