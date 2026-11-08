"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Clock,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { PRODUCTS, formatJOD, type Product } from "@/data/products";
import { useStore } from "@/store/useStore";
import { cn, t } from "@/lib/utils";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            cls,
            i <= Math.round(rating)
              ? "fill-volt text-volt"
              : "text-white/20"
          )}
        />
      ))}
    </div>
  );
}

const parseSteps = (raw: string): string[] => {
  const parts = raw
    .split(/(?:^|\s)\d+\.\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts : [raw.trim()];
};

export default function ProductDetailClient({ slug, product: productProp }: { slug: string; product?: Product | null }) {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const addToCart = useStore((s) => s.addToCart);
  const router = useRouter();

  const allProducts = useMemo<Product[]>(
    () => [...PRODUCTS, ...adminProducts],
    [adminProducts]
  );
  const product = useMemo(
    () => productProp ?? allProducts.find((p) => p.slug === slug) ?? null,
    [productProp, allProducts, slug]
  );

  const [mainImage, setMainImage] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-6xl font-black text-white/10">404</p>
        <h1 className="text-xl font-black text-white">
          {lang === "ar"
            ? "المنتج غير موجود"
            : "This product doesn't exist"}
        </h1>
        <p className="max-w-sm text-sm text-white/55">
          {lang === "ar"
            ? " يمكن يكون اتنزّل أو الرابط غلط — ارجع للمتجر وشوف الجديد."
            : "It may have been removed or the link is off — head back to the store."}
        </p>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl bg-volt px-6 py-3 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
        >
          {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  const discount =
    product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  const gallery =
    product.gallery.length > 0 ? product.gallery : [product.image];
  const activeImage = mainImage ?? gallery[0];

  const steps = parseSteps(product.installation[lang]);

  const unitPrice = qty >= 2 ? product.price * 0.8 : product.price;
  const lineTotal = unitPrice * qty;
  const savedAmount = qty >= 2 ? product.price * 0.2 * qty : 0;

  const tiers = [
    {
      qty: 1,
      label: lang === "ar" ? "شراء 1" : "Buy 1",
      sub:
        lang === "ar"
          ? `السعر الكامل — ${formatJOD(product.price)}`
          : `Full price — ${formatJOD(product.price)}`,
      active: qty < 2,
    },
    {
      qty: 2,
      label: lang === "ar" ? "شراء 2 — وفّر 20%" : "Buy 2 — Save 20%",
      sub:
        lang === "ar"
          ? `${formatJOD(product.price * 0.8)} للقطعة`
          : `${formatJOD(product.price * 0.8)} each`,
      active: qty >= 2,
    },
  ];

  const remaining = product.stock;
  const totalUnits = product.stock + product.soldCount;
  const soldPct = totalUnits > 0 ? (product.soldCount / totalUnits) * 100 : 0;

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAdd = () => addToCart(product, qty);
  const handleBuyNow = () => {
    addToCart(product, qty);
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-obsidian pb-28 md:pb-10">
      {/* ── Breadcrumb ───────────────────────────────────────── */}
      <div className="border-b border-white/10 bg-carbon/60">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 text-xs text-white/50">
          <Link href="/" className="font-bold hover:text-volt">
            {lang === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <Link href="/#products" className="font-bold hover:text-volt">
            {lang === "ar" ? "المنتجات" : "Products"}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
          <span className="line-clamp-1 text-white/85">
            {t(product.title, lang)}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <Link
          href="/#products"
          className="mb-5 inline-flex items-center gap-2 text-xs font-black text-white/60 transition-colors hover:text-volt"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {lang === "ar" ? "رجوع للمنتجات" : "Back to products"}
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ── Gallery ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-carbon">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt={t(product.title, lang)}
                className="aspect-[4/3] w-full object-cover"
              />
              {product.badge && (
                <span className="absolute start-3 top-3 rounded-full bg-racing px-3 py-1.5 text-[11px] font-black text-white shadow-lg">
                  {t(product.badge, lang)}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute end-3 top-3 rounded-full bg-volt px-3 py-1.5 text-[11px] font-black text-obsidian">
                  -{discount}%
                </span>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setMainImage(img)}
                  aria-label={`${lang === "ar" ? "صورة" : "Image"} ${i + 1}`}
                  className={cn(
                    "relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                    activeImage === img
                      ? "border-volt glow-volt"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* ── Info ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4"
          >
            <h1 className="text-2xl font-black leading-snug text-white sm:text-3xl">
              {t(product.title, lang)}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <Stars rating={product.rating} />
              <span className="font-bold text-white/80">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-white/35">|</span>
              <span className="flex items-center gap-1 text-white/60">
                <TrendingUp className="h-3.5 w-3.5 text-racing" />
                {lang === "ar"
                  ? `${product.soldCount.toLocaleString("en-US")} مبيع`
                  : `${product.soldCount.toLocaleString("en-US")} sold`}
              </span>
            </div>

            {/* Price block */}
            <div className="glass flex flex-wrap items-end gap-3 rounded-2xl p-4">
              <span className="text-3xl font-black text-volt text-glow-volt">
                {formatJOD(lineTotal)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-sm text-white/40 line-through">
                    {formatJOD(product.compareAt * qty)}
                  </span>
                  <span className="rounded-md bg-racing px-2 py-1 text-[11px] font-black text-white">
                    {lang === "ar" ? "خصم" : "Save"} {discount}%
                  </span>
                </>
              )}
              {qty >= 2 && (
                <span className="w-full text-[11px] font-bold text-volt">
                  {lang === "ar"
                    ? `القطعة بـ${formatJOD(unitPrice)} — وفّرت ${formatJOD(
                        savedAmount
                      )}`
                    : `Effective ${formatJOD(
                        unitPrice
                      )}/unit — you saved ${formatJOD(savedAmount)}`}
                </span>
              )}
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              {t(product.description, lang)}
            </p>

            {/* Quantity-break tiers */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-black tracking-widest text-white/45 uppercase">
                {lang === "ar" ? "عروض الكمية" : "Quantity Breaks"}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {tiers.map((tier) => (
                  <button
                    key={tier.qty}
                    type="button"
                    onClick={() => setQty(tier.qty)}
                    className={cn(
                      "rounded-xl border px-3 py-3 text-start transition-all",
                      tier.active
                        ? "border-volt bg-volt/10 glow-volt"
                        : "border-white/15 bg-white/5 hover:border-volt/40"
                    )}
                  >
                    <span
                      className={cn(
                        "block text-xs font-black",
                        tier.active ? "text-volt" : "text-white/85"
                      )}
                    >
                      {tier.label}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-white/55">
                      {tier.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + actions */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-3 text-sm font-black text-white/70 hover:text-volt"
                  aria-label="−"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-black text-white">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-4 py-3 text-sm font-black text-white/70 hover:text-volt"
                  aria-label="+"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-volt px-5 py-3 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-racing bg-racing/15 px-5 py-3 text-sm font-black text-racing transition-all hover:shadow-[0_0_24px_rgba(255,42,84,0.35)] active:scale-95"
              >
                <Zap className="h-4 w-4" />
                {lang === "ar" ? "اشترِ الآن" : "Buy Now"}
              </button>
            </div>

            {/* Stock bar */}
            <div className="glass rounded-xl p-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold">
                <span className={cn("text-racing", remaining <= 15 && "animate-scarce")}>
                  {lang === "ar"
                    ? `فقط ${remaining} قطعة متبقية`
                    : `Only ${remaining} left in stock`}
                </span>
                <span className="text-white/55">
                  {lang === "ar"
                    ? `${product.soldCount.toLocaleString("en-US")} مبيع`
                    : `${product.soldCount.toLocaleString("en-US")} sold`}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${soldPct}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-racing to-volt"
                />
              </div>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  icon: Truck,
                  text: lang === "ar" ? "توصيل سريع" : "Fast delivery",
                },
                {
                  icon: ShieldCheck,
                  text: lang === "ar" ? "فحص قبل الشحن" : "Inspected",
                },
                {
                  icon: PackageCheck,
                  text: lang === "ar" ? "استبدال 7 أيام" : "7-day swap",
                },
              ].map((perk) => (
                <div
                  key={perk.text}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-center"
                >
                  <perk.icon className="h-4.5 w-4.5 text-volt" />
                  <span className="text-[10px] font-bold text-white/65">
                    {perk.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Specs ────────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-black text-white">
            {lang === "ar" ? "المواصفات" : "Specifications"}
          </h2>
          <div className="glass overflow-hidden rounded-2xl">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((spec, i) => (
                  <tr
                    key={i}
                    className={cn(
                      i % 2 === 1 && "bg-white/[0.03]",
                      "border-b border-white/5 last:border-b-0"
                    )}
                  >
                    <td className="w-1/3 px-4 py-3 font-bold text-white/55">
                      {t(spec.label, lang)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white/90">
                      {t(spec.value, lang)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Installation ─────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <Clock className="h-5 w-5 text-volt" />
            {lang === "ar" ? "دليل التركيب" : "Installation Guide"}
          </h2>
          <ol className="glass flex flex-col gap-3 rounded-2xl p-5">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-volt text-xs font-black text-obsidian">
                  {i + 1}
                </span>
                <span className="pt-1 text-sm leading-relaxed text-white/75">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Reviews ──────────────────────────────────────── */}
        <section className="mt-12">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-black text-white">
            <Star className="h-5 w-5 fill-volt text-volt" />
            {lang === "ar" ? "آراء العملاء" : "Customer Reviews"}
          </h2>
          {product.reviews.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-sm text-white/55">
              {lang === "ar"
                ? "لسه ما في تقييمات — كن أول واحد يقيّم بعد الشراء."
                : "No reviews yet — be the first after you order."}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {product.reviews.map((review) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  className="glass flex flex-col gap-2.5 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-volt/15 text-xs font-black text-volt">
                        {review.name.charAt(0)}
                      </span>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1.5 text-sm font-black text-white">
                          {review.name}
                          {review.verified && (
                            <BadgeCheck
                              className="h-3.5 w-3.5 text-volt"
                              aria-label={
                                lang === "ar" ? "شراء موثّق" : "Verified purchase"
                              }
                            />
                          )}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {t(review.governorate, lang)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-white/40" dir="ltr">
                      {new Date(review.date).toLocaleDateString(
                        lang === "ar" ? "ar-JO" : "en-GB"
                      )}
                    </span>
                  </div>
                  <Stars rating={review.rating} />
                  <p className="text-xs leading-relaxed text-white/70">
                    {t(review.text, lang)}
                  </p>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        {/* ── Related ──────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-lg font-black text-white">
              {lang === "ar" ? "منتجات مشابهة" : "Related Products"}
            </h2>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/product/${rel.slug}`}
                  className="glass group flex flex-col overflow-hidden rounded-2xl transition-all hover:border-volt/40 hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-obsidian">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={rel.image}
                      alt={t(rel.title, lang)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {rel.badge && (
                      <span className="absolute start-2 top-2 rounded-full bg-racing px-2 py-1 text-[10px] font-bold text-white">
                        {t(rel.badge, lang)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 p-3">
                    <span className="line-clamp-2 text-xs font-bold leading-snug text-white group-hover:text-volt">
                      {t(rel.title, lang)}
                    </span>
                    <span className="text-sm font-black text-volt">
                      {formatJOD(rel.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Sticky mobile buy bar ────────────────────────────── */}
      <div className="glass-strong fixed inset-x-0 bottom-0 z-50 flex items-center gap-3 border-t border-white/10 px-4 py-3 md:hidden">
        <div className="flex flex-col">
          <span className="text-lg font-black leading-none text-volt">
            {formatJOD(lineTotal)}
          </span>
          {qty >= 2 && (
            <span className="text-[10px] font-bold text-racing">
              {lang === "ar" ? "خصم الكمية مطبّق" : "Quantity discount applied"}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3 text-sm font-black text-obsidian active:scale-95"
        >
          <ShoppingCart className="h-4 w-4" />
          {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
