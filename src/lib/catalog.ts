/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "./db";
import { fromFils } from "./money";
import { assetPath } from "./paths";

export interface ProductDTO {
  id: string;
  slug: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  specs: { label: { ar: string; en: string }; value: { ar: string; en: string } }[];
  price: number;
  compareAt: number | null;
  cost: number;
  sku: string | null;
  stock: number;
  trackInventory: boolean;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: { ar: string; en: string } | null;
  badge: { ar: string; en: string } | null;
  isActive: boolean;
  isFeatured: boolean;
  isBundleEligible: boolean;
  sortOrder: number;
  media: { id: string; type: string; url: string; poster: string | null; alt: { ar: string; en: string }; isPrimary: boolean; sortOrder: number }[];
  primaryImage: string | null;
}

function mapProduct(p: any): ProductDTO {
  const media = (p.media ?? []).map((m: any) => ({
    id: m.id,
    type: m.mediaType,
    url: assetPath(m.optimizedUrl || m.originalUrl) ?? "",
    poster: assetPath(m.posterUrl),
    alt: { ar: m.altTextAr || p.titleAr, en: m.altTextEn || p.titleEn },
    isPrimary: m.isPrimary,
    sortOrder: m.sortOrder,
  }));
  const primary =
    media.find((m: any) => m.isPrimary)?.url ||
    media[0]?.url ||
    null;
  let specs: any[] = [];
  try {
    const raw = p.specifications ? JSON.parse(p.specifications) : [];
    specs = raw.map((s: any) => ({
      label: { ar: s.label?.ar ?? s.labelAr ?? "", en: s.label?.en ?? s.labelEn ?? "" },
      value: { ar: s.value?.ar ?? s.valueAr ?? "", en: s.value?.en ?? s.valueEn ?? "" },
    }));
  } catch {
    specs = [];
  }
  return {
    id: p.id,
    slug: p.slug,
    title: { ar: p.titleAr, en: p.titleEn },
    description: { ar: p.descriptionAr, en: p.descriptionEn },
    specs,
    price: fromFils(p.priceFils),
    compareAt: p.compareAtFils ? fromFils(p.compareAtFils) : null,
    cost: fromFils(p.costFils),
    sku: p.sku,
    stock: p.stockQuantity,
    trackInventory: p.trackInventory,
    categoryId: p.categoryId,
    categorySlug: p.category?.slug ?? null,
    categoryName: p.category ? { ar: p.category.nameAr, en: p.category.nameEn } : null,
    badge: p.badgeLabel
      ? { ar: p.badgeLabel, en: p.badgeLabelEn ?? p.badgeLabel }
      : null,
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBundleEligible: p.isBundleEligible,
    sortOrder: p.sortOrder,
    media,
    primaryImage: primary,
  };
}

