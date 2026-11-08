import { PrismaClient } from "@prisma/client";
import {
  PRODUCTS,
  CATEGORIES,
  GOVERNORATES,
  BUNDLES,
  REELS,
  FREE_DELIVERY_THRESHOLD,
  WHATSAPP_NUMBER,
  BRAND,
} from "../src/data/products";

const prisma = new PrismaClient();

async function main() {
  // Categories
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { slug: c.id },
      update: {
        nameAr: c.label.ar,
        nameEn: c.label.en,
        isActive: true,
        sortOrder: i,
      },
      create: {
        slug: c.id,
        nameAr: c.label.ar,
        nameEn: c.label.en,
        isActive: true,
        sortOrder: i,
      },
    });
  }

  // Products (drop fake Unsplash media — store no media rows; UI renders designed no-image state)
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const cat = await prisma.category.findUnique({ where: { slug: p.category } });
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        titleAr: p.title.ar,
        titleEn: p.title.en,
        descriptionAr: p.description.ar,
        descriptionEn: p.description.en,
        specifications: JSON.stringify(p.specs),
        priceFils: Math.round(p.price * 1000),
        compareAtFils: Math.round(p.compareAt * 1000),
        costFils: 0,
        stockQuantity: p.stock,
        trackInventory: true,
        badgeLabel: p.badge?.ar ?? null,
        isActive: true,
        isFeatured: p.soldCount > 1000,
        isBundleEligible: true,
        sortOrder: i,
      },
      create: {
        slug: p.slug,
        titleAr: p.title.ar,
        titleEn: p.title.en,
        descriptionAr: p.description.ar,
        descriptionEn: p.description.en,
        specifications: JSON.stringify(p.specs),
        priceFils: Math.round(p.price * 1000),
        compareAtFils: Math.round(p.compareAt * 1000),
        costFils: 0,
        stockQuantity: p.stock,
        trackInventory: true,
        badgeLabel: p.badge?.ar ?? null,
        isActive: true,
        isFeatured: p.soldCount > 1000,
        isBundleEligible: true,
        sortOrder: i,
        categoryId: cat?.id ?? null,
      },
    });
    // media: bespoke illustration
    const imgUrl = `/products/illustrations/${p.slug}.svg`;
    const existingMedia = await prisma.productMedia.findFirst({ where: { productId: prod.id } });
    if (!existingMedia) {
      await prisma.productMedia.create({
        data: {
          productId: prod.id,
          mediaType: "IMAGE",
          originalUrl: imgUrl,
          optimizedUrl: imgUrl,
          altTextAr: p.title.ar,
          altTextEn: p.title.en,
          sortOrder: 0,
          isPrimary: true,
        },
      });
    }
  }

  // Governorates — all 12 official (fees only where previously configured; others unconfigured)
  const FULL_GOVS: { slug: string; ar: string; en: string; fee?: number }[] = [
    { slug: "amman", ar: "عمّان", en: "Amman", fee: 2.0 },
    { slug: "irbid", ar: "إربد", en: "Irbid", fee: 3.0 },
    { slug: "zarqa", ar: "الزرقاء", en: "Zarqa", fee: 3.0 },
    { slug: "balqa", ar: "البلقاء", en: "Balqa", fee: 3.0 },
    { slug: "mafraq", ar: "المفرق", en: "Mafraq" },
    { slug: "ajloun", ar: "عجلون", en: "Ajloun" },
    { slug: "jerash", ar: "جرش", en: "Jerash" },
    { slug: "madaba", ar: "مادبا", en: "Madaba" },
    { slug: "karak", ar: "الكرك", en: "Karak" },
    { slug: "tafilah", ar: "الطفيلة", en: "Tafilah" },
    { slug: "maan", ar: "معان", en: "Ma'an" },
    { slug: "aqaba", ar: "العقبة", en: "Aqaba", fee: 3.0 },
  ];
  // map old slugs (salt) -> balqa
  const feeBySlug = new Map(GOVERNORATES.map((g) => [g.id, g.deliveryFee]));
  for (let i = 0; i < FULL_GOVS.length; i++) {
    const g = FULL_GOVS[i];
    const fee = g.fee ?? feeBySlug.get(g.slug) ?? null;
    const gov = await prisma.governorate.upsert({
      where: { slug: g.slug },
      update: { nameAr: g.ar, nameEn: g.en, isActive: true, sortOrder: i },
      create: { slug: g.slug, nameAr: g.ar, nameEn: g.en, isActive: true, sortOrder: i },
    });
    await prisma.shippingRate.upsert({
      where: { governorateId: gov.id },
      update: {
        deliveryFeeFils: fee ? Math.round(fee * 1000) : 0,
        isConfigured: !!fee,
        isActive: true,
      },
      create: {
        governorateId: gov.id,
        deliveryFeeFils: fee ? Math.round(fee * 1000) : 0,
        isConfigured: !!fee,
        isActive: true,
      },
    });
  }

  // Bundle rules (defaults)
  const rules = [
    { minimumEligibleItems: 2, discountPercentage: 15, freeDelivery: true, priority: 1 },
    { minimumEligibleItems: 3, discountPercentage: 25, freeDelivery: true, priority: 2 },
  ];
  for (const r of rules) {
    const existing = await prisma.bundleRule.findFirst({
      where: { minimumEligibleItems: r.minimumEligibleItems },
    });
    if (!existing) {
      await prisma.bundleRule.create({ data: r });
    } else {
      await prisma.bundleRule.update({
        where: { id: existing.id },
        data: {
          discountPercentage: r.discountPercentage,
          freeDelivery: r.freeDelivery,
          enabled: true,
          priority: r.priority,
        },
      });
    }
  }

  // Prebuilt bundles (from BUNDLES) — store productIds empty placeholder; admin can edit
  for (const b of BUNDLES) {
    const existing = await prisma.bundle.findFirst({ where: { titleEn: b.name.en } });
    if (!existing) {
      await prisma.bundle.create({
        data: {
          titleAr: b.name.ar,
          titleEn: b.name.en,
          descriptionAr: b.name.ar,
          descriptionEn: b.name.en,
          productIds: JSON.stringify([]),
          discountPct: b.discountPct,
          isActive: true,
        },
      });
    }
  }

  // Homepage content (hero) — editable CMS seed
  const heroAr = await prisma.homepageContent.findUnique({
    where: { contentKey_locale: { contentKey: "HERO", locale: "ar" } },
  });
  if (!heroAr) {
    await prisma.homepageContent.create({
      data: {
        contentKey: "HERO",
        locale: "ar",
        headline: "خلّ ليلتك تتكلم",
        subheadline: "إكسسوارات سيارات وتكنولوجيا — من عمّان إلى سيارتك",
        body: "تجهيزات ليلية، تتبع، شحن، وتنظيف — مفحوصة من GearTech ومُرسَلة من عمّان.",
        ctaText: "تسوق التشكيلة",
        ctaDestination: "/products",
        isActive: true,
      },
    });
  }
  const heroEn = await prisma.homepageContent.findUnique({
    where: { contentKey_locale: { contentKey: "HERO", locale: "en" } },
  });
  if (!heroEn) {
    await prisma.homepageContent.create({
      data: {
        contentKey: "HERO",
        locale: "en",
        headline: "Make Your Night Speak",
        subheadline: "Automotive accessories & tech — from Amman to your car",
        body: "Night lighting, tracking, charging, cleaning — GearTech-inspected, shipped from Amman.",
        ctaText: "Shop the collection",
        ctaDestination: "/products",
        isActive: true,
      },
    });
  }

  // Announcement bar
  const annAr = await prisma.homepageContent.findUnique({
    where: { contentKey_locale: { contentKey: "ANNOUNCEMENT", locale: "ar" } },
  });
  if (!annAr) {
    await prisma.homepageContent.create({
      data: {
        contentKey: "ANNOUNCEMENT",
        locale: "ar",
        headline: "الدفع عند الاستلام — توصيل لجميع المحافظات",
        isActive: true,
      },
    });
  }

  // Reels (from REELS) — link to products by slug
  for (let i = 0; i < REELS.length; i++) {
    const r = REELS[i];
    const prod = await prisma.product.findUnique({ where: { slug: r.productIds[0] } });
    // skip if no real product link; here all link to real seeded products
    const existing = await prisma.reel.findFirst({ where: { titleEn: r.title.en } });
    if (!existing) {
      await prisma.reel.create({
        data: {
          titleAr: r.title.ar,
          titleEn: r.title.en,
          videoUrl: r.videoUrl,
          posterUrl: r.poster.includes("unsplash") ? null : r.poster,
          productId: prod?.id ?? null,
          manualViewLabel: r.views,
          isActive: true,
          sortOrder: i,
        },
      });
    }
  }

  // Store settings
  const settings: Record<string, unknown> = {
    storeName: BRAND.name,
    storeDescriptionAr: "إكسسوارات سيارات وتكنولوجيا من عمّان",
    storeDescriptionEn: "Automotive accessories & tech from Amman",
    whatsappNumber: WHATSAPP_NUMBER,
    instagram: "@geartechjo",
    tiktok: "",
    facebook: "",
    cliqAlias: "",
    cliqBeneficiary: "GearTech",
    cliqIban: "",
    cliqInstructions: "حوّل المبلغ ثم ابعت لقطة الشاشة على واتساب",
    freeShippingThresholdFils: Math.round(FREE_DELIVERY_THRESHOLD * 1000),
    replacementDays: 7,
    jordanPhonePrefixes: ["077", "078", "079"],
    currencyRates: { SAR: 0.128, AED: 0.101, USD: 0.378 },
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.storeSetting.upsert({
      where: { settingKey: key },
      update: { settingValue: JSON.stringify(value) },
      create: { settingKey: key, settingValue: JSON.stringify(value) },
    });
  }

  // Currency rates
  const rates = [
    { base: "JOD", target: "SAR", rate: 5.25, source: "seed" },
    { base: "JOD", target: "AED", rate: 5.12, source: "seed" },
    { base: "JOD", target: "USD", rate: 1.41, source: "seed" },
  ];
  for (const r of rates) {
    await prisma.currencyRate.upsert({
      where: { baseCurrency_targetCurrency: { baseCurrency: r.base, targetCurrency: r.target } },
      update: { exchangeRate: r.rate, source: r.source },
      create: { baseCurrency: r.base, targetCurrency: r.target, exchangeRate: r.rate, source: r.source },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
