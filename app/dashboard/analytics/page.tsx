import type { Metadata } from "next";
import { Activity, AlertCircle, CreditCard, Package, ShoppingBag, Store } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Analytics" };

type RevenueOrder = { total_amount: number | string | null; created_at: string | null; status: string | null };

function formatMoney(value: number) {
  return `PKR ${Math.round(value).toLocaleString()}`;
}

export default async function AnalyticsPage() {
  const supabase = createAdminClient();
  let storeCount = 0;
  let productCount = 0;
  let orderCount = 0;
  let revenue = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let dataError: string | null = null;
  let orders: RevenueOrder[] = [];

  if (!supabase) {
    dataError = "Connect Supabase by setting NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to load live platform analytics.";
  } else {
    const [storesResult, productsResult, ordersResult] = await Promise.all([
      supabase.from("stores").select("id", { count: "exact", head: true }),
      supabase.from("store_products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_amount, created_at, status").order("created_at", { ascending: false }),
    ]);
    const errors = [storesResult.error, productsResult.error, ordersResult.error].filter((error) => error !== null);
    if (errors.length) dataError = `Unable to load complete analytics: ${errors.map((error) => error.message).join("; ")}`;
    storeCount = storesResult.count ?? 0;
    productCount = productsResult.count ?? 0;
    orders = (ordersResult.data ?? []).map((order) => ({
      total_amount: typeof order.total_amount === "number" || typeof order.total_amount === "string" ? order.total_amount : null,
      created_at: typeof order.created_at === "string" ? order.created_at : null,
      status: typeof order.status === "string" ? order.status : null,
    }));
    orderCount = orders.length;
    for (const order of orders) {
      revenue += Number(order.total_amount ?? 0) || 0;
      const status = (order.status ?? "pending").toLowerCase();
      if (status === "completed" || status === "delivered" || status === "shipped") completedCount += 1;
      if (status === "pending") pendingCount += 1;
    }
  }

  const chartDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toLocaleDateString("en-CA");
    const amount = orders.reduce((sum, order) => {
      if (!order.created_at || new Date(order.created_at).toLocaleDateString("en-CA") !== key) return sum;
      return sum + (Number(order.total_amount ?? 0) || 0);
    }, 0);
    return { key, label: date.toLocaleDateString("en", { weekday: "short" }), amount };
  });
  const maxRevenue = Math.max(...chartDays.map((day) => day.amount), 1);
  const metrics = [
    { label: "Gross revenue", value: formatMoney(revenue), hint: "Across recorded orders", icon: CreditCard, accent: "bg-indigo-50 text-indigo-700" },
    { label: "Orders", value: orderCount.toLocaleString(), hint: `${pendingCount} awaiting fulfillment`, icon: ShoppingBag, accent: "bg-blue-50 text-blue-700" },
    { label: "Stores", value: storeCount.toLocaleString(), hint: "Registered storefronts", icon: Store, accent: "bg-sky-50 text-sky-700" },
    { label: "Products", value: productCount.toLocaleString(), hint: `${completedCount} orders completed`, icon: Package, accent: "bg-violet-50 text-violet-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Platform performance</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Analytics</h2>
        <p className="mt-1 text-sm text-slate-500">Live commerce and operational performance across the platform.</p>
      </div>
      {dataError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" />{dataError}</p>}
      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Platform metrics">
        {metrics.map(({ label, value, hint, icon: Icon, accent }) => (
          <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`grid size-9 place-items-center rounded-lg ${accent}`}><Icon size={17} /></span></div>
            <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-[11px] text-slate-500">{hint}</p>
          </article>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.7fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div><h3 className="text-sm font-semibold text-slate-800">Revenue trend</h3><p className="mt-1 text-xs text-slate-500">Daily order revenue for the last 7 days</p></div>
            <Activity size={18} className="text-blue-600" />
          </div>
          <div className="mt-8 flex h-48 items-end gap-3 border-b border-slate-100 px-1">
            {chartDays.map((day) => (
              <div key={day.key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                <span className="truncate text-[10px] text-slate-400">{day.amount ? formatMoney(day.amount) : ""}</span>
                <div className="w-full max-w-12 rounded-t-md bg-blue-500 transition-[height] hover:bg-blue-600" style={{ height: `${Math.max((day.amount / maxRevenue) * 72, 4)}%` }} title={`${day.label}: ${formatMoney(day.amount)}`} />
                <span className="pb-2 text-[10px] text-slate-500">{day.label}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-sm font-semibold text-slate-800">Platform health</h3>
          <p className="mt-1 text-xs text-slate-500">Current operational summary</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-slate-500">Completed orders</span><span className="text-sm font-semibold text-slate-800">{completedCount}</span></div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3"><span className="text-xs text-slate-500">Pending orders</span><span className="text-sm font-semibold text-amber-700">{pendingCount}</span></div>
            <div className="flex items-center justify-between"><span className="text-xs text-slate-500">Data source</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${dataError ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{dataError ? "Needs attention" : "Connected"}</span></div>
          </div>
          {dataError && <p className="mt-4 text-xs leading-5 text-slate-500"><AlertCircle size={14} className="mr-1 inline text-amber-600" />Some statistics may be incomplete.</p>}
        </section>
      </div>
    </div>
  );
}
