"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS, formatJOD } from "@/data/products";
import {
  applyPricingRules,
  useStore,
  type AdminProduct,
} from "@/store/useStore";

const ADMIN_PIN = "2026";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80";

const PLATFORMS: { id: string; label: { ar: string; en: string } }[] = [
  { id: "Shein", label: { ar: "شاين (Shein)", en: "Shein" } },
  { id: "Temu", label: { ar: "تيمو (Temu)", en: "Temu" } },
  { id: "Alibaba", label: { ar: "علي بابا (Alibaba)", en: "Alibaba" } },
  { id: "Local Importer", label: { ar: "مستورد محلي", en: "Local Importer" } },
];

const TIERS = [9, 11, 12, 14, 15, 18, 22, 26, 30, 36, 42, 50, 60, 75, 90, 120];

const round2 = (x: number): number => Math.round(x * 100) / 100;

const roundUp99 = (x: number): number => {
  if (!Number.isFinite(x) || x <= 0) return 0;
  const base = Math.floor(x);
  const cand = round2(base + 0.99);
  return cand >= x - 1e-9 ? cand : round2(base + 1.99);
};

const roundUpTier = (x: number): number | null =>
  x > 0 ? (TIERS.find((t) => t >= x - 1e-9) ?? null) : null;

const pickPrice = (x: number) => {
  const option99 = roundUp99(x);
  const tierRaw = roundUpTier(x);
  const optionTier = tierRaw ?? 0;
  const chosen = Math.max(option99, optionTier);
  return { option99, optionTier, chosen, hasTier: tierRaw !== null };
};

const shippingFor = (grams: number): number => {
  if (grams <= 500) return 1.5;
  if (grams <= 1000) return 2.2;
  if (grams <= 2000) return 3.5;
  return 5.0;
};

const num = (s: string): number => {
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : 0;
};

const slugify = (s: string): string => {
  const slug = s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `product-${Date.now()}`;
};

const INSTALLATION: { ar: string; en: string } = {
  ar: "1. افتح الطرد وتأكد من المحتوى. 2. ركّب القطعة بدون أي تغيير على أسلاك السيارة. 3. جرّبها قبل ما تمشي. التركيب 5 دقائق وبدون أي تغيير يلغي الضمان.",
  en: "1. Open the box and check the contents. 2. Fit the part with zero wiring changes. 3. Test before you drive. 5-minute install, warranty untouched.",
};

