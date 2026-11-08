import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromFils } from "@/lib/money";

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // formula injection protection
  const safe = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { governorate: true, items: true },
  });

  const header = [
    "Order Number", "Customer Name", "Customer Phone", "Governorate", "City", "Area",
    "Full Address", "Product Summary", "Quantity", "Payment Method", "COD Amount",
    "Order Total", "Delivery Fee", "Customer Notes", "Order Status", "Payment Status", "Created At",
  ];

  const rows = orders.map((o) => {
    const addr = JSON.parse(o.addressSnapshot || "{}");
    const summary = o.items.map((i) => `${i.productTitleSnapshot} x${i.quantity}`).join(" | ");
    const qty = o.items.reduce((s, i) => s + i.quantity, 0);
    return [
      o.orderNumber,
      o.customerNameSnapshot,
      o.customerPhoneSnapshot,
      o.governorate?.nameAr ?? "",
      addr.city ?? "",
      addr.area ?? "",
      [addr.city, addr.area, addr.street, addr.details].filter(Boolean).join("، "),
      summary,
      qty,
      o.paymentMethod,
      o.paymentMethod === "COD" ? fromFils(o.totalFils).toFixed(2) : "0.00",
      fromFils(o.totalFils).toFixed(2),
      fromFils(o.shippingFeeFils).toFixed(2),
      o.customerNotes ?? "",
      o.orderStatus,
      o.paymentStatus,
      o.createdAt.toISOString(),
    ];
  });

  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="geartech-orders-${Date.now()}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
