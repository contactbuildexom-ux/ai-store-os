import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, CirclePlus, DollarSign, Package, Store, Users } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function Status({ value }: { value: string }) {
  const active = value === "Active" || value === "Live" || value === "pro" || value === "verified";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${active ? "bg-[#e9f5ed] text-[#286b49]" : "bg-[#fff2df] text-[#98621e]"}`}>
      <span className={`size-1.5 rounded-full ${active ? "bg-[#54a477]" : "bg-[#d6a043]"}`} />
      {value}
    </span>
  );
}

export default async function DashboardPage() {
  // 1. Supabase se real stores fetch karein
  const { data: storesList, count: totalStoresCount } = await supabase
    .from('stores')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5);

  // 2. Total products count fetch karein
  const { count: totalProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const stores = storesList || [];
  const totalStores = totalStoresCount || 0;
  const totalProducts = totalProductsCount || 0;

  return (
    <div className="space-y-6">
      <div className="rise-in flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-[#7c8982]">Platform Overview</p>
          <h2 className="mt-1.5 text-[25px] font-semibold tracking-tight text-[#1b2923]">Good morning, Admin</h2>
          <p className="mt-1 text-sm text-[#7d8983]">Here’s live data happening across your platform.</p>
        </div>
        <Link href="/dashboard/analytics" className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe6e1] bg-white px-3 text-xs font-medium text-[#47564e] transition hover:border-[#b8c9be] hover:bg-[#fbfcfb]">
          Platform report <ArrowRight size={14} />
        </Link>
      </div>

      {/* Dynamic Metrics Section */}
      <section className="rise-in grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4" aria-label="Platform metrics">
        <article className="rounded-xl border border-[#e9ede9] bg-white p-5 shadow-[0_2px_8px_rgba(28,48,38,0.025)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#75817b]">Total Stores</span>
            <span className="grid size-9 place-items-center rounded-lg bg-[#edf0e4] text-[#66703f]"><Store size={17} /></span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-[26px] font-semibold leading-none tracking-tight text-[#1c2924]">{totalStores}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-[#7f8b85]">
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#268052]"><ArrowUpRight size={13} />Live</span> from Supabase
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-[#e9ede9] bg-white p-5 shadow-[0_2px_8px_rgba(28,48,38,0.025)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-medium text-[#75817b]">Total Products</span>
            <span className="grid size-9 place-items-center rounded-lg bg-[#f4ece1] text-[#9a6737]"><Package size={17} /></span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-2">
            <div>
              <p className="text-[26px] font-semibold leading-none tracking-tight text-[#1c2924]">{totalProducts}</p>
              <p className="mt-2 flex items-center gap-1 text-[11px] text-[#7f8b85]">
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#268052]"><ArrowUpRight size={13} />Live</span> catalog items
              </p>
            </div>
          </div>
        </article>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(270px,0.8fr)]">
        <div className="min-w-0 space-y-5">
          {/* Dynamic Recent Stores Table */}
          <section className="overflow-hidden rounded-xl border border-[#e9ede9] bg-white shadow-[0_2px_8px_rgba(28,48,38,0.025)]">
            <div className="flex items-center justify-between border-b border-[#edf0ed] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-[#26342d]">Registered Stores</h3>
                <p className="mt-1 text-[11px] text-[#8a958f]">Latest stores created on your platform</p>
              </div>
              <Link href="/dashboard/stores" className="inline-flex items-center gap-1 text-xs font-medium text-[#26704e] hover:text-[#174b35]">View all <ArrowRight size={14} /></Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[510px] text-left">
                <thead>
                  <tr className="bg-[#fafbfa] text-[10px] font-medium uppercase tracking-wide text-[#8a958f]">
                    <th className="px-5 py-3">Store Name</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f2f0]">
                  {stores.map((store: any) => (
                    <tr key={store.id} className="text-xs text-[#5c6962] hover:bg-[#fcfdfc]">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-md bg-[#e9f1eb] text-[#416a50] font-semibold">
                            {store.name ? store.name[0] : 'S'}
                          </span>
                          <span className="font-medium text-[#334139]">{store.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">{store.slug}</td>
                      <td className="px-4 py-3.5 uppercase font-bold text-blue-600">{store.plan}</td>
                      <td className="px-4 py-3.5"><Status value={store.payment_status || 'pending'} /></td>
                    </tr>
                  ))}
                  {stores.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-5 py-6 text-center text-gray-500">No stores found in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <aside className="space-y-5">
          <section className="rounded-xl border border-[#e9ede9] bg-white p-5 shadow-[0_2px_8px_rgba(28,48,38,0.025)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#26342d]">Quick actions</h3>
                <p className="mt-1 text-[11px] text-[#8a958f]">Common admin tasks</p>
              </div>
              <CirclePlus size={18} className="text-[#9aa59e]" />
            </div>
            <div className="mt-4 divide-y divide-[#eff2ef]">
              {[
                { label: "View stores", href: "/dashboard/stores", icon: Store },
                { label: "Manage subscriptions", href: "/dashboard/subscriptions", icon: ArrowUpRight },
                { label: "Platform analytics", href: "/dashboard/analytics", icon: ArrowUpRight }
              ].map(({ label, href, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 py-3 text-xs text-[#59665f] transition hover:text-[#286d4c]">
                  <span className="grid size-8 place-items-center rounded-md bg-[#f4f7f4] text-[#708078] group-hover:bg-[#e8f3eb] group-hover:text-[#347450]"><Icon size={15} /></span>
                  <span className="flex-1">{label}</span>
                  <ArrowRight size={14} className="text-[#b0b9b3] transition group-hover:translate-x-0.5 group-hover:text-[#4a8465]" />
                </Link>
              ))}
            </div>
          </section>
          <div className="rounded-xl bg-[#e8efe8] px-5 py-4">
            <div className="flex items-center gap-2 text-[11px] font-medium text-[#3c5e48]"><Bot size={15} />Buildexom AI insight</div>
            <p className="mt-2 text-xs leading-5 text-[#617469]">Platform overview is now connected live with Supabase database.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}