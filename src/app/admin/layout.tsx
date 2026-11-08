import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "لوحة التحكم", en: "Overview" },
  { href: "/admin/products", label: "المنتجات", en: "Products" },
  { href: "/admin/orders", label: "الطلبات", en: "Orders" },
  { href: "/admin/settings", label: "الإعدادات", en: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#060709] text-[#F8FAFC]">
      <div className="flex min-h-screen">
        <aside className="hidden w-60 shrink-0 border-e border-white/7 bg-[#0E1014] md:block">
          <div className="px-5 py-6">
            <div className="text-lg font-extrabold tracking-tight">
              Gear<span className="text-[#14B8A6]">Tech</span>
            </div>
            <div className="mt-1 text-[11px] text-white/40">Admin Portal</div>
          </div>
          <nav className="px-3 space-y-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <span>{n.label}</span>
                <span className="text-[10px] text-white/30">{n.en}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-6 px-5">
            <div className="text-[11px] text-white/40">{session.email}</div>
            <div className="text-[10px] text-white/30">{session.role}</div>
          </div>
          <form action={logoutAction} className="mt-4 px-3">
            <button className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white">
              تسجيل الخروج / Logout
            </button>
          </form>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
