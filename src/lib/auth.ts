import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { Role } from "@prisma/client";

const COOKIE = "geartech_session";
const TTL_SECONDS = 60 * 60 * 24 * 7;

const secret = () => {
  const s = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET is required in production");
    }
    return new TextEncoder().encode("dev-only-insecure-session-secret-change-me");
  }
  return new TextEncoder().encode(s);
};

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  adminId: string;
  role: string;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.adminId !== "string") return null;
    // Re-check the admin still exists and is active.
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.adminId },
      select: { id: true, role: true, email: true, isActive: true },
    });
    if (!admin || !admin.isActive) return null;
    return { adminId: admin.id, role: admin.role, email: admin.email };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function requireAdmin(allowedRoles?: string[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHENTICATED");
  if (allowedRoles && !allowedRoles.includes(session.role)) throw new Error("FORBIDDEN");
  return session;
}

// Bootstrap helper used by CLI script
export async function bootstrapAdmin(email: string, password: string, role = "SUPER_ADMIN") {
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { created: false, id: existing.id };
  }
  const hash = await hashPassword(password);
  const admin = await prisma.adminUser.create({
    data: { email, passwordHash: hash, role: role as Role, isActive: true },
  });
  return { created: true, id: admin.id };
}
