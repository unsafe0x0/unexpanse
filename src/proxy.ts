import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const { nextUrl } = request;

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;

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
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