export default function AdminPage() {
  const lang = useStore((s) => s.lang);
  const adminProducts = useStore((s) => s.adminProducts);
  const pricingRules = useStore((s) => s.pricingRules);
  const addAdminProduct = useStore((s) => s.addAdminProduct);
  const removeAdminProduct = useStore((s) => s.removeAdminProduct);
  const addPricingRule = useStore((s) => s.addPricingRule);
  const removePricingRule = useStore((s) => s.removePricingRule);

  const ar = lang === "ar";

  const money = (v: number): string =>
    ar ? formatJOD(v) : `${v.toFixed(2)} JOD`;

  /* ---------------- Stage A — passcode ---------------- */

  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("geartech_admin_unlocked") === "1") {
        setUnlocked(true);
      }
    } catch {
      /* sessionStorage unavailable — stay locked */
    }
  }, []);

  const pressDigit = (d: string) => {
    setPinError(false);
    setPin((prev) => {
      const next = (prev + d).slice(0, 4);
      if (next.length === 4) {
        if (next === ADMIN_PIN) {
          try {
            sessionStorage.setItem("geartech_admin_unlocked", "1");
          } catch {
            /* ignore */
          }
          setUnlocked(true);
        } else {
          setPinError(true);
          window.setTimeout(() => setPin(""), 450);
        }
      }
      return next;
    });
  };

  const clearPin = () => {
    setPin("");
    setPinError(false);
  };

  /* ---------------- Calculator inputs ---------------- */

  const [platform, setPlatform] = useState("Shein");
  const [cost, setCost] = useState("4.50");
  const [currency, setCurrency] = useState<"USD" | "JOD">("USD");
  const [weight, setWeight] = useState("450");
  const [customsPct, setCustomsPct] = useState("12");
  const [cpa, setCpa] = useState("2.50");
  const [marginPct, setMarginPct] = useState("55");
  const [fx, setFx] = useState("0.709");

  const calc = useMemo(() => {
    const fxRate =
      currency === "USD" ? (num(fx) > 0 ? num(fx) : 0.709) : 1;
    const supplierJod =
      currency === "USD" ? num(cost) * fxRate : num(cost);
    const customsJod = supplierJod * (num(customsPct) / 100);
    const shippingJod = shippingFor(num(weight));
    const cpaJod = num(cpa);
    const landed = supplierJod + customsJod + shippingJod + cpaJod;

    const margin = Math.min(Math.max(num(marginPct), 0), 95);
    const marginDecimal = margin / 100;
    const rawPrice =
      marginDecimal < 1 ? landed / (1 - marginDecimal) : landed;

    const priceOptions = pickPrice(rawPrice);
    const recommended = priceOptions.chosen;
    const compareOptions = pickPrice(recommended * 1.35);
    const compareAt = compareOptions.chosen;

    const targetNet = Math.max(margin - 5, 0);
    const floorPrice =
      targetNet >= 100 ? Number.POSITIVE_INFINITY : landed / (1 - targetNet / 100);

    const unit2 = roundUp99(Math.max(recommended * 0.85, floorPrice));
    const unit3 = roundUp99(Math.max(recommended * 0.75, floorPrice));
    const net2 = unit2 > 0 ? ((unit2 - landed) / unit2) * 100 : 0;
    const net3 = unit3 > 0 ? ((unit3 - landed) / unit3) * 100 : 0;

    const contribution = recommended * marginDecimal;
    const roas = contribution > 0 ? cpaJod / contribution : null;

    const afterRules = applyPricingRules(recommended, pricingRules);
    const effectiveMargin =
      afterRules > 0 ? ((afterRules - landed) / afterRules) * 100 : 0;

    return {
      supplierJod,
      customsJod,
      shippingJod,
      cpaJod,
      landed,
      margin,
      rawPrice,
      option99: priceOptions.option99,
      optionTier: priceOptions.optionTier,
      hasTier: priceOptions.hasTier,
      recommended,
      compareAt,
      unit2,
      unit3,
      net2,
      net3,
      total2: round2(unit2 * 2),
      total3: round2(unit3 * 3),
      roas,
      effectiveMargin,
    };
  }, [cost, currency, fx, weight, customsPct, cpa, marginPct, pricingRules]);

  /* ---------------- Push to storefront ---------------- */

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState<string>("gadgets");
  const [pushedId, setPushedId] = useState<string | null>(null);

  const priceText = money(calc.recommended);

  const hooks = useMemo(() => {
    const arName = nameAr.trim() || "المنتج";
    const enName = nameEn.trim() || "the product";
    if (ar) {
      return [
        `شهقت لما شفت ${arName} بـ${priceText} — بس من جير تيك`,
        `${arName} بـ${priceText} وتوصيل لكل الأردن — الكمية محدودة`,
        `ما صدّقت لقيت ${arName} بهالمبلغ، اطلبها الحين وادفع عند الاستلام`,
      ];
    }
    return [
      `I gasped when I saw ${enName} at ${priceText} — only at GearTech`,
      `${enName} at ${priceText}, delivered across all Jordan — limited stock`,
      `Can't believe ${enName} costs this much — order now, pay on delivery`,
    ];
  }, [ar, nameAr, nameEn, priceText]);

  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyHook = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(i);
      window.setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const pushToStore = () => {
    const en = nameEn.trim();
    const name = nameAr.trim();
    if (!en || !name || calc.recommended <= 0) return;

    const platformLabel =
      PLATFORMS.find((p) => p.id === platform)?.label[lang] ?? platform;

    const description = {
      ar: `${name} من جير تيك — ${money(calc.recommended)} بدل ${money(
        calc.compareAt
      )}. اختيار ${platformLabel} بفحص جودة قبل الشحن من عمّان لكل محافظات الأردن، والدفع عند الاستلام متاح. التركيب بدون تغيير أسلاك ولا يلغي الضمان وخلال 5 دقائق تكون جاهز. الكمية محدودة — اطلب الحين.`,
      en: `${en} by GearTech — ${
        ar ? money(calc.recommended) : `${calc.recommended.toFixed(2)} JOD`
      } instead of ${
        ar ? money(calc.compareAt) : `${calc.compareAt.toFixed(2)} JOD`
      }. Picked from ${platformLabel}, quality-checked before shipping from Amman to all of Jordan, cash on delivery available. Plug-and-play install, zero wire cutting, warranty untouched, ready in 5 minutes. Limited stock — order now.`,
    };

    const product: AdminProduct = {
      id: `admin_${Date.now()}`,
      slug: slugify(en),
      title: { ar: name, en },
      description,
      price: calc.recommended,
      compareAt: calc.compareAt,
      badge: { ar: "جديد", en: "New" },
      category: category as AdminProduct["category"],
      image: DEFAULT_IMAGE,
      gallery: [DEFAULT_IMAGE],
      specs: [
        {
          label: { ar: "المصدر", en: "Source" },
          value: { ar: platformLabel, en: platform },
        },
        {
          label: { ar: "الوزن", en: "Weight" },
          value: {
            ar: `${num(weight)} جرام`,
            en: `${num(weight)} grams`,
          },
        },
        {
          label: { ar: "التكلفة المستوردة", en: "Landed Cost" },
          value: {
            ar: formatJOD(round2(calc.landed)),
            en: `${calc.landed.toFixed(2)} JOD`,
          },
        },
      ],
      installation: INSTALLATION,
      reviews: [],
      stock: 50,
      soldCount: 0,
      rating: 4.8,
      source: platform,
      landedCost: round2(calc.landed),
    };

    addAdminProduct(product);
    setPushedId(product.id);
  };

  /* ---------------- Pricing rules ---------------- */

  const [ruleLabel, setRuleLabel] = useState("");
  const [ruleType, setRuleType] = useState<"percent" | "fixed">("percent");
  const [ruleValue, setRuleValue] = useState("");

  const sample = PRODUCTS[0];
  const sampleAfter = applyPricingRules(sample.price, pricingRules);

  /* ---------------- Render ---------------- */

  if (!unlocked) {
    return (
      <div
        dir={ar ? "rtl" : "ltr"}
        className="min-h-screen bg-obsidian flex items-center justify-center px-4"
      >
        <style>{`
          @keyframes gt-shake {
            10%, 90% { transform: translateX(-2px); }
            20%, 80% { transform: translateX(4px); }
            30%, 50%, 70% { transform: translateX(-6px); }
            40%, 60% { transform: translateX(6px); }
          }
          .gt-shake { animation: gt-shake 0.45s ease; }
        `}</style>
        <div
          className={`glass-strong w-full max-w-sm rounded-2xl p-8 text-center ${
            pinError ? "gt-shake border-racing" : ""
          }`}
          style={{ borderColor: pinError ? "#FF2A54" : undefined }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-volt/40 text-volt glow-volt">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h1 className="text-lg font-bold text-white">
            {ar ? "منطقة المالك" : "Owner Access"}
          </h1>
          <p className="mt-1 text-xs text-white/50">
            {ar ? "GearTech — لوحة التحكم" : "GearTech — Control Deck"}
          </p>

          <div className="mt-6 flex justify-center gap-3" dir="ltr">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-bold ${
                  pinError
                    ? "border-racing text-racing"
                    : pin.length > i
                      ? "border-volt text-volt glow-volt"
                      : "border-white/15 text-white/25"
                }`}
              >
                {pin.length > i ? "•" : ""}
              </span>
            ))}
          </div>

          <p
            className={`mt-3 h-5 text-sm ${
              pinError ? "text-racing" : "text-white/40"
            }`}
          >
            {pinError
              ? ar
                ? "رمز غير صحيح — جرّب مرة ثانية"
                : "Wrong passcode — try again"
              : ar
                ? "أدخل الرمز السري"
                : "Enter your passcode"}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2" dir="ltr">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => pressDigit(d)}
                className="rounded-lg border border-white/10 bg-carbon py-3 text-base font-semibold text-white transition hover:border-volt hover:text-volt"
              >
                {d}
              </button>
            ))}
            <button
              type="button"
              onClick={clearPin}
              className="rounded-lg border border-white/10 bg-carbon py-3 text-sm font-semibold text-white/60 transition hover:border-racing hover:text-racing"
            >
              C
            </button>
            <button
              type="button"
              onClick={() => pressDigit("0")}
              className="rounded-lg border border-white/10 bg-carbon py-3 text-base font-semibold text-white transition hover:border-volt hover:text-volt"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => {
                if (pin === ADMIN_PIN) setUnlocked(true);
                else {
                  setPinError(true);
                  window.setTimeout(() => setPin(""), 450);
                }
              }}
              className="rounded-lg border border-volt/40 bg-volt/10 py-3 text-sm font-bold text-volt transition hover:bg-volt hover:text-obsidian"
            >
              {ar ? "دخول" : "GO"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = PRODUCTS.length + adminProducts.length;

  const renderRow = (p: AdminProduct | (typeof PRODUCTS)[number], isAdmin: boolean) => (
    <div
      key={`${p.id}`}
      className="flex items-center gap-3 rounded-xl border border-white/10 bg-carbon p-3"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.image}
        alt={p.title[lang]}
        className="h-12 w-12 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {p.title[lang]}
        </p>
        <p className="text-xs text-white/50">{p.slug}</p>
      </div>
      <span className="shrink-0 text-sm font-bold text-volt">
        {money(p.price)}
      </span>
      {isAdmin && (
        <button
          type="button"
          onClick={() => removeAdminProduct(p.id)}
          className="shrink-0 rounded-lg border border-racing/50 px-2 py-1 text-xs font-semibold text-racing transition hover:bg-racing hover:text-white"
        >
          {ar ? "حذف" : "Delete"}
        </button>
      )}
    </div>
  );

  const inputCls =
    "w-full rounded-lg border border-white/10 bg-obsidian px-3 py-2 text-sm text-white outline-none transition focus:border-volt";
  const labelCls = "mb-1 block text-xs font-medium text-white/60";
  const sectionTitleCls =
    "text-xs font-bold uppercase tracking-[0.2em] text-volt";

  return (
    <div dir={ar ? "rtl" : "ltr"} className="min-h-screen bg-obsidian">
      <header className="border-b border-white/10 bg-carbon/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-black text-white">
              GearTech <span className="text-volt">/ {ar ? "المالك" : "Owner"}</span>
            </h1>
            <p className="text-xs text-white/40">@geartechjo — {ar ? "عمّان، الأردن" : "Amman, Jordan"}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem("geartech_admin_unlocked");
              } catch {
                /* ignore */
              }
              setUnlocked(false);
              setPin("");
              setPinError(false);
            }}
            className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-racing hover:text-racing"
          >
            {ar ? "قفل" : "Lock"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {/* a) stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="glass rounded-2xl p-5">
            <p className={sectionTitleCls}>
              {ar ? "إجمالي المنتجات" : "Total Products"}
            </p>
            <p className="mt-2 text-3xl font-black text-white">{totalProducts}</p>
            <p className="mt-1 text-xs text-white/40">
              {ar
                ? `${PRODUCTS.length} أساسي + ${adminProducts.length} مضاف`
                : `${PRODUCTS.length} base + ${adminProducts.length} pushed`}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className={sectionTitleCls}>{ar ? "متوسط الهامش" : "Avg Margin"}</p>
            <p className="mt-2 text-3xl font-black text-volt">
              {calc.effectiveMargin.toFixed(1)}%
            </p>
            <p className="mt-1 text-xs text-white/40">
              {ar ? "بعد تطبيق قواعد التسعير" : "After pricing rules applied"}
            </p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className={sectionTitleCls}>{ar ? "أحداث السلة" : "Cart Events"}</p>
            <p className="mt-2 text-3xl font-black text-white/40">—</p>
            <p className="mt-1 text-xs text-white/40">
              {ar ? "التحليلات قريباً" : "Analytics coming soon"}
            </p>
          </div>
        </section>

        {/* b) calculator */}
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-black text-white">
              {ar
                ? "حاسبة هامش المستورد والأسعار"
                : "Importer Margin & Pricing Calculator"}
            </h2>
            <span className={sectionTitleCls}>
              {ar ? "محرك التسعير الفيروسي" : "Viral Pricing Engine"}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className={labelCls}>{ar ? "منصة المصدر" : "Source platform"}</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className={inputCls}
              >
                {PLATFORMS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label[lang]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                {ar ? "تكلفة المورد الخام" : "Raw supplier cost"}
              </label>
              <div className="flex gap-2" dir="ltr">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className={inputCls}
                />
                <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/10">
                  {(["USD", "JOD"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={`px-2 text-xs font-bold transition ${
                        currency === c
                          ? "bg-volt text-obsidian"
                          : "bg-obsidian text-white/50 hover:text-white"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>{ar ? "الوزن (جم)" : "Weight (g)"}</label>
              <input
                type="number"
                min="0"
                step="10"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {ar ? "رسوم المستورد/الجمارك %" : "Importer/customs fee %"}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={customsPct}
                onChange={(e) => setCustomsPct(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {ar ? "تكلفة الشراء الإعلاني (د.أ)" : "Estimated ad CPA (JOD)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={cpa}
                onChange={(e) => setCpa(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {ar ? "هامش الربح المستهدف %" : "Target profit margin %"}
              </label>
              <input
                type="number"
                min="0"
                max="95"
                step="1"
                value={marginPct}
                onChange={(e) => setMarginPct(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                {ar ? "سعر الصرف USD → JOD (اختياري)" : "Exchange rate USD → JOD (optional)"}
              </label>
              <input
                type="number"
                min="0"
                step="0.001"
                value={fx}
                disabled={currency === "JOD"}
                onChange={(e) => setFx(e.target.value)}
                className={`${inputCls} disabled:opacity-40`}
              />
            </div>
          </div>

          {/* outputs */}
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-carbon p-4">
              <p className={sectionTitleCls}>
                {ar ? "تفصيل التكلفة المستوردة" : "Landed cost breakdown"}
              </p>
              <table className="mt-3 w-full text-sm">
                <tbody className="text-white/70">
                  <tr className="border-b border-white/5">
                    <td className="py-2">{ar ? "تكلفة المورد" : "Supplier cost"}</td>
                    <td className="py-2 text-left font-mono text-white" dir="ltr">
                      {calc.supplierJod.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">
                      {ar ? `الجمارك (${customsPct}%)` : `Customs (${customsPct}%)`}
                    </td>
                    <td className="py-2 text-left font-mono text-white" dir="ltr">
                      {calc.customsJod.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">
                      {ar ? "الشحن حسب الوزن" : "Shipping by weight"}
                    </td>
                    <td className="py-2 text-left font-mono text-white" dir="ltr">
                      {calc.shippingJod.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-2">{ar ? "تكلفة الإعلان (CPA)" : "Ad CPA"}</td>
                    <td className="py-2 text-left font-mono text-white" dir="ltr">
                      {calc.cpaJod.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold text-volt">
                      {ar ? "الإجمالي (د.أ)" : "Total (JOD)"}
                    </td>
                    <td className="py-2 text-left font-mono font-bold text-volt" dir="ltr">
                      {calc.landed.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-white/40">
                {ar
                  ? `معدل الشحن: ${shippingFor(num(weight)).toFixed(2)} د.أ لوزن ${num(weight)} جم`
                  : `Shipping rate: ${shippingFor(num(weight)).toFixed(2)} JOD at ${num(weight)} g`}
              </p>
            </div>

            <div className="rounded-xl border border-volt/30 bg-volt/5 p-4">
              <p className={sectionTitleCls}>
                {ar ? "السعر الفيروسي الموصى به" : "Recommended viral price"}
              </p>
              <p className="mt-2 text-4xl font-black text-volt text-glow-volt" dir="ltr">
                {calc.recommended.toFixed(2)} JOD
              </p>
              <p className="text-xs text-white/50">
                {ar
                  ? `الأساس: ${calc.rawPrice.toFixed(2)} ÷ (1 − ${calc.margin}%)`
                  : `Base: ${calc.rawPrice.toFixed(2)} ÷ (1 − ${calc.margin}%)`}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div
                  className={`rounded-lg border p-2 text-center ${
                    Math.abs(calc.option99 - calc.recommended) < 0.005
                      ? "border-volt bg-volt/10"
                      : "border-white/10 bg-obsidian"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    {ar ? "تقريب .99" : ".99 rounding"}
                  </p>
                  <p className="font-mono text-sm font-bold text-white" dir="ltr">
                    {calc.option99.toFixed(2)}
                  </p>
                </div>
                <div
                  className={`rounded-lg border p-2 text-center ${
                    calc.hasTier && Math.abs(calc.optionTier - calc.recommended) < 0.005
                      ? "border-volt bg-volt/10"
                      : "border-white/10 bg-obsidian"
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40">
                    {ar ? "تدرّج نظيف" : "Clean tier"}
                  </p>
                  <p className="font-mono text-sm font-bold text-white" dir="ltr">
                    {calc.hasTier ? calc.optionTier.toFixed(2) : "—"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg border border-white/10 bg-obsidian px-3 py-2">
                <span className="text-xs text-white/60">
                  {ar ? "سعر المقارنة (×1.35)" : "Compare At (×1.35)"}
                </span>
                <span className="font-mono text-sm font-bold text-white/80" dir="ltr">
                  {calc.compareAt.toFixed(2)} JOD
                </span>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-lg border border-white/10 bg-obsidian px-3 py-2">
                <span className="text-xs text-white/60">
                  {ar ? "ROAS التعادل (إنستا/تيك توك)" : "Break-even ROAS (IG/TikTok)"}
                </span>
                <span className="font-mono text-sm font-bold text-racing" dir="ltr">
                  {calc.roas !== null ? `${calc.roas.toFixed(2)}×` : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* bundles */}
          <div className="mt-6 rounded-xl border border-white/10 bg-carbon p-4">
            <p className={sectionTitleCls}>{ar ? "أسعار الباقات" : "Bundle tier prices"}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                {
                  key: "b2",
                  title: ar ? "باقة ثنائية (خصم 15%)" : "Buy 2 (15% off)",
                  unit: calc.unit2,
                  total: calc.total2,
                  net: calc.net2,
                },
                {
                  key: "b3",
                  title: ar ? "باقة ثلاثية (خصم 25%)" : "Buy 3 (25% off)",
                  unit: calc.unit3,
                  total: calc.total3,
                  net: calc.net3,
                },
              ].map((b) => {
                const belowBreakEven = b.net < 0;
                return (
                  <div key={b.key} className="rounded-lg border border-white/10 bg-obsidian p-3">
                    <p className="text-sm font-bold text-white">{b.title}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-white/50">
                        {ar ? "سعر الوحدة" : "Per unit"}
                      </span>
                      <span className="font-mono font-bold text-volt" dir="ltr">
                        {b.unit.toFixed(2)} JOD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">
                        {ar
                          ? b.key === "b2"
                            ? "إجمالي القطعتين"
                            : "إجمالي الثلاث قطع"
                          : b.key === "b2"
                            ? "Pair total"
                            : "Trio total"}
                      </span>
                      <span className="font-mono font-bold text-white" dir="ltr">
                        {b.total.toFixed(2)} JOD
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-md border border-white/5 bg-carbon px-2 py-1.5 text-sm">
                      <span className="text-white/50">
                        {ar ? "صافي الهامش بعد التكلفة" : "Net margin after landed cost"}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          belowBreakEven ? "text-racing" : "text-volt"
                        }`}
                        dir="ltr"
                      >
                        {b.net.toFixed(1)}%
                      </span>
                    </div>
                    {belowBreakEven && (
                      <p className="mt-1 text-xs font-semibold text-racing">
                        {ar
                          ? "تحت نقطة التعادل — السعر يغطي التكلفة المستوردة"
                          : "Below break-even — price does not cover landed cost"}
                      </p>
                    )}
                    <p className="mt-1 text-[11px] text-white/35">
                      {ar
                        ? `الحد الأدنى المطلوب (هامش − 5): ${(calc.landed / (1 - Math.max(calc.margin - 5, 0) / 100)).toFixed(2)} د.أ`
                        : `Floor to keep (margin − 5): ${(calc.landed / (1 - Math.max(calc.margin - 5, 0) / 100)).toFixed(2)} JOD`}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* c) push to storefront */}
        <section className="glass rounded-2xl p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-base font-black text-white">
              {ar ? "دفع إلى الواجهة (ضغطة وحدة)" : "1-Click Push to Storefront"}
            </h2>
            <span className={sectionTitleCls}>{ar ? "منتج إداري جديد" : "New admin product"}</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={labelCls}>{ar ? "اسم المنتج (إنجليزي)" : "Product name (EN)"}</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Turbo RGB Dashboard Strip"
                className={inputCls}
                dir="ltr"
              />
            </div>
            <div>
              <label className={labelCls}>{ar ? "اسم المنتج (عربي)" : "Product name (AR)"}</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                placeholder="شريط إضاءة RGB للشاشة"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{ar ? "الفئة" : "Category"}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label[lang]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={pushToStore}
              disabled={!nameEn.trim() || !nameAr.trim() || calc.recommended <= 0}
              className="rounded-xl bg-volt px-6 py-3 text-sm font-black text-obsidian transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 glow-volt"
            >
              {ar ? "دفع إلى المتجر" : "Push to Storefront"}
            </button>
            <span className="text-xs text-white/50">
              {ar
                ? `السعر: ${priceText} — المقارنة: ${money(calc.compareAt)} — الهامش: ${calc.margin}%`
                : `Price: ${priceText} — Compare at: ${money(calc.compareAt)} — Margin: ${calc.margin}%`}
            </span>
            {pushedId && (
              <span className="rounded-lg border border-volt/40 bg-volt/10 px-3 py-1 text-xs font-bold text-volt">
                {ar ? `تم الإضافة ✓ (${pushedId})` : `Pushed ✓ (${pushedId})`}
              </span>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-carbon p-4">
            <div className="flex items-center justify-between">
              <p className={sectionTitleCls}>
                {ar ? "سكربتات خطافات تيك توك" : "TikTok video hook scripts"}
              </p>
              <span className="text-[11px] text-white/40">
                {ar ? "انسخ بلغة واحدة" : "Copy in one tap"}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {hooks.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-white/10 bg-obsidian p-3"
                >
                  <span className="mt-0.5 font-mono text-xs font-bold text-volt">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="flex-1 text-sm text-white/80">{h}</p>
                  <button
                    type="button"
                    onClick={() => copyHook(h, i)}
                    className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-bold transition ${
                      copiedIdx === i
                        ? "border-volt bg-volt text-obsidian"
                        : "border-white/15 text-white/60 hover:border-volt hover:text-volt"
                    }`}
                  >
                    {copiedIdx === i
                      ? ar
                        ? "تم النسخ"
                        : "Copied"
                      : ar
                        ? "نسخ"
                        : "Copy"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* d) pricing rules */}
        <section className="glass rounded-2xl p-6">
          <h2 className="text-base font-black text-white">
            {ar ? "مدير قواعد التسعير" : "Pricing Rules Manager"}
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <div>
              <label className={labelCls}>{ar ? "الوصف" : "Label"}</label>
              <input
                type="text"
                value={ruleLabel}
                onChange={(e) => setRuleLabel(e.target.value)}
                placeholder={ar ? "خصم الجمعة" : "Friday discount"}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>{ar ? "النوع" : "Type"}</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value as "percent" | "fixed")}
                className={inputCls}
              >
                <option value="percent">{ar ? "نسبة %" : "Percent %"}</option>
                <option value="fixed">{ar ? "مبلغ ثابت (د.أ)" : "Fixed (JOD)"}</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>{ar ? "القيمة" : "Value"}</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={ruleValue}
                onChange={(e) => setRuleValue(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  const v = num(ruleValue);
                  if (!ruleLabel.trim() || v <= 0) return;
                  addPricingRule({
                    label: ruleLabel.trim(),
                    type: ruleType,
                    value: v,
                  });
                  setRuleLabel("");
                  setRuleValue("");
                }}
                className="w-full rounded-lg border border-volt/50 bg-volt/10 py-2.5 text-sm font-bold text-volt transition hover:bg-volt hover:text-obsidian"
              >
                {ar ? "إضافة قاعدة" : "Add rule"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <ul className="space-y-2">
              {pricingRules.length === 0 && (
                <li className="rounded-lg border border-dashed border-white/15 p-4 text-sm text-white/40">
                  {ar ? "ما في قواعد تسعير بعد." : "No pricing rules yet."}
                </li>
              )}
              {pricingRules.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-carbon px-3 py-2"
                >
                  <span className="flex-1 text-sm font-semibold text-white">
                    {r.label}
                  </span>
                  <span className="font-mono text-xs font-bold text-volt" dir="ltr">
                    {r.type === "percent" ? `-${r.value}%` : `-${r.value.toFixed(2)} JOD`}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePricingRule(r.id)}
                    className="rounded-md border border-racing/50 px-2 py-1 text-xs font-bold text-racing transition hover:bg-racing hover:text-white"
                  >
                    {ar ? "حذف" : "Remove"}
                  </button>
                </li>
              ))}
            </ul>

            <div className="rounded-xl border border-white/10 bg-carbon p-4">
              <p className={sectionTitleCls}>
                {ar ? "معاينة سعر المتجر" : "Store price preview"}
              </p>
              <p className="mt-2 truncate text-sm font-semibold text-white">
                {sample.title[lang]}
              </p>
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{ar ? "السعر الأساسي" : "Base price"}</span>
                  <span className="font-mono text-white/70" dir="ltr">
                    {money(sample.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{ar ? "بعد القواعد" : "After rules"}</span>
                  <span className="font-mono font-bold text-volt" dir="ltr">
                    {money(round2(sampleAfter))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">{ar ? "التوفير" : "Savings"}</span>
                  <span className="font-mono font-bold text-racing" dir="ltr">
                    {money(round2(sample.price - sampleAfter))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* e) product list */}
        <section className="glass rounded-2xl p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-base font-black text-white">
              {ar ? "قائمة المنتجات" : "Product list"}
            </h2>
            <span className={sectionTitleCls}>
              {totalProducts} {ar ? "منتج" : "products"}
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {PRODUCTS.map((p) => renderRow(p, false))}
            {adminProducts.map((p) => renderRow(p, true))}
          </div>
        </section>
      </main>
    </div>
  );
}
