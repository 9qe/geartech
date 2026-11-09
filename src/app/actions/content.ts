"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateHeroAction(locale: string, data: { headline: string; subheadline: string; body: string; ctaText: string; ctaDestination: string }) {
  await requireAdmin();
  await prisma.homepageContent.upsert({
    where: { contentKey_locale: { contentKey: "HERO", locale } },
    update: { ...data, isActive: true },
    create: { contentKey: "HERO", locale, ...data, isActive: true },
  });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true as const };
}

export async function createReelAction(input: {
  titleAr: string; titleEn: string; videoUrl: string; posterUrl: string | null; productId: string | null; manualViewLabel: string | null; sortOrder: number; isActive: boolean;
}) {
  await requireAdmin();
  await prisma.reel.create({ data: input });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true as const };
}

export async function updateReelAction(id: string, input: {
  titleAr: string; titleEn: string; videoUrl: string; posterUrl: string | null; productId: string | null; manualViewLabel: string | null; sortOrder: number; isActive: boolean;
}) {
  await requireAdmin();
  await prisma.reel.update({ where: { id }, data: input });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteReelAction(id: string) {
  await requireAdmin();
  await prisma.reel.delete({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true as const };
}

export async function toggleReelAction(id: string, isActive: boolean) {
  await requireAdmin();
  await prisma.reel.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true as const };
}
