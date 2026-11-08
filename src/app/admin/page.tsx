import { requireAdmin } from "@/lib/auth";
import { getAdminMetrics } from "@/lib/catalog";
import { fromFils } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const m = await getAdminMetrics();

  const cards = [
    { label: "إيرادات اليوم", value: `${fromFils(m.todayRevenueFils).toFixed(2)} د.أ`, sub: "مبيعات مكتملة" },
    { label: "إجمالي الطلبات", value: String(m.totalOrders), sub: "باستثناء الملغاة" },
    { label: "متوسط الطلب", value: `${fromFils(m.aovFils).toFixed(2)} د.أ`, sub: "AOV" },
    { label: "COD معلّق", value: String(m.pendingCod), sub: "بانتظار التأكيد" },
  ];

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">لوحة التحكم</h1>
      <p className="mt-1 text-sm text-white/50">نظرة عامة على الأداء — Asia/Amman</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
            <div className="text-xs text-white/50">{c.label}</div>
            <div className="mt-2 text-2xl font-extrabold tabular-nums">{c.value}</div>
            <div className="mt-1 text-[11px] text-white/30">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
          <h2 className="text-sm font-bold">الأكثر مبيعاً</h2>
          <ul className="mt-4 space-y-3">
            {m.topProducts.length === 0 && <li className="text-xs text-white/40">لا توجد بيانات بعد</li>}
            {m.topProducts.map((t) => (
              <li key={t.productId ?? t.title} className="flex items-center justify-between text-sm">
                <span className="truncate">{t.title}</span>
                <span className="text-white/50 tabular-nums">{t.quantity}× · {fromFils(t.revenueFils).toFixed(2)} د.أ</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
          <h2 className="text-sm font-bold">آخر الطلبات</h2>
          <ul className="mt-4 space-y-3">
            {m.recentOrders.length === 0 && <li className="text-xs text-white/40">لا توجد طلبات بعد</li>}
            {m.recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between text-sm">
                <span className="truncate">{o.orderNumber} · {o.customerNameSnapshot}</span>
                <span className="text-white/50 tabular-nums">{fromFils(o.totalFils).toFixed(2)} د.أ · {o.orderStatus}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
