import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/management/:path*"],
};

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const userRole = token.role;

  if (userRole === "super-admin") {
    return NextResponse.next();
  }

  if (userRole === "team-member") {
    if (
      req.nextUrl.pathname.startsWith("/management/organizations") ||
      req.nextUrl.pathname.startsWith("/management/case-configurations") ||
      req.nextUrl.pathname.startsWith("/management/admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/401", req.url));
    }
    return NextResponse.next();
  }

  if (userRole === "admin") {
    if (
      req.nextUrl.pathname.startsWith("/management/organizations") ||
      req.nextUrl.pathname.startsWith("/management/case-configurations") ||
      req.nextUrl.pathname.startsWith("/management/admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/401", req.url));
    }
    return NextResponse.next();
  }

  if (userRole === "accountant") {
    if (
      req.nextUrl.pathname.startsWith("/management/organizations") ||
      req.nextUrl.pathname.startsWith("/management/case-configurations") ||
      req.nextUrl.pathname.startsWith("/management/admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/401", req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/403", req.url));
}
