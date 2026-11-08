import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStoreSetting } from "@/lib/pricing";
import { saveAllShippingAction, saveStoreSettingsAction } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const govs = await prisma.governorate.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { shippingRates: true },
  });
  const threshold = (await getStoreSetting<number>("freeShippingThresholdFils")) ?? 25000;
  const s = (k: string) => getStoreSetting<unknown>(k);

  const [
    storeName, whatsappNumber, instagram, tiktok, facebook,
    cliqAlias, cliqBeneficiary, cliqIban, cliqInstructions, replacementDays,
  ] = await Promise.all([
    s("storeName"), s("whatsappNumber"), s("instagram"), s("tiktok"), s("facebook"),
    s("cliqAlias"), s("cliqBeneficiary"), s("cliqIban"), s("cliqInstructions"), s("replacementDays"),
  ]);

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-2xl font-extrabold">الإعدادات</h1>

      {/* Shipping */}
      <section className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">التوصيل — 12 محافظة</h2>
        <form action={async (fd) => { "use server"; await saveAllShippingAction(fd); }} className="mt-4 space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-white/50">
                <tr>
                  <th className="py-2 text-start">المحافظة</th>
                  <th className="py-2 text-start">رسوم التوصيل (JOD)</th>
                  <th className="py-2 text-start">التكلفة الفعلية (JOD)</th>
                  <th className="py-2 text-start">مُعدّ</th>
                  <th className="py-2 text-start">نشط</th>
                </tr>
              </thead>
              <tbody>
                {govs.map((g) => {
                  const r = g.shippingRates[0];
                  return (
                    <tr key={g.id} className="border-t border-white/7">
                      <td className="py-2">{g.nameAr}</td>
                      <td className="py-2"><input name={`fee_${g.id}`} type="number" step="0.001" defaultValue={r ? (r.deliveryFeeFils / 1000).toFixed(3) : "0"} className="w-28 rounded-lg border border-white/10 bg-[#14171D] px-2 py-1.5 text-xs text-white outline-none focus:border-[#14B8A6]/60" /></td>
                      <td className="py-2"><input name={`cost_${g.id}`} type="number" step="0.001" defaultValue={r ? (r.actualCostFils / 1000).toFixed(3) : "0"} className="w-28 rounded-lg border border-white/10 bg-[#14171D] px-2 py-1.5 text-xs text-white outline-none focus:border-[#14B8A6]/60" /></td>
                      <td className="py-2 text-center"><input type="checkbox" name={`configured_${g.id}`} defaultChecked={r?.isConfigured ?? false} /></td>
                      <td className="py-2 text-center"><input type="checkbox" name={`active_${g.id}`} defaultChecked={r?.isActive ?? true} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-white/60">حد التوصيل المجاني (JOD)</label>
            <input name="threshold" type="number" step="0.001" defaultValue={(threshold / 1000).toFixed(3)} className="w-28 rounded-lg border border-white/10 bg-[#14171D] px-2 py-1.5 text-xs text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <button className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709] transition hover:brightness-110">حفظ التوصيل</button>
        </form>
      </section>

      {/* Store settings */}
      <section className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">معلومات المتجر</h2>
        <form action={async (fd) => { "use server"; await saveStoreSettingsAction(fd); }} className="mt-4 grid gap-4 md:grid-cols-2">
          {([
            ["storeName", "اسم المتجر", storeName ?? "GearTech"],
            ["whatsappNumber", "رقم واتساب (دولي)", whatsappNumber ?? ""],
            ["instagram", "Instagram", instagram ?? "@geartechjo"],
            ["tiktok", "TikTok", tiktok ?? ""],
            ["facebook", "Facebook", facebook ?? ""],
          ] as [string, string, unknown][]).map(([k, label, val]) => (
            <div key={k}>
              <label className="mb-1.5 block text-xs text-white/60">{label}</label>
              <input name={k} defaultValue={String(val ?? "")} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
            </div>
          ))}
          <div>
            <label className="mb-1.5 block text-xs text-white/60">أيام الاستبدال</label>
            <input name="replacementDays" type="number" defaultValue={Number(replacementDays ?? 7)} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs text-white/60">CliQ alias</label>
            <input name="cliqAlias" defaultValue={String(cliqAlias ?? "")} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs text-white/60">اسم المستفيد (CliQ)</label>
            <input name="cliqBeneficiary" defaultValue={String(cliqBeneficiary ?? "GearTech")} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs text-white/60">IBAN (CliQ)</label>
            <input name="cliqIban" defaultValue={String(cliqIban ?? "")} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs text-white/60">تعليمات CliQ</label>
            <textarea name="cliqInstructions" defaultValue={String(cliqInstructions ?? "")} rows={3} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          </div>
          <div className="md:col-span-2">
            <button className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709] transition hover:brightness-110">حفظ الإعدادات</button>
          </div>
        </form>
      </section>
    </div>
  );
}
