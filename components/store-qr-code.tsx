'use client';

import { useId } from 'react';
import { Download, ExternalLink, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

type StoreQRCodeProps = {
  storeSlug: string;
};

export function StoreQRCode({ storeSlug }: StoreQRCodeProps) {
  const reactId = useId();
  const downloadId = `store-qr-${reactId.replace(/:/g, '')}`;
  const safeSlug = storeSlug.trim();
  const storeUrl = `https://ai-store-os.vercel.app/store/${encodeURIComponent(safeSlug)}`;

  function downloadQrCode() {
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
    URL.revokeObjectURL(objectUrl);
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
              src: "/logo-b.png", // Apne public folder mein 'logo-b.png' ke naam se icon rakh dein
              height: 40,
              width: 40,
              excavate: true, // Yeh QR dots ko logo ke peechay se hata kar saaf jagah banata hai
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
      </div>

      <button
        type="button"
        onClick={downloadQrCode}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <Download size={15} aria-hidden="true" />
        Download QR code (SVG)
      </button>
      <p className="mt-2 text-center text-[10px] leading-4 text-slate-400">Scalable SVG file, ready to share or print.</p>
    </section>
  );
}