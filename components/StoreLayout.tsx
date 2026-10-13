'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Search, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  Globe, 
  ExternalLink,
  MessageCircle,
  Settings,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
  badge?: string;
  stock_status?: string;
}

export interface StoreLayoutProps {
  storeId?: string;
  storeSlug: string;
  storeName: string;
  tagline: string;
  description?: string;
  whatsappNumber: string;
  plan?: string;
  theme: {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    bgHero?: string;
    cardBg?: string;
    badgeStyle?: string;
  };
  products: ProductItem[];
}

interface CartItem {
  product: ProductItem;
  quantity: number;
}

export default function StoreLayout({
  storeSlug,
  storeName,
  tagline,
  description,
  whatsappNumber,
  plan = 'free',
  theme,
  products
}: StoreLayoutProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('Lahore');
  const [customerAddress, setCustomerAddress] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // AI Shopping Assistant chat state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: `Hi! 👋 I am your AI Shopping Assistant for ${storeName}. Ask me anything about our products, categories, or pricing!` }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/create-store/store-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: storeSlug, message: userMsg })
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.reply || "Sorry, I couldn't find matching items in the catalog." }
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Catalog assistant is temporarily offline. Please order directly via WhatsApp.' }
      ]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = customerCity.toLowerCase().trim() === 'lahore' ? 200 : 350;
  const grandTotal = cartTotal > 0 ? cartTotal + deliveryFee : 0;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Direct single-product WhatsApp order
  const handleDirectWhatsAppOrder = (product: ProductItem) => {
    const text = 
`Hello *${storeName}*! 👋%0A%0A` +
`I would like to place an order for:%0A` +
`🛍️ *Product:* ${encodeURIComponent(product.name)}%0A` +
`💰 *Price:* Rs. ${product.price.toLocaleString()}%0A` +
`📍 *Store Link:* https://${storeSlug}.buildexom.store%0A%0A` +
`Please confirm availability and share payment/delivery details! Thank you!`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '') || '923001234567';
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  // WhatsApp checkout for full cart
  const handleCartCheckout = () => {
    if (cart.length === 0) return;

    let itemsList = '';
    cart.forEach((item, index) => {
      itemsList += `${index + 1}. ${item.product.name} (x${item.quantity}) - Rs. ${(item.product.price * item.quantity).toLocaleString()}%0A`;
    });

    const text = 
`🛍️ *NEW ORDER - ${storeName.toUpperCase()}*%0A` +
`----------------------------------------%0A` +
`*Customer Name:* ${encodeURIComponent(customerName || 'Valued Customer')}%0A` +
`*City:* ${encodeURIComponent(customerCity)}%0A` +
`*Address:* ${encodeURIComponent(customerAddress || 'Will provide in chat')}%0A%0A` +
`*Items Ordered:*%0A${itemsList}%0A` +
`💵 *Subtotal:* Rs. ${cartTotal.toLocaleString()}%0A` +
`🚚 *Delivery Fee:* Rs. ${deliveryFee}%0A` +
`🏷️ *Grand Total:* Rs. ${grandTotal.toLocaleString()}%0A` +
`----------------------------------------%0A` +
`Please confirm my order. Thank you!`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '') || '923001234567';
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Subdomain & Platform Header Bar */}
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-[11px] text-emerald-400">
              <Globe size={11} /> {storeSlug}.buildexom.store
            </span>
            <span className="hidden items-center gap-1 rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline-flex">
              <Sparkles size={10} /> AI Storefront
            </span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
              {plan.toUpperCase()} PLAN
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-slate-400 sm:inline">🚚 Fast Nationwide Delivery</span>
            <Link 
              href={`/store-admin/${storeSlug}`} 
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-500"
            >
              <Settings size={12} /> Store Admin Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Store Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div 
              className="flex size-10 items-center justify-center rounded-xl font-bold text-white shadow-sm"
              style={{ backgroundColor: theme.primaryColor || '#0f172a' }}
            >
              {storeName.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {storeName}
              </h1>
              <p className="hidden text-xs text-slate-500 sm:block">{storeSlug}.buildexom.store</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative hidden max-w-xs flex-1 md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs transition focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Cart & WhatsApp Quick Action */}
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '923001234567'}?text=Hello%20${encodeURIComponent(storeName)}!`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:flex"
            >
              <MessageCircle size={14} className="text-emerald-600" /> WhatsApp Support
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
              style={{ backgroundColor: theme.primaryColor || '#0f172a' }}
            >
              <ShoppingBag size={16} />
              <span>Cart</span>
              {totalCartCount > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-emerald-400 text-[10px] font-bold text-slate-950">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="px-4 pb-3 md:hidden">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs transition focus:border-slate-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </header>

      {/* 3. Hero Section (Dynamic Theme Styling) */}
      <section 
        className="relative overflow-hidden py-16 px-6 text-white sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${theme.primaryColor || '#0f172a'} 0%, ${theme.secondaryColor || '#1e293b'} 100%)`
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-medium backdrop-blur-md">
            <Sparkles size={13} className="text-amber-300" /> Official Storefront • Verified Catalog
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {storeName}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-light text-slate-200 sm:text-lg">
            {tagline}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalog"
              className="rounded-full bg-white px-6 py-2.5 text-xs font-bold text-slate-900 shadow-lg transition hover:bg-slate-100"
            >
              Shop Collection
            </a>
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '923001234567'}?text=Hello%20${encodeURIComponent(storeName)}!%20I%20want%20to%20know%20more%20about%20your%20products.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <MessageCircle size={15} /> Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 4. Trust Badges Strip */}
      <div className="border-b border-slate-200 bg-white py-4 px-4">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">100% Genuine Products</p>
              <p className="text-[11px] text-slate-500">Quality checked before dispatch</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Truck size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Nationwide Cash on Delivery</p>
              <p className="text-[11px] text-slate-500">Fast 2-4 business days delivery</p>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <Headphones size={18} />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Direct WhatsApp Assistance</p>
              <p className="text-[11px] text-slate-500">Real-time support & order tracking</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Catalog & Category Filtering */}
      <main id="catalog" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Curated Catalog</span>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Product Image & Badges */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {product.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-slate-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                    {product.badge}
                  </span>
                )}
                {product.category && (
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-xs backdrop-blur-md">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                    {product.name}
                  </h4>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {product.description || 'Premium quality product manufactured to exacting standards.'}
                  </p>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <span className="text-lg font-black text-slate-900">
                      Rs. {product.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      ✓ In Stock
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-50"
                    >
                      <Plus size={13} /> Add to Cart
                    </button>
                    <button
                      onClick={() => handleDirectWhatsAppOrder(product)}
                      className="flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-500"
                    >
                      <MessageCircle size={13} /> WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <ShoppingBag size={32} className="mx-auto text-slate-400" />
              <h4 className="mt-3 text-base font-semibold text-slate-800">No products match your filter</h4>
              <p className="mt-1 text-xs text-slate-500">Try changing your search query or category filter.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* 6. Slide-Out Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl z-10">
            {/* Cart Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-slate-800" />
                <h3 className="font-bold text-slate-900">Your Shopping Cart</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {totalCartCount}
                </span>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex gap-3 border-b border-slate-100 pb-4">
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'}
                    alt={item.product.name}
                    className="size-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="truncate text-xs font-bold text-slate-900">{item.product.name}</h5>
                    <p className="mt-0.5 text-xs text-slate-500">Rs. {item.product.price.toLocaleString()}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-slate-200">
                        <button
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-900"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="px-2 py-1 text-slate-500 hover:text-slate-900"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="py-16 text-center">
                  <ShoppingBag size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">Your cart is currently empty</p>
                  <p className="mt-1 text-xs text-slate-400">Add products from our catalog to place your order.</p>
                </div>
              )}

              {/* Order Info Inputs */}
              {cart.length > 0 && (
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                  <p className="text-xs font-bold text-slate-800">Delivery Details</p>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={customerCity}
                      onChange={(e) => setCustomerCity(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                    >
                      <option value="Lahore">Lahore (Rs. 200)</option>
                      <option value="Karachi">Karachi (Rs. 350)</option>
                      <option value="Islamabad">Islamabad (Rs. 350)</option>
                      <option value="Rawalpindi">Rawalpindi (Rs. 350)</option>
                      <option value="Faisalabad">Faisalabad (Rs. 350)</option>
                      <option value="Other City">Other City (Rs. 350)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Delivery Address"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Footer & Checkout */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-5 space-y-3">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900">Rs. {cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee ({customerCity}):</span>
                    <span className="font-semibold text-slate-900">Rs. {deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-1.5">
                    <span>Grand Total:</span>
                    <span className="text-emerald-700">Rs. {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCartCheckout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-500"
                >
                  <MessageCircle size={16} /> Checkout via WhatsApp
                </button>
                <p className="text-center text-[10px] text-slate-400">
                  Clicking will open WhatsApp with your full order invoice details.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl space-y-3">
          <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
            <span>{storeName}</span>
            <span>•</span>
            <span className="font-mono text-emerald-700">{storeSlug}.buildexom.store</span>
          </div>
          <p className="max-w-md mx-auto text-slate-400">
            {description || 'Curated online shopping experience powered by the Buildexom AI Store Builder.'}
          </p>
          <div className="pt-4 text-[11px] text-slate-400">
            © {new Date().getFullYear()} {storeName}. Built with AI Store OS.
          </div>
        </div>
      </footer>

      {/* 8. Floating AI Shopping Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isAiChatOpen ? (
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl transition hover:bg-slate-800 hover:scale-105 border border-slate-700"
          >
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
              <Sparkles size={13} />
            </span>
            <span>Ask AI Assistant</span>
          </button>
        ) : (
          <div className="relative flex h-[480px] w-80 sm:w-96 flex-col rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden text-xs">
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <span className="grid size-7 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-bold">
                  <Sparkles size={14} />
                </span>
                <div>
                  <p className="font-bold text-xs">{storeName} AI</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Catalog Assistant Active</p>
                </div>
              </div>
              <button
                onClick={() => setIsAiChatOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'bg-slate-900 border border-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatSending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs text-slate-400 flex items-center gap-2">
                    <span className="size-2 animate-bounce rounded-full bg-emerald-400" />
                    <span className="size-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.2s]" />
                    <span className="size-2 animate-bounce rounded-full bg-emerald-400 [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChatMessage} className="border-t border-slate-800 bg-slate-900/60 p-3 flex gap-2">
              <input
                type="text"
                placeholder="Ask about perfumes, prices..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isChatSending || !chatInput.trim()}
                className="rounded-xl bg-emerald-600 px-3.5 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}