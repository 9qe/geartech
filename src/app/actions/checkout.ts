"use server";

import { createOrder } from "@/lib/orders";
import type { CartLine } from "@/lib/orders";

export async function placeOrderAction(payload: {
  fullName: string;
  phone: string;
  governorateId: string;
  city?: string;
  area?: string;
  street: string;
  addressDetails?: string;
  notes?: string;
  paymentMethod: "COD" | "CLIQ";
  cliqReference?: string;
  cart: CartLine[];
  idempotencyKey?: string;
}) {
  return createOrder({
    fullName: payload.fullName,
    phone: payload.phone,
    governorateId: payload.governorateId,
    city: payload.city ?? "",
    area: payload.area ?? "",
    street: payload.street,
    addressDetails: payload.addressDetails ?? "",
    notes: payload.notes ?? "",
    paymentMethod: payload.paymentMethod,
    cliqReference: payload.cliqReference ?? "",
    cart: payload.cart,
    idempotencyKey: payload.idempotencyKey,
  });
}
