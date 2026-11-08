"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  ShoppingCart,
} from "lucide-react";
import {
  PRODUCTS,
  REELS,
  formatJOD,
  type ReelVideo,
} from "@/data/products";
import { useStore } from "@/store/useStore";
import { cn, t } from "@/lib/utils";

export default function ReelsFeed() {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const addToCart = useStore((s) => s.addToCart);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const isRTL = lang === "ar";

  const catalog = [...PRODUCTS, ...adminProducts];

  const productFor = (reel: ReelVideo) =>
    catalog.find((p) => p.id === reel.productIds[0]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { root, threshold: [0, 0.6] }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!addedId) return;
    const id = setTimeout(() => setAddedId(null), 1600);
    return () => clearTimeout(id);
  }, [addedId]);

  const scrollByDir = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.85, 420);
    const sign = isRTL ? -direction : direction;
    el.scrollBy({ left: sign * amount, behavior: "smooth" });
  };

  const addReelProduct = (reel: ReelVideo) => {
    const product = productFor(reel);
    if (!product) return;
    addToCart(product, 1);
    setAddedId(reel.id);
  };

  return (
    <section id="reels" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-volt">
            {lang === "ar" ? "من إنستغرام" : "From Instagram"}
          </p>
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {lang === "ar" ? "تسوّق من الريل الفايروسي" : "Shop the Viral Reel"}
          </h2>
          <p className="mt-2 text-sm text-white/60">
            {lang === "ar"
              ? "شوف المنتج بالمقطع وضيفه لسلتك بضغطة وحدة."
              : "See it in the clip, add it to your cart in one tap."}
          </p>
        </div>

        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label={lang === "ar" ? "السابق" : "Previous"}
            onClick={() => scrollByDir(-1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-volt/50 hover:text-volt"
          >
            <ChevronLeft
              className={cn("h-5 w-5", isRTL && "rotate-180")}
            />
          </button>
          <button
            type="button"
            aria-label={lang === "ar" ? "التالي" : "Next"}
            onClick={() => scrollByDir(1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-volt/50 hover:text-volt"
          >
            <ChevronRight
              className={cn("h-5 w-5", isRTL && "rotate-180")}
            />
          </button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
        >
          {REELS.map((reel, index) => {
            const product = productFor(reel);
            const isAdded = addedId === reel.id;
            return (
              <motion.article
                key={reel.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: Math.min(index, 4) * 0.06 }}
                className="relative aspect-[9/16] w-[78vw] max-w-[320px] shrink-0 snap-center overflow-hidden rounded-3xl border border-white/10 bg-carbon"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                    if (el) el.muted = true;
                  }}
                  src={reel.videoUrl}
                  poster={reel.poster}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/50" />

                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[11px] font-bold text-white/90">
                  <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur">
                    <Eye className="h-3.5 w-3.5 text-volt" />
                    {reel.views}
                  </span>
                  <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur">
                    <Heart className="h-3.5 w-3.5 text-racing" />
                    {reel.likes}
                  </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-3.5">
                  <p className="text-sm font-extrabold leading-snug text-volt text-glow-volt">
                    {t(reel.hook, lang)}
                  </p>
                  <h3 className="text-base font-extrabold leading-tight text-white">
                    {t(reel.title, lang)}
                  </h3>
                  <p className="line-clamp-2 text-xs leading-relaxed text-white/70">
                    {t(reel.caption, lang)}
                  </p>

                  {product && (
                    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 p-2 backdrop-blur">
                      <img
                        src={product.image}
                        alt={t(product.title, lang)}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-semibold text-white/85">
                          {t(product.title, lang)}
                        </p>
                        <p className="text-sm font-extrabold text-volt">
                          {formatJOD(product.price)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addReelProduct(reel)}
                        className={cn(
                          "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-2 text-[11px] font-extrabold transition",
                          isAdded
                            ? "bg-white/20 text-white"
                            : "bg-volt text-obsidian hover:brightness-110"
                        )}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            {lang === "ar" ? "تمت الإضافة" : "Added"}
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {lang === "ar" ? "أضف للسلة" : "Add to Cart"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={lang === "ar" ? "السابق" : "Previous"}
          onClick={() => scrollByDir(-1)}
          className="absolute start-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white/80 backdrop-blur transition hover:text-volt sm:grid"
        >
          <ChevronLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
        </button>
        <button
          type="button"
          aria-label={lang === "ar" ? "التالي" : "Next"}
          onClick={() => scrollByDir(1)}
          className="absolute end-0 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/10 bg-black/60 p-2.5 text-white/80 backdrop-blur transition hover:text-volt sm:grid"
        >
          <ChevronRight className={cn("h-5 w-5", isRTL && "rotate-180")} />
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-white/40 sm:hidden">
        {lang === "ar" ? "اسحب لتشوف باقي الريلز" : "Swipe for more reels"}
      </p>
    </section>
  );
}
