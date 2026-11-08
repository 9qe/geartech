"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgePercent,
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Timer,
  Trash2,
  X,
} from "lucide-react";
import { create } from "zustand";
import {
  BUNDLES,
  FREE_DELIVERY_THRESHOLD,
  PRODUCTS,
  formatJOD,
} from "@/data/products";
import {
  bestBundleFor,
  cartCount,
  cartSubtotal,
  useStore,
} from "@/store/useStore";
import { cn, t } from "@/lib/utils";

interface CartUIState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCartUI = create<CartUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));

const SESSION_SECONDS = 14 * 60 + 59;

export default function CartDrawer() {
  const lang = useStore((s) => s.lang);
  const cart = useStore((s) => s.cart);
  const setQty = useStore((s) => s.setQty);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const addToCart = useStore((s) => s.addToCart);
  const { isOpen, close } = useCartUI();

  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);

  const isRTL = lang === "ar";
  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);
  const bundle = bestBundleFor(count);
  const nextBundle = BUNDLES.filter((b) => b.minQty > count).sort(
    (a, b) => a.minQty - b.minQty
  )[0];
  const discountPct = bundle?.discountPct ?? 0;
  const total = subtotal * (1 - discountPct / 100);
  const savings = subtotal - total;
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);
  const freeUnlocked =
    subtotal >= FREE_DELIVERY_THRESHOLD || bundle?.freeDelivery === true;

  const impulse = useMemo(
    () =>
      PRODUCTS.filter((p) => !cart.some((i) => i.productId === p.id)).sort(
        (a, b) => a.price - b.price
      )[0],
    [cart]
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? SESSION_SECONDS : s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, close]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="cart-drawer-root"
          className="fixed inset-0 z-[60]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={lang === "ar" ? "سلة التسوق" : "Your cart"}
            className={cn(
              "absolute top-0 flex h-full w-full max-w-md flex-col glass-strong",
              isRTL ? "left-0" : "right-0"
            )}
            initial={{ x: isRTL ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">
                  {lang === "ar" ? "سلة التسوق" : "Your Cart"}
                </h2>
                <span className="rounded-full bg-volt/15 px-2 py-0.5 text-[11px] font-bold text-volt">
                  {lang === "ar" ? `${count} قطعة` : `${count} items`}
                </span>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={lang === "ar" ? "إغلاق السلة" : "Close cart"}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:text-volt"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/5">
                  <ShoppingBag className="h-9 w-9 text-white/30" />
                </div>
                <p className="text-base font-extrabold text-white">
                  {lang === "ar" ? "سلتك فاضية" : "Your cart is empty"}
                </p>
                <p className="text-sm text-white/50">
                  {lang === "ar"
                    ? "دور على شي يلمع لسيارتك وارجع لهون"
                    : "Find something shiny for your car and come back"}
                </p>
                <Link
                  href="#products"
                  onClick={close}
                  className="mt-2 rounded-full bg-volt px-5 py-2.5 text-sm font-extrabold text-obsidian transition hover:brightness-110"
                >
                  {lang === "ar" ? "تسوّق الآن" : "Shop now"}
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
                  <div className="flex items-center justify-between rounded-xl border border-racing/40 bg-racing/10 px-3.5 py-2.5">
                    <span className="flex items-center gap-2 text-xs font-semibold text-white/80">
                      <Timer className="h-4 w-4 animate-scarce text-racing" />
                      {lang === "ar"
                        ? "خصم الحجز ينتهي خلال"
                        : "Reservation discount ends in"}
                    </span>
                    <span className="font-mono text-sm font-extrabold tabular-nums text-racing">
                      {mm}:{ss}
                    </span>
                  </div>

                  <ul className="space-y-3">
                    {cart.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: isRTL ? 40 : -40 }}
                        className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
                      >
                        <img
                          src={item.image}
                          alt={t(item.title, lang)}
                          className="h-16 w-16 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-sm">
                            {t(item.title, lang)}
                          </p>
                          <p className="mt-1 text-sm font-extrabold text-volt">
                            {formatJOD(item.price)}
                          </p>
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1">
                              <button
                                type="button"
                                aria-label={
                                  lang === "ar" ? "تقليل الكمية" : "Decrease quantity"
                                }
                                onClick={() =>
                                  setQty(item.productId, item.qty - 1)
                                }
                                className="grid h-7 w-7 place-items-center rounded-full text-white/70 transition hover:text-volt"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-extrabold text-white">
                                {item.qty}
                              </span>
                              <button
                                type="button"
                                aria-label={
                                  lang === "ar" ? "زيادة الكمية" : "Increase quantity"
                                }
                                onClick={() =>
                                  setQty(item.productId, item.qty + 1)
                                }
                                className="grid h-7 w-7 place-items-center rounded-full text-white/70 transition hover:text-volt"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button
                              type="button"
                              aria-label={
                                lang === "ar" ? "حذف المنتج" : "Remove item"
                              }
                              onClick={() => removeFromCart(item.productId)}
                              className="grid h-8 w-8 place-items-center rounded-full text-white/40 transition hover:bg-racing/15 hover:text-racing"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </ul>

                  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-xs font-extrabold text-white">
                        <span
                          className={cn(
                            "grid h-5 w-5 place-items-center rounded-full",
                            freeUnlocked
                              ? "bg-volt text-obsidian"
                              : "bg-white/10 text-white/60"
                          )}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {lang === "ar"
                          ? "التوصيل مجاني في الأردن"
                          : "Free Delivery in Jordan"}
                      </p>
                      {freeUnlocked ? (
                        <span className="text-[11px] font-extrabold text-volt">
                          {lang === "ar" ? "مفتوح" : "Unlocked"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-white/60">
                          {lang === "ar"
                            ? `باقي ${formatJOD(remaining)}`
                            : `${formatJOD(remaining)} to go`}
                        </span>
                      )}
                    </div>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          freeUnlocked ? "bg-volt glow-volt" : "bg-volt/70"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                    </div>
                  </div>

                  {impulse && (
                    <div className="rounded-xl border border-volt/30 bg-volt/[0.06] p-3">
                      <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-volt">
                        <Sparkles className="h-3.5 w-3.5" />
                        {lang === "ar" ? "عرض لحظي" : "Limited-time add-on"}
                      </p>
                      <div className="flex items-center gap-3">
                        <img
                          src={impulse.image}
                          alt={t(impulse.title, lang)}
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-white">
                            {t(impulse.title, lang)}
                          </p>
                          <p className="text-sm font-extrabold text-volt">
                            {formatJOD(impulse.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(impulse, 1)}
                          className="shrink-0 rounded-lg bg-volt px-3 py-2 text-xs font-extrabold text-obsidian transition hover:brightness-110"
                        >
                          {lang === "ar" ? "أضف" : "Add"}
                        </button>
                      </div>
                    </div>
                  )}

                  {bundle ? (
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="flex items-center gap-2 text-xs font-extrabold text-white">
                          <BadgePercent className="h-4 w-4 text-volt" />
                          {lang === "ar" ? "الحزمة المفعّلة" : "Active bundle"}
                        </p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-obsidian"
                          style={{ backgroundColor: bundle.color }}
                        >
                          -{bundle.discountPct}%
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs text-white/60">
                        {t(bundle.name, lang)}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-volt">
                          {lang === "ar"
                            ? `وفّرت ${formatJOD(savings)}`
                            : `You save ${formatJOD(savings)}`}
                        </span>
                        <span className="text-white/50 line-through">
                          {formatJOD(subtotal)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    nextBundle && (
                      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-xs text-white/70">
                        {lang === "ar"
                          ? `أضف ${nextBundle.minQty - count} قطعة ويفتح ${t(
                              nextBundle.name,
                              lang
                            )}`
                          : `Add ${nextBundle.minQty - count} more to unlock ${t(
                              nextBundle.name,
                              lang
                            )}`}
                      </div>
                    )
                  )}
                </div>

                <div className="border-t border-white/10 bg-obsidian/70 px-4 py-4 backdrop-blur">
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-white/70">
                      <span>
                        {lang === "ar" ? "المجموع الفرعي" : "Subtotal"}
                      </span>
                      <span className="font-semibold text-white">
                        {formatJOD(subtotal)}
                      </span>
                    </div>
                    {bundle && (
                      <div className="flex items-center justify-between text-volt">
                        <span>
                          {lang === "ar" ? "الخصم" : "Discount"}
                        </span>
                        <span className="font-semibold">
                          -{bundle.discountPct}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-white/10 pt-1.5">
                      <span className="font-extrabold text-white">
                        {lang === "ar" ? "الإجمالي" : "Total"}
                      </span>
                      <span className="text-lg font-extrabold text-volt text-glow-volt">
                        {formatJOD(total)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/checkout"
                    onClick={close}
                    className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-volt px-4 py-3.5 text-sm font-extrabold text-obsidian transition hover:brightness-110 glow-volt"
                  >
                    {lang === "ar" ? "إتمام الطلب" : "Proceed to Checkout"}
                    {isRTL ? (
                      <ArrowLeft className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
