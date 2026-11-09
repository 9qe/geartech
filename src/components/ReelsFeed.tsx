"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, ShoppingCart } from "lucide-react";
import { formatJOD, type Product } from "@/data/products";
import { useStore } from "@/store/useStore";
import { cn, t } from "@/lib/utils";

export interface ReelCard {
  id: string;
  title: { ar: string; en: string };
  videoUrl: string;
  poster: string | null;
  viewLabel: string | null;
  sortOrder: number;
  product: {
    id: string;
    slug: string;
    title: { ar: string; en: string };
    price: number;
    image: string | null;
  } | null;
}

const BLANK: { ar: string; en: string } = { ar: "", en: "" };

function productFromReel(reel: ReelCard): Product | null {
  if (!reel.product) return null;
  return {
    id: reel.product.id,
    slug: reel.product.slug,
    title: reel.product.title,
    description: BLANK,
    price: reel.product.price,
    compareAt: reel.product.price,
    badge: null,
    category: "gadgets",
    image: reel.product.image ?? reel.poster ?? "",
    gallery: [],
    specs: [],
    installation: BLANK,
    reviews: [],
    stock: 0,
    soldCount: 0,
    rating: 5,
  };
}

export default function ReelsFeed({ reels }: { reels: ReelCard[] }) {
  const lang = useStore((s) => s.lang);
  const addToCart = useStore((s) => s.addToCart);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  const productFor = (reel: ReelCard) => productFromReel(reel);

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

  const addReelProduct = (reel: ReelCard) => {
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
          {reels.map((reel, index) => {
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
                  poster={reel.poster ?? undefined}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/50" />

                {reel.viewLabel && (
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3 text-[11px] font-bold text-white/90">
                    <span className="flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 backdrop-blur">
                      <Eye className="h-3.5 w-3.5 text-volt" />
                      {reel.viewLabel}
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 space-y-2.5 p-3.5">
                  <h3 className="text-base font-extrabold leading-tight text-white">
                    {t(reel.title, lang)}
                  </h3>
                  <p className="text-sm font-extrabold leading-snug text-volt text-glow-volt">
                    {lang === "ar"
                      ? "شوف المنتج بالمقطع وضيفه لسلتك بضغطة وحدة."
                      : "See it in the clip, add it to your cart in one tap."}
                  </p>

                  {product && (
                    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-black/55 p-2 backdrop-blur">
                      <img
                        src={product.image || reel.poster || ""}
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
