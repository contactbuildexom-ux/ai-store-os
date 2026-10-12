import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const hasAdminSession = Boolean(request.cookies.get("ai_store_admin_session")?.value);
  if (!user && !hasAdminSession && request.nextUrl.pathname.startsWith("/dashboard")) {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    return NextResponse.redirect(target);
  }
  if (user?.app_metadata?.role === "super_admin" && request.nextUrl.pathname === "/login") {
    const target = request.nextUrl.clone();
    target.pathname = "/dashboard";
    return NextResponse.redirect(target);
  }
  return response;
}

export const config = { matcher: ["/login", "/dashboard/:path*"] };