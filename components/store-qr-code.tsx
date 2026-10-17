'use client';

import { useEffect, useId, useState } from 'react';
import { Download, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { isPublicStorefrontResponse } from '@/lib/storefront-types';

type StoreQRCodeProps = {
  storeSlug: string;
  storePath?: string;
  title?: string;
  badge?: string;
  className?: string;
  showCardHeader?: boolean;
};

// Embedded SVG data URI with Buildexom "B" logo with dark navy to electric blue gradient
const BUILDEXOM_LOGO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><linearGradient id="bgrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%230b2545"/><stop offset="100%" stop-color="%231976d2"/></linearGradient></defs><rect width="48" height="48" rx="10" fill="url(%23bgrad)"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="28">B</text></svg>`;

export function StoreQRCode({ 
  storeSlug, 
  storePath, 
  title = "Your store QR", 
  badge = "Sample",
  className = "",
  showCardHeader = true
}: StoreQRCodeProps) {
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
    <section 
      className={`mx-auto w-full max-w-[360px] overflow-hidden rounded-3xl border border-blue-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md ${className}`} 
      aria-labelledby={`${downloadId}-title`}
    >
      {/* Top decorative gradient strip */}
      <div className="h-1.5 -mx-5 sm:-mx-6 -mt-5 sm:-mt-6 mb-5 bg-gradient-to-r from-[#0b2545] via-[#1976d2] to-[#4a9bf0]" />

      {/* Header matching screenshot media_1792254366140.jpg */}
      {showCardHeader && (
        <div className="flex items-center justify-between">
          <h2 id={`${downloadId}-title`} className="text-sm font-bold text-[#0b2545]">
            {title}
          </h2>
          <span className="rounded-full bg-[#e6f1ff] px-2.5 py-1 text-[11px] font-bold text-[#1976d2]">
            {badge}
          </span>
        </div>
      )}

      {/* Main Light Blue Box matching screenshot */}
      <div className="mt-4 rounded-2xl bg-[#f1f7ff] p-5 ring-1 ring-blue-100 flex flex-col items-center">
        {storeUrl ? (
          <>
            {/* Inner White QR Card with rounded corners and shadow */}
            <div className="relative mx-auto w-fit rounded-xl bg-white p-3 sm:p-3.5 shadow-sm">
              <QRCodeSVG
                id={downloadId}
                value={storeUrl}
                size={176}
                level="H"
                marginSize={2}
                title={`QR code for ${safeSlug} storefront`}
                bgColor="#ffffff"
                fgColor="#0b2545"
                imageSettings={{
                  src: BUILDEXOM_LOGO_SVG,
                  height: 38,
                  width: 38,
                  excavate: true,
                }}
              />

              {/* Exact Central 'B' Badge matching screenshot */}
              <div 
                className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg bg-white p-0.5 shadow-xs pointer-events-none"
                aria-hidden="true"
              >
                <span className="flex size-full items-center justify-center rounded-md bg-gradient-to-br from-[#0b2545] to-[#1976d2] text-sm font-bold text-white shadow-2xs">
                  B
                </span>
              </div>
            </div>

            {/* Bottom text matching screenshot */}
            <p className="mt-3 text-center text-xs font-semibold text-slate-600">
              Scan to visit the store
            </p>
          </>
        ) : (
          <div className="py-8 text-center">
            <p className={qrError ? 'text-xs font-medium text-rose-600' : 'text-xs text-slate-500'} role={qrError ? 'alert' : 'status'}>
              {qrError || 'Generating store QR code…'}
            </p>
          </div>
        )}
      </div>

      {/* Storefront Link & Actions */}
      {storeUrl && (
        <div className="mt-3 text-center">
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex max-w-full items-center gap-1.5 text-xs font-semibold text-[#1976d2] hover:text-[#0b2545] hover:underline"
          >
            <span className="truncate">{storeUrl}</span>
            <ExternalLink size={13} className="shrink-0" aria-hidden="true" />
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={downloadQrCode}
        disabled={!storeUrl}
        className="mt-3.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0b2545] px-4 text-xs font-bold text-white transition hover:bg-[#1976d2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
      >
        <Download size={15} aria-hidden="true" />
        Download QR code (SVG)
      </button>
      <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
        Scalable vector QR code ready to print on product packaging, delivery bags, and flyers.
      </p>
    </section>
  );
}