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

export function AdminStoreVerifications() {
  const [stores, setStores] = useState<PendingStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadPendingStores() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verify-store');
      const data = await res.json();
      if (res.ok && data.pending_stores) {
        setStores(data.pending_stores);
      }
    } catch (e) {
      console.error('Failed to load pending stores for verification', e);
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
    try {
      const res = await fetch('/api/admin/verify-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(data.message || (action === 'approve' ? 'Store approved & merchant rights unlocked!' : 'Store rejected.'));
        setStores((prev) => prev.filter((s) => s.id !== storeId));
      } else {
        setNotice(data.error || 'Failed to update store verification status.');
      }
    } catch {
      setNotice('Network error occurred while verifying store.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-800">
            <ShieldCheck size={12} /> New Store Verifications
          </span>
          <h3 className="mt-1 text-base font-bold text-slate-900">Pending Store Approvals</h3>
          <p className="text-xs text-slate-500">
            Verify new AI-generated stores to unlock merchant dashboard rights (adding products, updating settings).
          </p>
        </div>
        <button
          type="button"
          onClick={loadPendingStores}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {notice && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-medium text-blue-900 flex items-center justify-between">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="text-blue-700 hover:underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading pending stores...</div>
      ) : stores.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          ✓ No stores awaiting verification. All stores are verified and active!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="p-3">Store Name & Slug</th>
                <th className="p-3">Owner Email</th>
                <th className="p-3">WhatsApp</th>
                <th className="p-3">Plan</th>
                <th className="p-3 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Store size={14} className="text-blue-600 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      <a
                        href={`/store/${encodeURIComponent(s.slug)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {s.slug}.buildexom.store <ExternalLink size={10} />
                      </a>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-600">{s.owner_email || '—'}</td>
                  <td className="p-3 font-medium text-slate-600">{s.whatsapp_number || '—'}</td>
                  <td className="p-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                      {s.plan || 'basic'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(s.id, 'approve')}
                        disabled={processingId === s.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-2xs transition active:scale-95 disabled:opacity-50"
                      >
                        <CheckCircle2 size={13} /> Approve & Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(s.id, 'reject')}
                        disabled={processingId === s.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-95 disabled:opacity-50"
                      >
                        <XCircle size={13} /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
