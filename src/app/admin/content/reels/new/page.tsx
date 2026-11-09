import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ReelForm from "@/components/admin/ReelForm";

export const dynamic = "force-dynamic";

export default async function NewReelPage() {
  await requireAdmin();
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { titleAr: "asc" }, select: { id: true, titleAr: true, titleEn: true } });
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">Reel جديد</h1>
      <div className="mt-6">
        <ReelForm mode="create" products={products} />
      </div>
    </div>
  );
}
