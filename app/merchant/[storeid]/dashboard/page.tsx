'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadProductImage, uploadStoreImage } from '@/lib/supabaseUpload';
import { StoreQRCode } from '@/components/store-qr-code';
import { Boxes, Check, ChevronRight, CirclePlus, CreditCard, ExternalLink, Eye, LayoutDashboard, Package, Pencil, Search, ShoppingBag, Sparkles, Tag, Trash2, Upload, Wallet } from 'lucide-react';

type Plan = 'basic' | 'pro' | 'business';
type Product = { id: string; name: string; price: number | string; description?: string | null; image_url?: string | null; category_id?: string | null; created_at?: string };
type Category = { id: string; name: string };
type Order = { id: string; customer_name: string; customer_phone: string; total_amount: number | string; status?: string | null; created_at?: string; items?: unknown[] };
type PaymentDetails = { bank_name: string; account_title: string; account_number: string; iban: string; jazzcash_number: string; easypaisa_number: string };

const PLAN_DETAILS: Record<Plan, { title: string; productLimit: number | null; categoryLimit: number | null; perCategoryLimit?: number; checkout: string }> = {
    basic: { title: 'Basic', productLimit: 20, categoryLimit: 2, checkout: 'Standard checkout' },
    pro: { title: 'Pro', productLimit: 75, categoryLimit: 5, perCategoryLimit: 15, checkout: 'Standard + WhatsApp ordering' },
    business: { title: 'Business', productLimit: null, categoryLimit: null, checkout: 'Standard + WhatsApp ordering' },
};

function normalizePlan(value: string | null | undefined): Plan {
    const plan = value?.toLowerCase();
    if (plan === 'pro' || plan === 'business') return plan;
    return 'basic';
}

function formatPKR(value: number | string) {
    return `PKR ${Number(value || 0).toLocaleString()}`;
}

