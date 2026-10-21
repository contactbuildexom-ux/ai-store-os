"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, X } from "lucide-react";

export type DashboardEditField = {
  key: string;
  label: string;
  type?: "text" | "email" | "number" | "select";
  options?: string[];
};

type DashboardRecordActionsProps = {
  resource: "stores" | "sellers" | "products";
  recordId: string;
  values: Array<{ label: string; value: string }>;
  fields: DashboardEditField[];
  viewHref?: string;
};

async function readApiResponse(response: Response, action: string): Promise<{ error?: string }> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`${action} failed: server returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    throw new Error(`${action} failed: server returned an invalid response (HTTP ${response.status}).`);
  }

  return {
    error: "error" in payload && typeof payload.error === "string" ? payload.error : undefined,
  };
}

export function DashboardRecordActions({ resource, recordId, values, fields, viewHref }: DashboardRecordActionsProps) {
  const router = useRouter();
  const [dialog, setDialog] = useState<"view" | "edit" | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const updates = Object.fromEntries(fields.map(({ key }) => [key, formData.get(key)]));
    try {
      const response = await fetch(`/api/admin/${resource}/${encodeURIComponent(recordId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const action = `Unable to update ${resource.slice(0, -1)}`;
      const result = await readApiResponse(response, action);
      if (!response.ok) throw new Error(result.error ?? `Unable to update ${resource.slice(0, -1)}.`);
      setDialog(null);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save changes.");
    } finally {
      setPending(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete this ${resource.slice(0, -1)}? This action cannot be undone.`)) return;
    setPending(true);
    setError("");
    try {
      const endpoint = resource === "stores"
        ? `/api/admin/stores?id=${encodeURIComponent(recordId)}`
        : `/api/admin/${resource}/${encodeURIComponent(recordId)}`;
      const response = await fetch(endpoint, { method: "DELETE" });
      const action = `Unable to delete ${resource.slice(0, -1)}`;
      const result = await readApiResponse(response, action);
      if (!response.ok) throw new Error(result.error ?? `Unable to delete ${resource.slice(0, -1)}.`);
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete this record.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-1">
        {viewHref ? (
          <Link href={viewHref} target="_blank" rel="noreferrer" aria-label="View record" title="View" className="grid size-8 place-items-center rounded-md text-blue-700 hover:bg-blue-50"><Eye size={15} /></Link>
        ) : (
          <button type="button" onClick={() => { setError(""); setDialog("view"); }} aria-label="View record" title="View" className="grid size-8 place-items-center rounded-md text-blue-700 hover:bg-blue-50"><Eye size={15} /></button>
        )}
        <button type="button" onClick={() => { setError(""); setDialog("edit"); }} disabled={pending} aria-label="Edit record" title="Edit" className="grid size-8 place-items-center rounded-md text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"><Pencil size={15} /></button>
        <button type="button" onClick={remove} disabled={pending} aria-label="Delete record" title="Delete" className="grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"><Trash2 size={15} /></button>
      </div>
      {error && !dialog && <p role="alert" className="mt-1 max-w-56 text-[11px] text-red-600">{error}</p>}
      {dialog && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/45 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="record-dialog-title" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="record-dialog-title" className="text-lg font-semibold text-slate-900">{dialog === "edit" ? "Edit record" : "Record details"}</h2>
                <p className="mt-1 text-xs text-slate-500">ID: {recordId}</p>
              </div>
              <button type="button" onClick={() => setDialog(null)} aria-label="Close dialog" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X size={18} /></button>
            </div>
            {dialog === "view" ? (
              <dl className="mt-5 divide-y divide-slate-100">
                {values.map(({ label, value }) => <div key={label} className="grid grid-cols-[minmax(100px,0.7fr)_1fr] gap-4 py-3 text-sm"><dt className="text-slate-500">{label}</dt><dd className="break-words font-medium text-slate-800">{value || "—"}</dd></div>)}
              </dl>
            ) : (
              <form className="mt-5 space-y-4" onSubmit={save}>
                {fields.map(({ key, label, type = "text", options }) => (
                  <label key={key} className="block text-xs font-medium text-slate-700">{label}
                    {type === "select" ? (
                      <select name={key} defaultValue={values.find((value) => value.label === label)?.value ?? ""} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                        {options?.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : (
                      <input name={key} type={type} step={type === "number" ? key === "stock" ? "1" : "0.01" : undefined} required={key === "name" || key === "owner_email" || key === "price"} defaultValue={values.find((value) => value.label === label)?.value ?? ""} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
                    )}
                  </label>
                ))}
                {error && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setDialog(null)} className="h-9 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={pending} className="h-9 rounded-md bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60">{pending ? "Saving..." : "Save changes"}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </>
  );
}
