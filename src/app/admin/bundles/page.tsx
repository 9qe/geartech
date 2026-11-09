import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteBundleRuleAction, toggleBundleRuleAction } from "@/app/actions/bundles";

export const dynamic = "force-dynamic";

export default async function BundlesAdminPage() {
  await requireAdmin();
  const rules = await prisma.bundleRule.findMany({ orderBy: [{ priority: "desc" }, { minimumEligibleItems: "asc" }] });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">الباقات والخصومات</h1>
          <p className="mt-1 text-sm text-white/50">{rules.length} قاعدة</p>
        </div>
        <Link href="/admin/bundles/new" className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709] transition hover:brightness-110">+ قاعدة جديدة</Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/7">
        <table className="w-full text-sm">
          <thead className="bg-[#14171D] text-xs text-white/50">
            <tr>
              <th className="px-4 py-3 text-start">الحد الأدنى</th>
              <th className="px-4 py-3 text-start">الخصم</th>
              <th className="px-4 py-3 text-start">توصيل مجاني</th>
              <th className="px-4 py-3 text-start">الأولوية</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} className="border-t border-white/7">
                <td className="px-4 py-3 tabular-nums">{r.minimumEligibleItems}</td>
                <td className="px-4 py-3 tabular-nums">{r.discountPercentage}%</td>
                <td className="px-4 py-3">{r.freeDelivery ? "نعم" : "لا"}</td>
                <td className="px-4 py-3 tabular-nums">{r.priority}</td>
                <td className="px-4 py-3">
                  <form action={async () => { "use server"; await toggleBundleRuleAction(r.id, !r.enabled); }}>
                    <button className={r.enabled ? "text-[#14B8A6]" : "text-white/30"}>{r.enabled ? "مفعّل" : "معطّل"}</button>
                  </form>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <Link href={`/admin/bundles/${r.id}`} className="text-[#14B8A6] hover:underline">تعديل</Link>
                  <form action={async () => { "use server"; await deleteBundleRuleAction(r.id); }}>
                    <button className="text-red-300 hover:underline">حذف</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
