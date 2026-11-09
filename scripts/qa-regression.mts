import { createOrder } from "../src/lib/orders";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const JOD = (fils: number) => fils / 1000;
let failures = 0;
const assert = (cond: boolean, label: string) => {
  if (cond) { console.log("PASS", label); } else { failures++; console.log("FAIL", label); }
};

(async () => {
  // -- 1. twelve governorates with mandated fees -----------------
  const govs = await prisma.governorate.findMany({
    orderBy: { sortOrder: "asc" },
    include: { shippingRates: true },
  });
  assert(govs.length === 12, "12 governorates seeded");
  const feeByName: Record<string, number | null> = {};
  let allConfigured = true;
  for (const g of govs) {
    const rate = g.shippingRates[0];
    if (!rate || !rate.isConfigured) { allConfigured = false; feeByName[g.nameEn] = null; continue; }
    feeByName[g.nameEn] = rate.deliveryFeeFils;
  }
  assert(allConfigured, "every governorate has a configured fee");
  assert(feeByName["Amman"] === 2000, "Amman 2.00 JOD");
  assert(feeByName["Zarqa"] === 2500, "Zarqa 2.50 JOD");
  assert(feeByName["Balqa"] === 2500, "Balqa 2.50 JOD");
  assert(feeByName["Madaba"] === 2500, "Madaba 2.50 JOD");
  for (const name of ["Irbid", "Jerash", "Ajloun", "Mafraq", "Karak", "Tafilah", "Ma'an", "Aqaba"]) {
    assert(feeByName[name] === 3000, `${name} 3.00 JOD`);
  }
  assert(!govs.some((g) => g.nameEn === "Salt"), "Salt is not a governorate");

  // -- 2. transactional order: 30.00 subtotal, 25% bundle, free delivery --
  const products = await prisma.product.findMany({
    where: { isBundleEligible: true, isActive: true },
    orderBy: { priceFils: "asc" },
  });
  const ten = products.find((p) => p.priceFils === 10000);
  assert(!!ten, "a 10.00 JOD bundle-eligible product exists");
  if (ten) {
    const gov = await prisma.governorate.findUnique({ where: { slug: "zarqa" } });
    assert(!!gov, "Zarqa exists");
    if (gov) {
      const res = await createOrder({
        fullName: "QA REGRESSION SUITE",
        phone: "0791234567",
        governorateId: gov.id,
        city: "QA",
        area: "QA",
        street: "QA Street 1",
        addressDetails: "",
        notes: "QA REGRESSION SUITE",
        paymentMethod: "COD",
        cliqReference: "",
        cart: [{ productId: ten.id, quantity: 3 }],
        idempotencyKey: "qa-regression-" + Date.now(),
      });
      assert(res.ok, "order creation succeeds");
      if (res.ok) {
        assert(res.subtotalFils === 30000, "subtotal 30.00 JOD");
        assert(res.discountFils === 7500, "bundle discount 7.50 JOD (25%)");
        assert(res.shippingFeeFils === 0, "delivery 0.00 JOD (threshold reached)");
        assert(res.totalFils === 22500, "total 22.50 JOD");
        assert(res.freeDelivery, "free delivery flag set");
        const r = res.receipt;
        assert(!!r, "persisted receipt returned");
        if (r) {
          assert(r.totalFils === 22500, "receipt total 22.50 JOD");
          assert(r.items.length > 0 && r.items.every((it) => it.unitPriceFils > 0), "receipt items have unit prices");
          assert(r.governorate?.en === "Zarqa", "receipt governorate persisted");
        }
        const again = await prisma.order.findUnique({
          where: { orderNumber: res.orderNumber },
          include: { items: true },
        });
        assert(again?.totalFils === 22500, "database persists 22.50 JOD");
        assert((again?.items.length ?? 0) > 0, "order items persisted");
      }
    }
  }

  // -- 3. rejects: unknown governorate and unknown product -------
  const bogusGov = await createOrder({
    fullName: "QA NEG",
    phone: "0791234567",
    governorateId: "no-such-gov",
    street: "X",
    city: "",
    area: "",
    paymentMethod: "COD",
    cart: [{ productId: products[0]?.id ?? "x", quantity: 1 }],
  });
  assert(!bogusGov.ok, "unknown governorate rejected");
  const bogusProd = govs[1];
  const res2 = await createOrder({
    fullName: "QA NEG2",
    phone: "0791234567",
    governorateId: bogusProd.id,
    street: "X",
    city: "",
    area: "",
    paymentMethod: "COD",
    cart: [{ productId: "missing-product-id", quantity: 1 }],
  });
  assert(!res2.ok, "unknown product rejected");
  const res3 = await createOrder({
    fullName: "QA NEG3",
    phone: "0791234567",
    governorateId: govs[1].id,
    street: "X",
    city: "",
    area: "",
    paymentMethod: "COD",
    cart: [],
  });
  assert(!res3.ok, "empty cart rejected");

  console.log(failures === 0 ? "ALL PASS" : `${failures} FAILURES`);
  await prisma.$disconnect();
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });