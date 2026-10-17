'use client';

import Link from 'next/link';
import { Landmark, Smartphone, ShieldCheck, Truck, Headphones, RotateCcw, MapPin, Phone, Mail } from 'lucide-react';
import { StoreSocialLinks } from './store-social-links';
import { StoreQRCode } from './store-qr-code';

type StorePaymentDetails = {
  bank_name: string;
  account_title: string;
  account_number: string;
  iban: string;
  jazzcash_number: string;
  jazzcash_title: string;
  easypaisa_number: string;
  easypaisa_title: string;
};

export function StoreFooter({ storeName, storeSlug, paymentDetails, socialLinks }: {
  storeName: string;
  storeSlug?: string;
  paymentDetails?: Partial<StorePaymentDetails>;
  socialLinks?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
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
  ].map((account) => ({ ...account, values: account.values.filter(([, value]) => value && value.trim()) }));

  const availableAccounts = accounts.filter((account) => account.values.length > 0);

  return (
    <footer className="mt-12 border-t border-slate-200/90 bg-white">
      {/* 1. Value Proposition & Trust Badges Strip (Responsive Grid) */}
      <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-8 sm:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-100 text-blue-700 shadow-xs">
              <Truck size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Nationwide Delivery</h4>
              <p className="text-[11px] text-slate-500">Fast Cash on Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 shadow-xs">
              <ShieldCheck size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine</h4>
              <p className="text-[11px] text-slate-500">Verified Quality Items</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-100 text-purple-700 shadow-xs">
              <Headphones size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">WhatsApp Support</h4>
              <p className="text-[11px] text-slate-500">Instant Order Updates</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
              <RotateCcw size={18} />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Easy Exchanges</h4>
              <p className="text-[11px] text-slate-500">Hassle-Free Policy</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Body (Desktop Multi-Column & Mobile Responsive) */}
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-xl bg-blue-600 font-extrabold text-white text-sm shadow-xs">
                {storeName.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-base font-extrabold tracking-tight text-slate-900">{storeName}</h3>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Welcome to our official online store. Explore our handpicked catalog of premium quality products with verified nationwide shipping and Cash on Delivery.
            </p>
            {storeSlug && (
              <p className="font-mono text-[11px] font-semibold text-blue-700">
                {storeSlug}.buildexom.store
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <a href="#featured" className="transition hover:text-blue-600 hover:underline">
                  Featured Products
                </a>
              </li>
              <li>
                <a href="#categories" className="transition hover:text-blue-600 hover:underline">
                  Shop by Category
                </a>
              </li>
              <li>
                <a href="#products" className="transition hover:text-blue-600 hover:underline">
                  Full Catalog
                </a>
              </li>
              <li>
                <span className="text-slate-400">Order Tracking via WhatsApp</span>
              </li>
            </ul>
          </div>

          {/* Customer Support & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Connect With Us</h4>
            <p className="text-xs text-slate-500">
              Follow our official social profiles for special discounts and new product drops.
            </p>
            <div className="pt-1">
              <StoreSocialLinks links={socialLinks} />
            </div>
          </div>

          {/* Store QR Code / Sharing */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Scan & Shop</h4>
            <p className="text-xs text-slate-500">
              Scan this QR code with any smartphone camera to open and share this store.
            </p>
            {storeSlug && (
              <StoreQRCode 
                storeSlug={storeSlug} 
                storePath={`/store/${encodeURIComponent(storeSlug)}`} 
                title="Your store QR"
                badge="Active"
              />
            )}
          </div>
        </div>

        {/* Advance Payment Details Section (if configured) */}
        {availableAccounts.length > 0 && (
          <section aria-labelledby="store-payment-details" className="mt-10 border-t border-slate-100 pt-8">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Advance Payment Accounts</p>
              <h4 id="store-payment-details" className="mt-1 text-sm font-bold text-slate-800">
                Direct Bank & Wallet Details for {storeName}
              </h4>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {availableAccounts.map(({ name, icon: Icon, accent, values }) => (
                <div key={name} className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
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
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Powered by</span>
            <span className="font-bold text-slate-800">Buildexom AI Store OS</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold">100% Secure Checkout</span>
          </div>
        </div>
      </div>
    </footer>
  );
}