'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does AI generate my store from a prompt?',
      a: 'Our AI engine analyzes your niche (e.g. perfume, clothing, tech), curates matching products with prices in PKR, writes persuasive product descriptions, assigns a matching color theme, and provisions a unique subdomain on our domain.'
    },
    {
      q: 'What is the difference between Super Admin and Store Admin?',
      a: 'Super Admin is for the development and platform team to monitor all stores, global metrics, and sellers. Store Admin is given to the customer who created the store to manage their own products (add, edit, delete), customize themes, and set WhatsApp delivery rates.'
    },
    {
      q: 'How does WhatsApp checkout work?',
      a: 'Customers browse your store, pick their products, and click "Order via WhatsApp". An itemized invoice message is automatically composed with the customer’s name, city, delivery fee, and total amount, opening directly into your WhatsApp business chat.'
    },
    {
      q: 'Can I change my products and theme after AI creates the store?',
      a: 'Yes, 100%! Log in to your Store Admin dashboard at /store-admin/[your-store-slug]. You can add new products, edit existing ones, upload images, change theme colors, and tweak taglines anytime.'
    },
    {
      q: 'What is MCP (Model Context Protocol) AI integration?',
      a: 'Model Context Protocol (MCP) is an open AI standard implemented at /api/mcp. It allows AI agents, Cursor, Claude Desktop, and our built-in assistants to interact directly with your store catalog, check plan limits, and generate new products programmatically.'
    }
  ];

  return (
    <section id="faq" className="bg-slate-900 py-20 px-4 sm:px-6 border-t border-slate-800">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Got Questions?</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-emerald-400"
              >
                <span>{f.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${openIndex === i ? 'rotate-180 text-emerald-400' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
