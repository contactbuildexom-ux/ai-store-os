"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertCircle, CheckCircle2, Database, Download, LoaderCircle, ShieldAlert, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MAX_DATABASE_BACKUP_SIZE } from "@/lib/database-backup";

type Notice = { tone: "success" | "error"; message: string };

function readResponse(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("The backup service returned an invalid response.");
  }
  return value as Record<string, unknown>;
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DatabaseBackupManager() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<"export" | "import" | null>(null);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  function selectFile(next: File | undefined) {
    setNotice(null);
    setConfirming(false);
    if (!next) return;
    if (!next.name.toLowerCase().endsWith(".json") || (next.type && next.type !== "application/json")) {
      setFile(null);
      setNotice({ tone: "error", message: "Choose a .json database backup file." });
      return;
    }
    if (next.size === 0 || next.size > MAX_DATABASE_BACKUP_SIZE) {
      setFile(null);
      setNotice({ tone: "error", message: "Choose a non-empty backup file smaller than 50 MB." });
      return;
    }
    setFile(next);
  }

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  async function exportDatabase() {
    setBusy("export");
    setNotice(null);
    try {
      const response = await fetch("/api/admin/db/export", { cache: "no-store" });
      if (!response.ok) {
        const payload = readResponse(await response.json());
        throw new Error(typeof payload.error === "string" ? payload.error : "Database export failed.");
      }
      const blob = await response.blob();
      if (blob.size > MAX_DATABASE_BACKUP_SIZE) throw new Error("The generated backup exceeds the 50 MB download limit.");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `buildexom-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice({ tone: "success", message: "Database backup downloaded. Store it somewhere secure." });
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Database export failed." });
    } finally {
      setBusy(null);
    }
  }

  async function importDatabase() {
    if (!file) return;
    setBusy("import");
    setConfirming(false);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/db/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: file,
      });
      const payload = readResponse(await response.json());
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : "Database restore failed.");
      setFile(null);
      setNotice({
        tone: "success",
        message: typeof payload.message === "string" ? payload.message : "Database backup restored.",
      });
      router.refresh();
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Database restore failed." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><Database size={19} /></span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Database backup &amp; restore</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">Export a secure copy of platform data or restore records from a previous backup.</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Download size={16} className="text-blue-700" /> Export database</div>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">Download stores and seller records, products, orders, payments, settings, blogs, and pricing plans as JSON.</p>
          <button
            type="button"
            onClick={exportDatabase}
            disabled={busy !== null}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy === "export" ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />}
            {busy === "export" ? "Preparing backup..." : "Export database"}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900"><Upload size={16} className="text-blue-700" /> Import database</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">Restore a Buildexom JSON backup. Matching record IDs will be updated; records not in the backup will not be deleted.</p>
          <div
            onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-4 rounded-lg border border-dashed p-4 text-center transition ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50"}`}
          >
            <input ref={inputRef} type="file" accept=".json,application/json" onChange={onFileInput} className="sr-only" />
            <p className="text-sm text-slate-600">{file ? <><span className="font-medium text-slate-900">{file.name}</span> <span className="text-slate-400">({formatBytes(file.size)})</span></> : "Drop a backup file here or browse to select one."}</p>
            <div className="mt-3 flex justify-center gap-2">
              <button type="button" onClick={() => inputRef.current?.click()} disabled={busy !== null} className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60">
                Browse files
              </button>
              {file && <button type="button" onClick={() => { setFile(null); setNotice(null); }} className="rounded-md px-3 py-2 text-xs font-medium text-slate-500 hover:bg-white" aria-label="Remove selected backup">Remove</button>}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={!file || busy !== null}
            className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-4 text-sm font-medium text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={16} /> Review restore
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-2.5 text-xs leading-5 text-amber-800">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p>Backups contain sensitive customer and seller data, including seller password hashes and order details. Downloaded files are not encrypted; store them securely and only share them with trusted administrators.</p>
        </div>
      </div>

      {notice && (
        <div role={notice.tone === "error" ? "alert" : "status"} className={`mx-5 mb-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm sm:mx-6 ${notice.tone === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>
          {notice.tone === "error" ? <AlertCircle size={17} className="mt-0.5 shrink-0" /> : <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
          <p>{notice.message}</p>
        </div>
      )}

      {confirming && file && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setConfirming(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="restore-title" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Confirm database restore</p>
                <h4 id="restore-title" className="mt-1 text-lg font-semibold text-slate-900">Restore this backup?</h4>
              </div>
              <button type="button" onClick={() => setConfirming(false)} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close confirmation"><X size={18} /></button>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">You are about to import <span className="font-medium text-slate-900">{file.name}</span>. Existing records with matching IDs will be overwritten. Records absent from the backup will remain untouched. The restore runs transactionally: if any table fails validation, no changes are committed.</p>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900">
              This includes sensitive seller credentials and customer order data. Only continue if you trust this backup and intend to replace matching records.
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setConfirming(false)} className="h-10 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={importDatabase} disabled={busy !== null} className="inline-flex h-10 items-center gap-2 rounded-md bg-red-700 px-4 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-60">
                {busy === "import" && <LoaderCircle size={16} className="animate-spin" />} Restore database
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