export async function getProducts(opts?: { featuredOnly?: boolean; bundleEligibleOnly?: boolean; activeOnly?: boolean }): Promise<ProductDTO[]> {
  const where: any = {};
  if (opts?.activeOnly !== false) where.isActive = true;
  if (opts?.featuredOnly) where.isFeatured = true;
  if (opts?.bundleEligibleOnly) where.isBundleEligible = true;
  const rows = await prisma.product.findMany({
    where,
    include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<ProductDTO | null> {
  const p = await prisma.product.findUnique({
    where: { slug },
    include: { category: true, media: { orderBy: { sortOrder: "asc" } } },
  });
  return p ? mapProduct(p) : null;
}

export async function getCategories() {
  const rows = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map((c) => ({ id: c.id, slug: c.slug, name: { ar: c.nameAr, en: c.nameEn }, image: assetPath(c.image), description: { ar: c.descriptionAr, en: c.descriptionEn } }));
}

export async function getReels() {
  const rows = await prisma.reel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  const productIds = rows.map((r) => r.productId).filter(Boolean) as string[];
  const products = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
      })
    : [];
  const byId = new Map(products.map((p) => [p.id, p]));
  return rows.map((r) => {
    const p = r.productId ? byId.get(r.productId) : null;
    return {
      id: r.id,
      title: { ar: r.titleAr, en: r.titleEn },
      videoUrl: r.videoUrl,
      poster: assetPath(r.posterUrl),
      viewLabel: r.manualViewLabel,
      sortOrder: r.sortOrder,
      product: p
        ? {
            id: p.id,
            slug: p.slug,
            title: { ar: p.titleAr, en: p.titleEn },
            price: fromFils(p.priceFils),
            image: assetPath(p.media?.[0]?.optimizedUrl || p.media?.[0]?.originalUrl) ?? null,
          }
        : null,
    };
  });
}

export async function getHomepageContent(key: string, locale: string) {
  return prisma.homepageContent.findUnique({
    where: { contentKey_locale: { contentKey: key as any, locale } },
  });
}

export async function getBundleRules() {
  return prisma.bundleRule.findMany({ where: { enabled: true }, orderBy: [{ priority: "desc" }, { minimumEligibleItems: "desc" }] });
}

export async function getGovernoratesWithRates() {
  const rows = await prisma.governorate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { shippingRates: true },
  });
  return rows.map((g) => ({
    id: g.id,
    slug: g.slug,
    name: { ar: g.nameAr, en: g.nameEn },
    rate: g.shippingRates[0]
      ? { feeFils: g.shippingRates[0].deliveryFeeFils, isConfigured: g.shippingRates[0].isConfigured }
      : null,
  }));
}

export async function getStoreSettings(): Promise<Record<string, any>> {
  const rows = await prisma.storeSetting.findMany();
  const out: Record<string, any> = {};
  for (const r of rows) {
    try {
      out[r.settingKey] = JSON.parse(r.settingValue);
    } catch {
      out[r.settingKey] = r.settingValue;
    }
  }
  return out;
}

export async function getAdminMetrics() {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  // Asia/Amman offset +3
  const ammanOffset = 3 * 60;
  const ammanNow = new Date(now.getTime() + ammanOffset * 60000);
  const ammanStart = new Date(ammanNow);
  ammanStart.setUTCHours(0, 0, 0, 0);
  const dayStartUTC = new Date(ammanStart.getTime() - ammanOffset * 60000);

  const [todayOrders, totalOrders, pendingCod, topProducts, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { createdAt: { gte: dayStartUTC }, orderStatus: { not: "CANCELLED" }, paymentStatus: { in: ["PAID", "PENDING"] } },
      select: { totalFils: true },
    }),
    prisma.order.count({ where: { orderStatus: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { paymentMethod: "COD", paymentStatus: "PENDING", orderStatus: { not: "CANCELLED" } } }),
    prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, lineTotalFils: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, orderNumber: true, customerNameSnapshot: true, totalFils: true, orderStatus: true, paymentMethod: true, createdAt: true },
    }),
  ]);

  const todayRevenueFils = todayOrders.reduce((s, o) => s + o.totalFils, 0);
  const aovFils = totalOrders > 0
    ? Math.round((await prisma.order.aggregate({ where: { orderStatus: { not: "CANCELLED" } }, _sum: { totalFils: true } }))._sum.totalFils! / totalOrders)
    : 0;

  // top products with titles
  const topIds = topProducts.map((t) => t.productId).filter(Boolean) as string[];
  const topProds = topIds.length ? await prisma.product.findMany({ where: { id: { in: topIds } }, select: { id: true, titleAr: true, titleEn: true } }) : [];
  const topWithTitle = topProducts.map((t) => ({
    productId: t.productId,
    quantity: t._sum.quantity ?? 0,
    revenueFils: t._sum.lineTotalFils ?? 0,
    title: topProds.find((p) => p.id === t.productId)?.titleAr ?? "—",
  }));

  return {
    todayRevenueFils,
    totalOrders,
    aovFils,
    pendingCod,
    topProducts: topWithTitle,
    recentOrders,
  };
}
