import Link from "next/link";
import { AlertCircle, ArrowRight, ArrowUpRight, Bot, CreditCard, Package, ShoppingBag, Store } from "lucide-react";
import { AddStoreButton } from "@/components/add-store-button";
import { createAdminClient } from "@/lib/supabase/admin";

type StoreSummary = {
  id: string;
  name: string | null;
  slug: string | null;
  plan: string | null;
  payment_status: string | null;
};

function Status({ value }: { value: string }) {
  const active = ["active", "live", "pro", "verified"].includes(value.toLowerCase());
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}><span className="size-1.5 rounded-full bg-current opacity-60" />{value}</span>;
}

export default async function DashboardPage() {
  const supabase = createAdminClient();
  let stores: StoreSummary[] = [];
  let totalStores = 0;
  let totalProducts = 0;
  let totalOrders = 0;
  let dataError: string | null = null;

  if (!supabase) {
    dataError = "Connect Supabase by setting NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to load live dashboard data.";
  } else {
    const [storesResult, productsResult, ordersResult] = await Promise.all([
      supabase.from("stores").select("id, name, slug, plan, payment_status", { count: "exact" }).order("created_at", { ascending: false }).limit(5),
      supabase.from("store_products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);
    const errors = [storesResult.error, productsResult.error, ordersResult.error].filter((error) => error !== null);
    if (errors.length) dataError = `Unable to load complete dashboard data: ${errors.map((error) => error.message).join("; ")}`;
    stores = (storesResult.data ?? []).map((store) => ({
      id: String(store.id),
      name: typeof store.name === "string" ? store.name : null,
      slug: typeof store.slug === "string" ? store.slug : null,
      plan: typeof store.plan === "string" ? store.plan : null,
      payment_status: typeof store.payment_status === "string" ? store.payment_status : null,
    }));
    totalStores = storesResult.count ?? 0;
    totalProducts = productsResult.count ?? 0;
    totalOrders = ordersResult.count ?? 0;
  }

  const metrics = [
    { label: "Total stores", value: totalStores, note: "Registered storefronts", icon: Store, accent: "bg-blue-50 text-blue-700" },
    { label: "Products", value: totalProducts, note: "Platform catalog", icon: Package, accent: "bg-indigo-50 text-indigo-700" },
    { label: "Orders", value: totalOrders, note: "All-time orders", icon: ShoppingBag, accent: "bg-sky-50 text-sky-700" },
  ];
  const actions = [
    { label: "Manage orders", href: "/dashboard/orders", icon: ShoppingBag },
    { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
    { label: "Platform analytics", href: "/dashboard/analytics", icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6">
      <div className="rise-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-blue-700">Platform overview</p>
          <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Good morning, Admin</h2>
          <p className="mt-1 text-sm text-slate-500">Live activity across your commerce platform.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/analytics" className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50">Platform report <ArrowRight size={14} /></Link>
          <AddStoreButton />
        </div>
      </div>
      {dataError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" />{dataError}</p>}
      <section className="rise-in grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3" aria-label="Platform metrics">
        {metrics.map(({ label, value, note, icon: Icon, accent }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`grid size-9 place-items-center rounded-lg ${accent}`}><Icon size={17} /></span></div>
            <p className="mt-4 text-[26px] font-semibold leading-none tracking-tight text-slate-900">{value.toLocaleString()}</p>
            <p className="mt-2 text-[11px] text-slate-500">{note}</p>
          </article>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><h3 className="text-sm font-semibold text-slate-800">Registered stores</h3><p className="mt-1 text-[11px] text-slate-500">Latest stores created on your platform</p></div>
            <Link href="/dashboard/stores" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[510px] text-left">
              <thead><tr className="bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500"><th className="px-5 py-3">Store name</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Payment status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {stores.map((store) => (
                  <tr key={store.id} className="text-xs text-slate-600 hover:bg-slate-50/70">
                    <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><span className="grid size-8 place-items-center rounded-md bg-blue-50 font-semibold text-blue-700">{store.name?.[0] ?? "S"}</span><span className="font-medium text-slate-800">{store.name ?? "Unnamed store"}</span></div></td>
                    <td className="px-4 py-3.5">{store.slug ?? "—"}</td><td className="px-4 py-3.5 font-semibold uppercase text-blue-700">{store.plan ?? "free"}</td><td className="px-4 py-3.5"><Status value={store.payment_status ?? "pending"} /></td>
                  </tr>
                ))}
                {stores.length === 0 && <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-500">No stores found.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <aside className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div><h3 className="text-sm font-semibold text-slate-800">Quick actions</h3><p className="mt-1 text-[11px] text-slate-500">Common admin destinations</p></div>
            <div className="mt-4 divide-y divide-slate-100">
              {actions.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className="group flex items-center gap-3 py-3 text-xs text-slate-600 transition hover:text-blue-700"><span className="grid size-8 place-items-center rounded-md bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-700"><Icon size={15} /></span><span className="flex-1">{label}</span><ArrowRight size={14} className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" /></Link>)}
            </div>
          </section>
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-blue-800"><Bot size={15} />Buildexom AI insight</div>
            <p className="mt-2 text-xs leading-5 text-blue-700">Review platform analytics for a detailed view of storefront and order activity.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
