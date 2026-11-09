import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BundleRuleForm from "@/components/admin/BundleRuleForm";

export const dynamic = "force-dynamic";

export default async function EditBundleRulePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await prisma.bundleRule.findUnique({ where: { id } });
  if (!r) notFound();
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">تعديل قاعدة باقة</h1>
      <div className="mt-6">
        <BundleRuleForm mode="edit" initial={{ id: r.id, minimumEligibleItems: r.minimumEligibleItems, discountPercentage: r.discountPercentage, freeDelivery: r.freeDelivery, priority: r.priority, enabled: r.enabled }} />
      </div>
    </div>
  );
}
