"use client";

import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import type { ProductImportIssue } from "@/lib/product-csv";

type StoreOption = { id: string; name: string };

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const SAMPLE_CSV = [
  "name,price,description,sku,stock,category_id,image_url",
  'Blue Cotton Shirt,2499.00,"Soft cotton shirt, regular fit",SHIRT-BLUE-M,25,,https://example.com/shirt.jpg',
  'Leather Wallet,1599.50,"Genuine leather wallet",WALLET-001,12,,',
].join("\r\n");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImportIssue(value: unknown): value is ProductImportIssue {
  return isRecord(value)
    && typeof value.row === "number"
    && typeof value.field === "string"
    && typeof value.message === "string";
}

function downloadSample() {
  const url = URL.createObjectURL(new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "products-template.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ProductCsvImport({ stores }: { stores: StoreOption[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [storeId, setStoreId] = useState(stores[0]?.id ?? "");
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [issues, setIssues] = useState<ProductImportIssue[]>([]);
  const [success, setSuccess] = useState("");

  function selectFile(candidate: File | undefined) {
    setError("");
    setIssues([]);
    setSuccess("");
    if (!candidate) {
      setFile(null);
      return;
    }
    if (!candidate.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Choose a .csv file.");
      return;
    }
    if (candidate.size <= 0 || candidate.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("Choose a CSV file smaller than 2 MB.");
      return;
    }
    setFile(candidate);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function closeDialog() {
    if (pending) return;
    setOpen(false);
    setFile(null);
    setError("");
    setIssues([]);
    setSuccess("");
  }

  async function importProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !storeId) {
      setError("Select a store and choose a CSV file.");
      return;
    }

    setPending(true);
    setError("");
    setIssues([]);
    setSuccess("");
    const body = new FormData();
    body.append("file", file);
    body.append("store_id", storeId);
    try {
      const response = await fetch("/api/admin/products/import", { method: "POST", body });
      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error("The import service returned an invalid response.");
      }
      if (!isRecord(result)) throw new Error("The import service returned an invalid response.");
      if (Array.isArray(result.errors)) {
        const parsedIssues = result.errors.filter(isImportIssue);
        setIssues(parsedIssues);
      }
      if (!response.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Unable to import products.");
      }
      if (typeof result.imported !== "number") throw new Error("The import service returned an invalid result.");
      setSuccess(`${result.imported} product${result.imported === 1 ? "" : "s"} imported successfully.`);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to import products.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => { setOpen(true); setError(""); setIssues([]); setSuccess(""); }} className="inline-flex h-9 items-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-50">
        <UploadCloud size={14} /> Import CSV
      </button>
      {open && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="product-import-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-blue-700"><FileSpreadsheet size={18} /><h2 id="product-import-title" className="text-lg font-semibold text-slate-900">Import products from CSV</h2></div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Add up to 1,000 products to a store. Required columns are <code className="rounded bg-slate-100 px-1">name</code> and <code className="rounded bg-slate-100 px-1">price</code>.</p>
              </div>
              <button type="button" onClick={closeDialog} disabled={pending} aria-label="Close import dialog" className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-50"><X size={18} /></button>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-blue-50/70 px-4 py-3">
              <p className="text-xs leading-5 text-slate-600">Supports name, price, description, SKU, stock, category_id, and image_url.</p>
              <button type="button" onClick={downloadSample} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-blue-200 bg-white px-2.5 text-[11px] font-semibold text-blue-700 hover:bg-blue-50"><Download size={13} />Sample CSV</button>
            </div>

            {success && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800"><CheckCircle2 size={16} />{success}</p>}
            {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"><AlertCircle size={16} className="mt-0.5 shrink-0" />{error}</p>}
            {issues.length > 0 && (
              <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="mb-2 text-xs font-semibold text-amber-900">Fix these CSV values and upload again:</p>
                <ul className="space-y-1 text-[11px] text-amber-900">
                  {issues.slice(0, 100).map((issue, index) => <li key={`${issue.row}-${issue.field}-${index}`}>Row {issue.row}, {issue.field}: {issue.message}</li>)}
                </ul>
                {issues.length > 100 && <p className="mt-2 text-[11px] text-amber-800">Showing the first 100 errors of {issues.length}.</p>}
              </div>
            )}

            <form onSubmit={importProducts} className="mt-5 space-y-4">
              <label className="block text-xs font-medium text-slate-700">Add products to
                <select required value={storeId} onChange={(event) => setStoreId(event.target.value)} disabled={pending || stores.length === 0} className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50">
                  {stores.length === 0 && <option value="">No stores available</option>}
                  {stores.map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}
                </select>
              </label>
              <div
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
                onDrop={handleDrop}
                className={`rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors ${dragging ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-slate-50/70 hover:border-blue-300"}`}
              >
                <UploadCloud className="mx-auto text-blue-600" size={28} />
                <p className="mt-3 text-sm font-medium text-slate-800">{file ? file.name : "Drag and drop your CSV here"}</p>
                <p className="mt-1 text-xs text-slate-500">{file ? `${(file.size / 1024).toFixed(1)} KB` : "CSV files only, up to 2 MB"}</p>
                <input ref={inputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} disabled={pending} className="sr-only" aria-label="Choose CSV file" />
                <button type="button" onClick={() => inputRef.current?.click()} disabled={pending} className="mt-4 h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{file ? "Choose a different file" : "Browse files"}</button>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={closeDialog} disabled={pending} className="h-9 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50">Close</button>
                <button type="submit" disabled={pending || !file || stores.length === 0} className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <UploadCloud size={14} />{pending ? "Importing…" : "Import products"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
