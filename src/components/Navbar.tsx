"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Coins, Globe, Menu, Search, ShoppingCart, X } from "lucide-react";
import { useStore, cartCount } from "@/store/useStore";
import { useCartUI } from "@/components/CartDrawer";
import { cn } from "@/lib/utils";

const NAV_LINKS: { href: string; ar: string; en: string }[] = [
  { href: "#products", ar: "المتجر", en: "Shop" },
  { href: "#reels", ar: "الريلز", en: "Reels" },
  { href: "#bundles", ar: "الباقات", en: "Bundles" },
];

function GearMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <g fill="currentColor">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <rect
            key={angle}
            x="22"
            y="1.5"
            width="4"
            height="11"
            rx="1.5"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="16" />
      </g>
      <circle cx="24" cy="24" r="6.5" fill="#090A0F" />
    </svg>
  );
}

export default function Navbar() {
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const searchQuery = useStore((s) => s.searchQuery);
  const setSearchQuery = useStore((s) => s.setSearchQuery);
  const cart = useStore((s) => s.cart);
  const openCart = useCartUI((s) => s.open);
  const [menuOpen, setMenuOpen] = useState(false);

  const count = cartCount(cart);
  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [lang, isRTL]);

  const toggleLang = () => {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  };

  const renderSearch = (extraClass?: string) => (
    <div className={cn("relative", extraClass)}>
      <Search className="pointer-events-none absolute inset-y-0 my-auto h-4 w-4 text-white/40" />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={lang === "ar" ? "دوّر على منتج…" : "Search products…"}
        aria-label={lang === "ar" ? "البحث في المنتجات" : "Search products"}
        className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pe-4 ps-9 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-volt/60"
      />
    </div>
  );

  const cartButton = (
    <button
      type="button"
      onClick={openCart}
      aria-label={lang === "ar" ? "فتح سلة التسوق" : "Open cart"}
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-volt/50 hover:text-volt"
    >
      <ShoppingCart className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -top-1.5 -end-1.5 grid min-w-5 place-items-center rounded-full bg-racing px-1 py-0.5 text-[10px] font-extrabold leading-none text-white shadow-[0_0_10px_rgba(255,42,84,0.6)]">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 glass-strong">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-volt"
          aria-label="GearTech"
        >
          <GearMark className="h-8 w-8" />
          <span className="text-lg font-extrabold tracking-tight text-white">
            Gear<span className="text-glow-volt text-volt">Tech</span>
          </span>
        </Link>

        <div className="mx-auto hidden max-w-md flex-1 md:block">
          {renderSearch()}
        </div>

        <nav className="hidden items-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-white/70 transition hover:text-volt"
            >
              {lang === "ar" ? link.ar : link.en}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-2 lg:ms-0">
          <button
            type="button"
            onClick={toggleLang}
            aria-label={lang === "ar" ? "تبديل اللغة" : "Toggle language"}
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-white transition hover:border-volt/50"
          >
            <Globe className="h-4 w-4 text-white/60" />
            <span
              className={cn(
                "text-xs font-extrabold",
                lang === "ar" ? "text-volt" : "text-white/45"
              )}
            >
              AR
            </span>
            <span className="text-xs text-white/25">/</span>
            <span
              className={cn(
                "text-xs font-extrabold",
                lang === "en" ? "text-volt" : "text-white/45"
              )}
            >
              EN
            </span>
          </button>

          <span className="hidden h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold text-white/70 sm:flex">
            <Coins className="h-3.5 w-3.5 text-volt" />
            {lang === "ar" ? "د.أ" : "JOD"}
          </span>

          {cartButton}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={lang === "ar" ? "القائمة" : "Menu"}
            aria-expanded={menuOpen}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-volt/50 hover:text-volt lg:hidden"
          >
            {menuOpen ? (
              <X className="h-[18px] w-[18px]" />
            ) : (
              <Menu className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="space-y-3 px-4 py-4 sm:px-6">
              {renderSearch()}
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5 hover:text-volt"
                  >
                    {lang === "ar" ? link.ar : link.en}
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
