import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromFils } from "@/lib/money";
import { getStoreSetting } from "@/lib/pricing";
import { updateOrderStatusAction, addOrderNoteAction } from "@/app/actions/orders";
import PaymentStatusSelect from "@/components/admin/PaymentStatusSelect";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  NEW: "جديد", CONFIRMED: "مؤكد", IN_DELIVERY: "قيد التوصيل", DELIVERED: "تم التسليم", CANCELLED: "ملغي",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, governorate: true, statusHistory: { orderBy: { createdAt: "asc" } }, customer: true },
  });
  if (!order) notFound();

  const waNumber = await getStoreSetting<string>("whatsappNumber");
  const address = JSON.parse(order.addressSnapshot || "{}");

  // WhatsApp confirm message
  const itemsText = order.items.map((it) => `${it.productTitleSnapshot} × ${it.quantity}`).join("\n");
  const msg = `مرحباً ${order.customerNameSnapshot}، معك GearTech.\n\nتم استلام طلبك رقم ${order.orderNumber}.\n\nالمنتجات:\n${itemsText}\n\nالإجمالي: ${fromFils(order.totalFils).toFixed(2)} د.أ\n\nالمحافظة: ${order.governorate?.nameAr ?? ""}\nالعنوان: ${[address.city, address.area, address.street, address.details].filter(Boolean).join("، ")}\n\nنرجو تأكيد الطلب.`;
  const waUrl = waNumber ? `https://wa.me/${String(waNumber).replace(/\D/g, "")}?text=${encodeURIComponent(msg)}` : null;

  const allowedNext: Record<string, string[]> = {
    NEW: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["IN_DELIVERY", "CANCELLED"],
    IN_DELIVERY: ["DELIVERED", "CANCELLED"],
    DELIVERED: [],
    CANCELLED: [],
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <Link href="/admin/orders" className="text-sm text-white/50 hover:text-white">← رجوع للطلبات</Link>
      <div className="mt-3 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">{order.orderNumber}</h1>
        <span className="text-xs text-white/40">{order.createdAt.toISOString().slice(0, 19).replace("T", " ")}</span>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
          <h2 className="text-sm font-bold">العميل</h2>
          <div className="mt-3 space-y-1 text-sm">
            <div>{order.customerNameSnapshot}</div>
            <div className="text-white/60" dir="ltr">{order.customerPhoneSnapshot}</div>
            <div className="text-white/60">{order.governorate?.nameAr ?? "—"}</div>
            <div className="text-white/60">{[address.city, address.area, address.street, address.details].filter(Boolean).join("، ")}</div>
            {order.customerNotes && <div className="mt-2 text-xs text-white/40">ملاحظات: {order.customerNotes}</div>}
          </div>
        </div>

        <div className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
          <h2 className="text-sm font-bold">الدفع</h2>
          <div className="mt-3 space-y-1 text-sm">
            <div>الطريقة: {order.paymentMethod}</div>
            <div>الحالة: {order.paymentStatus}</div>
            {order.cliqReference && <div className="text-white/60">مرجع CliQ: {order.cliqReference}</div>}
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709] transition hover:brightness-110">
                تأكيد عبر واتساب
              </a>
            )}
          </div>
          <PaymentStatusSelect orderId={order.id} initial={order.paymentStatus} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">المنتجات</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-xs text-white/50">
            <tr><th className="py-2 text-start">المنتج</th><th className="py-2 text-start">SKU</th><th className="py-2 text-start">الكمية</th><th className="py-2 text-start">السعر</th><th className="py-2 text-start">المجموع</th></tr>
          </thead>
          <tbody>
            {order.items.map((it) => (
              <tr key={it.id} className="border-t border-white/7">
                <td className="py-2">{it.productTitleSnapshot}</td>
                <td className="py-2 text-white/50">{it.productSkuSnapshot ?? "—"}</td>
                <td className="py-2 tabular-nums">{it.quantity}</td>
                <td className="py-2 tabular-nums">{fromFils(it.unitPriceFils).toFixed(2)}</td>
                <td className="py-2 tabular-nums">{fromFils(it.lineTotalFils).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 space-y-1 text-sm text-end">
          <div>المجموع الفرعي: {fromFils(order.subtotalFils).toFixed(2)} د.أ</div>
          <div>الخصم: {fromFils(order.discountFils).toFixed(2)} د.أ</div>
          <div>التوصيل: {fromFils(order.shippingFeeFils).toFixed(2)} د.أ</div>
          <div className="font-bold">الإجمالي: {fromFils(order.totalFils).toFixed(2)} د.أ</div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">تحديث الحالة</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {allowedNext[order.orderStatus].map((s) => (
            <form key={s} action={async () => { "use server"; await updateOrderStatusAction(order.id, s); }}>
              <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-[#14B8A6]/40 hover:text-[#14B8A6]">
                {STATUS_LABELS[s]}
              </button>
            </form>
          ))}
          {allowedNext[order.orderStatus].length === 0 && <span className="text-xs text-white/40">لا توجد انتقالات متاحة</span>}
        </div>
        <div className="mt-4">
          <h3 className="text-xs text-white/50">سجل الحالة</h3>
          <ul className="mt-2 space-y-1 text-xs text-white/60">
            {order.statusHistory.map((h) => (
              <li key={h.id}>{h.createdAt.toISOString().slice(0, 16).replace("T", " ")} — {h.fromStatus ?? "—"} → {h.toStatus}{h.note ? ` (${h.note})` : ""}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">إضافة ملاحظة داخلية</h2>
        <form action={async (fd) => { "use server"; await addOrderNoteAction(order.id, String(fd.get("note") ?? "")); }} className="mt-3 flex gap-2">
          <input name="note" required className="flex-1 rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          <button className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709]">إضافة</button>
        </form>
      </div>
    </div>
  );
}
