"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Minus,
  Package,
  Plus,
  ShoppingCart,
} from "lucide-react";
import {
  BUNDLES,
  PRODUCTS,
  formatJOD,
  type Product,
} from "@/data/products";
import { bestBundleFor, useStore } from "@/store/useStore";
import { useCartUI } from "@/components/CartDrawer";
import { cn, t } from "@/lib/utils";

export default function BundleBuilder({ products: productsProp }: { products?: Product[] } = {}) {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const addToCart = useStore((s) => s.addToCart);
  const openCart = useCartUI((s) => s.open);

  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});

  const products = useMemo(() => {
    const source = productsProp && productsProp.length ? productsProp : [...PRODUCTS, ...adminProducts];
    const seen = new Set<string>();
    const list: Product[] = [];
    for (const p of source) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      list.push(p);
    }
    return list;
  }, [productsProp, adminProducts]);

  const isRTL = lang === "ar";
  const selected = products.filter((p) => (qtyMap[p.id] ?? 0) > 0);
  const totalQty = selected.reduce((sum, p) => sum + qtyMap[p.id], 0);
  const subtotal = selected.reduce(
    (sum, p) => sum + p.price * qtyMap[p.id],
    0
  );
  const unlocked = bestBundleFor(totalQty);
  const nextBundle = BUNDLES.filter((b) => b.minQty > totalQty).sort(
    (a, b) => a.minQty - b.minQty
  )[0];
  const discountPct = unlocked?.discountPct ?? 0;
  const discounted = subtotal * (1 - discountPct / 100);
  const savings = subtotal - discounted;

  const toggle = (product: Product) => {
    setQtyMap((prev) => {
      const next = { ...prev };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = 1;
      }
      return next;
    });
  };

  const bump = (productId: string, delta: number) => {
    setQtyMap((prev) => {
      const next = { ...prev };
      const value = (next[productId] ?? 0) + delta;
      if (value <= 0) {
        delete next[productId];
      } else {
        next[productId] = Math.min(value, 99);
      }
      return next;
    });
  };

  const addAll = () => {
    if (totalQty === 0) return;
    selected.forEach((product) => addToCart(product, qtyMap[product.id]));
    setQtyMap({});
    openCart();
  };

  return (
    <section id="bundles" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-volt">
          <Flame className="h-4 w-4" />
          {lang === "ar" ? "باقة الليل" : "Night Pack"}
        </p>
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          {lang === "ar"
            ? "كوّن باقة أورورا الليلية"
            : "Build Your Night Aura Pack"}
        </h2>
        <p className="mt-2 text-sm text-white/60">
          {lang === "ar"
            ? "اختر قطعتين أو أكثر وخلي السعر ينزل تلقائياً — التوصيل مجاني مع أي باقة."
            : "Pick two or more items and watch the price drop — free delivery with any pack."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => {
            const qty = qtyMap[product.id] ?? 0;
            const isSelected = qty > 0;
            return (
              <motion.div
                key={product.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => toggle(product)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggle(product);
                  }
                }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group cursor-pointer overflow-hidden rounded-2xl border bg-carbon transition",
                  isSelected
                    ? "border-volt ring-2 ring-volt/60"
                    : "border-white/10 hover:border-white/30"
                )}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={product.image}
                    alt={t(product.title, lang)}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute start-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {t(product.badge, lang)}
                    </span>
                  )}
                  <motion.span
                    initial={false}
                    animate={{
                      scale: isSelected ? 1 : 0,
                      opacity: isSelected ? 1 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 24 }}
                    className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-volt text-obsidian"
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </motion.span>
                </div>

                <div className="p-3">
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-white">
                    {t(product.title, lang)}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-volt">
                      {formatJOD(product.price)}
                    </span>
                    {isSelected && (
                      <div
                        className="flex items-center gap-0.5 rounded-full border border-volt/40 bg-volt/10 px-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          aria-label={lang === "ar" ? "تقليل" : "Decrease"}
                          onClick={(e) => {
                            e.stopPropagation();
                            bump(product.id, -1);
                          }}
                          className="grid h-6 w-6 place-items-center rounded-full text-volt transition hover:bg-volt/20"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-extrabold text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          aria-label={lang === "ar" ? "زيادة" : "Increase"}
                          onClick={(e) => {
                            e.stopPropagation();
                            bump(product.id, 1);
                          }}
                          className="grid h-6 w-6 place-items-center rounded-full text-volt transition hover:bg-volt/20"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <aside className="h-fit rounded-2xl border border-white/10 bg-carbon p-5 lg:sticky lg:top-24">
          <p className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Package className="h-4 w-4 text-volt" />
            {lang === "ar" ? "ملخص الباقة" : "Pack Summary"}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {BUNDLES.map((b) => {
              const active = totalQty >= b.minQty;
              return (
                <span
                  key={b.id}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-extrabold leading-none",
                    active
                      ? "border-transparent text-obsidian"
                      : "border-white/15 text-white/45"
                  )}
                  style={active ? { backgroundColor: b.color } : undefined}
                >
                  {t(b.name, lang)}
                </span>
              );
            })}
          </div>

          <div className="mt-4 space-y-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
            <div className="flex items-center justify-between text-white/70">
              <span>{lang === "ar" ? "عدد القطع" : "Item count"}</span>
              <motion.span
                key={totalQty}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-extrabold text-white"
              >
                {totalQty}
              </motion.span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>{lang === "ar" ? "المجموع" : "Subtotal"}</span>
              <span className="font-semibold text-white">
                {formatJOD(subtotal)}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>{lang === "ar" ? "الخصم" : "Discount"}</span>
              <span
                className={cn(
                  "font-extrabold",
                  discountPct > 0 ? "text-volt" : "text-white/40"
                )}
              >
                {discountPct > 0 ? `-${discountPct}%` : "0%"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-2.5">
              <span className="font-extrabold text-white">
                {lang === "ar" ? "الإجمالي" : "Total"}
              </span>
              <motion.span
                key={`${totalQty}-${discountPct}`}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-lg font-extrabold text-volt text-glow-volt"
              >
                {formatJOD(discounted)}
              </motion.span>
            </div>
            {savings > 0 && (
              <div className="rounded-lg bg-racing/15 px-3 py-2 text-center text-xs font-extrabold text-racing">
                {lang === "ar"
                  ? `وفّرت ${formatJOD(savings)}`
                  : `You save ${formatJOD(savings)}`}
              </div>
            )}
          </div>

          <div className="mt-4">
            {nextBundle ? (
              <>
                <p className="text-xs text-white/70">
                  {lang === "ar"
                    ? `باقي ${nextBundle.minQty - totalQty} قطعة لفتح ${
                        nextBundle.name.ar
                      }`
                    : `${nextBundle.minQty - totalQty} more to unlock ${t(
                        nextBundle.name,
                        lang
                      )}`}
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-volt"
                    animate={{
                      width: `${Math.min(
                        100,
                        (totalQty / nextBundle.minQty) * 100
                      )}%`,
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-volt/10 px-3 py-2.5 text-center text-xs font-extrabold text-volt">
                {lang === "ar"
                  ? "أعلى خصم مفعّل — التوصيل مجاني"
                  : "Top discount unlocked — free delivery"}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={addAll}
            disabled={totalQty === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3.5 text-sm font-extrabold text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 glow-volt"
          >
            <ShoppingCart className="h-4 w-4" />
            {lang === "ar" ? "أضف الكل إلى السلة" : "Add All to Cart"}
            {isRTL ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>

          {totalQty === 0 && (
            <p className="mt-2 text-center text-xs text-white/45">
              {lang === "ar" ? "اختر قطعة من تحت" : "Pick an item below"}
            </p>
          )}
        </aside>
      </div>
    </section>
  );
}
