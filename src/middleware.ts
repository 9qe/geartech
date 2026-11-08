import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "geartech_session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  // Full JWT verification happens server-side in the admin layout/pages (Node runtime).
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
