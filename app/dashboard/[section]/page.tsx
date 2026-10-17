import { notFound } from "next/navigation";
import { AlertCircle, ArrowUpRight, Search } from "lucide-react";
import Link from "next/link";
import { AddStoreButton } from "@/components/add-store-button";
import { DashboardRecordActions, type DashboardEditField } from "@/components/dashboard-record-actions";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ProductCsvImport } from "@/components/product-csv-import";
import { DashboardTableScroll } from "@/components/dashboard-table-scroll";
import { createAdminClient } from "@/lib/supabase/admin";

type SectionRow = {
  id: string;
  cells: string[];
  values: Array<{ label: string; value: string }>;
  resource?: "stores" | "products";
  fields?: DashboardEditField[];
  viewHref?: string;
};

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Live: "bg-emerald-50 text-emerald-700",
  pro: "bg-emerald-50 text-emerald-700",
  free: "bg-slate-100 text-slate-600",
  verified: "bg-emerald-50 text-emerald-700",
  Shipped: "bg-blue-50 text-blue-700",
  Delivered: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  pending: "bg-amber-50 text-amber-700",
  Review: "bg-amber-50 text-amber-700",
  Processing: "bg-slate-100 text-slate-600",
  Trial: "bg-violet-50 text-violet-700",
};

