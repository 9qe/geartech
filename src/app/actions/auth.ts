"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession, destroySession, hashPassword } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const parsed = loginSchema.safeParse({ email, password });
  if (!parsed.success) return { ok: false as const, error: "INVALID_INPUT" };

  // simple rate limit via DB? Use in-memory best-effort (dev). Production: use Redis/DB-backed limiter.
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin || !admin.isActive) return { ok: false as const, error: "INVALID_CREDENTIALS" };

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return { ok: false as const, error: "INVALID_CREDENTIALS" };

  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

  await createSession({ adminId: admin.id, role: admin.role, email: admin.email });

  const next = String(formData.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// Bootstrap helper exposed for the CLI-less first-run (dev only): creates first admin if none exist
export async function bootstrapFirstAdminAction(email: string, password: string) {
  const count = await prisma.adminUser.count();
  if (count > 0) return { ok: false as const, error: "ALREADY_BOOTSTRAPPED" };
  if (!email || password.length < 8) return { ok: false as const, error: "INVALID_INPUT" };
  const hash = await hashPassword(password);
  const admin = await prisma.adminUser.create({ data: { email, passwordHash: hash, role: "SUPER_ADMIN", isActive: true } });
  await createSession({ adminId: admin.id, role: admin.role, email: admin.email });
  return { ok: true as const };
}
