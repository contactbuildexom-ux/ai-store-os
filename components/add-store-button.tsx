"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

export function AddStoreButton({ label = "Add store" }: { label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function createStore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "").trim();
    const ownerEmail = String(values.get("owner_email") ?? "").trim();
    const slug = String(values.get("slug") ?? "").trim();
    const password = String(values.get("password") ?? "");
    const whatsappNumber = String(values.get("whatsapp_number") ?? "").trim();

    try {
      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          owner_email: ownerEmail,
          slug,
          password,
          whatsapp_number: whatsappNumber,
        }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Unable to create store.");
      setOpen(false);
      router.refresh();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Unable to create store.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
      >
        <Plus size={14} /> {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-store-title"
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 id="add-store-title" className="text-lg font-semibold text-slate-900">Add a store</h2>
                <p className="mt-1 text-sm text-slate-500">Create a storefront and its owner account.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close dialog" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={createStore}>
              <label className="text-xs font-medium text-slate-700">Store name
                <input name="name" required maxLength={100} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="text-xs font-medium text-slate-700">Store URL slug
                <input name="slug" required pattern="[a-zA-Z0-9-]+" maxLength={80} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="text-xs font-medium text-slate-700 sm:col-span-2">Owner email
                <input name="owner_email" type="email" required maxLength={254} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="text-xs font-medium text-slate-700">Temporary password
                <input name="password" type="password" required minLength={8} maxLength={128} autoComplete="new-password" className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              <label className="text-xs font-medium text-slate-700">WhatsApp number
                <input name="whatsapp_number" type="tel" maxLength={30} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
              </label>
              {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{error}</p>}
              <div className="flex justify-end gap-2 pt-1 sm:col-span-2">
                <button type="button" onClick={() => setOpen(false)} className="h-9 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={pending} className="h-9 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">{pending ? "Creating..." : "Create store"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
