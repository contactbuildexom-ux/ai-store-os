"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Bell, Boxes, ChevronDown, ChevronRight, CreditCard, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShoppingBag, Store, Users, X } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Sellers", href: "/dashboard/sellers", icon: Users },
  { label: "Stores", href: "/dashboard/stores", icon: Store },
  { label: "Products", href: "/dashboard/products", icon: Package },
  { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
  { label: "Subscriptions", href: "/dashboard/subscriptions", icon: CreditCard },
  { label: "Analytics", href: "/dashboard/analytics", icon: Activity },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardShell({ children, email }: { children: React.ReactNode; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const pageName = navigation.find((item) => item.href === pathname)?.label ?? "Dashboard";
  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "DELETE" });
    if (isSupabaseConfigured()) {
      await createClient().auth.signOut();
    } else {
      await fetch("/api/mock-auth", { method: "DELETE" });
    }
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <aside className="flex h-full w-[258px] shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.08] px-6"><span className="grid size-9 place-items-center rounded-[10px] bg-blue-500 text-white"><Boxes size={19} /></span><span className="text-[15px] font-semibold tracking-wide">Buildexom <span className="font-normal text-blue-200">AI</span></span><button onClick={() => setMobileOpen(false)} className="ml-auto grid size-8 place-items-center text-slate-300 lg:hidden" aria-label="Close menu"><X size={19} /></button></div>
      <div className="px-4 pt-7"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.17em] text-slate-400">Workspace</p><nav className="space-y-1" aria-label="Main navigation">{navigation.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
        return <Link key={href} href={href} prefetch onClick={() => setMobileOpen(false)} aria-current={active ? "page" : undefined} className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition-colors ${active ? "bg-blue-600 font-medium text-white shadow-sm shadow-blue-950/20" : "text-slate-300 hover:bg-white/[0.07] hover:text-white"}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span className="flex-1">{label}</span>{active && <ChevronRight size={14} className="text-blue-100" />}</Link>;
      })}</nav></div>
      <div className="mt-auto border-t border-white/[0.08] p-4"><div className="flex items-center gap-3 rounded-lg bg-white/[0.055] p-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-500/25 text-xs font-semibold text-blue-100">{initials}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-white">{email.split("@")[0]}</span><span className="mt-1 block text-[10px] text-slate-400">Super Admin</span></span><button onClick={signOut} aria-label="Log out" title="Log out" className="grid size-8 place-items-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"><LogOut size={16} /></button></div></div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-50 flex lg:hidden"><button className="absolute inset-0 bg-slate-950/55" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" /><div className="relative">{sidebar}</div></div>}
      <div className="min-w-0 flex-1 lg:ml-[258px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center gap-4 border-b border-slate-200 bg-white/95 px-5 backdrop-blur sm:px-8">
          <button onClick={() => setMobileOpen(true)} className="grid size-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu size={20} /></button>
          <div className="min-w-0 flex-1"><div className="flex items-center gap-2 text-[11px] text-slate-400"><span className="hidden sm:inline">Workspace</span><ChevronRight size={13} className="hidden sm:block" /><span className="truncate text-slate-600">{pageName}</span></div><h1 className="mt-1 truncate text-[16px] font-semibold text-slate-900">{pageName}</h1></div>
          <form action="/dashboard/sellers" className="hidden h-10 w-[230px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 xl:flex"><Search size={16} className="shrink-0 text-slate-400" /><input name="q" placeholder="Search sellers..." aria-label="Search sellers" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" /><kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">/</kbd></form>
          <div className="relative"><button onClick={() => { setNotificationsOpen((value) => !value); setProfileOpen(false); }} className="relative grid size-9 place-items-center rounded-md text-slate-600 transition hover:bg-slate-100" aria-label="Notifications" aria-expanded={notificationsOpen}><Bell size={18} /><span className="absolute right-[7px] top-[6px] size-1.5 rounded-full bg-blue-500 ring-2 ring-white" /></button>{notificationsOpen && <div className="absolute right-0 top-12 z-40 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg"><p className="text-sm font-semibold text-slate-800">Notifications</p><p className="mt-3 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">You’re all caught up. New platform activity will appear here.</p></div>}</div>
          <div className="relative"><button onClick={() => { setProfileOpen((value) => !value); setNotificationsOpen(false); }} className="flex items-center gap-2 rounded-md p-1.5 text-left transition hover:bg-slate-100" aria-expanded={profileOpen} aria-label="Admin profile menu"><span className="grid size-8 place-items-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">{initials}</span><ChevronDown size={14} className="hidden text-slate-400 sm:block" /></button>{profileOpen && <div className="absolute right-0 top-12 z-40 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"><div className="border-b border-slate-100 px-3 py-2"><p className="text-xs font-medium text-slate-800">Super Admin</p><p className="mt-1 truncate text-[11px] text-slate-500">{email}</p></div><button onClick={signOut} className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"><LogOut size={15} />Log out</button></div>}</div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}