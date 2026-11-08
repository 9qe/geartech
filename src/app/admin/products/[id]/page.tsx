import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fromFils } from "@/lib/money";
import ProductForm from "@/components/admin/ProductForm";
import { archiveProductAction, deleteProductAction, adjustStockAction } from "@/app/actions/products";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id }, include: { category: true } });
  if (!p) notFound();
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const categories = cats.map((c) => ({ id: c.id, name: { ar: c.nameAr, en: c.nameEn } }));

  const initial = {
    id: p.id,
    slug: p.slug,
    titleAr: p.titleAr,
    titleEn: p.titleEn,
    descriptionAr: p.descriptionAr,
    descriptionEn: p.descriptionEn,
    priceJOD: fromFils(p.priceFils),
    compareAtJOD: p.compareAtFils ? fromFils(p.compareAtFils) : null,
    costJOD: fromFils(p.costFils),
    sku: p.sku ?? "",
    stockQuantity: p.stockQuantity,
    trackInventory: p.trackInventory,
    categoryId: p.categoryId,
    badgeLabel: p.badgeLabel ?? "",
    isActive: p.isActive,
    isFeatured: p.isFeatured,
    isBundleEligible: p.isBundleEligible,
    sortOrder: p.sortOrder,
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">تعديل المنتج</h1>
        <Link href="/admin/products" className="text-sm text-white/50 hover:text-white">← رجوع</Link>
      </div>
      <div className="mt-6">
        <ProductForm mode="edit" categories={categories} initial={initial} />
      </div>

      <div className="mt-8 rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold">المخزون</h2>
        <p className="mt-1 text-xs text-white/40">الكمية الحالية: {p.stockQuantity}</p>
        <form action={async (fd) => {
          "use server";
          const delta = Number(fd.get("delta"));
          await adjustStockAction(p.id, delta, String(fd.get("note") ?? ""));
        }} className="mt-3 flex gap-2">
          <input name="delta" type="number" placeholder="+/-" className="w-24 rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          <input name="note" placeholder="ملاحظة" className="flex-1 rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
          <button className="rounded-lg bg-[#14B8A6] px-4 py-2 text-sm font-bold text-[#060709]">تطبيق</button>
        </form>
      </div>

      <div className="mt-6 flex gap-3">
        <form action={async () => { "use server"; await archiveProductAction(p.id); }}>
          <button className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:text-white">أرشفة</button>
        </form>
        <form action={async () => { "use server"; await deleteProductAction(p.id); }}>
          <button className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/10">حذف (إذا لا توجد طلبات)</button>
        </form>
      </div>
    </div>
  );
}
