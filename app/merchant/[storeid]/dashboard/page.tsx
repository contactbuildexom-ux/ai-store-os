"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";

type Store = {
  id: string;
  name?: string | null;
  slug?: string | null;
  plan?: string | null;
  whatsapp_number?: string | null;
};

type Product = {
  id: string;
  store_id: string;
  name: string;
  price: number | string;
  description?: string | null;
  image_url?: string | null;
  category_id?: string | null;
};

type Category = {
  id: string;
  store_id: string;
  name: string;
};

type Order = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  total_amount?: number | string | null;
  status?: string | null;
};

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value ?? "";
}

function normalizePlan(plan?: string | null) {
  const value = (plan || "basic").toLowerCase();
  return value === "free" ? "basic" : value;
}

export default function MasterMerchantDashboard() {
  const params = useParams();
  const storeSlug = getParam(params.storeid as string | string[] | undefined);

  const [store, setStore] = useState<Store | null>(null);
  const storeId = store?.id ?? "";
  const storePlan = normalizePlan(store?.plan);
  const isPro = useMemo(() => ["pro", "business"].includes(storePlan), [storePlan]);

  const [activeTab, setActiveTab] = useState("overview");
  const [themeColor, setThemeColor] = useState("#1d7555");
  const [bannerText, setBannerText] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [footerText, setFooterText] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [jazzcashNumber, setJazzcashNumber] = useState("");
  const [easypaisaNumber, setEasypaisaNumber] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCategory, setProdCategory] = useState("");
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);

  const [catName, setCatName] = useState("");
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  function showMessage(text: string, type: "success" | "error" = "success") {
    setMessage(text);
    setMessageType(type);
  }

  async function readJson(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  async function fetchAllData() {
    if (!storeSlug) return;
    setLoading(true);
    try {
      const storeData = await readJson(await fetch(`/api/stores/${encodeURIComponent(storeSlug)}`));
      const resolvedStore = storeData.store as Store;
      setStore(resolvedStore);
      setProducts(storeData.products ?? []);
      setCategories(storeData.categories ?? []);
      setWhatsappNumber(resolvedStore.whatsapp_number ?? "");

      const settingsData = await readJson(await fetch(`/api/stores/settings?store_id=${resolvedStore.id}`));
      if (settingsData.settings) {
        setThemeColor(settingsData.settings.theme_color || "#1d7555");
        setBannerText(settingsData.settings.banner_text || "");
        setLogoUrl(settingsData.settings.logo_url || "");
        setFooterText(settingsData.settings.footer_text || "");
        setCustomDomain(settingsData.settings.custom_domain || "");
        setWhatsappNumber(settingsData.settings.whatsapp_number || resolvedStore.whatsapp_number || "");
      }

      const ordersResponse = await fetch(`/api/stores/orders?store_id=${resolvedStore.id}`);
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) setOrders(ordersData.orders ?? []);
      }
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Unable to load merchant dashboard.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchAllData();
    }, 0);

    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeSlug]);

  async function uploadProductImage(file: File) {
    if (!storeId) throw new Error("Store is still loading. Try again in a moment.");
    if (!file.type.startsWith("image/")) throw new Error("Choose a valid image file.");

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("store_id", storeId);
      formData.append("file", file);

      const {
        data: { session },
      } = await createSupabaseBrowserClient().auth.getSession();
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined;
      const data = await readJson(await fetch("/api/stores/product-image", { method: "POST", body: formData, headers }));
      return String(data.image_url || "");
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleLogoImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    try {
      const imageUrl = await uploadProductImage(file);
      if (!imageUrl) throw new Error("The uploaded logo did not return an image URL.");
      setLogoUrl(imageUrl);
      showMessage("Logo image uploaded. Save branding changes to publish it.");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to upload logo image.", "error");
    }
  }

  async function handleSaveSettings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!storeId) return;

    setSaving(true);
    try {
      const data = await readJson(await fetch("/api/stores/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          store_id: storeId,
          theme_color: themeColor,
          banner_text: bannerText,
          logo_url: logoUrl,
          footer_text: footerText,
          custom_domain: customDomain,
          whatsapp_number: whatsappNumber,
        }),
      }));
      showMessage(data.message || "Store settings updated successfully.");
      fetchAllData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to update settings.", "error");
    } finally {
      setSaving(false);
    }
  }

  function resetProductForm() {
    setProdName("");
    setProdPrice("");
    setProdDesc("");
    setProdCategory("");
    setProdImageFile(null);
    setProdImageUrl("");
    setEditingProdId(null);
    setFileInputKey((value) => value + 1);
  }

  async function handleSaveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!storeId) return;

    const name = prodName.trim();
    const price = Number(prodPrice);
    if (!name) return showMessage("Product name is required.", "error");
    if (!Number.isFinite(price) || price < 0) return showMessage("Enter a valid product price.", "error");

    setSaving(true);
    try {
      const uploadedImageUrl = prodImageFile ? await uploadProductImage(prodImageFile) : prodImageUrl;
      const method = editingProdId ? "PUT" : "POST";
      const bodyData: Record<string, string | number | null> = {
        store_id: storeId,
        name,
        price,
        description: prodDesc.trim() || null,
        category_id: prodCategory || null,
        image_url: uploadedImageUrl || null,
      };
      if (editingProdId) bodyData.id = editingProdId;

      const data = await readJson(await fetch("/api/stores/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      }));

      showMessage(data.message || (editingProdId ? "Product updated successfully." : "Product added successfully."));
      resetProductForm();
      fetchAllData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save product.", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleEditProduct(prod: Product) {
    setEditingProdId(prod.id);
    setProdName(prod.name ?? "");
    setProdPrice(String(prod.price ?? ""));
    setProdDesc(prod.description ?? "");
    setProdCategory(prod.category_id ?? "");
    setProdImageUrl(prod.image_url ?? "");
    setProdImageFile(null);
    setFileInputKey((value) => value + 1);
    setActiveTab("products");
  }

  async function handleDeleteProduct(id: string) {
    if (!storeId || !confirm("Delete this product?")) return;
    try {
      const data = await readJson(await fetch(`/api/stores/products?id=${encodeURIComponent(id)}&store_id=${encodeURIComponent(storeId)}`, { method: "DELETE" }));
      showMessage(data.message || "Product deleted successfully.");
      fetchAllData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to delete product.", "error");
    }
  }

  async function handleSaveCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!storeId) return;

    const name = catName.trim();
    if (!name) return showMessage("Category name is required.", "error");

    const method = editingCatId ? "PUT" : "POST";
    const payload: Record<string, string> = { store_id: storeId, name };
    if (editingCatId) payload.id = editingCatId;

    try {
      const data = await readJson(await fetch("/api/stores/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      showMessage(data.message || "Category saved successfully.");
      setCatName("");
      setEditingCatId(null);
      fetchAllData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to save category.", "error");
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!storeId || !confirm("Delete this category? Products using it will become uncategorized.")) return;
    try {
      const data = await readJson(await fetch(`/api/stores/categories?id=${encodeURIComponent(id)}&store_id=${encodeURIComponent(storeId)}`, { method: "DELETE" }));
      showMessage(data.message || "Category deleted successfully.");
      fetchAllData();
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Failed to delete category.", "error");
    }
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "branding", label: "Branding" },
    { id: "payments", label: "Payments" },
    { id: "analytics", label: "Analytics", pro: true },
    { id: "categories", label: `Categories (${categories.length})` },
    { id: "products", label: `Products (${products.length})` },
    { id: "orders", label: `Orders (${orders.length})` },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <aside className="flex w-64 flex-col bg-gray-900 text-white shadow-xl">
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 rounded-full shadow" style={{ backgroundColor: themeColor }} />
            <div className="min-w-0">
              <h2 className="text-xs font-bold uppercase tracking-wider">Merchant OS</h2>
              <p className="truncate text-[10px] text-gray-400">{store?.name || storeSlug || "Loading store"}</p>
            </div>
          </div>
          <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${isPro ? "bg-emerald-500/15 text-emerald-200" : "bg-amber-500/15 text-amber-200"}`}>
            {storePlan} plan
          </span>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 text-xs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full rounded-lg px-4 py-2.5 text-left font-medium transition ${activeTab === tab.id ? "text-white shadow-sm" : "text-gray-300 hover:bg-gray-800"}`}
              style={activeTab === tab.id ? { backgroundColor: themeColor } : undefined}
            >
              <span className="flex items-center justify-between gap-2">
                {tab.label}
                {tab.pro && !isPro && <span className="rounded bg-amber-300/15 px-1.5 py-0.5 text-[9px] text-amber-200">Pro</span>}
              </span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto">
        <header className="flex items-center justify-between border-b bg-white px-8 py-4 shadow-sm">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-widest text-gray-800">{activeTab} Control Panel</h1>
            <p className="mt-1 text-[11px] text-gray-500">Dashboard URL: /merchant/{storeSlug}/dashboard</p>
          </div>
          <div className="rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-sm" style={{ backgroundColor: themeColor }}>
            {loading ? "Syncing..." : "Live Store Sync Active"}
          </div>
        </header>

        <div className="max-w-5xl p-8">
          {!isPro && (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Basic Plan active. Upgrade to Pro to unlock WhatsApp ordering, advanced analytics, custom domain settings, and expanded branding.
            </div>
          )}

          {message && (
            <div className={`mb-6 rounded-lg border px-3 py-3 text-xs font-medium shadow-sm ${messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
              {message}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <Metric label="Total Orders" value={orders.length} />
              <Metric label="Total Products" value={products.length} />
              <Metric label="Categories" value={categories.length} />
              <Metric label="Plan" value={storePlan.toUpperCase()} />
            </div>
          )}

          {activeTab === "branding" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">Store Branding</h3>
              <form onSubmit={handleSaveSettings} className="max-w-lg space-y-4">
                <Field label="Banner Announcement Text">
                  <input type="text" value={bannerText} onChange={(e) => setBannerText(e.target.value)} className="w-full rounded-lg border p-2.5 text-xs" />
                </Field>
                <Field label="Theme Color Code">
                  <div className="flex items-center gap-2">
                    <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-10 cursor-pointer rounded border" />
                    <input type="text" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="flex-1 rounded-lg border p-2.5 font-mono text-xs" />
                  </div>
                </Field>
                <div className="block text-[11px] font-bold text-gray-700">
                  <span>Store Logo</span>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <label className={`relative inline-flex cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 ${uploadingImage ? "cursor-not-allowed opacity-60" : ""}`}>
                        Choose image
                        <input disabled={uploadingImage} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleLogoImageChange} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Choose store logo image" />
                      </label>
                      {uploadingImage && <span className="shrink-0 text-[11px] text-gray-500">Uploading...</span>}
                    </div>
                    {logoUrl && <p className="max-w-full truncate text-[11px] font-normal text-gray-500" title={logoUrl}>Logo selected</p>}
                    <p className="text-[11px] font-normal text-gray-500">Choose a PNG, JPG, WebP, or GIF image up to 5 MB.</p>
                  </div>
                </div>
                <ProGate enabled={isPro} feature="Custom footer and domain settings">
                  <Field label="Footer Text / Copyright">
                    <input disabled={!isPro} type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="2026 All rights reserved." className="w-full rounded-lg border p-2.5 text-xs disabled:bg-gray-100" />
                  </Field>
                  <Field label="Custom Domain">
                    <input disabled={!isPro} type="text" value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="shop.example.com" className="w-full rounded-lg border p-2.5 text-xs disabled:bg-gray-100" />
                  </Field>
                </ProGate>
                <button disabled={saving || uploadingImage || !storeId} type="submit" className="rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:cursor-wait disabled:opacity-70" style={{ backgroundColor: themeColor }}>
                  {saving ? "Saving..." : "Save Branding Changes"}
                </button>
              </form>
            </section>
          )}

          {activeTab === "payments" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-800">Payments & WhatsApp Integration</h3>
              <p className="mb-4 text-[11px] text-gray-500">Standard payment numbers are available on Basic. WhatsApp ordering is enabled on Pro.</p>
              <form onSubmit={handleSaveSettings} className="max-w-lg space-y-4">
                <ProGate enabled={isPro} feature="WhatsApp ordering integration">
                  <Field label="WhatsApp Order Number">
                    <input disabled={!isPro} type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="03001234567" className="w-full rounded-lg border p-2.5 text-xs disabled:bg-gray-100" />
                  </Field>
                </ProGate>
                <Field label="JazzCash Account Number">
                  <input type="text" value={jazzcashNumber} onChange={(e) => setJazzcashNumber(e.target.value)} placeholder="03001234567" className="w-full rounded-lg border p-2.5 text-xs" />
                </Field>
                <Field label="Easypaisa Account Number">
                  <input type="text" value={easypaisaNumber} onChange={(e) => setEasypaisaNumber(e.target.value)} placeholder="03001234567" className="w-full rounded-lg border p-2.5 text-xs" />
                </Field>
                <button disabled={saving || !storeId} type="submit" className="rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:cursor-wait disabled:opacity-70" style={{ backgroundColor: themeColor }}>
                  {saving ? "Saving..." : "Save Payment Details"}
                </button>
              </form>
            </section>
          )}

          {activeTab === "analytics" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">Advanced Analytics</h3>
              {isPro ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Metric label="Conversion Signals" value={orders.length ? "Active" : "Waiting"} />
                  <Metric label="Catalog Depth" value={products.length} />
                  <Metric label="Order Channels" value={whatsappNumber ? "WhatsApp + Store" : "Store"} />
                </div>
              ) : (
                <LockedPanel title="Advanced analytics are a Pro feature." />
              )}
            </section>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">{editingCatId ? "Edit Category" : "Add New Category"}</h3>
                <form onSubmit={handleSaveCategory} className="flex max-w-lg gap-3">
                  <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="e.g. Birthday Cakes" className="flex-1 rounded-lg border p-2.5 text-xs" />
                  <button type="submit" className="rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90" style={{ backgroundColor: themeColor }}>
                    {editingCatId ? "Update" : "Add"}
                  </button>
                  {editingCatId && <button type="button" onClick={() => { setEditingCatId(null); setCatName(""); }} className="rounded-lg bg-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700">Cancel</button>}
                </form>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">Existing Categories</h3>
                {categories.length === 0 ? <p className="text-xs text-gray-500">No categories created yet.</p> : (
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat.id} className="inline-flex items-center gap-2 rounded-lg border bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700">
                        {cat.name}
                        <button onClick={() => { setEditingCatId(cat.id); setCatName(cat.name); }} className="text-blue-700">Edit</button>
                        <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-700">Delete</button>
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-6">
              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">{editingProdId ? "Edit Product" : "Add New Product"}</h3>
                <form onSubmit={handleSaveProduct} className="max-w-lg space-y-4">
                  <Field label="Product Name">
                    <input type="text" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full rounded-lg border p-2.5 text-xs" />
                  </Field>
                  <Field label="Price (PKR)">
                    <input type="number" min="0" step="0.01" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="w-full rounded-lg border p-2.5 text-xs" />
                  </Field>
                  <Field label="Category">
                    <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full rounded-lg border p-2.5 text-xs">
                      <option value="">No category</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Product Image">
                    <input key={fileInputKey} type="file" accept="image/*" onChange={(e: ChangeEvent<HTMLInputElement>) => setProdImageFile(e.target.files?.[0] ?? null)} className="w-full rounded-lg border p-2.5 text-xs" />
                    {(prodImageFile || prodImageUrl) && <p className="mt-1 text-[10px] text-gray-500">{prodImageFile ? prodImageFile.name : "Current image will be kept unless you choose a new file."}</p>}
                  </Field>
                  <Field label="Description">
                    <textarea value={prodDesc} onChange={(e) => setProdDesc(e.target.value)} rows={3} className="w-full rounded-lg border p-2.5 text-xs" />
                  </Field>
                  <div className="flex gap-2">
                    <button disabled={saving || uploadingImage || !storeId} type="submit" className="rounded-lg px-4 py-2.5 text-xs font-bold text-white shadow hover:opacity-90 disabled:cursor-wait disabled:opacity-70" style={{ backgroundColor: themeColor }}>
                      {uploadingImage ? "Uploading image..." : saving ? "Saving..." : editingProdId ? "Update Product" : "Publish Product"}
                    </button>
                    {editingProdId && <button type="button" onClick={resetProductForm} className="rounded-lg bg-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700">Cancel</button>}
                  </div>
                </form>
              </section>

              <section className="rounded-xl border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">Store Products List</h3>
                {products.length === 0 ? <p className="text-xs text-gray-500">No products added yet.</p> : (
                  <div className="space-y-3">
                    {products.map((prod) => (
                      <div key={prod.id} className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          {prod.image_url ? <Image unoptimized src={prod.image_url} alt="" width={48} height={48} className="h-12 w-12 rounded-lg border object-cover" /> : <div className="h-12 w-12 rounded-lg border bg-white" />}
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-gray-800">{prod.name} - <span style={{ color: themeColor }}>PKR {prod.price}</span></p>
                            <p className="truncate text-[10px] text-gray-500">{prod.description || "No description"}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button onClick={() => handleEditProduct(prod)} className="rounded bg-blue-100 px-3 py-1 text-[10px] font-bold text-blue-700">Edit</button>
                          <button onClick={() => handleDeleteProduct(prod.id)} className="rounded bg-red-100 px-3 py-1 text-[10px] font-bold text-red-700">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === "orders" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-gray-800">Customer Orders</h3>
              {orders.length === 0 ? <p className="text-xs text-gray-500">No orders received yet.</p> : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                      <div>
                        <p className="text-xs font-bold text-gray-800">{order.customer_name} ({order.customer_phone})</p>
                        <p className="text-[10px] text-gray-500">{order.customer_address}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold" style={{ color: themeColor }}>PKR {order.total_amount}</p>
                        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">{order.status || "pending"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-bold text-gray-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <article className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-xs font-medium text-gray-500">{label}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </article>
  );
}

function ProGate({ enabled, feature, children }: { enabled: boolean; feature: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      {!enabled && <LockedPanel title={`${feature} require Pro.`} />}
      {children}
    </div>
  );
}

function LockedPanel({ title }: { title: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-xs font-medium text-amber-900">
      {title} Upgrade to Pro to enable this feature.
    </div>
  );
}