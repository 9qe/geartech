"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAction, bootstrapFirstAdminAction } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("email", email);
      fd.set("password", password);
      fd.set("next", next);
      const res = await loginAction(fd);
      if (res && !res.ok) {
        setError(res.error === "INVALID_CREDENTIALS" ? "بيانات الدخول غير صحيحة" : "خطأ في الإدخال");
      }
    });
  };

  const doBootstrap = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await bootstrapFirstAdminAction(email, password);
      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(res.error === "ALREADY_BOOTSTRAPPED" ? "يوجد مدير بالفعل — سجّل الدخول" : "البريد أو كلمة المرور غير صالحة (8 أحرف على الأقل)");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060709] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/7 bg-[#0E1014] p-8">
        <div className="mb-6 text-center">
          <div className="text-2xl font-extrabold tracking-tight">
            Gear<span className="text-[#14B8A6]">Tech</span>
          </div>
          <div className="mt-1 text-xs text-white/40">Admin Portal</div>
        </div>

        <form onSubmit={bootstrap ? doBootstrap : submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-white/60">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-white/60">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-white/10 bg-[#14171D] px-3 py-2.5 text-sm text-white outline-none focus:border-[#14B8A6]/60"
            />
          </div>

          {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-[#14B8A6] px-4 py-2.5 text-sm font-bold text-[#060709] transition hover:brightness-110 disabled:opacity-50"
          >
            {pending ? "..." : bootstrap ? "إنشاء أول مدير" : "تسجيل الدخول"}
          </button>
        </form>

        <button
          onClick={() => setBootstrap((b) => !b)}
          className="mt-4 w-full text-center text-xs text-white/40 transition hover:text-white/70"
        >
          {bootstrap ? "لديك حساب؟ تسجيل الدخول" : "أول مرة؟ إنشاء أول مدير (Bootstrap)"}
        </button>

        <p className="mt-6 text-center text-[10px] text-white/30">
          Bootstrap only works when no admin exists. Use CLI: npm run admin:bootstrap
        </p>
      </div>
    </div>
  );
}
