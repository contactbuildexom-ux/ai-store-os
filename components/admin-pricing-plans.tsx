"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";

type PricingPlan = {
  id: string;
  plan_key: "basic" | "pro" | "business" | null;
  name: string;
  price: number | string;
  billing_cycle: string;
  features: string[];
  is_active: boolean;
  created_at: string;
};

type PlanForm = {
  plan_key: "basic" | "pro" | "business" | "";
  name: string;
  price: string;
  billing_cycle: string;
  features: string;
  is_active: boolean;
};

const emptyForm: PlanForm = { plan_key: "", name: "", price: "0", billing_cycle: "monthly", features: "", is_active: true };

async function responseBody(response: Response): Promise<Record<string, unknown>> {
  const result: unknown = await response.json();
  if (typeof result !== "object" || result === null) throw new Error("The pricing service returned an invalid response.");
  const body = result as Record<string, unknown>;
  if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Unable to complete pricing request.");
  return body;
}

function isPricingPlan(value: unknown): value is PricingPlan {
  if (typeof value !== "object" || value === null) return false;
  const plan = value as Record<string, unknown>;
  return typeof plan.id === "string"
    && (plan.plan_key === null || plan.plan_key === "basic" || plan.plan_key === "pro" || plan.plan_key === "business")
    && typeof plan.name === "string"
    && (typeof plan.price === "number" || typeof plan.price === "string")
    && typeof plan.billing_cycle === "string"
    && Array.isArray(plan.features) && plan.features.every((feature) => typeof feature === "string")
    && typeof plan.is_active === "boolean"
    && typeof plan.created_at === "string";
}

export function AdminPricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/pricing");
      const body = await responseBody(response);
      if (!Array.isArray(body.plans) || !body.plans.every(isPricingPlan)) throw new Error("The pricing service returned invalid plan data.");
      setPlans(body.plans);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load pricing plans.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPlans(); }, [loadPlans]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function editPlan(plan: PricingPlan) {
    setEditingId(plan.id);
    setForm({
      plan_key: plan.plan_key ?? "",
      name: plan.name,
      price: String(plan.price),
      billing_cycle: plan.billing_cycle,
      features: plan.features.join("\n"),
      is_active: plan.is_active,
    });
    setNotice(null);
    setError(null);
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setNotice(null);
    setError(null);
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) {
      setError("Enter a valid non-negative price.");
      setSaving(false);
      return;
    }
    const payload = {
      plan_key: form.plan_key || null,
      name: form.name.trim(),
      price,
      billing_cycle: form.billing_cycle.trim(),
      features: form.features.split("\n").map((feature) => feature.trim()).filter(Boolean),
      is_active: form.is_active,
    };
    try {
      const response = await fetch("/api/admin/pricing", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
      });
      await responseBody(response);
      resetForm();
      setNotice(editingId ? "Pricing plan updated." : "Pricing plan created.");
      await loadPlans();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save pricing plan.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePlan(plan: PricingPlan) {
    if (!window.confirm(`Delete the ${plan.name} plan?`)) return;
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/pricing?id=${encodeURIComponent(plan.id)}`, { method: "DELETE" });
      await responseBody(response);
      setNotice(`${plan.name} plan deleted.`);
      if (editingId === plan.id) resetForm();
      await loadPlans();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to delete pricing plan.");
    }
  }

  return (
    <div className="space-y-5">
      {(error || notice) && <p role={error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{error ?? notice}</p>}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-800">Pricing plans</h3>
            <p className="mt-1 text-xs text-slate-500">Active plans are published to the public pricing section.</p>
          </div>
          {loading ? <p role="status" className="px-5 py-8 text-sm text-slate-500">Loading plans…</p> : plans.length === 0 ? <p className="px-5 py-8 text-sm text-slate-500">No plans yet. Add the first plan using the form.</p> : (
            <ul className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <li key={plan.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-slate-800">{plan.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${plan.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{plan.is_active ? "Active" : "Inactive"}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">PKR {Number(plan.price).toLocaleString()} / {plan.billing_cycle} · {plan.features.length} features</p>
                  </div>
                  <button type="button" onClick={() => editPlan(plan)} aria-label={`Edit ${plan.name}`} className="grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"><Pencil size={15} /></button>
                  <button type="button" onClick={() => void deletePlan(plan)} aria-label={`Delete ${plan.name}`} className="grid size-9 place-items-center rounded-md border border-red-100 text-red-600 hover:bg-red-50"><Trash2 size={15} /></button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <form onSubmit={savePlan} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><h3 className="text-sm font-semibold text-slate-800">{editingId ? "Edit plan" : "Create a plan"}</h3><p className="mt-1 text-xs text-slate-500">Add feature names one per line.</p></div>
            {editingId && <button type="button" onClick={resetForm} aria-label="Cancel editing" className="grid size-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X size={16} /></button>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Subscription key
              <select value={form.plan_key} onChange={(event) => setForm({ ...form, plan_key: event.target.value as PlanForm["plan_key"] })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500">
                <option value="">Custom / display only</option>
                <option value="basic">Basic entitlement</option>
                <option value="pro">Pro entitlement</option>
                <option value="business">Business entitlement</option>
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-700">Plan name<input required maxLength={80} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-700">Price (PKR)<input required type="number" min="0" max="99999999.99" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
            <label className="block text-xs font-medium text-slate-700">Billing cycle<input required maxLength={40} placeholder="monthly, yearly, one-time" value={form.billing_cycle} onChange={(event) => setForm({ ...form, billing_cycle: event.target.value })} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" /></label>
          </div>
          <label className="block text-xs font-medium text-slate-700">Features<textarea rows={6} value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} className="mt-1.5 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500" /></label>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} className="size-4 accent-blue-600" />Publish this plan</label>
          <button type="submit" disabled={saving} className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            {editingId ? <Save size={15} /> : <Plus size={15} />}{saving ? "Saving…" : editingId ? "Save changes" : "Create plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
