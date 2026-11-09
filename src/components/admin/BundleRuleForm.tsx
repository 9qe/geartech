"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBundleRuleAction, updateBundleRuleAction } from "@/app/actions/bundles";

interface Props {
  mode: "create" | "edit";
  initial?: { id: string; minimumEligibleItems: number; discountPercentage: number; freeDelivery: boolean; priority: number; enabled: boolean };
}

export default function BundleRuleForm({ mode, initial }: Props) {
  const router = useRouter();
  const [min, setMin] = useState(initial?.minimumEligibleItems ?? 2);
  const [disc, setDisc] = useState(initial?.discountPercentage ?? 15);
  const [free, setFree] = useState(initial?.freeDelivery ?? true);
  const [prio, setPrio] = useState(initial?.priority ?? 0);
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = { minimumEligibleItems: min, discountPercentage: disc, freeDelivery: free, priority: prio, enabled };
      const res = mode === "create"
        ? await createBundleRuleAction(payload)
        : await updateBundleRuleAction(initial!.id, payload);
      if (res.ok) {
        router.push("/admin/bundles");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  };

  const field = (label: string, node: React.ReactNode) => (
    <div>
      <label className="mb-1.5 block text-xs text-white/60">{label}</label>
      {node}
    </div>
  );
  const input = (val: number, set: (n: number) => void, min = 0, max = 100) => (
    <input type="number" value={val} min={min} max={max} onChange={(e) => set(Number(e.target.value))} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}
      <div className="grid gap-4 md:grid-cols-2">
        {field("الحد الأدنى للمنتجات", input(min, setMin, 1, 99))}
        {field("نسبة الخصم (%)", input(disc, setDisc, 0, 100))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {field("الأولوية", input(prio, setPrio, 0, 99))}
        <div className="flex flex-col gap-2 pt-6">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> توصيل مجاني</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> مفعّل</label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-lg bg-[#14B8A6] px-5 py-2.5 text-sm font-bold text-[#060709] transition hover:brightness-110 disabled:opacity-50">{pending ? "..." : mode === "create" ? "إنشاء" : "حفظ"}</button>
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-white/10 px-5 py-2.5 text-sm text-white/70 transition hover:text-white">إلغاء</button>
      </div>
    </form>
  );
}
