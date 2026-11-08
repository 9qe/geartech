import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  const categories = cats.map((c) => ({ id: c.id, name: { ar: c.nameAr, en: c.nameEn } }));
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">منتج جديد</h1>
      <div className="mt-6">
        <ProductForm mode="create" categories={categories} />
      </div>
    </div>
  );
}
