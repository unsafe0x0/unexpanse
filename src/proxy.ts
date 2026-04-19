import { authMiddleware } from "@/lib/auth-edge";
import { NextResponse } from "next/server";

export const proxy = authMiddleware((request) => {
  const { nextUrl } = request;
  const isLoggedIn = !!request.auth;

  const isAuthPage =
    nextUrl.pathname.startsWith("/auth/login") ||
    nextUrl.pathname.startsWith("/auth/register");

  const isPublicPage = nextUrl.pathname === "/";

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicPage) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
