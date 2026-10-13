import type { Metadata } from "next";
import { AlertCircle, ShoppingBag } from "lucide-react";
import { DashboardOrdersTable, type DashboardOrder } from "@/components/dashboard-orders-table";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Orders | Buildexom AI" };

export default async function OrdersPage() {
  const supabase = createAdminClient();
  let orders: DashboardOrder[] = [];
  let dataError: string | null = null;

  if (!supabase) {
    dataError = "Connect Supabase by setting NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to load platform orders.";
  } else {
    const result = await supabase
      .from("orders")
      .select("id, store_id, customer_name, customer_phone, shipping_address, city, items, total_amount, status, created_at")
      .order("created_at", { ascending: false });
    if (result.error) {
      dataError = `Unable to load orders: ${result.error.message}`;
    } else {
      orders = (result.data ?? []).map((order) => ({
        id: String(order.id),
        store_id: typeof order.store_id === "string" ? order.store_id : null,
        customer_name: typeof order.customer_name === "string" ? order.customer_name : null,
        customer_phone: typeof order.customer_phone === "string" ? order.customer_phone : null,
        shipping_address: typeof order.shipping_address === "string" ? order.shipping_address : null,
        city: typeof order.city === "string" ? order.city : null,
        items: order.items,
        total_amount: typeof order.total_amount === "number" || typeof order.total_amount === "string" ? order.total_amount : null,
        status: typeof order.status === "string" ? order.status : null,
        created_at: typeof order.created_at === "string" ? order.created_at : null,
      }));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-blue-700">Platform management</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">Orders</h2>
        <p className="mt-1 text-sm text-slate-500">Review and search orders placed across your storefronts.</p>
      </div>
      {dataError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" />{dataError}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700"><ShoppingBag size={19} /></span>
          <div><p className="text-xs font-medium text-slate-500">Orders shown</p><p className="mt-1 text-2xl font-semibold text-slate-900">{orders.length}</p></div>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">Pending orders</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{orders.filter((order) => (order.status ?? "pending").toLowerCase() === "pending").length}</p>
        </article>
      </div>
      <DashboardOrdersTable orders={orders} />
    </div>
  );
}
