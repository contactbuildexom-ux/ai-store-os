'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Eye, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface PendingUpgrade {
  store_id: string;
  store_name: string;
  store_slug: string;
  current_plan: string;
  requested_plan: string;
  payment_method: string;
  sender_name: string;
  sender_number: string;
  transaction_id: string;
  screenshot_url: string;
  amount: number;
  submitted_at: string;
}

export function AdminPlanUpgradeApprovals() {
  const [upgrades, setUpgrades] = useState<PendingUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function loadPendingUpgrades() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/plan-upgrades');
      const data = await res.json();
      if (res.ok && data.pending_upgrades) {
        setUpgrades(data.pending_upgrades);
      }
    } catch (e) {
      console.error('Failed to load pending upgrades', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingUpgrades();
  }, []);

  async function handleAction(storeId: string, action: 'approve' | 'reject', plan: string) {
    setProcessingId(storeId);
    setNotice(null);
    try {
      const res = await fetch('/api/admin/plan-upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeId, action, plan }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice(data.message || (action === 'approve' ? 'Plan approved!' : 'Plan rejected.'));
        setUpgrades((prev) => prev.filter((u) => u.store_id !== storeId));
      } else {
        setNotice(data.error || 'Failed to update plan status.');
      }
    } catch {
      setNotice('Network error occurred while updating plan.');
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            <Clock size={12} /> Pending Approvals
          </span>
          <h3 className="mt-1 text-base font-bold text-slate-900">Merchant Plan Upgrade Requests</h3>
          <p className="text-xs text-slate-500">
            Review transaction receipts and approve Pro & Business subscriptions submitted by merchants.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPendingUpgrades}
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
        <div className="py-8 text-center text-xs text-slate-400">Loading pending requests...</div>
      ) : upgrades.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
          <p className="text-xs font-bold text-slate-800">No pending upgrade requests</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All merchant payment proofs have been reviewed.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">Plan Request</th>
                <th className="px-4 py-3">Method & Amount</th>
                <th className="px-4 py-3">Sender & TID</th>
                <th className="px-4 py-3">Receipt Proof</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upgrades.map((u) => (
                <tr key={u.store_id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-slate-900">{u.store_name}</p>
                    <a
                      href={`/store/${u.store_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-[10px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {u.store_slug} <ExternalLink size={10} />
                    </a>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700">
                      {u.requested_plan}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Current: {u.current_plan || 'basic'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-semibold capitalize text-slate-800">{u.payment_method}</p>
                    <p className="font-bold text-emerald-600">PKR {Number(u.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-800 font-medium">{u.sender_name} ({u.sender_number})</p>
                    <p className="font-mono text-[10px] text-slate-500">Ref: {u.transaction_id || 'N/A'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    {u.screenshot_url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(u.screenshot_url)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 shadow-2xs"
                      >
                        <Eye size={12} /> View Slip
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">No receipt file</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      disabled={processingId === u.store_id}
                      onClick={() => handleAction(u.store_id, 'approve', u.requested_plan)}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50"
                    >
                      <CheckCircle2 size={12} /> Approve
                    </button>
                    <button
                      type="button"
                      disabled={processingId === u.store_id}
                      onClick={() => handleAction(u.store_id, 'reject', u.requested_plan)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] max-w-xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b">
              <h4 className="text-xs font-bold text-slate-900">Payment Proof Screenshot</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="mt-3 overflow-auto max-h-[70vh]">
              <img src={previewImage} alt="Payment receipt proof" className="w-full object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
