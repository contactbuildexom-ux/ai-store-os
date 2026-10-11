import { MessageCircle, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function WhatsappOrdering() {
  return (
    <section className="bg-slate-950 py-20 px-4 sm:px-6 border-t border-slate-800">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">High-Conversion Checkout</span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Direct WhatsApp Ordering Designed for Pakistani & Global Shoppers
          </h2>
          <p className="mt-4 text-xs text-slate-300 sm:text-sm leading-relaxed">
            Eliminate friction, cart abandonment, and complicated card portals. Customers simply tap "Order on WhatsApp" or check out their whole cart, generating an itemized message directly in your WhatsApp inbox with customer name, city, and delivery charges.
          </p>

          <div className="mt-6 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Pre-filled product title, price, quantity, and delivery fee calculation</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Confirm orders directly and build long-term customer relationships</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-emerald-400" />
              <span>Works seamlessly with Cash on Delivery (COD) and manual bank transfers</span>
            </div>
          </div>
        </div>

        {/* Mock WhatsApp Chat Box */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
            <div className="size-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
              VA
            </div>
            <div>
              <p className="font-bold text-white text-sm">Velvet Aura Orders</p>
              <p className="text-[11px] text-emerald-400 font-mono">Online • Direct Store Line</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#0b241d] p-4 text-xs text-emerald-100 font-mono leading-relaxed border border-emerald-800/40">
            <p className="font-bold text-white mb-1">🛍️ NEW ORDER - VELVET AURA</p>
            <p className="text-emerald-300">----------------------------------------</p>
            <p>*Customer Name:* Muhammad Ali</p>
            <p>*City:* Lahore</p>
            <p>*Address:* Gulberg III, Main Boulevard</p>
            <p className="mt-2">*Items Ordered:*</p>
            <p>1. Velvet Royal Amber Oud (x1) - Rs. 6,500</p>
            <p>2. Imperial White Musk (x1) - Rs. 3,200</p>
            <p className="text-emerald-300">----------------------------------------</p>
            <p>💵 *Subtotal:* Rs. 9,700</p>
            <p>🚚 *Delivery Fee:* Rs. 200</p>
            <p className="font-bold text-emerald-400">🏷️ *Grand Total:* Rs. 9,900</p>
          </div>
        </div>
      </div>
    </section>
  );
}
