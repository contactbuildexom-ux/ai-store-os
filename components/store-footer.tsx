'use client';

import Link from 'next/link';
import { Landmark, Smartphone, ShieldCheck, Truck, Headphones, RotateCcw, MapPin, Phone, Mail } from 'lucide-react';
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
    : (themeColor && THEME_PALETTES[themeColor]) || '#0f172a';
  const footerBgDark = darkenColor(resolvedThemeColor, 60);
  const footerBgDarker = darkenColor(resolvedThemeColor, 80);

  return (
    <footer 
      className="mt-12 border-t text-white transition-colors"
      style={{
        background: `linear-gradient(180deg, ${footerBgDark} 0%, ${footerBgDarker} 100%)`,
        borderColor: `${resolvedThemeColor}40`,
      }}
    >
      {/* 1. Value Proposition & Trust Badges Strip (Responsive Grid) */}
      <div 
        className="border-b px-4 py-8 sm:px-8"
        style={{
          backgroundColor: `${resolvedThemeColor}18`,
          borderColor: `${resolvedThemeColor}30`,
        }}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <span 
              className="grid size-10 shrink-0 place-items-center rounded-xl shadow-xs text-white"
              style={{ backgroundColor: resolvedThemeColor }}
            >
              <Truck size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-300">Fast Cash on Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span 
              className="grid size-10 shrink-0 place-items-center rounded-xl shadow-xs text-white"
              style={{ backgroundColor: resolvedThemeColor }}
            >
              <ShieldCheck size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">100% Genuine</h4>
              <p className="text-[11px] text-slate-300">Verified Quality Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span 
              className="grid size-10 shrink-0 place-items-center rounded-xl shadow-xs text-white"
              style={{ backgroundColor: resolvedThemeColor }}
            >
              <Headphones size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">WhatsApp Support</h4>
              <p className="text-[11px] text-slate-300">Instant Order Updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span 
              className="grid size-10 shrink-0 place-items-center rounded-xl shadow-xs text-white"
              style={{ backgroundColor: resolvedThemeColor }}
            >
              <RotateCcw size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-white">Easy Exchanges</h4>
              <p className="text-[11px] text-slate-300">Hassle-Free Policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body (Desktop 4-Column Aligned & Mobile Responsive) */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 items-start">
          {/* Column 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="grid size-8 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-white/20 overflow-hidden">
                <img
                  src={BUILDEXOM_ICON_DATA_URL}
                  alt={storeName}
                  className="size-full object-contain"
                />
              </div>
              <h3 className="text-base font-extrabold tracking-tight text-white">{storeName}</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">
              Welcome to our official online store. Explore our catalog of quality products with verified nationwide shipping and Cash on Delivery.
            </p>
            {storeSlug && (
              <p className="font-mono text-[11px] font-semibold text-emerald-300">
                {storeSlug}.buildexom.store
              </p>
            )}
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <a href="#featured" className="transition hover:text-white hover:underline">
                  Featured Products
                </a>
              </li>
              <li>
                <a href="#categories" className="transition hover:text-white hover:underline">
                  Shop by Category
                </a>
              </li>
              <li>
                <a href="#products" className="transition hover:text-white hover:underline">
                  Full Catalog
                </a>
              </li>
              <li>
                <span className="text-slate-400">Order Tracking via WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect With Us */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Connect With Us</h4>
            <p className="text-xs text-slate-300">
              Follow our official social profiles for special discounts and new product drops.
            </p>
            <div className="pt-1">
              <StoreSocialLinks links={socialLinks} />
            </div>
          </div>

          {/* Column 4: Scan & Shop QR Code (Aligned cleanly with columns) */}
          {storeSlug && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Scan & Shop</h4>
              <p className="text-xs text-slate-300">
                Scan this QR code with any smartphone camera to open and share this store.
              </p>
              <div className="pt-1">
                <StoreQRCode 
                  storeSlug={storeSlug} 
                  storePath={`/store/${encodeURIComponent(storeSlug)}`} 
                  title={`${storeName} QR Code`}
                  badge="Active"
                  showCardHeader={false}
                  className="!max-w-[220px] !p-3 !shadow-none !border-white/20 !rounded-2xl"
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
            style={{ borderColor: `${resolvedThemeColor}35` }}
          >
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Advance Payment Accounts</p>
              <h4 id="store-payment-details" className="mt-1 text-sm font-bold text-white">
                Direct Bank & Wallet Details for {storeName}
              </h4>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {availableAccounts.map(({ name, icon: Icon, accent, values }) => (
                <div key={name} className="rounded-xl border border-white/15 bg-white p-3.5 shadow-sm text-slate-900">
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
          className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-center text-xs text-slate-400 sm:flex-row"
          style={{ borderColor: `${resolvedThemeColor}30` }}
        >
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span>Powered by</span>
            <span className="font-bold text-white">Buildexom AI Store OS</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">100% Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
