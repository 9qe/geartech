import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromFils } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;
  const q = sp.q?.trim();
  const status = sp.status;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { titleAr: { contains: q } },
      { titleEn: { contains: q } },
      { sku: { contains: q } },
      { slug: { contains: q } },
    ];
  }
  if (status === "active") where.isActive = true;
  if (status === "inactive") where.isActive = false;

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">المنتجات</h1>
          <p className="mt-1 text-sm text-white/50">{products.length} منتج</p>
        </div>
        <Link href="/admin/products/new" className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709] transition hover:brightness-110">
          + منتج جديد
        </Link>
      </div>

      <form className="mt-4 flex gap-2" method="get">
        <input name="q" defaultValue={q ?? ""} placeholder="بحث..." className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60">
          <option value="">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>
        <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white">بحث</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/7">
        <table className="w-full text-sm">
          <thead className="bg-[#14171D] text-xs text-white/50">
            <tr>
              <th className="px-4 py-3 text-start">المنتج</th>
              <th className="px-4 py-3 text-start">SKU</th>
              <th className="px-4 py-3 text-start">التصنيف</th>
              <th className="px-4 py-3 text-start">السعر</th>
              <th className="px-4 py-3 text-start">المخزون</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-white/7">
                <td className="px-4 py-3">
                  <div className="font-semibold">{p.titleAr}</div>
                  <div className="text-[11px] text-white/40">{p.titleEn}</div>
                </td>
                <td className="px-4 py-3 text-white/60">{p.sku ?? "—"}</td>
                <td className="px-4 py-3 text-white/60">{p.category?.nameAr ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{fromFils(p.priceFils).toFixed(2)} د.أ</td>
                <td className="px-4 py-3 tabular-nums">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span className={p.isActive ? "text-[#14B8A6]" : "text-white/30"}>{p.isActive ? "نشط" : "غير نشط"}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="text-[#14B8A6] hover:underline">تعديل</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
