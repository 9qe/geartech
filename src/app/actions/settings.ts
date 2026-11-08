"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toFils } from "@/lib/money";
import { setStoreSetting } from "@/lib/pricing";
import { revalidatePath } from "next/cache";

export async function updateShippingRateAction(governorateId: string, feeJOD: number, actualCostJOD: number, isConfigured: boolean, isActive: boolean) {
  await requireAdmin();
  await prisma.shippingRate.upsert({
    where: { governorateId },
    update: {
      deliveryFeeFils: toFils(feeJOD),
      actualCostFils: toFils(actualCostJOD),
      isConfigured,
      isActive,
    },
    create: {
      governorateId,
      deliveryFeeFils: toFils(feeJOD),
      actualCostFils: toFils(actualCostJOD),
      isConfigured,
      isActive,
    },
  });
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function updateFreeShippingThresholdAction(thresholdJOD: number) {
  await requireAdmin();
  await setStoreSetting("freeShippingThresholdFils", toFils(thresholdJOD));
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true as const };
}

export async function saveAllShippingAction(formData: FormData) {
  await requireAdmin();
  const govs = await prisma.governorate.findMany({ select: { id: true } });
  for (const g of govs) {
    const fee = Number(formData.get(`fee_${g.id}`) ?? 0);
    const cost = Number(formData.get(`cost_${g.id}`) ?? 0);
    const configured = formData.get(`configured_${g.id}`) === "on";
    const active = formData.get(`active_${g.id}`) === "on";
    await prisma.shippingRate.upsert({
      where: { governorateId: g.id },
      update: { deliveryFeeFils: toFils(fee), actualCostFils: toFils(cost), isConfigured: configured, isActive: active },
      create: { governorateId: g.id, deliveryFeeFils: toFils(fee), actualCostFils: toFils(cost), isConfigured: configured, isActive: active },
    });
  }
  const threshold = Number(formData.get("threshold") ?? 25);
  await setStoreSetting("freeShippingThresholdFils", toFils(threshold));
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true as const };
}

export async function saveStoreSettingsAction(formData: FormData) {
  await requireAdmin();
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const settings: Record<string, unknown> = {
    storeName: get("storeName"),
    whatsappNumber: get("whatsappNumber"),
    instagram: get("instagram"),
    tiktok: get("tiktok"),
    facebook: get("facebook"),
    cliqAlias: get("cliqAlias"),
    cliqBeneficiary: get("cliqBeneficiary"),
    cliqIban: get("cliqIban"),
    cliqInstructions: get("cliqInstructions"),
    replacementDays: Number(get("replacementDays") || 7),
  };
  for (const [key, value] of Object.entries(settings)) {
    await setStoreSetting(key, value);
  }
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

