'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw, Store, ExternalLink } from 'lucide-react';

interface PendingStore {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_email: string;
  whatsapp_number: string;
  created_at: string;
  verification_status: string;
}

function isPendingStore(value: unknown): value is PendingStore {
  if (typeof value !== "object" || value === null) return false;
  const store = value as Record<string, unknown>;
  return ["id", "name", "slug", "plan", "owner_email", "whatsapp_number", "created_at", "verification_status"]
    .every((key) => typeof store[key] === "string");
}

export function AdminStoreVerifications() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeIsError, setNoticeIsError] = useState(false);

  async function loadPendingStores() {
    setLoading(true);
    setNotice(null);
    setNoticeIsError(false);
    try {
      const res = await fetch('/api/admin/verify-store');
      const result: unknown = await res.json();
      if (typeof result !== "object" || result === null) throw new Error("The verification service returned an invalid response.");
      const data = result as Record<string, unknown>;
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Unable to load pending stores.");
      if (!Array.isArray(data.pending_stores) || !data.pending_stores.every(isPendingStore)) {
        throw new Error("The verification service returned invalid store data.");
      }
      setStores(data.pending_stores);
    } catch (reason) {
      console.error('Failed to load pending stores for verification', reason);
      setNotice(reason instanceof Error ? reason.message : "Unable to load pending stores.");
      setNoticeIsError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingStores();
  }, []);

  async function handleAction(storeId: string, action: 'approve' | 'reject') {
    setProcessingId(storeId);
    setNotice(null);
    setNoticeIsError(false);
    try {
      const res = await fetch('/api/admin/verify-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, action }),
      });
      const result: unknown = await res.json();
      if (typeof result !== "object" || result === null) throw new Error("The verification service returned an invalid response.");
      const data = result as Record<string, unknown>;
      if (res.ok) {
        setNotice(typeof data.message === "string" ? data.message : (action === 'approve' ? 'Store approved & merchant rights unlocked!' : 'Store rejected.'));
        setStores((prev) => prev.filter((s) => s.id !== storeId));
      } else {
        setNotice(typeof data.error === "string" ? data.error : 'Failed to update store verification status.');
        setNoticeIsError(true);
      }
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Network error occurred while verifying store.');
      setNoticeIsError(true);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            <ShieldCheck size={12} /> New Store Verifications
          </span>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">Pending Store Approvals</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify new AI-generated stores to unlock merchant dashboard rights (adding products, updating settings).
          </p>
        </div>
        <button
          type="button"
          onClick={loadPendingStores}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {notice && (
        <div role={noticeIsError ? "alert" : "status"} className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-xs font-medium ${noticeIsError ? "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"}`}>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 underline underline-offset-2">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">Loading pending stores...</div>
      ) : stores.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
          {noticeIsError ? "Unable to load pending stores. Refresh to try again." : "✓ No stores awaiting verification. All stores are verified and active!"}
        </div>
      ) : (
        <>
          <div className="space-y-3 2xl:hidden">
            {stores.map((store) => (
              <article key={store.id} className="rounded-lg border border-blue-600 bg-blue-600 p-3 text-white shadow-sm">
                <div className="flex items-start gap-2">
                  <Store size={15} className="mt-0.5 shrink-0 text-blue-100" />
                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-semibold text-white [overflow-wrap:anywhere]">{store.name}</h4>
                    <a href={`/store/${encodeURIComponent(store.slug)}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-[10px] text-blue-100 hover:text-white hover:underline">
                      {store.slug}.buildexom.store <ExternalLink size={10} className="shrink-0" />
                    </a>
                  </div>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="min-w-0"><dt className="text-[10px] font-medium uppercase tracking-wide text-blue-100">Owner email</dt><dd className="mt-0.5 break-all text-xs text-white">{store.owner_email || '—'}</dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-blue-100">WhatsApp</dt><dd className="mt-0.5 break-words text-xs text-white [overflow-wrap:anywhere]">{store.whatsapp_number || '—'}</dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-blue-100">Plan</dt><dd className="mt-1"><span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-white">{store.plan || 'basic'}</span></dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-blue-100">Submitted</dt><dd className="mt-0.5 text-xs text-white">{new Date(store.created_at).toLocaleDateString()}</dd></div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-white/20 pt-3">
                  <ActionButtons store={store} processing={processingId === store.id} onAction={handleAction} />
                </div>
              </article>
            ))}
          </div>
          <div className="hidden min-w-0 2xl:block">
            <table className="w-full table-fixed text-left text-xs text-slate-700 dark:text-slate-300">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="w-[22%] break-words px-2 py-3">Store Name & Slug</th>
                <th className="w-[23%] break-words px-2 py-3">Owner Email</th>
                <th className="w-[15%] break-words px-2 py-3">WhatsApp</th>
                <th className="w-[10%] break-words px-2 py-3">Plan</th>
                <th className="w-[30%] break-words px-2 py-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stores.map((s) => (
                <tr key={s.id} className="bg-blue-600 text-white transition hover:bg-blue-700">
                  <td className="break-words px-2 py-3 align-top [overflow-wrap:anywhere]">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Store size={14} className="shrink-0 text-blue-100" />
                      <span>{s.name}</span>
                    </div>
                    <div className="mt-1 break-all font-mono text-[10px] text-blue-100">
                      <a
                        href={`/store/${encodeURIComponent(s.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full items-center gap-1 break-all text-blue-100 hover:text-white hover:underline"
                      >
                        {s.slug}.buildexom.store <ExternalLink size={10} className="shrink-0" />
                      </a>
                    </div>
                  </td>
                  <td className="break-all px-2 py-3 align-top font-medium text-white">{s.owner_email || '—'}</td>
                  <td className="break-words px-2 py-3 align-top font-medium text-white [overflow-wrap:anywhere]">{s.whatsapp_number || '—'}</td>
                  <td className="break-words px-2 py-3 align-top">
                    <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {s.plan || 'basic'}
                    </span>
                  </td>
                  <td className="px-2 py-3 text-right align-top">
                    <ActionButtons store={s} processing={processingId === s.id} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
      )}
    </section>
  );
}

function ActionButtons({
  store,
  processing,
  onAction,
}: {
  store: PendingStore;
  processing: boolean;
  onAction: (storeId: string, action: 'approve' | 'reject') => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={() => onAction(store.id, 'approve')}
        disabled={processing}
        className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        <CheckCircle2 size={13} /> Approve & Verify
      </button>
      <button
        type="button"
        onClick={() => onAction(store.id, 'reject')}
        disabled={processing}
        className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950"
      >
        <XCircle size={13} /> Reject
      </button>
    </>
  );
}
