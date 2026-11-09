import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { updateHeroAction } from "@/app/actions/content";
import { deleteReelAction, toggleReelAction } from "@/app/actions/content";

export const dynamic = "force-dynamic";

export default async function ContentAdminPage() {
  await requireAdmin();
  const heroAr = await prisma.homepageContent.findUnique({ where: { contentKey_locale: { contentKey: "HERO", locale: "ar" } } });
  const heroEn = await prisma.homepageContent.findUnique({ where: { contentKey_locale: { contentKey: "HERO", locale: "en" } } });
  const reels = await prisma.reel.findMany({ orderBy: { sortOrder: "asc" } });
  const products = await prisma.product.findMany({ where: { isActive: true }, select: { id: true, titleAr: true, titleEn: true } });
  const productById = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="p-6 md:p-8 space-y-10">
      <h1 className="text-2xl font-extrabold">المحتوى</h1>

      {/* Hero Editor */}
      <section className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <h2 className="text-sm font-bold mb-4">Hero Section</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { loc: "ar", label: "العربية", hero: heroAr },
            { loc: "en", label: "English", hero: heroEn },
          ].map(({ loc, label, hero }) => (
            <form key={loc} action={async (fd) => {
              "use server";
              await updateHeroAction(loc, {
                headline: String(fd.get("headline") ?? ""),
                subheadline: String(fd.get("subheadline") ?? ""),
                body: String(fd.get("body") ?? ""),
                ctaText: String(fd.get("ctaText") ?? ""),
                ctaDestination: String(fd.get("ctaDestination") ?? "/"),
              });
            }} className="space-y-3">
              <h3 className="text-xs font-bold text-white/60">{label}</h3>
              <input name="headline" defaultValue={hero?.headline ?? ""} placeholder="Headline" className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
              <input name="subheadline" defaultValue={hero?.subheadline ?? ""} placeholder="Subheadline" className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
              <textarea name="body" defaultValue={hero?.body ?? ""} placeholder="Body" rows={2} className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
              <div className="grid grid-cols-2 gap-2">
                <input name="ctaText" defaultValue={hero?.ctaText ?? ""} placeholder="CTA text" className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
                <input name="ctaDestination" defaultValue={hero?.ctaDestination ?? "/"} placeholder="CTA dest" className="rounded-lg border border-white/10 bg-[#14171D] px-3 py-2 text-sm text-white outline-none focus:border-[#14B8A6]/60" />
              </div>
              <button className="rounded-lg bg-[#14B8A6] px-4 py-2 text-xs font-bold text-[#060709]">حفظ {label}</button>
            </form>
          ))}
        </div>
      </section>

      {/* Reels */}
      <section className="rounded-xl border border-white/7 bg-[#0E1014] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold">Viral Reels</h2>
          <Link href="/admin/content/reels/new" className="rounded-lg bg-[#14B8A6] px-3 py-1.5 text-xs font-bold text-[#060709]">+ Reel جديد</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#14171D] text-xs text-white/50">
              <tr>
                <th className="px-4 py-3 text-start">العنوان</th>
                <th className="px-4 py-3 text-start">المنتج</th>
                <th className="px-4 py-3 text-start">الترتيب</th>
                <th className="px-4 py-3 text-start">الحالة</th>
                <th className="px-4 py-3 text-start">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reels.map((r) => (
                <tr key={r.id} className="border-t border-white/7">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{r.titleAr}</div>
                    <div className="text-[11px] text-white/40">{r.titleEn}</div>
                  </td>
                  <td className="px-4 py-3 text-white/60">{productById.get(r.productId ?? "")?.titleAr ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums">{r.sortOrder}</td>
                  <td className="px-4 py-3">
                    <form action={async () => { "use server"; await toggleReelAction(r.id, !r.isActive); }}>
                      <button className={r.isActive ? "text-[#14B8A6]" : "text-white/30"}>{r.isActive ? "منشور" : "مخفي"}</button>
                    </form>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link href={`/admin/content/reels/${r.id}`} className="text-[#14B8A6] hover:underline">تعديل</Link>
                    <form action={async () => { "use server"; await deleteReelAction(r.id); }}>
                      <button className="text-red-300 hover:underline">حذف</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
