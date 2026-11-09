import { requireAdmin } from "@/lib/auth";
import BundleRuleForm from "@/components/admin/BundleRuleForm";

export const dynamic = "force-dynamic";

export default async function NewBundleRulePage() {
  await requireAdmin();
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-extrabold">قاعدة باقة جديدة</h1>
      <div className="mt-6">
        <BundleRuleForm mode="create" />
      </div>
    </div>
  );
}