function formatDate(value?: string) {
    if (!value) return 'Recently';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MerchantDashboardMaster() {
    const params = useParams<{ storeid: string }>();
    const paramId = params.storeid;

    const [resolvedStoreId, setResolvedStoreId] = useState<string>('');
    const [storeName, setStoreName] = useState<string>('');
    const [storeSlug, setStoreSlug] = useState<string>('');
    const [storePlan, setStorePlan] = useState<Plan>('basic');
    const [activeTab, setActiveTab] = useState('overview');
    const [productSearch, setProductSearch] = useState('');
    
    // Branding & Settings
    const [themeColor, setThemeColor] = useState('#1d7555');
    const [bannerText, setBannerText] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [acceptsCod, setAcceptsCod] = useState(true);
    const [acceptsAdvance, setAcceptsAdvance] = useState(false);
    const [advancePercentage, setAdvancePercentage] = useState('50');
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ bank_name: '', account_title: '', account_number: '', iban: '', jazzcash_number: '', easypaisa_number: '' });

    // Data states
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageError, setMessageError] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Product Form States
    const [prodName, setProdName] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodCategory, setProdCategory] = useState('');
    const [prodImageFile, setProdImageFile] = useState<File | null>(null);
    const [editingProdId, setEditingProdId] = useState<string | null>(null);

    // Category Form
    const [catName, setCatName] = useState('');

    const planDetails = PLAN_DETAILS[storePlan];
    const canUseWhatsapp = storePlan === 'pro' || storePlan === 'business';
    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return products;
        return products.filter((product) => product.name.toLowerCase().includes(query));
    }, [products, productSearch]);
    const totalRevenue = useMemo(() => orders.reduce((total, order) => total + Number(order.total_amount || 0), 0), [orders]);
    const pendingOrders = useMemo(() => orders.filter((order) => (order.status || 'pending').toLowerCase() === 'pending').length, [orders]);

    const fetchMeshData = useCallback(async (storeId: string) => {
        try {
            const [prodRes, catRes, ordersRes] = await Promise.all([
                fetch(`/api/stores/products?store_id=${storeId}`),
                fetch(`/api/stores/categories?store_id=${storeId}`),
                fetch(`/api/stores/orders?store_id=${storeId}`),
            ]);
            const [prodData, catData, ordersData] = await Promise.all([
                prodRes.json(),
                catRes.json(),
                ordersRes.json(),
            ]);

            if (prodData.products) setProducts(prodData.products);
            if (catData.categories) setCategories(catData.categories);
            if (ordersData.success) setOrders(ordersData.orders);
        } catch (err) {
            console.error('Error fetching mesh data:', err);
        }
    }, []);

    const resolveStoreAndData = useCallback(async (identifier: string) => {
        try {
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
            const storeQuery = createClient().from('stores').select('id, name, slug, plan, whatsapp_number');
            const { data: storeData, error: storeError } = await (isUuid
                ? storeQuery.eq('id', identifier)
                : storeQuery.eq('slug', identifier)
            ).maybeSingle();

            if (storeError) throw storeError;

            if (!storeData) {
                setMessage('Store not found in database.');
                return;
            }

            setResolvedStoreId(storeData.id);
            setStoreName(storeData.name);
            setStoreSlug(storeData.slug);
            setStorePlan(normalizePlan(storeData.plan));

            // Load settings and dashboard data at the same time to avoid a network waterfall.
            const [settingsData] = await Promise.all([
                fetch(`/api/stores/settings?store_id=${storeData.id}`).then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Unable to load storefront settings.');
                    return data;
                }),
                fetchMeshData(storeData.id),
            ]);
            if (settingsData.settings) {
                setThemeColor(settingsData.settings.theme_color || '#1d7555');
                setBannerText(settingsData.settings.banner_text || '');
                setLogoUrl(settingsData.settings.logo_url || '');
                setWhatsappNumber(settingsData.settings.whatsapp_number || '');
                setAcceptsCod(settingsData.settings.accepts_cod ?? true);
                setAcceptsAdvance(settingsData.settings.accepts_advance ?? false);
                setAdvancePercentage(String(settingsData.settings.advance_percentage ?? 50));
                setPaymentDetails({
                    bank_name: settingsData.settings.payment_details?.bank_name || '',
                    account_title: settingsData.settings.payment_details?.account_title || '',
                    account_number: settingsData.settings.payment_details?.account_number || '',
                    iban: settingsData.settings.payment_details?.iban || '',
                    jazzcash_number: settingsData.settings.payment_details?.jazzcash_number || settingsData.settings.jazzcash_number || '',
                    easypaisa_number: settingsData.settings.payment_details?.easypaisa_number || settingsData.settings.easypaisa_number || '',
                });
            }
        } catch (err) {
            console.error('Error loading store:', err);
            setMessage(err instanceof Error ? err.message : 'Failed to load store data.');
        } finally {
            setLoading(false); // Yeh zaroori hai taake loading state hamesha reset ho
        }
    }, [fetchMeshData]);

    useEffect(() => {
        if (!paramId) return;

        let cancelled = false;
        queueMicrotask(() => {
            if (!cancelled) void resolveStoreAndData(paramId);
        });
        return () => {
            cancelled = true;
        };
    }, [paramId, resolveStoreAndData]);

    // Save Settings & Integrations (Plan Gated)
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setMessageError(false);
        setSavingSettings(true);
        try {
            if (!resolvedStoreId) throw new Error('Store is still loading. Please try again in a moment.');
            const savedLogoUrl = logoFile ? await uploadStoreImage(logoFile, resolvedStoreId) : logoUrl;
            const settingsPayload: Record<string, unknown> = {
                    store_id: resolvedStoreId,
                    theme_color: themeColor,
                    banner_text: bannerText,
                    logo_url: savedLogoUrl,
                    whatsapp_number: canUseWhatsapp ? whatsappNumber : null,
                };
            if (activeTab === 'payments') {
                settingsPayload.accepts_cod = acceptsCod;
                settingsPayload.accepts_advance = acceptsAdvance;
                settingsPayload.advance_percentage = Number(advancePercentage);
                settingsPayload.payment_details = paymentDetails;
            }
            const res = await fetch('/api/stores/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settingsPayload)
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save settings.');
            if (savedLogoUrl && data.settings?.logo_url !== savedLogoUrl) {
                throw new Error('Settings were submitted, but the saved logo could not be confirmed. Please save again.');
            }
            setLogoUrl(savedLogoUrl);
            setLogoFile(null);
            setMessage(data.warning || data.message || 'Settings saved successfully!');
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to save settings.');
            setMessageError(true);
        } finally {
            setSavingSettings(false);
        }
    };

    // Save Product with Supabase Image Upload
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setUploadingImage(true);

        try {
            let imageUrl = null;
            if (prodImageFile) {
                imageUrl = await uploadProductImage(prodImageFile, resolvedStoreId);
            }

            const method = editingProdId ? 'PUT' : 'POST';
            const bodyData: Record<string, unknown> = {
                store_id: resolvedStoreId,
                name: prodName,
                price: Number(prodPrice),
                description: prodDesc || '',
                category_id: prodCategory || null,
            };
            if (imageUrl) bodyData.image_url = imageUrl;
            if (editingProdId) bodyData.id = editingProdId;

            const res = await fetch('/api/stores/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });
            const data = await res.json();

            if (data.success) {
                setMessage(editingProdId ? 'Product updated successfully!' : 'Product added successfully!');
                setProdName('');
                setProdPrice('');
                setProdDesc('');
                setProdImageFile(null);
                setEditingProdId(null);
                setActiveTab('overview');
                await fetchMeshData(resolvedStoreId);
            } else {
                setMessage(data.error || 'Failed to save product');
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        const res = await fetch(`/api/stores/products?id=${id}&store_id=${resolvedStoreId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            setMessage('Product deleted.');
            await fetchMeshData(resolvedStoreId);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('/api/stores/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_id: resolvedStoreId, name: catName })
        });
        const data = await res.json();
        if (data.success) {
            setMessage('Category added.');
            setCatName('');
            fetchMeshData(resolvedStoreId);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-xs font-medium space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p>Loading merchant dashboard...</p>
            </div>
        );
    }

    if (message && !resolvedStoreId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xs font-medium text-red-600">
                {message}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 md:min-h-screen bg-slate-950 text-white flex flex-col shadow-xl md:sticky md:top-0 md:h-screen">
                <div className="p-5 border-b border-white/10 flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white" style={{ backgroundColor: themeColor }}><Boxes size={19} /></div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-wide">{storeName}</h2>
                        <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-200">{planDetails.title} plan</span>
                    </div>
                </div>

                <nav className="grid grid-cols-3 gap-1.5 p-3 text-xs md:flex md:flex-1 md:flex-col md:space-y-1.5 md:p-4" aria-label="Merchant dashboard">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'products', label: `Products · ${products.length}`, icon: Package },
                        { id: 'orders', label: `Orders · ${orders.length}`, icon: ShoppingBag },
                        { id: 'categories', label: `Categories · ${categories.length}`, icon: Tag },
                        { id: 'branding', label: 'Storefront', icon: Eye },
                        { id: 'payments', label: 'Payments', icon: CreditCard }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex min-h-10 items-center gap-2 rounded-lg px-2.5 text-left font-medium transition md:w-full md:px-3 ${
                                activeTab === tab.id ? 'text-white shadow-sm' : 'text-slate-300 hover:bg-white/10'
                            }`}
                            style={activeTab === tab.id ? { backgroundColor: themeColor } : {}}
                        >
                            <tab.icon size={15} className="shrink-0" />
                            {tab.label}
                        </button>
                    ))}
                    <div className="hidden flex-1 md:block" />
                    <div className="hidden rounded-xl border border-white/10 bg-white/[0.04] p-3 md:block">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Store status</p>
                        <p className="mt-2 flex items-center gap-2 text-xs font-medium"><span className="size-2 rounded-full bg-emerald-400" /> Your store is live</p>
                        <a className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-300 hover:text-white" href={`/store/${paramId}`} target="_blank" rel="noreferrer">Open storefront <ExternalLink size={12} /></a>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="min-w-0 flex-1 flex flex-col overflow-y-auto">
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 shadow-sm backdrop-blur sm:px-8">
                    <div><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-400">Merchant workspace</p><h1 className="mt-1 text-lg font-semibold capitalize tracking-tight text-slate-900">{activeTab === 'overview' ? 'Store overview' : activeTab}</h1></div>
                    <a href={`/store/${paramId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                        <Eye size={14} /> <span className="hidden sm:inline">View storefront</span><ExternalLink size={12} />
                    </a>
                </header>

                <div className="w-full max-w-7xl space-y-6 p-5 sm:p-8">
                    {message && (
                        <div role={messageError ? 'alert' : 'status'} className={`rounded-lg border p-3 text-xs font-medium ${messageError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                            {message}
                        </div>
                    )}

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <>
                            <section className="relative overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
                                <div className="absolute -right-12 -top-24 size-72 rounded-full border border-white/10" />
                                <div className="absolute -right-2 -top-14 size-52 rounded-full border border-white/10" />
                                <div className="relative flex flex-wrap items-end justify-between gap-5">
                                    <div className="max-w-xl">
                                        <p className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-200"><Sparkles size={12} /> Store workspace</p>
                                        <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Welcome back, {storeName}</h2>
                                        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-300">Your products, orders, and storefront performance at a glance. Keep your catalog fresh and stay on top of every order.</p>
                                    </div>
                                    <button type="button" onClick={() => { setEditingProdId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory(''); setProdImageFile(null); setActiveTab('products'); }} className="inline-flex h-10 items-center gap-2 rounded-lg px-4 text-xs font-semibold text-white shadow-sm transition hover:opacity-90" style={{ backgroundColor: themeColor }}><CirclePlus size={15} /> Add a product</button>
                                </div>
                            </section>

                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store performance">
                                {[
                                    { title: 'Catalog products', value: products.length, note: planDetails.productLimit === null ? 'No cap on this plan' : `${Math.max(0, planDetails.productLimit - products.length)} remaining`, icon: Package, tone: 'bg-blue-50 text-blue-700' },
                                    { title: 'Orders received', value: orders.length, note: `${pendingOrders} awaiting action`, icon: ShoppingBag, tone: 'bg-violet-50 text-violet-700' },
                                    { title: 'Sales recorded', value: formatPKR(totalRevenue), note: 'Total from loaded orders', icon: Wallet, tone: 'bg-emerald-50 text-emerald-700' },
                                    { title: 'Categories', value: categories.length, note: planDetails.categoryLimit === null ? 'No cap on this plan' : `${Math.max(0, planDetails.categoryLimit - categories.length)} remaining`, icon: Tag, tone: 'bg-amber-50 text-amber-700' },
                                ].map(({ title, value, note, icon: Icon, tone }) => (
                                    <article key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between"><p className="text-xs font-medium text-slate-500">{title}</p><span className={`grid size-9 place-items-center rounded-lg ${tone}`}><Icon size={17} /></span></div>
                                        <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
                                        <p className="mt-1.5 text-[11px] text-slate-500">{note}</p>
                                    </article>
                                ))}
                            </section>

                            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
                                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                                        <div><h3 className="text-sm font-semibold text-slate-900">Your products</h3><p className="mt-1 text-[11px] text-slate-500">All products currently listed in your store · {products.length} total</p></div>
                                        <div className="flex items-center gap-2">
                                            <label className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-2.5 text-slate-400"><Search size={14} /><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search products" aria-label="Search products" className="w-28 bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400 sm:w-36" /></label>
                                            <button type="button" onClick={() => setActiveTab('products')} className="hidden items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800 sm:inline-flex">Manage <ChevronRight size={14} /></button>
                                        </div>
                                    </div>
                                    {filteredProducts.length === 0 ? (
                                        <div className="px-5 py-12 text-center"><span className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-slate-500"><Package size={21} /></span><h4 className="mt-3 text-sm font-semibold text-slate-800">{products.length ? 'No matching products' : 'Your catalog is ready to begin'}</h4><p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">{products.length ? 'Try a different name or clear the search.' : 'Add products to make them visible on your storefront and here in your dashboard.'}</p>{!products.length && <button onClick={() => setActiveTab('products')} className="mt-4 rounded-lg px-3 py-2 text-xs font-semibold text-white" style={{ backgroundColor: themeColor }}>Add your first product</button>}</div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {filteredProducts.map((product) => (
                                                <article key={product.id} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50/70">
                                                    {product.image_url ? <Image src={product.image_url} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"><Package size={18} /></span>}
                                                    <div className="min-w-0 flex-1"><h4 className="truncate text-xs font-semibold text-slate-800">{product.name}</h4><p className="mt-1 truncate text-[10px] text-slate-500">{product.description || 'No description added'}{product.created_at ? ` · Added ${formatDate(product.created_at)}` : ''}</p></div>
                                                    <p className="whitespace-nowrap text-xs font-semibold text-slate-900">{formatPKR(product.price)}</p>
                                                    <button type="button" aria-label={`Edit ${product.name}`} title="Edit product" onClick={() => { setEditingProdId(product.id); setProdName(product.name); setProdPrice(String(product.price)); setProdDesc(product.description || ''); setProdCategory(product.category_id || ''); setProdImageFile(null); setActiveTab('products'); }} className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-700"><Pencil size={14} /></button>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <aside className="space-y-5">
                                    <StoreQRCode storeSlug={storeSlug || paramId} />
                                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Your subscription</p><h3 className="mt-1 text-lg font-semibold capitalize text-slate-900">{planDetails.title} plan</h3></div><span className="grid size-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700"><Sparkles size={17} /></span></div>
                                        <div className="mt-4 space-y-3">
                                            <div><div className="mb-1.5 flex justify-between text-[10px]"><span className="text-slate-500">Products</span><span className="font-semibold text-slate-700">{products.length} / {planDetails.productLimit ?? '∞'}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ backgroundColor: themeColor, width: `${planDetails.productLimit ? Math.min(100, products.length / planDetails.productLimit * 100) : products.length ? 100 : 0}%` }} /></div></div>
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]"><span className="text-slate-500">Categories</span><span className="font-semibold text-slate-700">{categories.length} / {planDetails.categoryLimit ?? '∞'}</span></div>
                                            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">Checkout</span><span className="text-right font-medium text-slate-700">{planDetails.checkout}</span></div>
                                            {planDetails.perCategoryLimit && <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">Products per category</span><span className="font-medium text-slate-700">Up to {planDetails.perCategoryLimit}</span></div>}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-600"><Check size={13} className="shrink-0 text-emerald-600" />Plan features are based on the limits enabled for your store.</div>
                                    </section>

                                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-900">Recent orders</h3><p className="mt-1 text-[10px] text-slate-500">Latest customer activity</p></div><button onClick={() => setActiveTab('orders')} className="text-[11px] font-semibold text-blue-700 hover:text-blue-800">View all</button></div>
                                        {orders.length === 0 ? <div className="mt-5 rounded-lg bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">No orders yet. New orders will show here.</div> : <div className="mt-3 divide-y divide-slate-100">{[...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 4).map((order) => <div key={order.id} className="flex items-center gap-3 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><ShoppingBag size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{order.customer_name}</p><p className="mt-0.5 text-[10px] text-slate-500">{formatDate(order.created_at)} · {(order.status || 'pending').toLowerCase()}</p></div><span className="text-[11px] font-semibold text-slate-800">{formatPKR(order.total_amount)}</span></div>)}</div>}
                                    </section>
                                </aside>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan guide</p><h3 className="mt-1 text-base font-semibold text-slate-900">What your plan includes</h3><p className="mt-1 text-xs text-slate-500">Limits shown here reflect the active product and category rules in the platform.</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">Current: {storePlan}</span></div>
                                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                                    {(['basic', 'pro', 'business'] as Plan[]).map((plan) => {
                                        const details = PLAN_DETAILS[plan];
                                        const isCurrent = plan === storePlan;
                                        return <article key={plan} className={`rounded-xl border p-4 ${isCurrent ? 'border-blue-300 bg-blue-50/40 ring-1 ring-blue-100' : 'border-slate-200 bg-white'}`}>
                                            <div className="flex items-center justify-between"><h4 className="text-sm font-semibold capitalize text-slate-900">{details.title}</h4>{isCurrent && <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold uppercase text-blue-700">Active</span>}</div>
                                            <ul className="mt-3 space-y-2.5 text-[11px] text-slate-600">
                                                <li className="flex items-start gap-2"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />{details.productLimit === null ? 'No product cap enforced' : `Up to ${details.productLimit} products`}</li>
                                                <li className="flex items-start gap-2"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />{details.categoryLimit === null ? 'No category cap enforced' : `Up to ${details.categoryLimit} categories`}</li>
                                                {details.perCategoryLimit && <li className="flex items-start gap-2"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />Up to {details.perCategoryLimit} products per category</li>}
                                                <li className="flex items-start gap-2"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />{details.checkout}</li>
                                                <li className="flex items-start gap-2"><Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />Store branding and payment account settings</li>
                                            </ul>
                                            {plan === 'business' && <p className="mt-3 border-t border-slate-200 pt-3 text-[10px] leading-4 text-slate-500">Business has no product or category caps configured in the current plan-limit rules.</p>}
                                        </article>;
                                    })}
                                </div>
                            </section>
                        </>
                    )}

                    {/* THEME & BRANDING */}
                    {activeTab === 'branding' && (
                        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Storefront appearance</p><h3 className="mt-1 text-base font-semibold text-slate-900">Branding and theme</h3><p className="mt-1 text-xs text-slate-500">Changes are reflected on your public storefront.</p></div>
                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold mb-1">Banner Announcement</label>
                                    <input type="text" value={bannerText} onChange={e => setBannerText(e.target.value)} className="w-full p-2.5 border rounded-lg text-xs" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-[11px] font-semibold text-slate-700">Store logo</label>
                                    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
                                        {logoUrl && <Image src={logoUrl} alt={`${storeName} logo preview`} width={52} height={52} unoptimized className="size-13 rounded-lg border border-slate-200 bg-white object-cover" />}
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-xs font-medium text-slate-700">{logoFile?.name || (logoUrl ? 'Current store logo' : 'Choose a logo image')}</p>
                                            <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, WebP or GIF · max 5 MB</p>
                                        </div>
                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus-within:ring-2 focus-within:ring-blue-200">
                                            <Upload size={14} /> Choose file
                                            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setLogoFile(event.target.files?.[0] || null)} className="sr-only" />
                                        </label>
                                    </div>
                                    <label className="mt-3 block text-[10px] font-medium text-slate-500">Or use an image URL
                                        <input type="url" value={logoUrl} onChange={event => { setLogoUrl(event.target.value); setLogoFile(null); }} placeholder="https://example.com/logo.png" className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold mb-1">Theme Color</label>
                                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 border rounded cursor-pointer" />
                                </div>
                                <button type="submit" disabled={savingSettings} className="rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: themeColor }}>{savingSettings ? 'Saving…' : 'Save branding'}</button>
                            </form>
                        </div>
                    )}

                    {/* PAYMENTS & PLAN-GATED WHATSAPP */}
                    {activeTab === 'payments' && (
                        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5"><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Checkout setup</p><h3 className="mt-1 text-base font-semibold text-slate-900">Payments and integrations</h3><p className="mt-1 text-xs text-slate-500">Configure the payment details customers use when ordering from your store.</p></div>

                            <form onSubmit={handleSaveSettings} className="space-y-4">
                                <section className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                                    <h4 className="text-xs font-semibold text-slate-900">Accepted payment methods</h4>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                                        <input type="checkbox" checked={acceptsCod} onChange={event => setAcceptsCod(event.target.checked)} className="mt-0.5 size-4 accent-emerald-700" />
                                        <span><span className="block text-xs font-semibold text-slate-800">Cash on Delivery</span><span className="mt-1 block text-[10px] text-slate-500">Customers pay when their order is delivered.</span></span>
                                    </label>
                                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                                        <input type="checkbox" checked={acceptsAdvance} onChange={event => setAcceptsAdvance(event.target.checked)} className="mt-0.5 size-4 accent-emerald-700" />
                                        <span className="flex-1"><span className="block text-xs font-semibold text-slate-800">Advance payment</span><span className="mt-1 block text-[10px] text-slate-500">Customers transfer a percentage before delivery.</span>
                                            {acceptsAdvance && <span className="mt-3 block max-w-48"><span className="mb-1 block text-[10px] font-medium text-slate-600">Advance percentage</span><span className="relative block"><input type="number" min="1" max="100" step="1" required value={advancePercentage} onChange={event => setAdvancePercentage(event.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 pr-8 text-xs outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><span className="absolute right-3 top-2 text-xs text-slate-400">%</span></span></span>}
                                        </span>
                                    </label>
                                </section>

                                <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                                    <div><h4 className="text-xs font-semibold text-slate-900">Transfer account details</h4><p className="mt-1 text-[10px] text-slate-500">Shown to customers when they choose advance payment.</p></div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {([
                                            ['bank_name', 'Bank name', 'e.g. Meezan Bank'],
                                            ['account_title', 'Account title', 'Name on the account'],
                                            ['account_number', 'Account number', 'Bank account number'],
                                            ['iban', 'IBAN', 'PK00 XXXX 0000 0000'],
                                            ['jazzcash_number', 'JazzCash number', '03XX XXXXXXX'],
                                            ['easypaisa_number', 'EasyPaisa number', '03XX XXXXXXX'],
                                        ] as const).map(([key, label, placeholder]) => <label key={key} className="block text-[10px] font-semibold text-slate-600">{label}<input type="text" value={paymentDetails[key]} onChange={event => setPaymentDetails(current => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} maxLength={120} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>)}
                                    </div>
                                </section>

                                {/* Plan Gated WhatsApp Integration */}
                                <div className="pt-3 border-t">
                                    <label className="block text-[11px] font-bold mb-1 flex items-center justify-between">
                                        <span>WhatsApp Direct Integration</span>
                                        {!canUseWhatsapp && <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-bold">Pro and Business</span>}
                                    </label>
                                    {canUseWhatsapp ? (
                                        <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} placeholder="03001234567" className="w-full p-2.5 border rounded-lg text-xs" />
                                    ) : (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 space-y-2">
                                            <p>WhatsApp ordering is available on Pro and Business plans. Your Basic plan continues to support standard checkout.</p>
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={savingSettings} className="rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: themeColor }}>{savingSettings ? 'Saving…' : 'Save payment settings'}</button>
                            </form>
                        </div>
                    )}

                    {/* CATEGORIES */}
                    {activeTab === 'categories' && (
                        <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Catalog organization</p><h3 className="mt-1 text-base font-semibold text-slate-900">Product categories</h3><p className="mt-1 text-xs text-slate-500">{planDetails.categoryLimit === null ? 'Your Business plan has no category cap configured.' : `${categories.length} of ${planDetails.categoryLimit} categories used on your ${planDetails.title} plan.`}</p></div>
                            <form onSubmit={handleAddCategory} className="flex gap-2">
                                <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category name" required disabled={planDetails.categoryLimit !== null && categories.length >= planDetails.categoryLimit} className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2.5 text-xs disabled:bg-slate-100" />
                                <button type="submit" disabled={planDetails.categoryLimit !== null && categories.length >= planDetails.categoryLimit} className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: themeColor }}>Add category</button>
                            </form>
                            {categories.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{categories.map((category) => <div key={category.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-medium text-slate-700"><Tag size={14} className="text-slate-400" />{category.name}</span><span className="text-[10px] text-slate-400">{products.filter((product) => product.category_id === category.id).length} products</span></div>)}</div>}
                        </div>
                    )}

                    {/* PRODUCTS WITH FILE UPLOAD */}
                    {activeTab === 'products' && (
                        <div className="grid gap-5 xl:grid-cols-[minmax(300px,0.85fr)_minmax(0,1.4fr)]">
                            <div className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Catalog management</p>
                                <h3 className="mt-1 text-base font-semibold text-slate-900">{editingProdId ? 'Edit product' : 'Add a product'}</h3>
                                <p className="mb-4 mt-1 text-xs text-slate-500">{products.length} / {planDetails.productLimit ?? '∞'} products used on {planDetails.title}.</p>
                                <form onSubmit={handleSaveProduct} className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Product name</label>
                                        <input type="text" value={prodName} onChange={e => setProdName(e.target.value)} required className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Price (PKR)</label>
                                        <input type="number" min="0" step="0.01" value={prodPrice} onChange={e => setProdPrice(e.target.value)} required className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Category</label>
                                        <select value={prodCategory} onChange={e => setProdCategory(e.target.value)} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                                            <option value="">Uncategorized</option>
                                            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Product image</label>
                                        <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 transition-colors hover:border-blue-400 hover:bg-blue-50/50">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"><Upload size={16} /></span>
                                            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium text-slate-700">{prodImageFile?.name || 'Choose a product image'}</span><span className="mt-1 block text-[10px] text-slate-500">PNG, JPG, WebP or GIF · max 5 MB</span></span>
                                            <span className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors group-hover:border-blue-300 group-hover:bg-blue-50 group-hover:text-blue-700">Choose file</span>
                                            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => setProdImageFile(event.target.files?.[0] || null)} className="sr-only" />
                                        </label>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Description</label>
                                        <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                    <button type="submit" disabled={uploadingImage || (!editingProdId && planDetails.productLimit !== null && products.length >= planDetails.productLimit)} className="w-full rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: themeColor }}>
                                        {uploadingImage ? 'Uploading Image & Saving...' : editingProdId ? 'Update Product' : 'Publish Product'}
                                    </button>
                                    {editingProdId && <button type="button" onClick={() => { setEditingProdId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory(''); setProdImageFile(null); }} className="w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel edit</button>}
                                    {!editingProdId && planDetails.productLimit !== null && products.length >= planDetails.productLimit && <p className="text-[10px] leading-4 text-amber-700">You reached your {planDetails.title} product limit. Upgrade your plan to add more.</p>}
                                </form>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4"><h3 className="text-sm font-semibold text-slate-900">Product inventory</h3><p className="mt-1 text-[11px] text-slate-500">All {products.length} products in this store</p></div>
                                {products.length === 0 ? <p className="px-5 py-10 text-center text-xs text-slate-500">No products yet. Add your first product using the form.</p> : <div className="divide-y divide-slate-100">{products.map((product) => <div key={product.id} className="flex items-center gap-3 px-4 py-3"><div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">{product.image_url ? <Image src={product.image_url} alt="" width={40} height={40} unoptimized className="size-full object-cover" /> : <Package size={16} />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{product.name}</p><p className="mt-1 truncate text-[10px] text-slate-500">{categories.find((category) => category.id === product.category_id)?.name || 'Uncategorized'}</p></div><span className="text-xs font-semibold text-slate-800">{formatPKR(product.price)}</span><button aria-label={`Edit ${product.name}`} onClick={() => { setEditingProdId(product.id); setProdName(product.name); setProdPrice(String(product.price)); setProdDesc(product.description || ''); setProdCategory(product.category_id || ''); setProdImageFile(null); }} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-700"><Pencil size={14} /></button><button aria-label={`Delete ${product.name}`} onClick={() => handleDeleteProduct(product.id)} className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button></div>)}</div>}
                            </div>
                        </div>
                    )}

                    {/* ORDERS */}
                    {activeTab === 'orders' && (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Store activity</p><h3 className="mt-1 text-base font-semibold text-slate-900">Customer orders</h3></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">{pendingOrders} pending</span></div>
                            {orders.length === 0 ? <div className="px-5 py-12 text-center text-xs text-slate-500">No orders yet. Customer orders placed through your storefront will appear here.</div> : <div className="divide-y divide-slate-100">{[...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).map((order) => <div key={order.id} className="flex flex-wrap items-center gap-3 px-5 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><ShoppingBag size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{order.customer_name}</p><p className="mt-1 text-[10px] text-slate-500">{order.customer_phone} · {formatDate(order.created_at)}</p></div><span className={`rounded-full px-2 py-1 text-[9px] font-semibold capitalize ${(order.status || 'pending').toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>{order.status || 'pending'}</span><span className="min-w-24 text-right text-xs font-semibold" style={{ color: themeColor }}>{formatPKR(order.total_amount)}</span></div>)}</div>}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}