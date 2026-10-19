'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { StoreQRCode, BUILDEXOM_ICON_DATA_URL } from '@/components/store-qr-code';
import { StoreSocialLinks } from '@/components/store-social-links';
import { StoreFooter } from '@/components/store-footer';
import {
  isPublicStorefrontResponse,
  isStoreAssistantResponse,
  type StoreAssistantRequest,
} from '@/lib/storefront-types';
import { resolveStoreHero } from '@/lib/ai/hero-niche-resolver';
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
  ArrowRight,
  Menu,
  ChevronRight
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
  socialLinks?: Partial<Record<'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'x', string>>;
}

interface CartItem {
  product: ProductItem;
  quantity: number;
}

export default function StoreLayout({
  storeSlug,
  storeName: initialStoreName,
  tagline: initialTagline,
  description: initialDescription,
  whatsappNumber: initialWhatsappNumber,
  plan: initialPlan = 'free',
  theme,
  products: initialProducts,
  socialLinks
}: StoreLayoutProps) {
  const [storeName, setStoreName] = useState(initialStoreName);
  const [tagline, setTagline] = useState(initialTagline);
  const [description, setDescription] = useState(initialDescription || '');
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [plan, setPlan] = useState(initialPlan);
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCity, setCustomerCity] = useState('Lahore');
  const [customerZip, setCustomerZip] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const themeColor = theme?.primaryColor || '#10b981';

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  const defaultFeatured: ProductItem[] = [
    {
      id: 'feat-1',
      name: 'Running Shoes',
      price: 12000,
      image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
      description: 'Ultra-lightweight responsive performance running shoes with all-day comfort.'
    },
    {
      id: 'feat-2',
      name: 'Hoodie',
      price: 8200,
      image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      description: 'Premium heavyweight cotton fleece hoodie with minimalist tailored fit.'
    },
    {
      id: 'feat-3',
      name: 'Cap',
      price: 2499,
      image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
      description: 'Structured classic baseball cap with breathable eyelets and adjustable strap.'
    },
    {
      id: 'feat-4',
      name: 'Smart Watch',
      price: 14000,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
      description: 'Next-gen AMOLED health & fitness tracker with high accuracy sensors.'
    }
  ];

  const featuredItems = useMemo(() => {
    if (products.length >= 4) {
      return products.slice(0, 4);
    }
    if (products.length > 0) {
      return [...products, ...defaultFeatured.slice(products.length, 4)];
    }
    return defaultFeatured;
  }, [products]);

  // Dynamic Niche & Hero Info
  const heroInfo = useMemo(
    () => resolveStoreHero({ name: storeName, tagline, description }, products),
    [storeName, tagline, description, products]
  );

  // Bexi AI Shopping Assistant chat state
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: `Assalam-o-Alaikum / Hello! 👋 Main hoon **Bexi AI**, **${storeName}** ka personal shopping assistant.\n\nAap mujh se Roman Urdu ya English mein products, prices, bestsellers, ya delivery ke baray mein pooch saktay hain! 🛍️`
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function refreshCatalog() {
      setCatalogLoading(true);
      setCatalogError('');
      try {
        const response = await fetch(`/api/stores/${encodeURIComponent(storeSlug)}`, {
          cache: 'no-store',
          signal: controller.signal,
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          const errorMessage = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to refresh the store catalog.';
          throw new Error(errorMessage);
        }
        if (!isPublicStorefrontResponse(payload) || payload.store.slug !== storeSlug) {
          throw new Error('The store returned an invalid catalog response.');
        }

        setStoreName(payload.store.name);
        setTagline(payload.store.tagline);
        setDescription(payload.store.description);
        setWhatsappNumber(payload.store.whatsapp_number);
        setPlan(payload.store.plan);
        setProducts(payload.products);
      } catch (error) {
        if (controller.signal.aborted) return;
        setCatalogError(error instanceof Error ? error.message : 'Unable to refresh the store catalog.');
      } finally {
        if (!controller.signal.aborted) setCatalogLoading(false);
      }
    }

    void refreshCatalog();
    return () => controller.abort();
  }, [storeSlug]);

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatSending) return;

    const userMsg = chatInput.trim();
    const requestBody: StoreAssistantRequest = { message: userMsg };
    setChatInput('');
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setIsChatSending(true);

    try {
      const res = await fetch(`/api/stores/${encodeURIComponent(storeSlug)}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        const errorMessage = typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string'
          ? data.error
          : 'The assistant could not process your message.';
        throw new Error(errorMessage);
      }
      if (!isStoreAssistantResponse(data)) {
        throw new Error('The assistant returned an invalid response.');
      }
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: data.reply }
      ]);
    } catch (error) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: error instanceof Error
            ? `The catalog assistant is unavailable: ${error.message}`
            : 'The catalog assistant is temporarily unavailable. Please try again.',
        }
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
`🛍️ *NEW ORDER — ${storeName.toUpperCase()}*%0A` +
`----------------------------------------%0A` +
`👤 *CUSTOMER DETAILS:*%0A` +
`• *Name:* ${encodeURIComponent(customerName || 'Valued Customer')}%0A` +
`• *Email:* ${encodeURIComponent(customerEmail || 'Not provided')}%0A` +
`• *Phone:* ${encodeURIComponent(customerPhone || 'Not provided')}%0A` +
`• *City:* ${encodeURIComponent(customerCity)}%0A` +
`• *Postal / Zip Code:* ${encodeURIComponent(customerZip || 'N/A')}%0A` +
`• *Delivery Address:* ${encodeURIComponent(customerAddress || 'Will provide in chat')}%0A%0A` +
`📦 *ITEMS ORDERED:*%0A${itemsList}%0A` +
`💵 *Subtotal:* Rs. ${cartTotal.toLocaleString()}%0A` +
`🚚 *Delivery Fee:* Rs. ${deliveryFee}%0A` +
`🏷️ *Grand Total:* Rs. ${grandTotal.toLocaleString()}%0A` +
`💳 *Payment Method:* Cash on Delivery (COD)%0A` +
`----------------------------------------%0A` +
`Please confirm my order. Thank you!`;

    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '') || '923001234567';
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white">
      {catalogLoading && (
        <p role="status" className="bg-blue-50 px-4 py-2 text-center text-xs text-blue-800">
          Refreshing the live catalog…
        </p>
      )}
      {catalogError && (
        <p role="alert" className="bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">
          The latest catalog could not be loaded: {catalogError} Showing the data available when this page opened.
        </p>
      )}
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open navigation menu"
              className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 active:scale-95 md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200 overflow-hidden shrink-0">
                <img
                  src={BUILDEXOM_ICON_DATA_URL}
                  alt={storeName}
                  className="size-full object-contain"
                />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                  {storeName}
                </h1>
                <p className="hidden text-[11px] font-medium text-slate-400 sm:block">{storeSlug}.buildexom.store</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links (Matching Instagram Post Mockup) */}
          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#" className="text-xs font-bold text-slate-900 transition hover:text-blue-600">
              Home
            </a>
            <a href="#featured" className="text-xs font-semibold text-slate-600 transition hover:text-blue-600">
              Shop
            </a>
            <a href="#categories" className="text-xs font-semibold text-slate-600 transition hover:text-blue-600">
              Categories
            </a>
            <a href="#catalog" className="text-xs font-semibold text-slate-600 transition hover:text-blue-600">
              All Products
            </a>
            <a href="#footer" className="text-xs font-semibold text-slate-600 transition hover:text-blue-600">
              About
            </a>
          </nav>

          {/* Search bar & Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden max-w-xs md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs transition focus:border-blue-400 focus:bg-white focus:outline-none lg:w-56"
              />
            </div>

            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '923001234567'}?text=Hello%20${encodeURIComponent(storeName)}!`}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 sm:flex"
            >
              <MessageCircle size={14} className="text-emerald-600" /> WhatsApp
            </a>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 rounded-full bg-[#1976d2] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1565c0]"
            >
              <ShoppingBag size={15} />
              <span className="hidden sm:inline">Cart</span>
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

      {/* Mobile Navigation Drawer (Slide-In from Left) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="relative flex h-full w-full max-w-xs flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200 overflow-hidden shrink-0">
                  <img
                    src={BUILDEXOM_ICON_DATA_URL}
                    alt={storeName}
                    className="size-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{storeName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{storeSlug}.buildexom.store</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Search Catalog</label>
                <div className="relative mt-2">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-blue-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Categories</label>
                <div className="mt-2 space-y-1">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        selectedCategory === cat ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat === 'All' ? 'All Products' : cat}</span>
                      <ChevronRight size={14} className="opacity-50" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800">
                  <MessageCircle size={16} />
                  <span className="text-xs font-bold">WhatsApp Support</span>
                </div>
                <p className="text-[11px] text-emerald-900/80">Have questions about an item or delivery?</p>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '923001234567'}?text=Hello%20${encodeURIComponent(storeName)}!`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Hero Promo Banner (Matching Instagram Post Studio Footwear Showcase) */}
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 space-y-6">
        <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-br from-slate-50 via-white to-slate-100/70 p-6 sm:p-10 shadow-sm transition duration-500">
          <div
            className="absolute -right-16 -top-16 size-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />
          <div
            className="absolute -left-16 -bottom-16 size-72 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ backgroundColor: themeColor }}
          />

          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="max-w-xl text-left">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${themeColor}15`,
                  color: themeColor,
                  borderColor: `${themeColor}35`
                }}
              >
                {heroInfo.badge}
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.08]">
                {heroInfo.headlineMain}<br />
                {heroInfo.headlineHighlight && (
                  <span style={{ color: themeColor }}>{heroInfo.headlineHighlight}</span>
                )}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                {tagline || heroInfo.subtext}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="#catalog"
                  className="rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
                  style={{ backgroundColor: themeColor }}
                >
                  Shop Now →
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '') || '923001234567'}?text=Hello%20${encodeURIComponent(storeName)}!%20I%20want%20to%20place%20an%20order.`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                >
                  <MessageCircle size={14} className="text-emerald-600" /> WhatsApp Support
                </a>
              </div>
            </div>

            {/* Dynamic Concept-Matched Hero Image */}
            <div className="w-56 sm:w-72 lg:w-96 shrink-0 relative flex items-center justify-center">
              <img
                src={heroInfo.heroImage}
                alt={heroInfo.altText}
                className="max-h-80 w-full object-contain rounded-2xl drop-shadow-[0_20px_25px_rgba(0,0,0,0.12)] transition duration-500 hover:scale-105"
              />
              <div className="mx-auto mt-[-18px] h-3.5 w-3/4 rounded-full bg-slate-400/25 blur-md" />
            </div>
          </div>
        </section>

        {/* 4. Featured Products Section (Matching Screenshot) */}
        <section id="featured" className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
              Featured Products
            </h3>
            <a
              href="#catalog"
              className="flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
              style={{ color: themeColor }}
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredItems.map((item) => (
              <article
                key={item.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-50 p-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="size-full object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-3.5">
                  <h4 className="line-clamp-1 text-xs font-bold text-slate-900 sm:text-sm">
                    {item.name}
                  </h4>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 sm:text-sm">
                      Rs. {item.price.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      aria-label={`Add ${item.name} to cart`}
                      className="grid size-8 place-items-center rounded-full text-white shadow-md transition hover:scale-110 active:scale-95"
                      style={{ backgroundColor: themeColor }}
                    >
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 5. Category Icons Strip (Matching Screenshot) */}
        <section id="categories" className="pt-1">
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {[
              { id: 'Electronics', name: 'Electronics', icon: '📱' },
              { id: 'Fashion', name: 'Fashion', icon: '👕' },
              { id: 'Home', name: 'Home', icon: '🏠' },
              { id: 'Accessories', name: 'Accessories', icon: '🎧' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? 'All' : cat.name)}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 sm:p-4 text-center transition duration-200 active:scale-95 ${
                  selectedCategory === cat.name
                    ? 'border-blue-600 bg-blue-50 text-blue-800 font-bold shadow-xs'
                    : 'border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <span className="text-2xl sm:text-3xl">{cat.icon}</span>
                <span className="text-[11px] sm:text-xs font-medium leading-none">{cat.name}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 6. Trust Badges Strip */}
      <div className="mt-8 border-y border-slate-200 bg-white py-4 px-4">
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

        {/* Official Buildexom Platform Feature Strip (Matching Instagram Post) */}
        <section className="mt-12 overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-[#0d2a4a] to-blue-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 w-full lg:w-auto">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🌐</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Your Own Online Store</h4>
                  <p className="text-[10px] text-blue-200/80">Custom branded domain</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">💬</span>
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Ordering</h4>
                  <p className="text-[10px] text-blue-200/80">Direct customer chat</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Secure & Reliable</h4>
                  <p className="text-[10px] text-blue-200/80">24/7 verified uptime</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl">📈</span>
                <div>
                  <h4 className="text-xs font-bold text-white">Grow Your Business</h4>
                  <p className="text-[10px] text-blue-200/80">Scale sales effortlessly</p>
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto text-center">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg transition hover:bg-blue-400 active:scale-95"
              >
                <span>Build Your Store</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
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
                <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
                  <p className="text-xs font-bold text-slate-800">Customer & Delivery Details</p>
                  <input
                    type="text"
                    placeholder="Your Full Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                  />
                  <input
                    type="email"
                    placeholder="Email Address (for order updates)"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp / Phone Number *"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
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
                      placeholder="Zip / Postal Code"
                      value={customerZip}
                      onChange={(e) => setCustomerZip(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Delivery Address *"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-slate-400 focus:outline-none"
                  />
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

      {/* 7. Responsive Store Footer */}
      <StoreFooter
        storeName={storeName}
        storeSlug={storeSlug}
        socialLinks={socialLinks}
      />

      {/* 8. Floating Bexi AI Shopping Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isAiChatOpen ? (
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl transition hover:bg-slate-800 hover:scale-105 border border-slate-700"
          >
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
              <Sparkles size={13} />
            </span>
            <span>Ask Bexi AI</span>
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
                  <p className="font-bold text-xs">{storeName} Bexi AI</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Roman Urdu & English Active</p>
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
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
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
                placeholder="Roman Urdu ya English mein poochain (e.g. delivery kab hogi?)..."
                value={chatInput}
                maxLength={500}
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

      {/* 9. Floating Bottom WhatsApp Pill (Matching Screenshot) */}
      <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:left-auto z-40">
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="w-full sm:w-auto flex items-center justify-between gap-4 rounded-full bg-slate-950/95 text-white px-5 py-3.5 shadow-2xl backdrop-blur-md border border-slate-800 transition hover:bg-slate-900 hover:scale-[1.02] active:scale-95"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
              <MessageCircle size={16} />
            </span>
            <div className="text-left">
              <p className="text-xs font-bold leading-none">Order via WhatsApp</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Quick • Easy • Secure</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {totalCartCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
              </span>
            )}
            <ArrowRight size={16} className="text-emerald-400" />
          </div>
        </button>
      </div>
    </div>
  );
}