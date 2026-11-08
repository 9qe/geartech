"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Eye,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  Wallet,
  X,
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
  GOVERNORATES,
  PRODUCTS,
  WHATSAPP_NUMBER,
  formatJOD,
  type Product,
} from "@/data/products";
import { useStore } from "@/store/useStore";
import { cn, t } from "@/lib/utils";

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
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

function ProductCard({
  product,
  onAdd,
  onQuickView,
}: {
  product: Product;
  onAdd: (p: Product) => void;
  onQuickView: (slug: string) => void;
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
      className="group glass flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:border-volt/40 hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-obsidian"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={t(product.title, lang)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute start-2 top-2 rounded-full bg-racing px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
            {t(product.badge, lang)}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute end-2 top-2 rounded-full bg-volt px-2 py-1 text-[11px] font-black text-obsidian">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Link
          href={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-white transition-colors hover:text-volt"
        >
          {t(product.title, lang)}
        </Link>

        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-volt text-glow-volt">
              {formatJOD(product.price)}
            </span>
            {product.compareAt > product.price && (
              <span className="text-xs text-white/40 line-through">
                {formatJOD(product.compareAt)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/60">
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.soldCount.toLocaleString("en-US")}+
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Stars rating={product.rating} />
          <span className="text-[11px] font-semibold text-white/70">
            {product.rating.toFixed(1)}
          </span>
        </div>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-1">
          <button
            type="button"
            onClick={() => onAdd(product)}
            className="flex items-center justify-center gap-2 rounded-xl bg-volt px-3 py-2.5 text-xs font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
          </button>
          <button
            type="button"
            onClick={() => onQuickView(product.slug)}
            aria-label={lang === "ar" ? "عرض سريع" : "Quick View"}
            className="flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-white/80 transition-colors hover:border-volt/50 hover:text-volt active:scale-95"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function QuickViewPanel({ product }: { product: Product }) {
  const lang = useStore((s) => s.lang);
  const addToCart = useStore((s) => s.addToCart);
  const closeQuickView = useStore((s) => s.closeQuickView);
  const [qty, setQty] = useState(1);

  const discount =
    product.compareAt > product.price
      ? Math.round((1 - product.price / product.compareAt) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25 }}
      className="glass-strong relative w-full max-w-2xl overflow-y-auto rounded-2xl"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={closeQuickView}
        aria-label={lang === "ar" ? "إغلاق" : "Close"}
        className="absolute end-3 top-3 z-10 rounded-full bg-obsidian/80 p-2 text-white/70 transition-colors hover:text-racing"
      >
        <X className="h-4.5 w-4.5" />
      </button>

      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl bg-obsidian">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={t(product.title, lang)}
            className="aspect-[4/3] w-full object-cover"
          />
          {product.badge && (
            <span className="absolute start-2 top-2 rounded-full bg-racing px-2.5 py-1 text-[11px] font-bold text-white">
              {t(product.badge, lang)}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-black leading-snug text-white">
            {t(product.title, lang)}
          </h3>

          <div className="flex items-center gap-2">
            <Stars rating={product.rating} />
            <span className="text-xs text-white/60">
              {product.rating.toFixed(1)} ·{" "}
              {lang === "ar"
                ? `${product.soldCount.toLocaleString("en-US")} مبيع`
                : `${product.soldCount.toLocaleString("en-US")} sold`}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-volt text-glow-volt">
              {formatJOD(product.price)}
            </span>
            {product.compareAt > product.price && (
              <>
                <span className="text-sm text-white/40 line-through">
                  {formatJOD(product.compareAt)}
                </span>
                <span className="rounded-md bg-racing/20 px-1.5 py-0.5 text-[11px] font-black text-racing">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <p className="text-xs leading-relaxed text-white/70">
            {t(product.description, lang)}
          </p>

          <ul className="flex flex-col gap-1.5 rounded-xl bg-white/5 p-3">
            {product.specs.slice(0, 4).map((spec, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-3 text-[11px]"
              >
                <span className="text-white/50">{t(spec.label, lang)}</span>
                <span className="font-semibold text-white/90">
                  {t(spec.value, lang)}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-sm font-bold text-white/70 hover:text-volt"
                aria-label="−"
              >
                −
              </button>
              <span className="w-8 text-center text-sm font-black text-white">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(99, q + 1))}
                className="px-3 py-2.5 text-sm font-bold text-white/70 hover:text-volt"
                aria-label="+"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                addToCart(product, qty);
                closeQuickView();
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-volt px-4 py-2.5 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
            >
              <ShoppingCart className="h-4 w-4" />
              {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const searchQuery = useStore((s) => s.searchQuery);
  const activeCategory = useStore((s) => s.activeCategory);
  const setActiveCategory = useStore((s) => s.setActiveCategory);
  const addToCart = useStore((s) => s.addToCart);
  const openQuickView = useStore((s) => s.openQuickView);
  const activeQuickView = useStore((s) => s.activeQuickView);
  const closeQuickView = useStore((s) => s.closeQuickView);

  const allProducts = useMemo<Product[]>(
    () => [...PRODUCTS, ...adminProducts],
    [adminProducts]
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

  const quickProduct = activeQuickView
    ? (allProducts.find((p) => p.slug === activeQuickView) ?? null)
    : null;

  const stats = [
    {
      value: "452K+",
      label: lang === "ar" ? "مشاهدة على الريلز" : "Reel Views",
      icon: Eye,
    },
    {
      value: "10K+",
      label: lang === "ar" ? "طلب تم توصيله" : "Orders Delivered",
      icon: Truck,
    },
    {
      value: "4.8",
      label: lang === "ar" ? "تقييم العملاء" : "Customer Rating",
      icon: Star,
    },
  ];

  const trustBadges = [
    {
      icon: Wallet,
      text: lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery",
    },
    {
      icon: Truck,
      text:
        lang === "ar"
          ? "توصيل لكل محافظات الأردن"
          : "Delivery across Jordan",
    },
    {
      icon: BadgeCheck,
      text:
        lang === "ar"
          ? "منتجات مفحوصة من جير تيك"
          : "GearTech-inspected products",
    },
    {
      icon: ShieldCheck,
      text: lang === "ar" ? "ضمان استبدال 7 أيام" : "7-Day Replacement",
    },
  ];

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-obsidian">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(0,245,212,0.18), transparent 65%), radial-gradient(ellipse 40% 40% at 85% 20%, rgba(255,42,84,0.08), transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 70% at 50% 30%, black 40%, transparent 85%)",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-7 px-4 pb-16 pt-20 text-center sm:pt-28">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-full px-4 py-1.5 text-[11px] font-bold tracking-widest text-volt uppercase"
          >
            {lang === "ar"
              ? `${BRAND.name} — ${BRAND.city.ar}`
              : `${BRAND.name} — ${BRAND.city.en}`}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl"
          >
            {lang === "ar" ? (
              <>
                خلّ ليلتك <span className="text-volt text-glow-volt">تتكلم</span>
              </>
            ) : (
              <>
                Make Your Night{" "}
                <span className="text-volt text-glow-volt">Speak</span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-xl text-sm leading-relaxed text-white/70 sm:text-base"
          >
            {lang === "ar"
              ? "إكسسوارات سيارات فيروسيّة صارت ترند على الريلز — من عمّان نوصّلها لكل محافظات الأردن، والدفع عند الاستلام."
              : "The viral car accessories taking over your feed — shipped from Amman to every governorate in Jordan, cash on delivery."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#products"
              className="flex items-center gap-2 rounded-xl bg-volt px-7 py-3.5 text-sm font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)] active:scale-95"
            >
              {lang === "ar" ? "تسوّق الآن" : "Shop Now"}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
            <a
              href="#bundles"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-black text-white transition-all hover:border-racing/60 hover:text-racing active:scale-95"
            >
              {lang === "ar" ? "الباقات والخصومات" : "Bundles & Deals"}
              <Zap className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-4 grid w-full max-w-lg grid-cols-3 gap-3"
          >
            {stats.map((s) => (
              <div
                key={s.value}
                className="glass flex flex-col items-center gap-1 rounded-2xl px-2 py-4"
              >
                <s.icon className="h-4 w-4 text-volt" />
                <span className="text-xl font-black text-white sm:text-2xl">
                  {s.value}
                </span>
                <span className="text-[10px] leading-tight text-white/55 sm:text-[11px]">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Trust badges marquee ─────────────────────────────── */}
      <section
        aria-label={lang === "ar" ? "مزايا المتجر" : "Store perks"}
        className="relative overflow-hidden border-y border-white/10 bg-carbon/70 py-4"
      >
        <div className="flex w-max animate-marquee">
          {[0, 1].map((group) => (
            <div key={group} className="flex shrink-0 items-center gap-10 pe-10">
              {trustBadges.map((b) => (
                <span
                  key={`${group}-${b.text}`}
                  className="flex items-center gap-2.5 whitespace-nowrap text-sm font-bold text-white/85"
                >
                  <b.icon className="h-4.5 w-4.5 shrink-0 text-volt" />
                  {b.text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Reels ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-black tracking-widest text-racing uppercase">
            {lang === "ar" ? "فيروسي" : "Viral"}
          </span>
          <h2 className="text-2xl font-black text-white sm:text-4xl">
            {lang === "ar" ? "تسوّق من الريلز" : "Shop the Viral Reel"}
          </h2>
          <p className="max-w-md text-sm text-white/60">
            {lang === "ar"
              ? "كل ريل حقق مشاهدات — والمنتج جاهز بالمخزون."
              : "Every reel that blew up — the product is in stock."}
          </p>
        </div>
        <ReelsFeed />
      </section>

      {/* ── Products ─────────────────────────────────────────── */}
      <section id="products" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-black tracking-widest text-volt uppercase">
            {lang === "ar" ? "المتجر" : "The Store"}
          </span>
          <h2 className="text-2xl font-black text-white sm:text-4xl">
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
                ? "bg-volt text-obsidian glow-volt"
                : "border border-white/15 bg-white/5 text-white/70 hover:border-volt/40 hover:text-volt"
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
                  ? "bg-volt text-obsidian glow-volt"
                  : "border border-white/15 bg-white/5 text-white/70 hover:border-volt/40 hover:text-volt"
              )}
            >
              {t(cat.label, lang)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="glass flex flex-col items-center gap-4 rounded-2xl px-6 py-16 text-center">
            <ShoppingBag className="h-10 w-10 text-white/25" />
            <p className="text-sm font-bold text-white/70">
              {lang === "ar"
                ? "ما في منتجات تطابق بحثك"
                : "No products match your search"}
            </p>
            <p className="text-xs text-white/45">
              {lang === "ar"
                ? "جرّب كلمة تانية أو ارجع لكل المنتجات."
                : "Try another word or go back to all products."}
            </p>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="rounded-xl bg-volt px-5 py-2.5 text-xs font-black text-obsidian transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
            >
              {lang === "ar" ? "عرض الكل" : "Show All"}
            </button>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={(p) => addToCart(p)}
                  onQuickView={openQuickView}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* ── Bundles ──────────────────────────────────────────── */}
      <section id="bundles" className="scroll-mt-20 py-16">
        <div className="mx-auto mb-8 max-w-6xl px-4 text-center">
          <span className="text-[11px] font-black tracking-widest text-racing uppercase">
            {lang === "ar" ? "وفّر أكثر" : "Save More"}
          </span>
          <h2 className="mt-2 text-2xl font-black text-white sm:text-4xl">
            {lang === "ar" ? "ابنِ باقتك" : "Build Your Bundle"}
          </h2>
        </div>
        <BundleBuilder />
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-white/10 bg-carbon/70">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="text-xl font-black text-volt text-glow-volt">
              {BRAND.name}
            </span>
            <span className="text-sm font-bold text-white/70">
              {BRAND.handle}
            </span>
            <p className="text-xs leading-relaxed text-white/50">
              {lang === "ar"
                ? "إكسسوارات سيارات وتكنولوجيا — من عمّان للأردن كلها."
                : "Car accessories & tech — from Amman to all of Jordan."}
            </p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-2 rounded-xl border border-volt/40 px-4 py-2.5 text-xs font-black text-volt transition-all hover:shadow-[0_0_24px_rgba(0,245,212,0.35)]"
            >
              {lang === "ar" ? "واتساب مباشر" : "Chat on WhatsApp"}
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "التوصيل" : "Delivery"}
            </h3>
            <ul className="flex flex-col gap-1.5">
              {GOVERNORATES.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-3 text-xs text-white/55"
                >
                  <span>{t(g.label, lang)}</span>
                  <span className="font-bold text-white/80">
                    {g.deliveryFee === 0
                      ? lang === "ar"
                        ? "مجاني"
                        : "Free"
                      : formatJOD(g.deliveryFee)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-white/40">
              {lang === "ar"
                ? `التوصيل مجاني للطلبات فوق ${formatJOD(FREE_DELIVERY_THRESHOLD)}`
                : `Free delivery on orders over ${formatJOD(FREE_DELIVERY_THRESHOLD)}`}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "طرق الدفع" : "Payment Methods"}
            </h3>
            <div className="flex flex-col gap-2">
              <span className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white/80">
                <Wallet className="h-4 w-4 text-volt" />
                {lang === "ar" ? "الدفع عند الاستلام" : "Cash on Delivery"}
              </span>
              <span className="glass flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-white/80">
                <Zap className="h-4 w-4 text-racing" />
                {lang === "ar" ? "تحويل CliQ فوري" : "CliQ Instant Transfer"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-black text-white">
              {lang === "ar" ? "تواصل" : "Contact"}
            </h3>
            <p className="text-xs text-white/55">{BRAND.city[lang]}</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-volt hover:[text-shadow:0_0_18px_rgba(0,245,212,0.6)]"
              dir="ltr"
            >
              +{WHATSAPP_NUMBER}
            </a>
            <p className="text-[11px] text-white/40">
              {lang === "ar"
                ? "نرد خلال دقائق — من 10 صباحاً لـ 11 مساءً."
                : "We reply in minutes — 10 AM to 11 PM."}
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 py-5 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} {BRAND.name} {BRAND.handle} —{" "}
          {lang === "ar" ? "كل الحقوق محفوظة" : "All rights reserved"}
        </div>
      </footer>

      {/* ── Quick view modal ─────────────────────────────────── */}
      <AnimatePresence>
        {quickProduct && (
          <motion.div
            key="quickview-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-md"
            onClick={closeQuickView}
          >
            <div
              className="w-full max-w-2xl py-8"
              onClick={(e) => e.stopPropagation()}
            >
              <QuickViewPanel key={quickProduct.slug} product={quickProduct} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer />
      <GearBotAI />
    </div>
  );
}
