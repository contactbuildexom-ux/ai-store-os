'use client';

import Link from 'next/link';
import { Landmark, Smartphone, ShieldCheck, Truck, Headphones, RotateCcw, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import { StoreSocialLinks } from './store-social-links';
import { StoreQRCode, BUILDEXOM_ICON_DATA_URL } from './store-qr-code';
import { THEME_PALETTES, darkenColor } from '@/lib/store-theme';

type StorePaymentDetails = {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
  sadapay_number?: string;
  sadapay_title?: string;
};

export function StoreFooter({ 
  storeName, 
  storeSlug, 
  paymentDetails, 
  socialLinks, 
  themeColor,
}: {
  storeName: string;
  storeSlug?: string;
  paymentDetails?: Partial<StorePaymentDetails>;
  socialLinks?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
  themeColor?: string;
}) {
  const safePayments = {
    bank_name: paymentDetails?.bank_name || '',
    account_title: paymentDetails?.account_title || '',
    account_number: paymentDetails?.account_number || '',
    iban: paymentDetails?.iban || '',
    jazzcash_number: paymentDetails?.jazzcash_number || '',
    jazzcash_title: paymentDetails?.jazzcash_title || '',
    easypaisa_number: paymentDetails?.easypaisa_number || '',
    easypaisa_title: paymentDetails?.easypaisa_title || '',
    sadapay_number: paymentDetails?.sadapay_number || '',
    sadapay_title: paymentDetails?.sadapay_title || '',
  };

  const accounts = [
    {
      name: 'Bank Transfer',
      icon: Landmark,
      accent: 'bg-blue-50 text-blue-700 border-blue-200',
      values: [
        ['Bank', safePayments.bank_name],
        ['Title', safePayments.account_title],
        ['Account #', safePayments.account_number],
        ['IBAN', safePayments.iban],
      ] as const,
    },
    {
      name: 'JazzCash',
      icon: Smartphone,
      accent: 'bg-rose-50 text-rose-700 border-rose-200',
      values: [
        ['Account Title', safePayments.jazzcash_title],
        ['Mobile Number', safePayments.jazzcash_number],
      ] as const,
    },
    {
      name: 'EasyPaisa',
      icon: Smartphone,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      values: [
        ['Account Title', safePayments.easypaisa_title],
        ['Mobile Number', safePayments.easypaisa_number],
      ] as const,
    },
    {
      name: 'SadaPay',
      icon: Smartphone,
      accent: 'bg-teal-50 text-teal-700 border-teal-200',
      values: [
        ['Account Title', safePayments.sadapay_title],
        ['Mobile Number', safePayments.sadapay_number],
      ] as const,
    },
  ].map((account) => ({ ...account, values: account.values.filter(([, value]) => value && value.trim()) }));

  const availableAccounts = accounts.filter((account) => account.values.length > 0);

  const resolvedThemeColor = themeColor?.startsWith('#') 
    ? themeColor 
    : (themeColor && THEME_PALETTES[themeColor]) || '#1976d2';

  return (
    <footer 
      className="mt-6 sm:mt-10 border-t-2 text-slate-900 transition-colors shadow-[0_-8px_30px_-5px_rgba(0,0,0,0.03)]"
      style={{
        backgroundColor: `${resolvedThemeColor}0c`,
        borderColor: `${resolvedThemeColor}28`,
      }}
    >
      {/* 1. Value Proposition & Trust Badges Strip (Responsive Sleek Grid Separator) */}
      <div 
        className="border-b px-4 py-3.5 sm:px-8"
        style={{
          backgroundColor: `${resolvedThemeColor}14`,
          borderColor: `${resolvedThemeColor}22`,
        }}
      >
        <div className="w-full grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="flex items-center gap-3.5 rounded-2xl p-2 transition hover:bg-white/40">
            <span 
              className="grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform duration-300 hover:scale-105"
              style={{ 
                backgroundColor: `${resolvedThemeColor}18`, 
                borderColor: `${resolvedThemeColor}35`, 
                color: resolvedThemeColor 
              }}
            >
              <Truck size={20} strokeWidth={2} />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-tight text-slate-900">Nationwide Delivery</h4>
              <p className="text-[11px] font-medium text-slate-600">Fast Cash on Delivery</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl p-2 transition hover:bg-white/40">
            <span 
              className="grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform duration-300 hover:scale-105"
              style={{ 
                backgroundColor: `${resolvedThemeColor}18`, 
                borderColor: `${resolvedThemeColor}35`, 
                color: resolvedThemeColor 
              }}
            >
              <ShieldCheck size={20} strokeWidth={2} />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-tight text-slate-900">100% Genuine Quality</h4>
              <p className="text-[11px] font-medium text-slate-600">Verified Quality Items</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl p-2 transition hover:bg-white/40">
            <span 
              className="grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform duration-300 hover:scale-105"
              style={{ 
                backgroundColor: `${resolvedThemeColor}18`, 
                borderColor: `${resolvedThemeColor}35`, 
                color: resolvedThemeColor 
              }}
            >
              <MessageCircle size={20} strokeWidth={2} />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-tight text-slate-900">WhatsApp Support</h4>
              <p className="text-[11px] font-medium text-slate-600">Instant Order Updates</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl p-2 transition hover:bg-white/40">
            <span 
              className="grid size-11 shrink-0 place-items-center rounded-2xl border shadow-2xs transition-transform duration-300 hover:scale-105"
              style={{ 
                backgroundColor: `${resolvedThemeColor}18`, 
                borderColor: `${resolvedThemeColor}35`, 
                color: resolvedThemeColor 
              }}
            >
              <RotateCcw size={20} strokeWidth={2} />
            </span>
            <div>
              <h4 className="text-xs font-extrabold tracking-tight text-slate-900">Easy Exchanges</h4>
              <p className="text-[11px] font-medium text-slate-600">Hassle-Free Policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body (Desktop 4-Column Aligned & Mobile Responsive) */}
      <div className="w-full px-4 py-10 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200 overflow-hidden">
                <img
                  src={BUILDEXOM_ICON_DATA_URL}
                  alt={storeName}
                  className="size-full object-contain"
                />
              </div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">{storeName}</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              Welcome to our official online store. Explore our catalog of quality products with verified nationwide shipping and Cash on Delivery.
            </p>
            {storeSlug && (
              <p className="font-mono text-[11px] font-semibold text-emerald-700">
                {storeSlug}.buildexom.store
              </p>
            )}
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#featured" className="transition hover:text-slate-950 hover:underline">
                  Featured Products
                </a>
              </li>
              <li>
                <a href="#categories" className="transition hover:text-slate-950 hover:underline">
                  Shop by Category
                </a>
              </li>
              <li>
                <a href="#products" className="transition hover:text-slate-950 hover:underline">
                  Full Catalog
                </a>
              </li>
              <li>
                <span className="text-slate-500">Order Tracking via WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect With Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Connect With Us</h4>
            <p className="text-xs text-slate-600">
              Follow our official social profiles for special discounts and new product drops.
            </p>
            <div className="pt-1">
              <StoreSocialLinks links={socialLinks} />
            </div>
          </div>

          {/* Column 4: Scan & Shop QR Code (Compact & Aligned cleanly with columns) */}
          {storeSlug && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Scan & Shop</h4>
              <p className="text-xs text-slate-600">
                Scan this QR code with any smartphone camera to open and share this store.
              </p>
              <div className="pt-1">
                <StoreQRCode 
                  storeSlug={storeSlug} 
                  storePath={`/store/${encodeURIComponent(storeSlug)}`} 
                  compact={true}
                  themeColor={resolvedThemeColor}
                  hideButtons={true}
                  className="w-full max-w-[260px] mx-auto sm:mx-0 !p-3.5 !shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Advance Payment Details Section (if configured) */}
        {availableAccounts.length > 0 && (
          <section 
            aria-labelledby="store-payment-details" 
            className="mt-10 border-t pt-8"
            style={{ borderColor: `${resolvedThemeColor}30` }}
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Advance Payment Accounts</p>
              <h4 id="store-payment-details" className="mt-1 text-sm font-bold text-slate-900">
                Direct Bank & Wallet Details for {storeName}
              </h4>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {availableAccounts.map(({ name, icon: Icon, accent, values }) => (
                <div key={name} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm text-slate-900">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className={`grid size-7 place-items-center rounded-lg ${accent}`}><Icon size={14} /></span>
                    <span className="text-xs font-bold text-slate-900">{name}</span>
                  </div>
                  <dl className="mt-2.5 space-y-1.5">
                    {values.map(([label, value]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <dt className="text-slate-400 text-[10px] uppercase font-medium">{label}:</dt>
                        <dd className="font-semibold text-slate-800 break-all">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Copyright & OS badge */}
        <div 
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center text-xs text-slate-500 sm:flex-row"
          style={{ borderColor: `${resolvedThemeColor}25` }}
        >
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-600">
            <span>Powered by</span>
            <span className="font-bold text-slate-900">Buildexom AI Store OS</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">100% Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
