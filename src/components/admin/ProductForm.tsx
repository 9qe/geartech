"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction, updateProductAction } from "@/app/actions/products";

export interface ProductFormValues {
  id?: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  priceJOD: number;
  compareAtJOD: number | null;
  costJOD: number;
  sku: string;
  stockQuantity: number;
  trackInventory: boolean;
  categoryId: string | null;
  badgeLabel: string;
  isActive: boolean;
  isFeatured: boolean;
  isBundleEligible: boolean;
  sortOrder: number;
}

interface Props {
  mode: "create" | "edit";
  categories: { id: string; name: { ar: string; en: string } }[];
  initial?: ProductFormValues;
}

const empty: ProductFormValues = {
  slug: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  priceJOD: 0,
  compareAtJOD: null,
  costJOD: 0,
  sku: "",
  stockQuantity: 0,
  trackInventory: true,
  categoryId: null,
  badgeLabel: "",
  isActive: true,
  isFeatured: false,
  isBundleEligible: false,
  sortOrder: 0,
};

export default function ProductForm({ mode, categories, initial }: Props) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial ?? empty);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        slug: v.slug,
        titleAr: v.titleAr,
        titleEn: v.titleEn,
        descriptionAr: v.descriptionAr,
        descriptionEn: v.descriptionEn,
        priceJOD: v.priceJOD,
        compareAtJOD: v.compareAtJOD,
        costJOD: v.costJOD,
        sku: v.sku || null,
        stockQuantity: v.stockQuantity,
        trackInventory: v.trackInventory,
        categoryId: v.categoryId,
        badgeLabel: v.badgeLabel || null,
        isActive: v.isActive,
        isFeatured: v.isFeatured,
        isBundleEligible: v.isBundleEligible,
        sortOrder: v.sortOrder,
      };
      const res =
        mode === "create"
          ? await createProductAction(payload)
          : await updateProductAction(v.id!, payload);
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(res.error + (res.issues ? ": " + res.issues.map((i: { message: string }) => i.message).join(", ") : ""));
      }
    });
  };

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="mb-1.5 block text-xs text-white/60">{label}</label>
      {node}
    </div>
  );
  const input = (key: keyof ProductFormValues, type = "text", extra?: Record<string, unknown>) => (
    <input
      type={type}
      value={v[key] as string | number}
      onChange={(e) => set(key, (type === "number" ? Number(e.target.value) : e.target.value) as ProductFormValues[typeof key])}
      {...extra}
      className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60"
    />
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {field("Slug", input("slug"))}
        {field("Badge", input("badgeLabel"))}
        {field("العنوان (AR)", input("titleAr"))}
        {field("Title (EN)", input("titleEn"))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {field("الوصف (AR)", <textarea value={v.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} rows={4} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />)}
        {field("Description (EN)", <textarea value={v.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} rows={4} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />)}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {field("السعر (JOD)", input("priceJOD", "number", { step: "0.001", min: 0 }))}
        {field("Compare-at", input("compareAtJOD", "number", { step: "0.001", min: 0 }))}
        {field("التكلفة", input("costJOD", "number", { step: "0.001", min: 0 }))}
        {field("المخزون", input("stockQuantity", "number", { min: 0 }))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {field("SKU", input("sku"))}
        {field("التصنيف", (
          <select value={v.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name.ar} / {c.name.en}</option>
            ))}
          </select>
        ))}
        {field("الترتيب", input("sortOrder", "number", { min: 0 }))}
        {field("تتبع المخزون", (
          <label className="flex items-center gap-2 pt-2 text-sm">
            <input type="checkbox" checked={v.trackInventory} onChange={(e) => set("trackInventory", e.target.checked)} />
            <span>Track inventory</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isActive} onChange={(e) => set("isActive", e.target.checked)} /> Active</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} /> Featured</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={v.isBundleEligible} onChange={(e) => set("isBundleEligible", e.target.checked)} /> Bundle eligible</label>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-[#14B8A6] px-5 py-2.5 text-sm font-bold text-[#060709] transition hover:brightness-110 disabled:opacity-50">
          {pending ? "..." : mode === "create" ? "إنشاء منتج" : "حفظ التغييرات"}
        </button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:text-white">
          إلغاء
        </button>
      </div>
    </form>
  );
}
