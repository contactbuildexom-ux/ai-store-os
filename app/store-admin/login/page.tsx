'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Boxes, ArrowRight, Store, KeyRound, Globe, Sparkles } from 'lucide-react';

export default function StoreAdminLoginPage() {
  const router = useRouter();
  const [storeSlug, setStoreSlug] = useState('velvet-aura');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanSlug = storeSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSlug) {
      setError('Please enter your store slug or subdomain.');
      return;
    }

    setLoading(true);
    // Redirect to store admin dashboard
    router.push(`/store-admin/${cleanSlug}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-400 font-bold text-lg mb-2">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <Boxes size={20} />
            </span>
            <span>Buildexom AI</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-white">Store Admin Portal</h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to manage your products, themes, and WhatsApp orders
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Your Store Subdomain / Slug
            </label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white focus-within:border-emerald-500">
              <Globe size={15} className="text-slate-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="e.g. velvet-aura"
                value={storeSlug}
                onChange={(e) => setStoreSlug(e.target.value)}
                className="w-full bg-transparent outline-none font-mono"
                required
              />
              <span className="text-slate-500 font-mono text-[11px] shrink-0">.buildexom.store</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Admin Password
            </label>
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-xs text-white focus-within:border-emerald-500">
              <KeyRound size={15} className="text-slate-500 mr-2 shrink-0" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 disabled:opacity-60"
          >
            {loading ? 'Entering Dashboard...' : 'Enter Store Dashboard'}
            <ArrowRight size={15} />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-5 text-center text-xs text-slate-400 space-y-2">
          <p>
            Want to create a new store?{' '}
            <Link href="/" className="font-semibold text-emerald-400 hover:underline">
              Use the AI Store Builder on Home
            </Link>
          </p>
          <p>
            Platform developer?{' '}
            <Link href="/login" className="font-semibold text-slate-400 hover:text-white">
              Super Admin Login →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
