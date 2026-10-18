import { NextResponse, type NextRequest } from "next/server";
import { getSubdomainFromHost } from "@/lib/store-url";

// shoe-store.e4emerald.com/            -> /store/shoe-store
// shoe-store.e4emerald.com/some/page   -> /store/shoe-store/some/page
// The browser keeps showing the subdomain URL (rewrite, not redirect).
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const slug = getSubdomainFromHost(host);
  if (!slug) return NextResponse.next();

  const { pathname } = request.nextUrl;
  // Links that already point at /store/... keep working on the subdomain.
  if (pathname.startsWith("/store/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/store/${slug}` : `/store/${slug}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip API routes, Next.js internals and any file with an extension (images, fonts, etc.)
  matcher: ["/((?!api/|_next/|favicon.ico|.*\\..*).*)"],
};