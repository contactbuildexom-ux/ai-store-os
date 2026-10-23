'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Eye, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

interface PendingUpgrade {
  request_id: string;
  store_id: string;
  store_name: string;
  store_slug: string;
  user_email: string;
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

function isPendingUpgrade(value: unknown): value is PendingUpgrade {
  if (typeof value !== "object" || value === null) return false;
  const upgrade = value as Record<string, unknown>;
  return [
    "request_id", "store_id", "store_name", "store_slug", "user_email", "current_plan", "requested_plan",
    "payment_method", "sender_name", "sender_number", "transaction_id",
    "screenshot_url", "submitted_at",
  ].every((key) => typeof upgrade[key] === "string") && typeof upgrade.amount === "number";
}

export function AdminPlanUpgradeApprovals() {
  const [upgrades, setUpgrades] = useState<PendingUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function loadPendingUpgrades() {
    setLoading(true);
    setNotice(null);
    setNoticeIsError(false);
    try {
      const res = await fetch('/api/admin/plan-upgrades');
      const result: unknown = await res.json();
      if (typeof result !== "object" || result === null) throw new Error("The upgrade service returned an invalid response.");
      const data = result as Record<string, unknown>;
      if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Unable to load pending upgrade requests.");
      if (!Array.isArray(data.pending_upgrades) || !data.pending_upgrades.every(isPendingUpgrade)) {
        throw new Error("The upgrade service returned invalid request data.");
      }
      setUpgrades(data.pending_upgrades);
    } catch (reason) {
      console.error('Failed to load pending upgrades', reason);
      setNotice(reason instanceof Error ? reason.message : "Unable to load pending upgrade requests.");
      setNoticeIsError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPendingUpgrades();
  }, []);

  async function handleAction(requestId: string, action: 'approve' | 'reject') {
    setProcessingId(requestId);
    setNotice(null);
    setNoticeIsError(false);
    try {
      const res = await fetch('/api/admin/plan-upgrades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: requestId, action }),
      });
      const result: unknown = await res.json();
      if (typeof result !== "object" || result === null) throw new Error("The upgrade service returned an invalid response.");
      const data = result as Record<string, unknown>;
      if (res.ok) {
        setNotice(typeof data.message === "string" ? data.message : (action === 'approve' ? 'Plan approved!' : 'Plan rejected.'));
        setUpgrades((prev) => prev.filter((u) => u.request_id !== requestId));
      } else {
        setNotice(typeof data.error === "string" ? data.error : 'Failed to update plan status.');
        setNoticeIsError(true);
      }
    } catch (reason) {
      setNotice(reason instanceof Error ? reason.message : 'Network error occurred while updating plan.');
      setNoticeIsError(true);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock size={12} /> Pending Approvals
          </span>
          <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">Merchant Plan Upgrade Requests</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review transaction receipts and approve Pro & Business subscriptions submitted by merchants.
          </p>
        </div>
        <button
          type="button"
          onClick={loadPendingUpgrades}
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
        <div className="py-8 text-center text-xs text-slate-400">Loading pending requests...</div>
      ) : upgrades.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-500 opacity-80" />
          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{noticeIsError ? "Unable to load upgrade requests. Refresh to try again." : "No pending upgrade requests"}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">All merchant payment proofs have been reviewed.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 2xl:hidden">
            {upgrades.map((upgrade) => (
              <article key={upgrade.request_id} className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="break-words text-sm font-semibold text-slate-900 dark:text-slate-100 [overflow-wrap:anywhere]">{upgrade.store_name}</h4>
                    <p className="mt-1 break-all text-[11px] text-slate-600 dark:text-slate-400">{upgrade.user_email || "Email unavailable"}</p>
                    <a href={`/store/${encodeURIComponent(upgrade.store_slug)}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all font-mono text-[10px] text-blue-600 hover:underline dark:text-blue-400">
                      {upgrade.store_slug} <ExternalLink size={10} className="shrink-0" />
                    </a>
                  </div>
                  <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">{upgrade.requested_plan}</span>
                </div>
                <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Current plan</dt><dd className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{upgrade.current_plan || 'basic'}</dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Payment</dt><dd className="mt-0.5 text-xs font-semibold capitalize text-slate-800 dark:text-slate-200">{upgrade.payment_method} · PKR {Number(upgrade.amount).toLocaleString()}</dd></div>
                  <div className="min-w-0"><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Sender & number</dt><dd className="mt-0.5 break-words text-xs text-slate-700 dark:text-slate-300 [overflow-wrap:anywhere]">{upgrade.sender_name} ({upgrade.sender_number})</dd></div>
                  <div className="min-w-0"><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Transaction ID</dt><dd className="mt-0.5 break-all font-mono text-xs text-slate-700 dark:text-slate-300">{upgrade.transaction_id || 'N/A'}</dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Receipt proof</dt><dd className="mt-1">{upgrade.screenshot_url ? <button type="button" onClick={() => setPreviewImage(upgrade.screenshot_url)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"><Eye size={12} /> View Slip</button> : <span className="text-[10px] text-slate-400">No receipt file</span>}</dd></div>
                  <div><dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Submitted</dt><dd className="mt-0.5 text-xs text-slate-700 dark:text-slate-300">{new Date(upgrade.submitted_at).toLocaleDateString()}</dd></div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <UpgradeActionButtons upgrade={upgrade} processing={processingId === upgrade.request_id} onAction={handleAction} />
                </div>
              </article>
            ))}
          </div>
          <div className="hidden min-w-0 2xl:block">
          <table className="w-full table-fixed text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <th className="w-[22%] break-words px-2 py-3">Merchant</th>
                <th className="w-[13%] break-words px-2 py-3">Plan Request</th>
                <th className="w-[15%] break-words px-2 py-3">Method & Amount</th>
                <th className="w-[22%] break-words px-2 py-3">Sender & TID</th>
                <th className="w-[12%] break-words px-2 py-3">Receipt Proof</th>
                <th className="w-[18%] break-words px-2 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {upgrades.map((u) => (
                <tr key={u.request_id} className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                  <td className="break-words px-2 py-3 align-top [overflow-wrap:anywhere]">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{u.store_name}</p>
                    <p className="mt-1 break-all text-[10px] text-slate-600 dark:text-slate-400">{u.user_email || "Email unavailable"}</p>
                    <a
                      href={`/store/${u.store_slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex max-w-full items-center gap-1 break-all font-mono text-[10px] text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {u.store_slug} <ExternalLink size={10} />
                    </a>
                  </td>
                  <td className="break-words px-2 py-3 align-top">
                    <span className="inline-flex rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                      {u.requested_plan}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-400">Current: {u.current_plan || 'basic'}</p>
                  </td>
                  <td className="break-words px-2 py-3 align-top">
                    <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">{u.payment_method}</p>
                    <p className="font-bold text-emerald-600">PKR {Number(u.amount).toLocaleString()}</p>
                  </td>
                  <td className="break-words px-2 py-3 align-top [overflow-wrap:anywhere]">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{u.sender_name} ({u.sender_number})</p>
                    <p className="break-all font-mono text-[10px] text-slate-500">Ref: {u.transaction_id || 'N/A'}</p>
                  </td>
                  <td className="break-words px-2 py-3 align-top">
                    {u.screenshot_url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(u.screenshot_url)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
                      >
                        <Eye size={12} /> View Slip
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400">No receipt file</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-right align-top">
                    <UpgradeActionButtons upgrade={u} processing={processingId === u.request_id} onAction={handleAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </>
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

function UpgradeActionButtons({
  upgrade,
  processing,
  onAction,
}: {
  upgrade: PendingUpgrade;
  processing: boolean;
  onAction: (requestId: string, action: 'approve' | 'reject') => void;
}) {
  function reviewPayment(action: 'approve' | 'reject') {
    if (action === 'approve' && !window.confirm('Confirm that payment has been received and verified before activating this plan?')) return;
    onAction(upgrade.request_id, action);
  }

  return (
    <>
      <button
        type="button"
        disabled={processing}
        onClick={() => reviewPayment('approve')}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
      >
        <CheckCircle2 size={12} /> Confirm payment & approve
      </button>
      <button
        type="button"
        disabled={processing}
        onClick={() => reviewPayment('reject')}
        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950"
      >
        <XCircle size={12} /> Reject
      </button>
    </>
  );
}
