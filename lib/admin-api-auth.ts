import "server-only";
import { cookies } from "next/headers";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export async function isAdminRequest() {
  const cookieStore = await cookies();
  if (verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) return true;
  if (process.env.NODE_ENV === "development" && cookieStore.get("buildexom_mock_session")?.value === "local-admin") return true;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return false;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === "super_admin";
}

export async function getAdminRequestActor() {
  const cookieStore = await cookies();
  const session = verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (session) return session.email;
  if (process.env.NODE_ENV === "development" && cookieStore.get("buildexom_mock_session")?.value === "local-admin") {
    return "Local development admin";
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Unable to identify the authenticated administrator.");
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || user?.app_metadata?.role !== "super_admin") {
    throw new Error("Unable to identify the authenticated administrator.");
  }
  return user.email || user.id;
}
