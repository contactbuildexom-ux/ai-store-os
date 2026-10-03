import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { DashboardShell } from "@/components/dashboard-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const mockSession = (await cookies()).get("buildexom_mock_session")?.value;
    if (process.env.NODE_ENV === "development" && mockSession === "local-admin") {
      return <DashboardShell email="admin@buildexom.com">{children}</DashboardShell>;
    }
    redirect("/login?setup=required");
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "super_admin") redirect("/login?access=denied");
  return <DashboardShell email={user.email ?? "Admin user"}>{children}</DashboardShell>;
}