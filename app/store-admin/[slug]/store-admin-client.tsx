'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Store, 
  Package, 
  Palette, 
  Settings, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Check, 
  AlertCircle,
  Globe,
  ArrowLeft,
  MessageCircle,
  RefreshCw,
  Zap,
  Search,
  Crown,
  ShieldCheck
} from 'lucide-react';
import { THEME_PRESETS } from '@/lib/ai/ai-generator';
import type { ProductRecord, StoreRecord } from '@/lib/store-repository';
import { VoiceStoreAssistant } from '@/components/VoiceStoreAssistant';

interface StoreAdminClientProps {
  store: StoreRecord;
  initialProducts: ProductRecord[];
}

export default function StoreAdminClient({ store, initialProducts }: StoreAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'theme' | 'settings' | 'plans'>('products');
  const [products, setProducts] = useState<ProductRecord[]>(initialProducts);
  const [currentStore, setCurrentStore] = useState<StoreRecord>(store);
  const [productSearch, setProductSearch] = useState('');
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image_url: ''
  });

  // Theme customizer state
  const [themePreset, setThemePreset] = useState(store.selected_theme || 'emerald');
  const [primaryColor, setPrimaryColor] = useState(store.primary_color || '#1d7555');
  const [tagline, setTagline] = useState(store.tagline || '');
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Settings state
  const [whatsappNumber, setWhatsappNumber] = useState(store.whatsapp_number || '');

  // Notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Plan limits (Basic: 20, Pro: 75, Advanced: unlimited)
  const rawPlan = (currentStore.plan || 'basic').toLowerCase();
  const plan = rawPlan === 'free' ? 'basic' : rawPlan;
  const maxProducts = plan === 'basic' ? 20 : plan === 'pro' ? 75 : 9999;
  const isLimitReached = products.length >= maxProducts;

  const handleUpdatePlan = async (newPlan: 'basic' | 'pro' | 'advanced') => {
    setIsUpdatingPlan(true);
    try {
      const res = await fetch('/api/stores/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_slug: currentStore.slug,
          plan: newPlan,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update plan');

      setCurrentStore((prev) => ({ ...prev, plan: newPlan }));
      showNotice('success', `Plan successfully switched to ${newPlan.toUpperCase()}! Limits and features updated.`);
    } catch (err: any) {
      showNotice('error', err.message || 'Could not update plan.');
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 4000);
  };

  // Open Add Product
  const handleOpenAdd = () => {
    if (isLimitReached) {
      showNotice('error', `Plan limit reached! ${plan.toUpperCase()} plan allows maximum ${maxProducts} products. Upgrade to add more.`);
      return;
    }
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      category: products[0]?.category || 'General',
      description: '',
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
    });
    setIsProductModalOpen(true);
  };

  // Open Edit Product
  const handleOpenEdit = (p: ProductRecord) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      price: String(p.price),
      category: p.category || '',
      description: p.description || '',
      image_url: p.image_url || ''
    });
    setIsProductModalOpen(true);
  };

  // Save (Create or Update) Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      showNotice('error', 'Product name and price are required.');
      return;
    }

    try {
      if (editingProduct) {
        // Update product via MCP / product API
        const res = await fetch(`/api/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'manage_product',
              arguments: {
                action: 'update',
                store_slug: currentStore.slug,
                product_id: editingProduct.id,
                product_data: {
                  name: productForm.name,
                  price: Number(productForm.price),
                  category: productForm.category,
                  description: productForm.description,
                  image_url: productForm.image_url
                }
              }
            }
          })
        });

        const data = await res.json();
        if (data.result?.isError) {
          throw new Error(data.result.content[0].text);
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id
              ? {
                  ...p,
                  name: productForm.name,
                  price: Number(productForm.price),
                  category: productForm.category,
                  description: productForm.description,
                  image_url: productForm.image_url
                }
              : p
          )
        );
        showNotice('success', 'Product updated successfully!');
      } else {
        // Add new product
        const res = await fetch(`/api/mcp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/call',
            params: {
              name: 'manage_product',
              arguments: {
                action: 'add',
                store_slug: currentStore.slug,
                product_data: {
                  name: productForm.name,
                  price: Number(productForm.price),
                  category: productForm.category || 'General',
                  description: productForm.description,
                  image_url: productForm.image_url
                }
              }
            }
          })
        });

        const data = await res.json();
        if (data.result?.isError) {
          throw new Error(data.result.content[0].text);
        }

        const raw = JSON.parse(data.result.content[0].text);
        const newProduct = raw.product;
        setProducts((prev) => [newProduct, ...prev]);
        showNotice('success', 'New product added to store catalog!');
      }

      setIsProductModalOpen(false);
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to save product.');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/mcp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'manage_product',
            arguments: {
              action: 'delete',
              store_slug: currentStore.slug,
              product_id: productId
            }
          }
        })
      });

      const data = await res.json();
      if (data.result?.isError) throw new Error(data.result.content[0].text);

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showNotice('success', 'Product removed from catalog.');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to delete product.');
    }
  };

  // Generate more products using AI
  const handleAiGenerateProducts = async () => {
    if (isLimitReached) {
      showNotice('error', `Plan limit reached! Upgrade your plan to generate more products.`);
      return;
    }

    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'generate_products',
            arguments: {
              niche_or_prompt: currentStore.tagline || currentStore.name,
              count: 2,
              store_id: currentStore.slug
            }
          }
        })
      });

      const data = await res.json();
      if (data.result?.isError) throw new Error(data.result.content[0].text);

      const parsed = JSON.parse(data.result.content[0].text);
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts((prev) => [...parsed.products, ...prev]);
        showNotice('success', `AI generated and added ${parsed.products.length} products to your store!`);
      }
    } catch (err: any) {
      showNotice('error', err.message || 'AI generation failed.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save Theme
  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTheme(true);

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'customize_store_theme',
            arguments: {
              store_slug: currentStore.slug,
              theme_preset: themePreset,
              primary_color: primaryColor,
              tagline: tagline
            }
          }
        })
      });

      const data = await res.json();
      if (data.result?.isError) throw new Error(data.result.content[0].text);

      const parsed = JSON.parse(data.result.content[0].text);
      setCurrentStore(parsed.store);
      showNotice('success', 'Theme and styling updated live!');
    } catch (err: any) {
      showNotice('error', err.message || 'Failed to update theme.');
    } finally {
      setIsSavingTheme(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Admin Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={14} /> Buildexom Home
            </Link>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white text-xs">
                {currentStore.name.charAt(0)}
              </span>
              <div>
                <h1 className="text-sm font-bold text-slate-900 leading-tight">{currentStore.name}</h1>
                <p className="text-[11px] font-mono text-slate-500">{currentStore.slug}.buildexom.store</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              plan === 'advanced' ? 'bg-indigo-100 text-indigo-800' :
              plan === 'pro' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-700'
            }`}>
              {plan.toUpperCase()} PLAN
            </span>

            <Link
              href={`/stores/${currentStore.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800"
            >
              <span>View Storefront</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Notice Banner */}
      {notice && (
        <div className={`py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-2 ${
          notice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {notice.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {notice.message}
        </div>
      )}

      {/* Main Workspace Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Navigation Tabs & Overview */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex gap-2 border-b border-slate-200 pb-2 sm:border-0 sm:pb-0">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'products'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Package size={15} />
              <span>Products Catalog ({products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'theme'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Palette size={15} />
              <span>Theme Customizer</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Settings size={15} />
              <span>Store Settings</span>
            </button>

            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                activeTab === 'plans'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Zap size={15} />
              <span>Merchant Plans</span>
            </button>
          </div>

          {/* Plan usage indicator */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs">
            <div className="text-right">
              <span className="font-semibold text-slate-700">Catalog Capacity:</span>
              <span className="ml-1 font-bold text-slate-900">
                {products.length} / {maxProducts === 9999 ? '∞' : maxProducts} items
              </span>
            </div>
            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full ${isLimitReached ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min((products.length / (maxProducts === 9999 ? 50 : maxProducts)) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Products</span>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{products.length}</p>
                <p className="text-[10px] text-slate-500">Live in catalog</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog Value</span>
                <p className="mt-1 text-xl font-extrabold text-emerald-600">
                  Rs. {products.reduce((s, p) => s + Number(p.price || 0), 0).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-500">Combined retail inventory</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Price</span>
                <p className="mt-1 text-xl font-extrabold text-slate-900">
                  Rs. {products.length > 0 ? Math.round(products.reduce((s, p) => s + Number(p.price || 0), 0) / products.length).toLocaleString() : 0}
                </p>
                <p className="text-[10px] text-slate-500">Per product</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan Capacity</span>
                <p className="mt-1 text-xl font-extrabold text-indigo-600">
                  {maxProducts === 9999 ? 'Unlimited' : `${products.length}/${maxProducts}`}
                </p>
                <p className="text-[10px] text-slate-500">
                  <button type="button" onClick={() => setActiveTab('plans')} className="text-blue-600 underline font-semibold">Change plan</button>
                </p>
              </div>
            </div>

            {/* Catalog Toolbar & Search */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by title, category, price..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAiGenerateProducts}
                  disabled={isAiGenerating || isLimitReached}
                  className="flex items-center gap-1.5 rounded-xl border border-purple-300 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-900 shadow-xs hover:bg-purple-100 disabled:opacity-50"
                >
                  <Sparkles size={14} className={isAiGenerating ? 'animate-spin' : ''} />
                  <span>{isAiGenerating ? 'AI Generating...' : 'Generate with AI'}</span>
                </button>

                <button
                  onClick={handleOpenAdd}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-500"
                >
                  <Plus size={15} />
                  <span>Add New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                    <tr>
                      <th className="px-5 py-3.5">Product</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Price (PKR)</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products
                      .filter((p) => {
                        if (!productSearch.trim()) return true;
                        const t = productSearch.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(t) ||
                          (p.category && p.category.toLowerCase().includes(t)) ||
                          (p.description && p.description.toLowerCase().includes(t)) ||
                          String(p.price).includes(t)
                        );
                      })
                      .map((p) => {
                        const imgList = (p.image_url || '').split(',').map((s) => s.trim()).filter(Boolean);
                        const firstImg = imgList[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                  <img
                                    src={firstImg}
                                    alt={p.name}
                                    className="size-full object-cover"
                                  />
                                  {imgList.length > 1 && (
                                    <span className="absolute bottom-0 right-0 bg-slate-900/85 px-1 py-0.5 text-[8px] font-bold text-white">
                                      +{imgList.length - 1}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{p.name}</p>
                                  <p className="line-clamp-1 text-[11px] text-slate-500 max-w-xs">{p.description || 'Verified product'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                                {p.category || 'General'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-900">
                              Rs. {p.price.toLocaleString()}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                <span className="size-1.5 rounded-full bg-emerald-500" /> In Stock
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/stores/${currentStore.slug}`}
                                  target="_blank"
                                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600 transition"
                                  title="View on storefront"
                                >
                                  <ExternalLink size={14} />
                                </Link>
                                <button
                                  onClick={() => handleOpenEdit(p)}
                                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                                  title="Edit product"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition"
                                  title="Delete product"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          No products found. Click "Add New Product" or "Generate with AI" to add inventory!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THEME CUSTOMIZER */}
        {activeTab === 'theme' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Visual Theme & Identity</h2>
              <p className="text-xs text-slate-500">
                Customize your store's colors, typography vibe, and hero announcement banner.
              </p>
            </div>

            <form onSubmit={handleSaveTheme} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-3">
                  Select Theme Preset
                </label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.values(THEME_PRESETS).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setThemePreset(t.id);
                        setPrimaryColor(t.primaryColor);
                      }}
                      className={`flex flex-col text-left rounded-xl border p-3.5 transition ${
                        themePreset === t.id
                          ? 'border-emerald-600 ring-2 ring-emerald-600/10 bg-emerald-50/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="size-4 rounded-full" style={{ backgroundColor: t.primaryColor }} />
                        <span className="size-4 rounded-full" style={{ backgroundColor: t.secondaryColor || t.accentColor }} />
                        <span className="text-xs font-bold text-slate-900">{t.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{t.fontVibe}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="size-10 cursor-pointer rounded-lg border border-slate-200 p-1"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-32 rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Hero Tagline & Announcement
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="E.g. Welcome to our exclusive handcrafted collection."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-5">
                <Link
                  href={`/stores/${currentStore.slug}`}
                  target="_blank"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  <ExternalLink size={13} /> Preview Storefront
                </Link>

                <button
                  type="submit"
                  disabled={isSavingTheme}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500 disabled:opacity-50"
                >
                  {isSavingTheme ? 'Saving Changes...' : 'Save Theme Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Store Settings & Ordering</h2>
              <p className="text-xs text-slate-500">Configure WhatsApp customer ordering and contact details.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Store Subdomain
                </label>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 font-mono">
                  <Globe size={14} className="text-slate-400" />
                  <span>https://{currentStore.slug}.buildexom.store</span>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Customer storefront link generated automatically.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  WhatsApp Ordering Number
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="923001234567"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  />
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Test Number
                  </a>
                </div>
                <p className="mt-1 text-[10px] text-slate-400">
                  Customers will send their orders directly to this WhatsApp number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Store Admin Email
                </label>
                <input
                  type="text"
                  value={currentStore.owner_email || 'admin@store.com'}
                  disabled
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Store Subscription Plan
                  </label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('plans')}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    View All Plans & Features →
                  </button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-slate-800">
                      {plan.toUpperCase()} PLAN
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {plan === 'basic' ? 'Up to 20 products, Cash on Delivery' : plan === 'pro' ? 'Up to 75 products, WhatsApp & Bexi AI bot' : 'Unlimited products, full AI Voice Store control'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('plans')}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                  >
                    Change Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MERCHANT SUBSCRIPTION PLANS */}
        {activeTab === 'plans' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Subscription Plans & Store Upgrades</h2>
              <p className="text-xs text-slate-500">
                Choose the plan that suits your scale. Upgrades apply instantly to catalog limits and AI features.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Plan 1: Basic */}
              <div className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                plan === 'basic'
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                {plan === 'basic' && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Current Active Plan
                  </span>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-slate-100 text-slate-700">
                      <Store size={20} />
                    </span>
                    <span className="text-xs font-bold text-slate-500">Starter</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Basic Plan</h3>
                    <p className="mt-1 text-2xl font-black text-slate-900">Free</p>
                    <p className="text-[11px] text-slate-500">Ideal for new merchants launching a storefront.</p>
                  </div>
                  <ul className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Up to 20 Products</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Cash on Delivery Checkout</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Clean Responsive Web Store</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Store QR Code</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    disabled={plan === 'basic' || isUpdatingPlan}
                    onClick={() => handleUpdatePlan('basic')}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                      plan === 'basic'
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {plan === 'basic' ? 'Active Plan' : isUpdatingPlan ? 'Updating...' : 'Switch to Basic'}
                  </button>
                </div>
              </div>

              {/* Plan 2: Pro */}
              <div className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                plan === 'pro'
                  ? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                <span className="absolute -top-3 right-6 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                  Most Popular
                </span>
                {plan === 'pro' && (
                  <span className="absolute -top-3 left-6 rounded-full bg-emerald-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Current Active Plan
                  </span>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                      <Zap size={20} />
                    </span>
                    <span className="text-xs font-bold text-blue-600">Growing Brand</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Pro Merchant</h3>
                    <p className="mt-1 text-2xl font-black text-slate-900">Rs. 2,999 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <p className="text-[11px] text-slate-500">Automated WhatsApp ordering & Bexi AI shopping bot.</p>
                  </div>
                  <ul className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Up to 75 Products</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Direct WhatsApp Order Routing</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Bexi AI Assistant (Urdu & English)</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Full Theme Color Customization</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Social Links & Live Catalog Sync</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    disabled={plan === 'pro' || isUpdatingPlan}
                    onClick={() => handleUpdatePlan('pro')}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                      plan === 'pro'
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
                    }`}
                  >
                    {plan === 'pro' ? 'Active Plan' : isUpdatingPlan ? 'Updating...' : 'Upgrade to Pro'}
                  </button>
                </div>
              </div>

              {/* Plan 3: Advanced */}
              <div className={`relative flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                plan === 'advanced'
                  ? 'border-indigo-500 bg-white ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}>
                {plan === 'advanced' && (
                  <span className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Current Active Plan
                  </span>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Crown size={20} />
                    </span>
                    <span className="text-xs font-bold text-indigo-600">Enterprise VIP</span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Advanced VIP</h3>
                    <p className="mt-1 text-2xl font-black text-slate-900">Rs. 5,999 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <p className="text-[11px] text-slate-500">Full AI Voice Control & unlimited store scaling.</p>
                  </div>
                  <ul className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Unlimited Products</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Voice-to-Action AI Assistant</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Advance Partial Payment Support</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Verified Merchant Gold Badge</li>
                    <li className="flex items-center gap-2"><Check size={14} className="text-emerald-600" /> Priority 24/7 Support Hotline</li>
                  </ul>
                </div>
                <div className="pt-6">
                  <button
                    type="button"
                    disabled={plan === 'advanced' || isUpdatingPlan}
                    onClick={() => handleUpdatePlan('advanced')}
                    className={`w-full rounded-xl py-2.5 text-xs font-bold transition ${
                      plan === 'advanced'
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20'
                    }`}
                  >
                    {plan === 'advanced' ? 'Active Plan' : isUpdatingPlan ? 'Updating...' : 'Upgrade to Advanced'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs" 
            onClick={() => setIsProductModalOpen(false)} 
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="E.g. Velvet Royal Amber Oud 100ml"
                  required
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (PKR)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="E.g. 4500"
                    required
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    placeholder="E.g. Fragrances"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Product highlights, notes, materials, or sizes..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Image URL(s)</label>
                <input
                  type="text"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... (comma-separated for multiple)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-emerald-600 focus:outline-none"
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  Enter 1 URL or multiple image URLs separated by commas. First image is the main cover.
                </p>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-2 font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  {editingProduct ? 'Update Product' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Voice-Controlled Store Management Assistant (Bilingual: English & Urdu) */}
      <VoiceStoreAssistant 
        storeId={currentStore.id}
        storeSlug={currentStore.slug}
        onActionExecuted={(actionType, actionData) => {
          if (actionType === 'ADD_PRODUCT' && actionData.createdProduct) {
            setProducts(prev => [actionData.createdProduct, ...prev]);
            showNotice('success', `Voice AI added '${actionData.createdProduct.name}' to catalog!`);
          } else if (actionType === 'DELETE_PRODUCT' && actionData.deletedItem) {
            setProducts(prev => prev.filter(p => p.name.toLowerCase() !== actionData.deletedItem.toLowerCase()));
            showNotice('success', `Voice AI deleted '${actionData.deletedItem}' from catalog.`);
          } else if (actionType === 'UPDATE_PRODUCT' && actionData.updatedProduct) {
            setProducts(prev => prev.map(p => p.id === actionData.updatedProduct.id ? actionData.updatedProduct : p));
            showNotice('success', `Voice AI updated price for '${actionData.updatedProduct.name}'!`);
          } else {
            showNotice('success', 'Voice AI updated store settings.');
          }
        }}
      />
    </div>
  );
}