export default async function SectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { section } = await params;
  const { q = "" } = await searchParams;
  let title: string;
  let description: string;
  let columns: string[];
  let rows: SectionRow[] = [];
  let totalCount = 0;
  let dataError: string | null = null;
  let storeOptions: Array<{ id: string; name: string }> = [];

  const supabase = createAdminClient();
  if (!supabase) {
    dataError = "Connect Supabase by setting NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to load platform records.";
  }

  if (section === "stores") {
    title = "Stores";
    description = "Review storefronts and their platform status.";
    columns = ["Store Name", "Slug", "Owner Email", "Plan", "Payment Status", "Created", "Actions"];
    if (supabase) {
      let query = supabase.from("stores").select("id, name, slug, owner_email, plan, payment_status, whatsapp_number, created_at", { count: "exact" }).order("created_at", { ascending: false });
      if (q) query = query.ilike("name", `%${q}%`);
      const result = await query;
      if (result.error) dataError = `Unable to load stores: ${result.error.message}`;
      totalCount = result.count ?? 0;
      rows = (result.data ?? []).map((store) => {
        const name = String(store.name ?? "");
        const slug = String(store.slug ?? "");
        const ownerEmail = String(store.owner_email ?? "");
        const plan = String(store.plan ?? "free");
        const paymentStatus = String(store.payment_status ?? "pending");
        const whatsappNumber = String(store.whatsapp_number ?? "");
        return {
          id: String(store.id),
          cells: [name || "N/A", slug || "N/A", ownerEmail || "N/A", plan, paymentStatus, store.created_at ? new Date(store.created_at).toLocaleDateString() : "—"],
          values: [{ label: "Store name", value: name }, { label: "Slug", value: slug }, { label: "Owner email", value: ownerEmail }, { label: "Plan", value: plan }, { label: "Payment status", value: paymentStatus }, { label: "WhatsApp number", value: whatsappNumber }],
          resource: "stores",
          fields: [
            { key: "name", label: "Store name" },
            { key: "slug", label: "Slug" },
            { key: "owner_email", label: "Owner email", type: "email" },
            { key: "plan", label: "Plan" },
            { key: "payment_status", label: "Payment status" },
            { key: "whatsapp_number", label: "WhatsApp number" },
          ],
          viewHref: slug ? `/store/${encodeURIComponent(slug)}` : undefined,
        };
      });
    }
  } else if (section === "sellers") {
    title = "Sellers";
    description = "Manage seller accounts and store owners.";
    columns = ["Owner Name / Email", "Store Name", "Slug", "Plan", "Status", "Joined", "Actions"];
    if (supabase) {
      let query = supabase.from("stores").select("id, owner_email, name, slug, plan, payment_status, created_at", { count: "exact" }).order("created_at", { ascending: false });
      if (q) query = query.ilike("owner_email", `%${q}%`);
      const result = await query;
      if (result.error) dataError = `Unable to load sellers: ${result.error.message}`;
      totalCount = result.count ?? 0;
      rows = (result.data ?? []).map((store) => {
        const ownerEmail = String(store.owner_email ?? "");
        const name = String(store.name ?? "");
        const slug = String(store.slug ?? "");
        const plan = String(store.plan ?? "free");
        const paymentStatus = String(store.payment_status ?? "active");
        return {
          id: String(store.id),
          cells: [ownerEmail || "Owner", name || "N/A", slug || "N/A", plan, paymentStatus, store.created_at ? new Date(store.created_at).toLocaleDateString() : "—"],
          values: [{ label: "Owner email", value: ownerEmail }, { label: "Store name", value: name }, { label: "Slug", value: slug }, { label: "Plan", value: plan }, { label: "Payment status", value: paymentStatus }],
          resource: "stores",
          fields: [
            { key: "owner_email", label: "Owner email", type: "email" },
            { key: "name", label: "Store name" },
          ],
          viewHref: slug ? `/store/${encodeURIComponent(slug)}` : undefined,
        };
      });
    }
  } else if (section === "products") {
    title = "Products";
    description = "Monitor catalog listings across store products.";
    columns = ["Product Name", "SKU", "Price", "Stock", "Category ID", "Created At", "Actions"];
    if (supabase) {
      const storesResult = await supabase.from("stores").select("id, name").order("name", { ascending: true }).limit(1000);
      if (storesResult.error) dataError = `Unable to load stores for product import: ${storesResult.error.message}`;
      storeOptions = (storesResult.data ?? []).map((store) => ({ id: String(store.id), name: String(store.name ?? "Untitled store") }));

      let query = supabase.from("store_products").select("id, name, price, category_id, description, sku, stock, created_at", { count: "exact" }).order("created_at", { ascending: false });
      if (q) query = query.ilike("name", `%${q}%`);
      const result = await query;
      if (result.error) {
        const missingImportColumns = ["sku", "stock"].some((column) => result.error.message.includes(column));
        dataError = missingImportColumns
          ? "Apply supabase/migrations/12_product_csv_import.sql to enable product SKU and stock fields."
          : `Unable to load products: ${result.error.message}`;
      }
      totalCount = result.count ?? 0;
      rows = (result.data ?? []).map((product) => {
        const name = String(product.name ?? "");
        const price = String(product.price ?? 0);
        const categoryId = typeof product.category_id === "string" ? product.category_id : "";
        const descriptionText = typeof product.description === "string" ? product.description : "";
        const sku = typeof product.sku === "string" ? product.sku : "";
        const stock = product.stock === null || product.stock === undefined ? "" : String(product.stock);
        return {
          id: String(product.id),
          cells: [name || "N/A", sku || "—", `PKR ${price}`, stock || "—", categoryId ? `${categoryId.slice(0, 8)}...` : "General", product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"],
          values: [{ label: "Product name", value: name }, { label: "SKU", value: sku }, { label: "Price", value: price }, { label: "Stock", value: stock }, { label: "Category ID", value: categoryId }, { label: "Description", value: descriptionText }],
          resource: "products",
          fields: [
            { key: "name", label: "Product name" },
            { key: "sku", label: "SKU" },
            { key: "price", label: "Price", type: "number" },
            { key: "stock", label: "Stock", type: "number" },
            { key: "category_id", label: "Category ID" },
            { key: "description", label: "Description" },
          ],
        };
      });
    }
  } else if (section === "subscriptions") {
    title = "Subscriptions";
    description = "Manage plan adoption and manual payment proofs.";
    columns = ["Payment ID", "Store ID", "Method", "Transaction ID", "Amount", "Status", "Date"];
    if (supabase) {
      const result = await supabase.from("store_payments").select("*", { count: "exact" }).order("created_at", { ascending: false });
      if (result.error) dataError = `Unable to load subscriptions: ${result.error.message}`;
      totalCount = result.count ?? 0;
      rows = (result.data ?? []).map((payment) => ({
        id: String(payment.id),
        cells: [
          typeof payment.id === "string" ? `${payment.id.slice(0, 8)}...` : "N/A",
          typeof payment.store_id === "string" ? `${payment.store_id.slice(0, 8)}...` : "N/A",
          String(payment.payment_method ?? "Easypaisa"),
          String(payment.transaction_id ?? "N/A"),
          `PKR ${payment.amount ?? 0}`,
          String(payment.status ?? "pending"),
          payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—",
        ],
        values: [],
      }));
    }
  } else {
    notFound();
  }

  const addAction = section === "stores" || section === "sellers"
    ? <AddStoreButton label={section === "sellers" ? "Add seller" : "Add store"} />
    : section === "products"
      ? <Link href="/dashboard/stores" prefetch className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"><ArrowUpRight size={14} />Browse stores</Link>
      : null;
  const importAction = section === "products" ? <ProductCsvImport stores={storeOptions} /> : null;
  const exportColumns = columns.filter((column) => column !== "Actions");
  const exportRows = rows.map((row) => row.cells);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-blue-700">Platform management</p>
          <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex gap-2">
          <ExportCsvButton columns={exportColumns} rows={exportRows} fileName={`${section}.csv`} />
          {importAction}
          {addAction}
        </div>
      </div>
      {dataError && <p role="alert" className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"><AlertCircle size={17} className="mt-0.5 shrink-0" />{dataError}</p>}
      <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">All {title.toLowerCase()}</h3>
            <p className="mt-1 text-[11px] text-slate-500">{rows.length} records {q ? `matching “${q}”` : "from database"}</p>
          </div>
          <form className="flex h-9 w-full max-w-[250px] items-center gap-2 rounded-md border border-slate-200 px-3" action={`/dashboard/${section}`}>
            <Search size={15} className="text-slate-400" />
            <input name="q" defaultValue={q} placeholder={`Search ${title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" />
          </form>
        </div>
        <DashboardTableScroll>
          <table className="w-full min-w-[850px] text-left">
            <thead><tr className="bg-slate-50 text-[10px] font-medium uppercase tracking-wide text-slate-500">{columns.map((column) => <th key={column} className="px-5 py-3">{column}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="text-xs text-slate-600 hover:bg-slate-50/70">
                  {row.cells.map((cell, index) => (
                    <td key={index} className="whitespace-nowrap px-5 py-4">
                      {statusStyles[cell] ? <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[cell]}`}><span className="size-1.5 rounded-full bg-current opacity-60" />{cell}</span> : <span className={index === 0 ? "font-medium text-slate-800" : ""}>{cell}</span>}
                    </td>
                  ))}
                  {row.resource && row.fields && <td className="whitespace-nowrap px-5 py-3"><DashboardRecordActions resource={row.resource} recordId={row.id} values={row.values} fields={row.fields} viewHref={row.viewHref} /></td>}
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-slate-500">No records found.</p>}
        </DashboardTableScroll>
        <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500">Total records: {totalCount}</div>
      </section>
    </div>
  );
}
