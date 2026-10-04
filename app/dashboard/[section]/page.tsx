import { notFound } from "next/navigation";
import { ArrowUpRight, Download, Plus, Search } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const statusStyles: Record<string, string> = { 
  Active: "bg-[#e9f5ed] text-[#286b49]", 
  Live: "bg-[#e9f5ed] text-[#286b49]", 
  pro: "bg-[#e9f5ed] text-[#286b49]",
  free: "bg-[#edf0f5] text-[#596b88]",
  verified: "bg-[#e9f5ed] text-[#286b49]",
  Shipped: "bg-[#e9eff7] text-[#426488]", 
  Delivered: "bg-[#e9f5ed] text-[#286b49]", 
  Pending: "bg-[#fff2df] text-[#98621e]", 
  pending: "bg-[#fff2df] text-[#98621e]",
  Review: "bg-[#fff2df] text-[#98621e]", 
  Processing: "bg-[#edf0f5] text-[#596b88]", 
  Trial: "bg-[#f1ecfb] text-[#6f579b]" 
};

export default async function SectionPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ section: string }>; 
  searchParams: Promise<{ q?: string }> 
}) {
  const { section } = await params;
  const { q = "" } = await searchParams;

  if (section === "settings") return <SettingsPage />;
  if (section === "analytics") return <AnalyticsPage />;

  let title = "";
  let description = "";
  let columns: string[] = [];
  let rows: string[][] = [];
  let totalCount = "0";

  // --- 1. STORES SECTION ---
  if (section === "stores") {
    title = "Stores";
    description = "Review storefronts and their platform status from database.";
    columns = ["Store Name", "Slug", "Owner Email", "Plan", "Payment Status", "Created"];
    
    let query = supabase.from('stores').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (q) query = query.ilike('name', `%${q}%`);
    
    const { data, count } = await query;
    totalCount = `${count || 0} active stores`;
    
    rows = (data || []).map((store: any) => [
      store.name || "N/A",
      store.slug || "N/A",
      store.owner_email || "N/A",
      store.plan || "free",
      store.payment_status || "pending",
      new Date(store.created_at).toLocaleDateString()
    ]);
  } 
  // --- 2. SELLERS SECTION (Using Stores table data) ---
  else if (section === "sellers") {
    title = "Sellers";
    description = "Manage seller accounts and store owners.";
    columns = ["Owner Name / Email", "Store Name", "Slug", "Plan", "Status", "Joined"];

    let query = supabase.from('stores').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (q) query = query.ilike('owner_email', `%${q}%`);

    const { data, count } = await query;
    totalCount = `${count || 0} sellers`;

    rows = (data || []).map((store: any) => [
      store.owner_email || "Owner",
      store.name || "N/A",
      store.slug || "N/A",
      store.plan || "free",
      store.payment_status || "active",
      new Date(store.created_at).toLocaleDateString()
    ]);
  }
  // --- 3. PRODUCTS SECTION ---
  else if (section === "products") {
    title = "Products";
    description = "Monitor catalog listings across store products.";
    columns = ["Product Name", "Price", "Category ID", "Created At"];

    let query = supabase.from('store_products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    if (q) query = query.ilike('name', `%${q}%`);

    const { data, count } = await query;
    totalCount = `${count || 0} products`;

    rows = (data || []).map((prod: any) => [
      prod.name || "N/A",
      `$${prod.price || 0}`,
      prod.category_id ? prod.category_id.slice(0, 8) + "..." : "General",
      new Date(prod.created_at).toLocaleDateString()
    ]);
  }
  // --- 4. SUBSCRIPTIONS & PAYMENTS SECTION ---
  else if (section === "subscriptions") {
    title = "Subscriptions";
    description = "Manage plan adoption and manual payment proofs.";
    columns = ["Payment ID", "Store ID", "Method", "Transaction ID", "Amount", "Status", "Date"];

    let query = supabase.from('store_payments').select('*', { count: 'exact' }).order('created_at', { ascending: false });
    
    const { data, count } = await query;
    totalCount = `${count || 0} payment requests`;

    rows = (data || []).map((pay: any) => [
      pay.id.slice(0, 8) + "...",
      pay.store_id ? pay.store_id.slice(0, 8) + "..." : "N/A",
      pay.payment_method || "Easypaisa",
      pay.transaction_id || "N/A",
      `PKR ${pay.amount || 0}`,
      pay.status || "pending",
      new Date(pay.created_at).toLocaleDateString()
    ]);
  }
  else {
    notFound();
  }

  const addLabel = section === "sellers" ? "seller" : section === "stores" ? "store" : section === "products" ? "product" : "item";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#87928c]">Platform management</p>
          <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-[#1b2923]">{title}</h2>
          <p className="mt-1 text-sm text-[#7d8983]">{description}</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe6e1] bg-white px-3 text-xs font-medium text-[#536159] hover:bg-[#f9fbf9]">
            <Download size={14} />Export
          </button>
          <button className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1d7555] px-3 text-xs font-medium text-white hover:bg-[#155d42]">
            <Plus size={14} />Add {addLabel}
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-[#e9ede9] bg-white shadow-[0_2px_8px_rgba(28,48,38,0.025)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-[#26342d]">All {title.toLowerCase()}</h3>
            <p className="mt-1 text-[11px] text-[#8a958f]">{rows.length} records {q ? `matching “${q}”` : "from database"}</p>
          </div>
          <form className="flex h-9 w-full max-w-[250px] items-center gap-2 rounded-md border border-[#e5eae6] px-3" action={`/dashboard/${section}`}>
            <Search size={15} className="text-[#89948e]" />
            <input name="q" defaultValue={q} placeholder={`Search ${title.toLowerCase()}...`} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-[#9ba49f]" />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[690px] text-left">
            <thead>
              <tr className="bg-[#fafbfa] text-[10px] font-medium uppercase tracking-wide text-[#8a958f]">
                {columns.map((column) => <th key={column} className="px-5 py-3">{column}</th>)}
                <th className="px-5 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f0]">
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="text-xs text-[#5c6962] hover:bg-[#fcfdfc]">
                  {row.map((cell, index) => (
                    <td key={index} className="whitespace-nowrap px-5 py-4">
                      {index === columns.length - 2 && (statusStyles[cell] || cell === "active" || cell === "pro" || cell === "live") ? (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${statusStyles[cell] ?? "bg-[#e9f5ed] text-[#286b49]"}`}>
                          <span className="size-1.5 rounded-full bg-current opacity-60" />
                          {cell}
                        </span>
                      ) : (
                        <span className={index === 0 ? "font-medium text-[#334139]" : ""}>{cell}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-4">
                    <button aria-label="Open record" className="grid size-7 place-items-center rounded text-[#929d96] hover:bg-[#f0f4f0] hover:text-[#2d7651]">
                      <ArrowUpRight size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#87928c]">No records found in database.</p>}
        </div>

        <div className="flex items-center justify-between border-t border-[#edf0ed] px-5 py-3 text-[11px] text-[#87928c]">
          <span>Total records: {totalCount}</span>
        </div>
      </section>
      <p className="text-[11px] text-[#929c96]">Connected live with Supabase database for Version 1 administration.</p>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#87928c]">Platform performance</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-[#1b2923]">Analytics</h2>
        <p className="mt-1 text-sm text-[#7d8983]">Live analytics overview from database.</p>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-[#87928c]">Workspace administration</p>
        <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-[#1b2923]">Settings</h2>
        <p className="mt-1 text-sm text-[#7d8983]">Configure platform preferences.</p>
      </div>
    </div>
  );
}