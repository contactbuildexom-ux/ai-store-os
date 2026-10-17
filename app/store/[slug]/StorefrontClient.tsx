'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { isPublicStorefrontResponse } from '@/lib/storefront-types';
import {
    Menu,
    X,
    ShoppingBag,
    Search,
    MessageCircle,
    Plus,
    Minus,
    Trash2,
    Sparkles,
    ArrowRight,
    ShieldCheck,
    Truck,
    Headphones,
    CheckCircle2,
    Share2,
    Phone,
    MapPin,
    Mail,
    ChevronRight,
    Send
} from 'lucide-react';

export type Product = {
    id: string;
    name: string;
    description?: string | null;
    price: number | string;
    image_url?: string | null;
    category?: string | null;
    category_id?: string | null;
    badge?: string | null;
};

export type CartItem = Product & { quantity: number };

export type DeliverySettings = {
    delivery_fee?: number | string | null;
    city_rate?: number | string | null;
    other_city_rate?: number | string | null;
    store_city?: string | null;
    free_delivery_above?: number | string | null;
    estimated_days?: string | null;
};

export type Store = {
    id: string;
    name: string;
    slug: string;
    plan: string;
    whatsapp_number: string;
    accepts_cod: boolean;
    accepts_advance: boolean;
    advance_percentage: number;
};

export type Props = {
    store: Store;
    settings: { theme_color?: string | null; banner_text?: string | null; logo_url?: string | null } | null;
    products: Product[];
    delivery: DeliverySettings | null;
};

function money(value: number | string) {
    return `PKR ${Number(value || 0).toLocaleString()}`;
}

function whatsappPhone(value: string) {
    let phone = (value || '').replace(/\D/g, '');
    if (phone.startsWith('00')) phone = phone.slice(2);
    if (phone.startsWith('0')) phone = `92${phone.slice(1)}`;
    else if (phone.length === 10) phone = `92${phone}`;
    return phone;
}

