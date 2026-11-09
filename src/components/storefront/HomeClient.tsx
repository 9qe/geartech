"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShoppingBag,
  ShoppingCart,
  Wallet,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ReelsFeed from "@/components/ReelsFeed";
import BundleBuilder from "@/components/BundleBuilder";
import CartDrawer from "@/components/CartDrawer";
import GearBotAI from "@/components/GearBotAI";
import {
  BRAND,
  CATEGORIES,
  FREE_DELIVERY_THRESHOLD,
  WHATSAPP_NUMBER,
  formatJOD,
} from "@/data/products";
import type { Product } from "@/data/products";
import type { ProductDTO } from "@/lib/catalog";
import type { ReelCard } from "@/components/ReelsFeed";
import { useStore } from "@/store/useStore";
import { cn, t } from "@/lib/utils";

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const lang = useStore((s) => s.lang);
  const discount =
    product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/7 bg-[#0E1014] transition-colors hover:border-white/18"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-[#060709]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={t(product.title, lang)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute start-3 top-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/85 backdrop-blur">
            {t(product.badge, lang)}
          </span>
        )}
        {discount > 0 && !product.badge && (
          <span className="absolute end-3 top-3 rounded-full bg-[#14B8A6] px-2 py-1 text-[10px] font-black text-[#060709]">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-white transition-colors hover:text-[#14B8A6]"
        >
          {t(product.title, lang)}
        </Link>

        <div className="flex items-baseline gap-2">
          <span className="text-base font-black text-[#14B8A6]">
            {formatJOD(product.price)}
          </span>
          {product.compareAt > product.price && (
            <span className="text-xs text-white/40 line-through">
              {formatJOD(product.compareAt)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => onAdd(product)}
          className="mt-auto flex items-center justify-center gap-2 rounded-lg border border-[#14B8A6]/40 bg-[#14B8A6]/10 px-3 py-2 text-xs font-bold text-[#14B8A6] transition-colors hover:bg-[#14B8A6] hover:text-[#060709]"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {lang === "ar" ? "أضف للسلة" : "Add to cart"}
        </button>
      </div>
    </motion.article>
  );
}

export default function HomeClient({
  products: dbProducts,
  reels,
}: {
  products: ProductDTO[];
  reels: ReelCard[];
}) {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const searchQuery = useStore((s) => s.searchQuery);
  const activeCategory = useStore((s) => s.activeCategory);
  const setActiveCategory = useStore((s) => s.setActiveCategory);
  const addToCart = useStore((s) => s.addToCart);

  const mappedProducts = useMemo<Product[]>(
    () =>
      dbProducts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        price: p.price,
        compareAt: p.compareAt ?? p.price,
        badge: p.badge,

        category: (p.categorySlug ?? "gadgets") as Product["category"],
        image: p.primaryImage ?? "/brand/no-image.svg",
        gallery: p.media.filter((m) => m.type === "IMAGE").map((m) => m.url),
        specs: p.specs,
        installation: { ar: "", en: "" },
        reviews: [],
        stock: p.stock,
        soldCount: 0,
        rating: 0,
      })),
    [dbProducts]
  );

  const allProducts = useMemo<Product[]>(
    () => [...mappedProducts, ...adminProducts],
    [mappedProducts, adminProducts]
  );

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allProducts.filter((p) => {
      const catOk = activeCategory === "all" || p.category === activeCategory;
      if (!catOk) return false;
      if (!q) return true;
      return (
        p.title.ar.toLowerCase().includes(q) ||
        p.title.en.toLowerCase().includes(q) ||
        p.description.ar.toLowerCase().includes(q) ||
        p.description.en.toLowerCase().includes(q)
      );
    });
  }, [allProducts, activeCategory, searchQuery]);

  const trustBadges = [
    { text: lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery" },
    { text: lang === "ar" ? "تحويل CliQ" : "CliQ Transfer" },
    { text: lang === "ar" ? "توصيل لجميع المحافظات" : "Delivery across Jordan" },
    { text: lang === "ar" ? "سياسة استبدال واضحة" : "Clear replacement policy" },
  ];

  const whatsappLink = WHATSAPP_NUMBER
    ? `https://wa.me/${WHATSAPP_NUMBER}`
    : null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#060709]">
      <Navbar />

      {/* ── Hero (editorial two-column) ─────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="mb-4 text-[11px] font-extrabold tracking-widest text-[#14B8A6] uppercase">
              GearTech — {lang === "ar" ? "من عمّان" : "From Amman"}
            </p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
              {lang === "ar" ? (
                <>
                  تقنية أذكى.<br />
                  <span className="text-[#14B8A6]">تفاصيل تفرق.</span>
                </>
              ) : (
                <>
                  Smarter tech.<br />
                  <span className="text-[#14B8A6]">Details that matter.</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              {lang === "ar"
                ? "إكسسوارات وتقنيات مختارة لسيارتك، بتوصيل لجميع محافظات الأردن."
                : "Curated automotive accessories and tech for your car, delivered across Jordan."}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#products"
                className="rounded-xl bg-[#14B8A6] px-6 py-3 text-sm font-black text-[#060709] transition-all hover:brightness-110"
              >
                {lang === "ar" ? "تسوّق التشكيلة" : "Shop the collection"}
              </a>
              <a
                href="#bundles"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-black text-white transition-all hover:border-[#14B8A6]/60 hover:text-[#14B8A6]"
              >
                {lang === "ar" ? "كون باقتك" : "Build your bundle"}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/7 bg-[#0E1014]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mappedProducts[0]?.image ?? "/brand/no-image.svg"}
                alt={mappedProducts[0] ? mappedProducts[0].title[lang] : "GearTech"}
                className="h-full w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Trust strip (single, monochrome) ────────────────── */}
      <section
        aria-label={lang === "ar" ? "مزايا المتجر" : "Store perks"}
        className="border-y border-white/7 bg-[#0E1014] py-4"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-xs font-semibold text-white/70 sm:px-6">
          {trustBadges.map((b) => (
            <span key={b.text} className="whitespace-nowrap">{b.text}</span>
          ))}
        </div>
      </section>

      {/* ── Reels ────────────────────────────────────────────── */}
      <section id="reels" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-xl">
          <p className="mb-2 text-[11px] font-extrabold tracking-widest text-[#FF2A54] uppercase">
            {lang === "ar" ? "فيروسي" : "Viral"}
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === "ar" ? "تسوّق من الريلز" : "Shop the Viral Reel"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {lang === "ar"
              ? "شوف المنتج بالمقطع وضيفه لسلتك بضغطة وحدة."
              : "See it in the clip, add it to your cart in one tap."}
          </p>
        </div>
        <ReelsFeed reels={reels} />
      </section>

      {/* ── Products ─────────────────────────────────────────── */}
      <section id="products" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div className="mb-8 max-w-xl">
          <p className="mb-2 text-[11px] font-extrabold tracking-widest text-[#14B8A6] uppercase">
            {lang === "ar" ? "المتجر" : "The Store"}
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === "ar" ? "كل المنتجات" : "All Products"}
          </h2>
        </div>

        <div className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-xs font-black transition-all",
              activeCategory === "all"
                ? "bg-[#14B8A6] text-[#060709]"
                : "border border-white/15 bg-white/5 text-white/70 hover:border-[#14B8A6]/40 hover:text-[#14B8A6]"
            )}
          >
            {lang === "ar" ? "الكل" : "All"}
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-black transition-all",
                activeCategory === cat.id
                  ? "bg-[#14B8A6] text-[#060709]"
                  : "border border-white/15 bg-white/5 text-white/70 hover:border-[#14B8A6]/40 hover:text-[#14B8A6]"
              )}
            >
              {t(cat.label, lang)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/7 bg-[#0E1014] px-6 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-white/25" />
            <p className="text-sm font-bold text-white/70">
              {lang === "ar" ? "ما في منتجات تطابق بحثك" : "No products match your search"}
            </p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={(p) => addToCart(p)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ── Bundles ──────────────────────────────────────────── */}
      <section id="bundles" className="scroll-mt-20 py-16">
        <div className="mx-auto mb-8 max-w-7xl px-4 sm:px-6">
          <p className="mb-2 text-[11px] font-extrabold tracking-widest text-[#FF2A54] uppercase">
            {lang === "ar" ? "وفّر أكثر" : "Save More"}
          </p>
          <h2 className="text-2xl font-black text-white sm:text-3xl">
            {lang === "ar" ? "ابنِ باقتك" : "Build Your Bundle"}
          </h2>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <BundleBuilder products={mappedProducts} />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/7 bg-[#0E1014]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          <div className="flex flex-col gap-3">
            <span className="text-xl font-black text-white">
              Gear<span className="text-[#14B8A6]">Tech</span>
            </span>
            <span className="text-sm font-bold text-white/70">{BRAND.handle}</span>
            <p className="text-xs leading-relaxed text-white/50">
              {lang === "ar"
                ? "إكسسوارات سيارات وتكنولوجيا — من عمّان للأردن كلها."
                : "Car accessories & tech — from Amman to all of Jordan."}
            </p>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-fit items-center gap-2 rounded-xl border border-[#14B8A6]/40 px-4 py-2.5 text-xs font-black text-[#14B8A6] transition-all hover:bg-[#14B8A6]/10"
              >
                {lang === "ar" ? "واتساب مباشر" : "Chat on WhatsApp"}
              </a>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "التوصيل" : "Delivery"}
            </h3>
            <p className="text-xs text-white/50">
              {lang === "ar"
                ? `التوصيل مجاني للطلبات فوق ${formatJOD(FREE_DELIVERY_THRESHOLD)}`
                : `Free delivery on orders over ${formatJOD(FREE_DELIVERY_THRESHOLD)}`}
            </p>
            <p className="text-xs text-white/40">
              {lang === "ar"
                ? "12 محافظة — rates managed in Admin"
                : "12 governorates — rates managed in Admin"}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "طرق الدفع" : "Payment Methods"}
            </h3>
            <div className="flex flex-col gap-2">
              <span className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/80">
                <Wallet className="h-4 w-4 text-[#14B8A6]" />
                {lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-white/7 bg-white/5 px-3 py-2.5 text-xs font-bold text-white/80">
                <Zap className="h-4 w-4 text-[#FF2A54]" />
                {lang === "ar" ? "تحويل CliQ فوري" : "CliQ Instant Transfer"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "تواصل" : "Contact"}
            </h3>
            <p className="text-xs text-white/55">{BRAND.city[lang]}</p>
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#14B8A6] hover:underline"
                dir="ltr"
              >
                +{WHATSAPP_NUMBER}
              </a>
            )}
            <p className="text-[11px] text-white/40">
              {lang === "ar"
                ? "نرد خلال دقائق — من 10 صباحاً لـ 11 مساءً."
                : "We reply in minutes — 10 AM to 11 PM."}
            </p>
          </div>
        </div>

        <div className="border-t border-white/7 py-5 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} {BRAND.name} {BRAND.handle} —{" "}
          {lang === "ar" ? "كل الحقوق محفوظة" : "All rights reserved"}
        </div>
      </footer>

      <CartDrawer />
      <GearBotAI />
    </div>
  );
}