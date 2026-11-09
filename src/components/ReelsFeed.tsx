"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ShoppingCart } from "lucide-react";
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

  const addReelProduct = (reel: ReelVideo) => {
    const product = productFor(reel);
    if (!product) return;
    addToCart(product, 1);
    setAddedId(reel.id);
  };

  return (
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
      <p className="mt-3 text-center text-xs text-white/40 sm:hidden">Swipe for more reels</p>
    </div>
  );
}
