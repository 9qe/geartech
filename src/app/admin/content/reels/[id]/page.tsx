import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ReelForm from "@/components/admin/ReelForm";

export const dynamic = "force-dynamic";

export default async function EditReelPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await prisma.reel.findUnique({ where: { id } });
  if (!r) notFound();
  const products = await prisma.product.findMany({ where: { isActive: true }, orderBy: { titleAr: "asc" }, select: { id: true, titleAr: true, titleEn: true } });
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">تعديل Reel</h1>
      <div className="mt-6">
        <ReelForm mode="edit" products={products} initial={{ id: r.id, titleAr: r.titleAr, titleEn: r.titleEn, videoUrl: r.videoUrl, posterUrl: r.posterUrl, productId: r.productId, manualViewLabel: r.manualViewLabel, sortOrder: r.sortOrder, isActive: r.isActive }} />
      </div>
    </div>
  );
}
