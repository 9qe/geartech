import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromFils } from "@/lib/money";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  NEW: "جديد",
  CONFIRMED: "مؤكد",
  IN_DELIVERY: "قيد التوصيل",
  DELIVERED: "تم التسليم",
  CANCELLED: "ملغي",
};

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; gov?: string; pm?: string }>;
}) {
  await requireAdmin();
  const sp = await searchParams;

  const where: Record<string, unknown> = {};
  if (sp.q) {
    where.OR = [
      { orderNumber: { contains: sp.q } },
      { customerNameSnapshot: { contains: sp.q } },
      { customerPhoneSnapshot: { contains: sp.q } },
    ];
  }
  if (sp.status) where.orderStatus = sp.status;
  if (sp.gov) where.governorateId = sp.gov;
  if (sp.pm) where.paymentMethod = sp.pm;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { governorate: true },
  });

  const govs = await prisma.governorate.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">الطلبات</h1>
          <p className="mt-1 text-sm text-white/50">{orders.length} طلب</p>
        </div>
        <a href="/api/admin/orders/export" className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white">
          تصدير CSV
        </a>
      </div>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <input name="q" defaultValue={sp.q ?? ""} placeholder="بحث (رقم/اسم/هاتف)" className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
        <select name="status" defaultValue={sp.status ?? ""} className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60">
          <option value="">كل الحالات</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="gov" defaultValue={sp.gov ?? ""} className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60">
          <option value="">كل المحافظات</option>
          {govs.map((g) => <option key={g.id} value={g.id}>{g.nameAr}</option>)}
        </select>
        <select name="pm" defaultValue={sp.pm ?? ""} className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60">
          <option value="">كل طرق الدفع</option>
          <option value="COD">COD</option>
          <option value="CLIQ">CliQ</option>
        </select>
        <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white">تطبيق</button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-white/7">
        <table className="w-full text-sm">
          <thead className="bg-[#14171D] text-xs text-white/50">
            <tr>
              <th className="px-4 py-3 text-start">الطلب</th>
              <th className="px-4 py-3 text-start">العميل</th>
              <th className="px-4 py-3 text-start">المحافظة</th>
              <th className="px-4 py-3 text-start">المجموع</th>
              <th className="px-4 py-3 text-start">الدفع</th>
              <th className="px-4 py-3 text-start">الحالة</th>
              <th className="px-4 py-3 text-start">التاريخ</th>
              <th className="px-4 py-3 text-start">عرض</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/7">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold">{o.customerNameSnapshot}</div>
                  <div className="text-[11px] text-white/40">{o.customerPhoneSnapshot}</div>
                </td>
                <td className="px-4 py-3 text-white/60">{o.governorate?.nameAr ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{fromFils(o.totalFils).toFixed(2)} د.أ</td>
                <td className="px-4 py-3 text-white/60">{o.paymentMethod}</td>
                <td className="px-4 py-3">{STATUS_LABELS[o.orderStatus] ?? o.orderStatus}</td>
                <td className="px-4 py-3 text-[11px] text-white/40">{o.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="text-[#14B8A6] hover:underline">فتح</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