export default function StorefrontClient({ store, settings, products, delivery }: Props) {
    const [liveStore, setLiveStore] = useState(store);
    const [liveProducts, setLiveProducts] = useState(products);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');

    const themeColor = settings?.theme_color || '#0b2545';
    const bannerText = settings?.banner_text || '✨ Free delivery nationwide on orders above Rs. 3,000!';
    const isPro = ['pro', 'business', 'advanced'].includes(liveStore.plan.toLowerCase());

    // UI state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [toastMessage, setToastMessage] = useState('');

    // Cart and checkout states
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerZip, setCustomerZip] = useState('');
    const [city, setCity] = useState(delivery?.store_city || 'Lahore');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance' | ''>(() => store.accepts_cod ? 'cod' : store.accepts_advance ? 'advance' : 'cod');
    const [orderStatus, setOrderStatus] = useState('');
    const [orderError, setOrderError] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(false);

    // Becni AI Chat states
    const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
        { sender: 'ai', text: `Assalam-o-Alaikum! 👋 I am **Becni AI**, your personal shopping assistant for **${liveStore.name}**.\n\nAsk me about our products, recommendations, pricing, or delivery details!` }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiSending, setAiSending] = useState(false);

    // Toast auto-clear
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Derived catalog values
    const categories = useMemo(() => {
        const set = new Set<string>();
        liveProducts.forEach((p) => {
            const cat = (p as any).category || (p as any).category_name;
            if (cat) set.add(cat);
        });
        if (set.size === 0) return ['All', 'Electronics', 'Fashion', 'Home', 'Accessories'];
        return ['All', ...Array.from(set)];
    }, [liveProducts]);

    const filteredProducts = useMemo(() => {
        return liveProducts.filter((p) => {
            const cat = (p as any).category || (p as any).category_name || '';
            const matchesCat = selectedCategory === 'All' || cat.toLowerCase() === selectedCategory.toLowerCase();
            const matchesSearch = !searchQuery.trim() ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [liveProducts, selectedCategory, searchQuery]);

    const totalCartCount = useMemo(() => cart.reduce((count, item) => count + item.quantity, 0), [cart]);
    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);
    const sameCity = Boolean(delivery?.store_city && city.trim().toLowerCase() === delivery.store_city.trim().toLowerCase());
    const baseDeliveryFee = Number(delivery?.delivery_fee ?? (sameCity ? delivery?.city_rate : delivery?.other_city_rate) ?? (city.trim().toLowerCase() === 'lahore' ? 200 : 350));
    const freeDeliveryAbove = Number(delivery?.free_delivery_above || 3000);
    const deliveryFee = freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove ? 0 : (Number.isFinite(baseDeliveryFee) ? baseDeliveryFee : 250);
    const finalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;
    const advanceAmount = Math.round((finalAmount * store.advance_percentage / 100 + Number.EPSILON) * 100) / 100;

    // Refresh live catalog
    useEffect(() => {
        const controller = new AbortController();

        async function refreshCatalog() {
            setCatalogLoading(true);
            setCatalogError('');
            try {
                const response = await fetch(`/api/stores/${encodeURIComponent(store.slug)}`, {
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
                if (!isPublicStorefrontResponse(payload) || payload.store.slug !== store.slug) {
                    throw new Error('The store returned an invalid catalog response.');
                }
                setLiveStore((current) => ({
                    ...current,
                    id: payload.store.id,
                    name: payload.store.name,
                    slug: payload.store.slug,
                    plan: payload.store.plan,
                    whatsapp_number: payload.store.whatsapp_number,
                }));
                setLiveProducts(payload.products);
            } catch (error) {
                if (controller.signal.aborted) return;
                setCatalogError(error instanceof Error ? error.message : 'Unable to refresh the store catalog.');
            } finally {
                if (!controller.signal.aborted) setCatalogLoading(false);
            }
        }

        void refreshCatalog();
        return () => controller.abort();
    }, [store.slug]);

    // Cart actions
    function addToCart(product: Product, openDrawer = false) {
        setCart((current) => {
            const existing = current.find((item) => item.id === product.id);
            if (existing) {
                return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...current, { ...product, quantity: 1 }];
        });
        setToastMessage(`✓ Added "${product.name}" to cart`);
        if (openDrawer) setIsCartOpen(true);
        setOrderStatus('');
        setWhatsappLink('');
    }

    function changeQuantity(productId: string, amount: number) {
        setCart((current) => current
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
            .filter((item) => item.quantity > 0));
    }

    function removeFromCart(productId: string) {
        setCart((current) => current.filter((item) => item.id !== productId));
    }

    // Direct WhatsApp order for single item
    function handleDirectWhatsApp(product: Product) {
        const merchantPhone = whatsappPhone(liveStore.whatsapp_number || '923001234567');
        const text =
            `🛍️ *INSTANT ORDER — ${liveStore.name.toUpperCase()}*\n` +
            `----------------------------------------\n` +
            `Hello! I would like to order:\n` +
            `• *Product:* ${product.name}\n` +
            `• *Price:* ${money(product.price)}\n` +
            `• *Store Link:* https://${liveStore.slug}.buildexom.store\n\n` +
            `Please confirm stock availability and share delivery details! Thank you!`;
        window.open(`https://wa.me/${merchantPhone}?text=${encodeURIComponent(text)}`, '_blank');
    }

    // Full Cart Checkout
    async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (cart.length === 0 || loading) return;
        setLoading(true);
        setOrderError(false);
        setOrderStatus('');
        setWhatsappLink('');

        const merchantPhone = whatsappPhone(String(liveStore.whatsapp_number || ''));

        // Open window during user gesture
        const whatsappWindow = window.open('about:blank', '_blank');
        if (whatsappWindow) whatsappWindow.opener = null;

        try {
            const response = await fetch(`/api/storefront/${encodeURIComponent(liveStore.slug)}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    shipping_address: customerAddress,
                    zip_code: customerZip,
                    city,
                    payment_method: paymentMethod,
                    items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })),
                    is_whatsapp_order: true,
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Unable to place your order.');

            const targetPhone = whatsappPhone(String(result.whatsapp_number || merchantPhone || '923001234567'));
            const itemLines = (result.items as Array<{ name: string; quantity: number; price: number }>)
                .map((item, idx) => `${idx + 1}. *${item.name}* × ${item.quantity} — ${money(item.price * item.quantity)}`)
                .join('\n');

            const summary = [
                `🛍️ *NEW ORDER — ${liveStore.name.toUpperCase()}*`,
                `----------------------------------------`,
                `📋 *Order ID:* #${result.order?.id?.slice(0, 8) || 'NEW'}`,
                ``,
                `👤 *CUSTOMER DETAILS:*`,
                `• *Name:* ${customerName}`,
                `• *WhatsApp / Phone:* ${customerPhone}`,
                `• *Email:* ${customerEmail || 'Not provided'}`,
                `• *City:* ${city}`,
                `• *Postal / Zip Code:* ${customerZip || 'N/A'}`,
                `• *Delivery Address:* ${customerAddress}`,
                ``,
                `📦 *ITEMS ORDERED:*`,
                itemLines,
                ``,
                `💵 *Subtotal:* ${money(result.subtotal || subtotal)}`,
                `🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : money(result.delivery_fee || deliveryFee)}`,
                `🏷️ *Grand Total:* ${money(result.total_amount || finalAmount)}`,
                `💳 *Payment Method:* ${paymentMethod === 'advance' ? `Advance payment (${store.advance_percentage}% · ${money(result.advance_amount || advanceAmount)})` : 'Cash on Delivery (COD)'}`,
                `----------------------------------------`,
                `Please confirm my order and dispatch timeline. Thank you!`,
            ].join('\n');

            const destination = `https://wa.me/${targetPhone}?text=${encodeURIComponent(summary)}`;
            if (whatsappWindow) whatsappWindow.location.href = destination;
            else setWhatsappLink(destination);

            setOrderStatus(`✓ Order placed successfully! Order #${result.order?.id?.slice(0, 8) || ''} saved.`);
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            setCustomerZip('');
        } catch (error) {
            whatsappWindow?.close();
            setOrderError(true);
            setOrderStatus(error instanceof Error ? error.message : 'Unable to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    // Becni AI Chat Assistant Send
    async function handleSendAiChat(e: React.FormEvent) {
        e.preventDefault();
        if (!aiInput.trim() || aiSending) return;

        const userMsg = aiInput.trim();
        setAiInput('');
        setAiMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
        setAiSending(true);

        try {
            const res = await fetch('/api/ai/create-store/store-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: liveStore.slug || liveStore.id,
                    message: userMsg
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to process AI chat query');
            setAiMessages((prev) => [...prev, { sender: 'ai', text: data.reply || 'Here are some items from our store catalog!' }]);
        } catch {
            setAiMessages((prev) => [
                ...prev,
                { sender: 'ai', text: `I am here to help you shop at ${liveStore.name}! You can browse our ${liveProducts.length} items above, or tap any product card to add to cart or order directly via WhatsApp.` }
            ]);
        } finally {
            setAiSending(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-28">
            {/* Live Catalog Status Messages */}
            {catalogLoading && (
                <div role="status" className="bg-blue-600 px-4 py-1.5 text-center text-xs font-medium text-white animate-pulse">
                    Refreshing live catalog…
                </div>
            )}
            {catalogError && (
                <div role="alert" className="bg-amber-500 px-4 py-1.5 text-center text-xs font-semibold text-white">
                    Viewing offline catalog: {catalogError}
                </div>
            )}

            {/* Top Announcement Bar */}
            <div className="px-4 py-2 text-center text-xs font-medium text-white shadow-xs" style={{ backgroundColor: themeColor }}>
                {bannerText}
            </div>

            {/* Main Header (Hamburger Left, Brand Center, Cart Icon Right) */}
            <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-shadow">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
                    {/* Left: Hamburger Icon Button */}
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open mobile navigation menu"
                        className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
                    >
                        <Menu size={20} />
                    </button>

                    {/* Center: Store Brand Name / Logo */}
                    <div className="flex min-w-0 items-center justify-center gap-2.5 text-center">
                        {settings?.logo_url ? (
                            <Image
                                src={settings.logo_url}
                                alt={`${liveStore.name} logo`}
                                width={36}
                                height={36}
                                unoptimized
                                className="size-9 rounded-xl object-cover shadow-xs"
                            />
                        ) : (
                            <div
                                className="grid size-9 place-items-center rounded-xl font-bold text-white shadow-xs text-sm"
                                style={{ backgroundColor: themeColor }}
                            >
                                {liveStore.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 text-left">
                            <h1 className="truncate text-base font-extrabold tracking-tight sm:text-lg" style={{ color: themeColor }}>
                                {liveStore.name}
                            </h1>
                            <p className="hidden text-[10px] text-slate-400 sm:block">Official Online Store</p>
                        </div>
                    </div>

                    {/* Right: Cart Icon Button with Counter Badge */}
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            aria-label={`Shopping cart with ${totalCartCount} items`}
                            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-100 active:scale-95 shadow-xs"
                        >
                            <ShoppingBag size={20} />
                            {totalCartCount > 0 && (
                                <span
                                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-[10px] font-bold text-white shadow-sm animate-bounce"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {totalCartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sub-Header Desktop Navigation Strip */}
                <div className="hidden border-t border-slate-100 bg-slate-50/60 px-6 py-2 md:block">
                    <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-emerald-700">✓ Verified Merchant</span>
                            <span>•</span>
                            <span>🚚 Nationwide Express Delivery</span>
                            <span>•</span>
                            <span>💳 Cash on Delivery Available</span>
                        </div>
                        <a
                            href={`https://wa.me/${whatsappPhone(liveStore.whatsapp_number || '923001234567')}?text=Hello%20${encodeURIComponent(liveStore.name)}!`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                            <MessageCircle size={14} /> Official WhatsApp Support
                        </a>
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
                    <div className="relative flex h-full w-full max-w-xs flex-col bg-white shadow-2xl z-10">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                {settings?.logo_url ? (
                                    <Image src={settings.logo_url} alt="" width={32} height={32} unoptimized className="size-8 rounded-lg object-cover" />
                                ) : (
                                    <div className="grid size-8 place-items-center rounded-lg font-bold text-white text-xs" style={{ backgroundColor: themeColor }}>
                                        {liveStore.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-sm text-slate-900">{liveStore.name}</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">{liveStore.slug}.buildexom.store</p>
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

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {/* Search in Drawer */}
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

                            {/* Categories Navigation */}
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
                                                selectedCategory === cat
                                                    ? 'bg-slate-900 text-white'
                                                    : 'text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>{cat}</span>
                                            <ChevronRight size={14} className="opacity-50" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* WhatsApp Direct Help */}
                            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-800">
                                    <MessageCircle size={16} />
                                    <span className="text-xs font-bold">WhatsApp Support</span>
                                </div>
                                <p className="text-[11px] text-emerald-900/80">Need help with product size, specifications, or bulk order pricing?</p>
                                <a
                                    href={`https://wa.me/${whatsappPhone(liveStore.whatsapp_number || '923001234567')}?text=Hello%20${encodeURIComponent(liveStore.name)}!%20I%20have%20a%20question%20regarding%20an%20order.`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                                >
                                    Chat with Merchant
                                </a>
                            </div>

                            {/* Store Admin Link */}
                            <div className="pt-2">
                                <Link
                                    href={`/merchant/${liveStore.slug}/dashboard`}
                                    className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
                                >
                                    Merchant Admin Dashboard →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Page Body */}
            <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 space-y-6">
                {/* 1. Hero Promo Banner (Matching Screenshot) */}
                <section
                    className="relative overflow-hidden rounded-3xl p-6 sm:p-10 text-white shadow-lg transition duration-500"
                    style={{
                        background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`
                    }}
                >
                    <div className="absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                    <div className="absolute -left-16 -bottom-16 size-64 rounded-full bg-cyan-400/10 blur-2xl pointer-events-none" />

                    <div className="relative z-10 max-w-2xl">
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold backdrop-blur-md">
                            <Sparkles size={12} className="text-amber-300" /> Premium Collection • Verified
                        </div>
                        <h2 className="text-2xl font-black tracking-tight sm:text-4xl lg:text-5xl leading-tight">
                            Premium Products For a Better You
                        </h2>
                        <p className="mt-2.5 text-xs sm:text-sm text-slate-200 max-w-lg leading-relaxed">
                            Discover our handpicked catalog crafted for modern elegance and performance. Direct WhatsApp ordering & Cash on Delivery across Pakistan.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <a
                                href="#products"
                                className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:bg-slate-100 hover:scale-105 active:scale-95"
                            >
                                Shop Now →
                            </a>
                            <a
                                href={`https://wa.me/${whatsappPhone(liveStore.whatsapp_number || '923001234567')}?text=Hello%20${encodeURIComponent(liveStore.name)}!%20I%20want%20to%20place%20an%20order.`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20"
                            >
                                <MessageCircle size={14} /> WhatsApp Support
                            </a>
                        </div>
                    </div>
                </section>

                {/* 2. Search & Category Bar */}
                <section className="space-y-3">
                    {/* Search Input */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search catalog by name or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-medium shadow-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Category Scrollable Pills (Matching Screenshot) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {categories.map((cat) => {
                            const isSelected = selectedCategory === cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition shadow-xs ${
                                        isSelected
                                            ? 'text-white'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                    style={isSelected ? { backgroundColor: themeColor } : {}}
                                >
                                    {cat === 'All' ? '🛍️ All Products' : cat}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Product Catalog Grid (Matching Screenshot) */}
                <section id="products" className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                {selectedCategory === 'All' ? 'Our Collection' : selectedCategory}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'} available
                            </p>
                        </div>
                        {selectedCategory !== 'All' && (
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('All')}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                                Reset filter
                            </button>
                        )}
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <ShoppingBag size={36} className="mx-auto text-slate-300" />
                            <h4 className="mt-3 text-base font-bold text-slate-800">No products found</h4>
                            <p className="mt-1 text-xs text-slate-500">Try changing your search terms or selecting another category.</p>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory('All');
                                    setSearchQuery('');
                                }}
                                className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3.5 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <article
                                    key={product.id}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                                >
                                    {/* Image Container with Badges */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                width={400}
                                                height={400}
                                                unoptimized
                                                className="size-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="grid size-full place-items-center bg-slate-100 text-3xl font-extrabold text-slate-300">
                                                {product.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-800 shadow-xs backdrop-blur-md">
                                            ✓ In Stock
                                        </span>

                                        {/* Quick WhatsApp Single Order Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleDirectWhatsApp(product)}
                                            title="Order this product directly on WhatsApp"
                                            className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-full bg-emerald-500 text-white shadow-sm transition hover:bg-emerald-600 hover:scale-110 active:scale-95"
                                        >
                                            <MessageCircle size={13} />
                                        </button>
                                    </div>

                                    {/* Product Details & Price */}
                                    <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                                        <div>
                                            {(product as any).category && (
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {(product as any).category}
                                                </p>
                                            )}
                                            <h4 className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-blue-600 sm:text-sm">
                                                {product.name}
                                            </h4>
                                            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                                                {product.description || 'Premium quality verified item.'}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                            <div>
                                                <span className="block text-[10px] text-slate-400 font-medium">Price</span>
                                                <span className="text-xs font-extrabold text-slate-900 sm:text-sm" style={{ color: themeColor }}>
                                                    {money(product.price)}
                                                </span>
                                            </div>

                                            {/* Circular Floating Cart Button (Matching Screenshot) */}
                                            <button
                                                type="button"
                                                onClick={() => addToCart(product, true)}
                                                aria-label={`Add ${product.name} to cart`}
                                                className="grid size-9 place-items-center rounded-full text-white shadow-md transition hover:scale-110 active:scale-95 sm:size-10"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* 4. Trust Badges Strip */}
                <section className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                                <ShieldCheck size={22} />
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900">100% Genuine Quality</h4>
                                <p className="text-[11px] text-slate-500">Hand-checked and verified items</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                                <Truck size={22} />
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900">Fast Nationwide Delivery</h4>
                                <p className="text-[11px] text-slate-500">{delivery?.estimated_days || '2-4 business days COD'}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                            <span className="grid size-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                                <Headphones size={22} />
                            </span>
                            <div>
                                <h4 className="text-xs font-bold text-slate-900">Dedicated Support</h4>
                                <p className="text-[11px] text-slate-500">Real-time WhatsApp tracking</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* SEPARATE SLIDE-OVER CART DRAWER */}
            {isCartOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
                        onClick={() => setIsCartOpen(false)}
                    />

                    <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl z-10 animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                            <div className="flex items-center gap-2.5">
                                <ShoppingBag size={18} className="text-slate-800" />
                                <h3 className="font-extrabold text-sm text-slate-900">Shopping Cart</h3>
                                <span
                                    className="rounded-full px-2 py-0.5 text-[11px] font-bold text-white"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {totalCartCount}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsCartOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Drawer Body (Items & Checkout Form) */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-5">
                            {/* Cart Items List */}
                            {cart.length === 0 ? (
                                <div className="py-16 text-center">
                                    <ShoppingBag size={42} className="mx-auto text-slate-300" />
                                    <h4 className="mt-3 text-sm font-bold text-slate-800">Your cart is empty</h4>
                                    <p className="mt-1 text-xs text-slate-500">Add products from our collection to place an order.</p>
                                    <button
                                        type="button"
                                        onClick={() => setIsCartOpen(false)}
                                        className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Order Items ({cart.length})</p>
                                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
                                        {cart.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3 p-2">
                                                {item.image_url ? (
                                                    <Image
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        width={52}
                                                        height={52}
                                                        unoptimized
                                                        className="size-13 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="size-13 grid place-items-center rounded-xl bg-slate-200 text-sm font-bold text-slate-500">
                                                        {item.name.charAt(0)}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <h5 className="truncate text-xs font-bold text-slate-900">{item.name}</h5>
                                                    <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{money(item.price)}</p>

                                                    <div className="mt-2 flex items-center gap-2">
                                                        <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                                                            <button
                                                                type="button"
                                                                onClick={() => changeQuantity(item.id, -1)}
                                                                className="px-2 py-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                                                            >
                                                                −
                                                            </button>
                                                            <span className="w-5 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeQuantity(item.id, 1)}
                                                                className="px-2 py-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1 text-rose-500 hover:text-rose-700"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {money(Number(item.price) * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Free Delivery Bar */}
                            {cart.length > 0 && freeDeliveryAbove > 0 && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3">
                                    <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                                        <span>{deliveryFee === 0 ? '🎉 Free Delivery Unlocked!' : `Add ${money(freeDeliveryAbove - subtotal)} for Free Delivery`}</span>
                                        <span>{deliveryFee === 0 ? 'FREE' : money(deliveryFee)}</span>
                                    </div>
                                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${Math.min(100, Math.round((subtotal / freeDeliveryAbove) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Order Pricing Breakdown */}
                            {cart.length > 0 && (
                                <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs">
                                    <div className="flex justify-between text-slate-600">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold text-slate-900">{money(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-600">
                                        <span>Delivery Fee ({city}):</span>
                                        <span className="font-semibold text-slate-900">{deliveryFee === 0 ? 'Free' : money(deliveryFee)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900">
                                        <span>Total Amount:</span>
                                        <span style={{ color: themeColor }}>{money(finalAmount)}</span>
                                    </div>
                                    {paymentMethod === 'advance' && (
                                        <div className="flex justify-between text-[11px] text-blue-700 font-semibold pt-1">
                                            <span>Advance Required ({store.advance_percentage}%):</span>
                                            <span>{money(advanceAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer Delivery Details Form */}
                            {cart.length > 0 && (
                                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 border-t border-slate-100 pt-4">
                                    <p className="text-xs font-bold text-slate-900">Customer & Delivery Information</p>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Customer Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Abeera Munir"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500">WhatsApp / Phone Number *</label>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="0300 1234567"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Email Address (Optional)</label>
                                        <input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-500">City *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Lahore / Karachi"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-500">Postal / Zip Code</label>
                                            <input
                                                type="text"
                                                placeholder="54000"
                                                value={customerZip}
                                                onChange={(e) => setCustomerZip(e.target.value)}
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Complete Delivery Address *</label>
                                        <textarea
                                            required
                                            rows={2}
                                            placeholder="House / Apartment #, Street, Area name..."
                                            value={customerAddress}
                                            onChange={(e) => setCustomerAddress(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none"
                                        />
                                    </div>

                                    {/* Payment Method Selector */}
                                    <div className="space-y-2 pt-2">
                                        <label className="text-[10px] font-bold uppercase text-slate-500">Payment Option</label>
                                        {store.accepts_cod && (
                                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-xs transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="cod"
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={() => setPaymentMethod('cod')}
                                                        className="size-4 accent-emerald-600"
                                                    />
                                                    <div>
                                                        <span className="block font-bold text-slate-800">Cash on Delivery</span>
                                                        <span className="block text-[10px] text-slate-500">Pay when order arrives</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-800">{money(finalAmount)}</span>
                                            </label>
                                        )}
                                        {store.accepts_advance && (
                                            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-3 text-xs transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                                                <div className="flex items-center gap-2.5">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="advance"
                                                        checked={paymentMethod === 'advance'}
                                                        onChange={() => setPaymentMethod('advance')}
                                                        className="size-4 accent-emerald-600"
                                                    />
                                                    <div>
                                                        <span className="block font-bold text-slate-800">Advance Transfer</span>
                                                        <span className="block text-[10px] text-slate-500">{store.advance_percentage}% advance</span>
                                                    </div>
                                                </div>
                                                <span className="font-bold text-slate-800">{money(advanceAmount)}</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* Submit Action */}
                                    <button
                                        type="submit"
                                        disabled={loading || cart.length === 0}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3.5 text-xs font-bold text-white shadow-lg transition hover:bg-emerald-500 disabled:opacity-50"
                                    >
                                        <MessageCircle size={16} />
                                        {loading ? 'Processing order…' : 'Order via WhatsApp'}
                                    </button>
                                </form>
                            )}

                            {/* Status or error feedback */}
                            {orderStatus && (
                                <div className={`rounded-xl border p-3 text-xs ${orderError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                                    <p className="font-semibold">{orderStatus}</p>
                                    {whatsappLink && (
                                        <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex font-bold underline">
                                            Open WhatsApp Link
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FLOATING BOTTOM BAR (MATCHING SCREENSHOT) */}
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

            {/* FLOATING BECNI AI ASSISTANT WIDGET */}
            <div className="fixed bottom-20 right-4 sm:bottom-20 sm:right-6 z-40">
                {!isAiOpen ? (
                    <button
                        type="button"
                        onClick={() => setIsAiOpen(true)}
                        className="flex items-center gap-2 rounded-full bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-white shadow-2xl transition hover:bg-slate-800 hover:scale-105 border border-slate-700"
                    >
                        <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
                            <Sparkles size={13} />
                        </span>
                        <span>Ask Becni AI</span>
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
                                    <p className="font-bold text-xs">Becni AI Assistant</p>
                                    <p className="text-[10px] text-emerald-400 font-mono">Shopping Catalog Active</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAiOpen(false)}
                                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {aiMessages.map((msg, i) => (
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
                            {aiSending && (
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
                        <form onSubmit={handleSendAiChat} className="border-t border-slate-800 bg-slate-900/60 p-3 flex gap-2">
                            <input
                                type="text"
                                placeholder="Ask about products, prices..."
                                value={aiInput}
                                maxLength={500}
                                onChange={(e) => setAiInput(e.target.value)}
                                className="flex-1 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                            />
                            <button
                                type="submit"
                                disabled={aiSending || !aiInput.trim()}
                                className="rounded-xl bg-emerald-600 px-3.5 py-2 font-bold text-white hover:bg-emerald-500 disabled:opacity-50"
                            >
                                <Send size={13} />
                            </button>
                        </form>
                    </div>
                )}
            </div>

            {/* Quick Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 right-4 z-50 rounded-xl bg-slate-900/90 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}