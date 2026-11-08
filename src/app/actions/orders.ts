"use server";

import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_DELIVERY", "CANCELLED"],
  IN_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

export async function updateOrderStatusAction(orderId: string, toStatus: string, note?: string) {
  const session = await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return { ok: false as const, error: "NOT_FOUND" };
  const allowed = ALLOWED_TRANSITIONS[order.orderStatus] ?? [];
  if (!allowed.includes(toStatus)) return { ok: false as const, error: "INVALID_TRANSITION" };

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { orderStatus: toStatus as OrderStatus } }),
    prisma.orderStatusHistory.create({
      data: { orderId, fromStatus: order.orderStatus, toStatus: toStatus as OrderStatus, note: note || null, changedBy: session.adminId },
    }),
  ]);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}

export async function updatePaymentStatusAction(orderId: string, paymentStatus: string) {
  await requireAdmin();
  await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: paymentStatus as PaymentStatus } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}

export async function addOrderNoteAction(orderId: string, note: string) {
  await requireAdmin();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { customerNotes: true } });
  const combined = [order?.customerNotes, note].filter(Boolean).join("\n---\n");
  await prisma.order.update({ where: { id: orderId }, data: { customerNotes: combined } });
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true as const };
}
