import { prisma } from "./db";

export interface BundleTier {
  minimumEligibleItems: number;
  discountPercentage: number;
  freeDelivery: boolean;
  priority: number;
}

export async function getBundleRules(): Promise<BundleTier[]> {
  const rows = await prisma.bundleRule.findMany({
    where: { enabled: true },
    orderBy: [{ priority: "desc" }, { minimumEligibleItems: "desc" }],
  });
  return rows.map((r) => ({
    minimumEligibleItems: r.minimumEligibleItems,
    discountPercentage: r.discountPercentage,
    freeDelivery: r.freeDelivery,
    priority: r.priority,
  }));
}

export interface BundleCalc {
  eligibleUnits: number;
  eligibleSubtotalFils: number;
  discountFils: number;
  discountPct: number;
  freeDelivery: boolean;
  tier: BundleTier | null;
}

export async function computeBundle(
  eligibleUnits: number,
  eligibleSubtotalFils: number
): Promise<BundleCalc> {
  const rules = await getBundleRules();
  const applicable = rules
    .filter((r) => eligibleUnits >= r.minimumEligibleItems)
    .sort((a, b) => b.discountPercentage - a.discountPercentage || b.minimumEligibleItems - a.minimumEligibleItems);
  const tier = applicable[0] ?? null;
  const discountPct = tier?.discountPercentage ?? 0;
  const discountFils = Math.round((eligibleSubtotalFils * discountPct) / 100);
  const freeDelivery = tier?.freeDelivery ?? false;
  return {
    eligibleUnits,
    eligibleSubtotalFils,
    discountFils,
    discountPct,
    freeDelivery,
    tier,
  };
}

export interface ShippingCalc {
  feeFils: number;
  isConfigured: boolean;
  freeDelivery: boolean;
}

export async function computeShipping(
  governorateId: string,
  subtotalFils: number,
  freeDeliveryFlag: boolean,
  freeShippingThresholdFils: number
): Promise<ShippingCalc> {
  const rate = await prisma.shippingRate.findUnique({
    where: { governorateId },
    include: { governorate: true },
  });
  const isConfigured = rate?.isConfigured ?? false;
  if (!isConfigured) {
    return { feeFils: 0, isConfigured: false, freeDelivery: false };
  }
  const freeDelivery =
    freeDeliveryFlag || subtotalFils >= freeShippingThresholdFils;
  const feeFils = freeDelivery ? 0 : (rate?.deliveryFeeFils ?? 0);
  return { feeFils, isConfigured: true, freeDelivery };
}

export async function getFreeShippingThresholdFils(): Promise<number> {
  const s = await prisma.storeSetting.findUnique({
    where: { settingKey: "freeShippingThresholdFils" },
  });
  if (s) {
    try {
      return JSON.parse(s.settingValue);
    } catch {
      /* fallthrough */
    }
  }
  return 25000;
}

export async function getStoreSetting<T = unknown>(key: string): Promise<T | null> {
  const s = await prisma.storeSetting.findUnique({ where: { settingKey: key } });
  if (!s) return null;
  try {
    return JSON.parse(s.settingValue) as T;
  } catch {
    return s.settingValue as unknown as T;
  }
}

export async function setStoreSetting(key: string, value: unknown): Promise<void> {
  await prisma.storeSetting.upsert({
    where: { settingKey: key },
    update: { settingValue: JSON.stringify(value) },
    create: { settingKey: key, settingValue: JSON.stringify(value) },
  });
}

// Jordan phone normalization + validation
export function normalizeJordanPhone(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  let local = digits;
  if (digits.startsWith("+962")) local = "0" + digits.slice(4);
  else if (digits.startsWith("962")) local = "0" + digits.slice(3);
  else if (digits.startsWith("00962")) local = "0" + digits.slice(5);
  if (!/^07[789]\d{7}$/.test(local)) return null;
  return local;
}

export function toInternationalPhone(local: string): string {
  return "+962" + local.slice(1);
}

export function isValidJordanPhone(input: string, allowedPrefixes?: string[]): boolean {
  const local = normalizeJordanPhone(input);
  if (!local) return false;
  if (allowedPrefixes && allowedPrefixes.length > 0) {
    const prefix = local.slice(0, 3);
    if (!allowedPrefixes.includes(prefix)) return false;
  }
  return true;
}
