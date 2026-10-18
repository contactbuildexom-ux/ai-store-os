'use client';

import { useEffect, useId, useState } from 'react';
import { Download, ExternalLink, QrCode, Copy, Check } from 'lucide-react';
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

// Official Buildexom Brand Logo Mark (Hexagon Store Awning Icon)
export const BUILDEXOM_ICON_DATA_URL = 'data:image/jpeg;base64,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';

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
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    if (!storeUrl) return;
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
                  src: BUILDEXOM_ICON_DATA_URL,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />

              {/* Exact Central Buildexom Logo Mark matching uploaded image */}
              <div 
                className="absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white p-1 shadow-md ring-1 ring-slate-100 pointer-events-none"
                aria-hidden="true"
              >
                <img
                  src={BUILDEXOM_ICON_DATA_URL}
                  alt="Buildexom Logo"
                  className="size-full object-contain"
                />
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

      {/* Storefront Actions: Copy Link & Download (Only 'Download') */}
      {storeUrl && (
        <div className="mt-4 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:border-slate-300"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-slate-500" />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            type="button"
            onClick={downloadQrCode}
            disabled={!storeUrl}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0b2545] px-3 text-xs font-bold text-white shadow-2xs transition hover:bg-[#1976d2] disabled:opacity-50"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      )}
      <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">
        Scalable vector QR code ready to print on packaging and flyers.
      </p>
    </section>
  );
}