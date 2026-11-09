"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createReelAction, updateReelAction } from "@/app/actions/content";

interface Props {
  mode: "create" | "edit";
  products: { id: string; titleAr: string; titleEn: string }[];
  initial?: { id: string; titleAr: string; titleEn: string; videoUrl: string; posterUrl: string | null; productId: string | null; manualViewLabel: string | null; sortOrder: number; isActive: boolean };
}

export default function ReelForm({ mode, products, initial }: Props) {
  const router = useRouter();
  const [titleAr, setTitleAr] = useState(initial?.titleAr ?? "");
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [posterUrl, setPosterUrl] = useState(initial?.posterUrl ?? "");
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [viewLabel, setViewLabel] = useState(initial?.manualViewLabel ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      titleAr, titleEn, videoUrl,
      posterUrl: posterUrl || null,
      productId: productId || null,
      manualViewLabel: viewLabel || null,
      sortOrder, isActive,
    };
    startTransition(async () => {
      const res = mode === "create"
        ? await createReelAction(payload)
        : await updateReelAction(initial!.id, payload);
      if (res.ok) { router.push("/admin/content"); router.refresh(); }
      else setError("Operation failed");
    });
  };

  const field = (label: string, node: React.ReactNode) => (
    <div><label className="mb-1.5 block text-xs text-white/60">{label}</label>{node}</div>
  );
  const input = (val: string, set: (s: string) => void, placeholder = "") => (
    <input value={val} onChange={(e) => set(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
  );

  return (
    <form onSubmit={submit} className="space-y-4 max-w-2xl">
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {field("العنوان (AR)", input(titleAr, setTitleAr))}
        {field("Title (EN)", input(titleEn, setTitleEn))}
      </div>
      {field("Video URL", input(videoUrl, setVideoUrl, "https://..."))}
      {field("Poster URL", input(posterUrl, setPosterUrl, "/products/illustrations/..."))}
      {field("المنتج", (
        <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60">
          <option value="">—</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.titleAr} / {p.titleEn}</option>)}
        </select>
      ))}
      <div className="grid gap-4 md:grid-cols-2">
        {field("View label", input(viewLabel, setViewLabel, "452K"))}
        {field("Sort order", <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />)}
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> منشور</label>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-[#14B8A6] px-5 py-2.5 text-sm font-bold text-[#060709] transition hover:brightness-110 disabled:opacity-50">{pending ? "..." : mode === "create" ? "إنشاء" : "حفظ"}</button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:text-white">إلغاء</button>
      </div>
    </form>
  );
}
