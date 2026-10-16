'use client';

import { useEffect, useId, useState } from 'react';
import { Download, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { isPublicStorefrontResponse } from '@/lib/storefront-types';

type StoreQRCodeProps = {
  storeSlug: string;
  storePath?: string;
};

export function StoreQRCode({ storeSlug, storePath }: StoreQRCodeProps) {
  const reactId = useId();
  const downloadId = `store-qr-${reactId.replace(/:/g, '')}`;
  const safeSlug = storeSlug.trim();
  const [storeUrl, setStoreUrl] = useState('');
  const [qrError, setQrError] = useState('');

  useEffect(() => {
    if (!safeSlug) return;
    const controller = new AbortController();

    async function loadStoreUrl() {
      setStoreUrl('');
      setQrError('');
      try {
        const response = await fetch(`/api/stores/${encodeURIComponent(safeSlug)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          const errorMessage = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load this store.';
          throw new Error(errorMessage);
        }
        if (!isPublicStorefrontResponse(payload) || payload.store.slug !== safeSlug) {
          throw new Error('The store returned invalid QR code data.');
        }

        const path = storePath || `/store/${encodeURIComponent(payload.store.slug)}`;
        setStoreUrl(new URL(path, window.location.origin).toString());
      } catch (error) {
        if (controller.signal.aborted) return;
        setQrError(error instanceof Error ? error.message : 'Unable to load the store QR code.');
      }
    }

    void loadStoreUrl();
    return () => controller.abort();
  }, [safeSlug, storePath]);

  function downloadQrCode() {
    if (!storeUrl) return;
    const svg = document.getElementById(downloadId);
    if (!(svg instanceof SVGSVGElement)) return;

    const svgContent = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `${safeSlug || 'store'}-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }

  if (!safeSlug) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby={`${downloadId}-title`}>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <QrCode size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${downloadId}-title`} className="text-sm font-semibold text-slate-900">Store QR Code</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Let customers scan to open your public storefront.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center rounded-xl border border-slate-100 bg-slate-50/70 p-5">
        {storeUrl ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <QRCodeSVG
                id={downloadId}
                value={storeUrl}
                size={192}
                level="H"
                marginSize={4}
                title={`QR code for ${safeSlug} storefront`}
                bgColor="#ffffff"
                fgColor="#0f172a"
                imageSettings={{
                  src: "/logo.jpg",
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
            </div>
            <a
              href={storeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex max-w-full items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              <span className="truncate">{storeUrl}</span>
              <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
            </a>
          </>
        ) : (
          <p className={qrError ? 'text-xs text-red-700' : 'text-xs text-slate-500'} role={qrError ? 'alert' : 'status'}>
            {qrError || 'Loading store QR code…'}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={downloadQrCode}
        disabled={!storeUrl}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={15} aria-hidden="true" />
        Download QR code (SVG)
      </button>
      <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">Scalable SVG file, ready to share or print.</p>
    </section>
  );
}