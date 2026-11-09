import { prisma } from "./db";
import { z } from "zod";
import { checkoutSchema } from "./validation";
import { normalizeJordanPhone, computeBundle, computeShipping, getFreeShippingThresholdFils, getStoreSetting } from "./pricing";

export type CartLine = { productId: string; quantity: number };

export async function createOrder(raw: z.infer<typeof checkoutSchema> & { cart: CartLine[]; idempotencyKey?: string }) {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "INVALID_INPUT", issues: parsed.error.issues };
  }
  const input = parsed.data;

  // idempotency
  if (raw.idempotencyKey) {
    const existing = await prisma.order.findUnique({ where: { idempotencyKey: raw.idempotencyKey } });
    if (existing) return { ok: true as const, orderId: existing.id, orderNumber: existing.orderNumber, duplicate: true };
  }

  const phoneLocal = normalizeJordanPhone(input.phone);
  if (!phoneLocal) return { ok: false as const, error: "INVALID_PHONE" };

  const allowedPrefixes = (await getStoreSetting<string[]>("jordanPhonePrefixes")) ?? ["077", "078", "079"];
  if (!allowedPrefixes.includes(phoneLocal.slice(0, 3))) {
    return { ok: false as const, error: "INVALID_PHONE_PREFIX" };
  }

  // governorate + shipping rate
  const gov = await prisma.governorate.findUnique({ where: { id: input.governorateId }, include: { shippingRates: true } });
  if (!gov || !gov.isActive) return { ok: false as const, error: "INVALID_GOVERNORATE" };
  const rate = gov.shippingRates[0];
  if (!rate || !rate.isConfigured) return { ok: false as const, error: "SHIPPING_NOT_CONFIGURED" };

  if (raw.cart.length === 0) return { ok: false as const, error: "EMPTY_CART" };

  // Load products from DB
  const ids = raw.cart.map((l) => l.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids } } });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Validate lines + stock
  for (const line of raw.cart) {
    const p = byId.get(line.productId);
    if (!p || !p.isActive) return { ok: false as const, error: "PRODUCT_UNAVAILABLE", productId: line.productId };
    if (line.quantity < 1 || line.quantity > 99) return { ok: false as const, error: "INVALID_QTY" };
    if (p.trackInventory && p.stockQuantity < line.quantity) return { ok: false as const, error: "INSUFFICIENT_STOCK", productId: line.productId };
  }

  // Compute eligible bundle subtotal
  let eligibleUnits = 0;
  let eligibleSubtotalFils = 0;
  let nonEligibleSubtotalFils = 0;
  for (const line of raw.cart) {
    const p = byId.get(line.productId)!;
    const lineTotal = p.priceFils * line.quantity;
    if (p.isBundleEligible) {
      eligibleUnits += line.quantity;
      eligibleSubtotalFils += lineTotal;
    } else {
      nonEligibleSubtotalFils += lineTotal;
    }
  }

  const bundle = await computeBundle(eligibleUnits, eligibleSubtotalFils);
  const subtotalFils = eligibleSubtotalFils + nonEligibleSubtotalFils;
  const discountFils = bundle.discountFils;

  const threshold = await getFreeShippingThresholdFils();
  const shipping = await computeShipping(gov.id, subtotalFils - discountFils, bundle.freeDelivery, threshold);
  // If shipping not configured, abort (already checked rate.isConfigured above, but re-check)
  if (!shipping.isConfigured) return { ok: false as const, error: "SHIPPING_NOT_CONFIGURED" };

  const totalFils = subtotalFils - discountFils + shipping.feeFils;

  // Customer upsert
  const customer = await prisma.customer.upsert({
    where: { normalizedPhone: phoneLocal },
    update: { fullName: input.fullName },
    create: { fullName: input.fullName, phone: input.phone, normalizedPhone: phoneLocal },
  });

  const orderNumber = `GT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // Transaction: create order + items + inventory movements
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerNameSnapshot: input.fullName,
        customerPhoneSnapshot: phoneLocal,
        governorateId: gov.id,
        addressSnapshot: JSON.stringify({
          city: input.city,
          area: input.area,
          street: input.street,
          details: input.addressDetails,
        }),
        orderStatus: "NEW",
        paymentMethod: input.paymentMethod as "COD" | "CLIQ",
        paymentStatus: "PENDING",
        subtotalFils,
        discountFils,
        shippingFeeFils: shipping.feeFils,
        totalFils,
        actualDeliveryCostFils: rate.actualCostFils,
        customerNotes: input.notes || null,
        cliqReference: input.cliqReference || null,
        idempotencyKey: raw.idempotencyKey || null,
      },
    });

    for (const line of raw.cart) {
      const p = byId.get(line.productId)!;
      // allocate discount proportionally to eligible items
      let allocated = 0;
      if (p.isBundleEligible && bundle.discountFils > 0 && eligibleSubtotalFils > 0) {
        const lineTotal = p.priceFils * line.quantity;
        allocated = Math.round((lineTotal / eligibleSubtotalFils) * bundle.discountFils);
      }
      await tx.orderItem.create({
        data: {
          orderId: o.id,
          productId: p.id,
          productTitleSnapshot: `${p.titleAr} / ${p.titleEn}`,
          productSkuSnapshot: p.sku,
          unitPriceFils: p.priceFils,
          unitCostFils: p.costFils,
          quantity: line.quantity,
          lineTotalFils: p.priceFils * line.quantity,
          discountAllocatedFils: allocated,
        },
      });

      if (p.trackInventory) {
        await tx.product.update({
          where: { id: p.id },
          data: { stockQuantity: { decrement: line.quantity } },
        });
        await tx.inventoryMovement.create({
          data: {
            productId: p.id,
            quantityChange: -line.quantity,
            movementType: "SALE",
            reference: orderNumber,
            note: "Checkout order",
          },
        });
      }
    }

    await tx.orderStatusHistory.create({
      data: { orderId: o.id, toStatus: "NEW", note: "Order created" },
    });

    return o;
  });

  // Persisted receipt — read back after commit so confirmation and
  // WhatsApp follow-up use DB truth, never client cart state.
  const persisted = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      governorate: true,
      items: true,
    },
  });

  return {
    ok: true as const,
    orderId: order.id,
    orderNumber: order.orderNumber,
    totalFils: order.totalFils,
    subtotalFils,
    discountFils,
    shippingFeeFils: shipping.feeFils,
    freeDelivery: shipping.freeDelivery || bundle.freeDelivery,
    receipt: persisted
      ? {
          orderNumber: persisted.orderNumber,
          totalFils: persisted.totalFils,
          subtotalFils: persisted.subtotalFils,
          discountFils: persisted.discountFils,
          shippingFeeFils: persisted.shippingFeeFils,
          paymentMethod: persisted.paymentMethod,
          paymentStatus: persisted.paymentStatus,
          orderStatus: persisted.orderStatus,
          createdAtISO: persisted.createdAt.toISOString(),
          customerName: persisted.customerNameSnapshot,
          customerPhone: persisted.customerPhoneSnapshot,
          addressSnapshot: persisted.addressSnapshot,
          governorate: persisted.governorate
            ? { ar: persisted.governorate.nameAr, en: persisted.governorate.nameEn }
            : null,
          freeDelivery: shipping.freeDelivery || bundle.freeDelivery,
          items: persisted.items.map((it) => ({
            titleAr: it.productTitleSnapshot,
            quantity: it.quantity,
            unitPriceFils: it.unitPriceFils,
            lineTotalFils: it.lineTotalFils,
          })),
        }
      : null,
  };
}
