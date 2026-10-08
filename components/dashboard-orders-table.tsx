"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ExportCsvButton } from "@/components/export-csv-button";

export type DashboardOrder = {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  items: unknown;
  total_amount: number | string | null;
  status: string | null;
  created_at: string | null;
};

function itemsLabel(items: unknown) {
  if (Array.isArray(items)) {
    return items.map((item) => {
      if (typeof item === "string") return item;
      if (typeof item === "object" && item !== null) {
        const value = item as { name?: unknown; qty?: unknown; quantity?: unknown };
        const name = typeof value.name === "string" ? value.name : "Item";
        const quantity = value.qty ?? value.quantity;
        return `${name}${typeof quantity === "number" ? ` × ${quantity}` : ""}`;
      }
      return "Item";
    }).join(", ");
  }
  return typeof items === "string" ? items : "—";
}

function statusClass(status: string) {
  const value = status.toLowerCase();
  if (value === "completed" || value === "delivered" || value === "shipped") return "bg-emerald-50 text-emerald-700";
  if (value === "cancelled" || value === "canceled" || value === "rejected") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

function statusGroup(status: string | null) {
  const value = (status ?? "pending").toLowerCase();
  if (value === "completed" || value === "delivered" || value === "shipped") return "completed";
  if (value === "cancelled" || value === "canceled" || value === "rejected") return "cancelled";
  return "pending";
}

export function DashboardOrdersTable({ orders }: { orders: DashboardOrder[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filteredOrders = useMemo(() => orders.filter((order) => {
    const searchable = `${order.id} ${order.customer_name ?? ""} ${order.customer_phone ?? ""}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (status === "all" || statusGroup(order.status) === status);
  }), [orders, query, status]);
  const exportRows = filteredOrders.map((order) => [
    order.id,
    order.customer_name ?? "Customer",
    itemsLabel(order.items),
    statusGroup(order.status),
    String(order.total_amount ?? 0),
    order.created_at ? new Date(order.created_at).toLocaleString() : "",
  ]);
  const columns = ["Order ID", "Customer", "Items", "Status", "Total", "Created"];

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">All orders</h3>
          <p className="mt-1 text-xs text-slate-500">{filteredOrders.length} of {orders.length} orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3">
            <Search size={14} className="text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search orders..." aria-label="Search orders" className="w-36 bg-transparent text-xs outline-none placeholder:text-slate-400" />
          </label>
          <select aria-label="Filter by order status" value={status} onChange={(event) => setStatus(event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <ExportCsvButton columns={columns} rows={exportRows} fileName="orders.csv" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            <tr>{columns.map((column) => <th key={column} className="px-5 py-3">{column}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order) => {
              const orderStatus = statusGroup(order.status);
              return (
                <tr key={order.id} className="text-xs text-slate-600 hover:bg-slate-50/70">
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-800">#{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4"><span className="block font-medium text-slate-700">{order.customer_name || "Customer"}</span><span className="mt-1 block text-[11px] text-slate-400">{order.customer_phone || "No phone"}</span></td>
                  <td className="max-w-[260px] truncate px-5 py-4" title={itemsLabel(order.items)}>{itemsLabel(order.items)}</td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-medium capitalize ${statusClass(orderStatus)}`}>{orderStatus}</span></td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">{Number(order.total_amount ?? 0).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-5 py-4">{order.created_at ? new Date(order.created_at).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
            {filteredOrders.length === 0 && <tr><td colSpan={columns.length} className="px-5 py-12 text-center text-sm text-slate-500">No orders match these filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
