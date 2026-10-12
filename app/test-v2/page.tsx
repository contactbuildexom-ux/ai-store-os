'use client';

import { useState } from 'react';

export default function V2TestPage() {
    const [storeId, setStoreId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [productId, setProductId] = useState('');
    const [output, setOutput] = useState('Results will appear here...');

    // Store Creation
    const createStore = async () => {
        const res = await fetch('/api/ai/create-store', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Dough Art Bakers",
                slug: "dough-art-" + Date.now(),
                owner_email: `owner_${Date.now()}@doughart.com`,
                password_hash: "hashed_123",
                whatsapp_number: "+923001234567",
                plan: "basic",
                prompt: "Create bakery with dark theme"
            })
        });
        const data = await res.json();
        if (data.store) setStoreId(data.store.id);
        setOutput(JSON.stringify(data, null, 2));
    };

    // Categories
    const createCategory = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_id: storeId, name: "Cakes & Pastries" })
        });
        const data = await res.json();
        if (data.category) setCategoryId(data.category.id);
        setOutput(JSON.stringify(data, null, 2));
    };

    // Products
    const addProduct = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id: storeId,
                category_id: categoryId || null,
                name: "Chocolate Fudge Cake",
                price: 1500,
                description: "Delicious rich chocolate cake",
                image_url: "https://example.com/cake.jpg"
            })
        });
        const data = await res.json();
        if (data.product) setProductId(data.product.id);
        setOutput(JSON.stringify(data, null, 2));
    };

    // Delivery Settings
    const saveDelivery = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/delivery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id: storeId,
                delivery_fee: 250,
                free_delivery_above: 3000,
                estimated_days: "1-2 business days"
            })
        });
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    const getDelivery = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch(`/api/stores/delivery?store_id=${storeId}`);
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    // Payment Methods
    const addPayment = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id: storeId,
                payment_method: "JazzCash",
                transaction_id: "TXN_" + Date.now(), // Har click par unique ID banegi
                amount: 1500
            })
        });
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };
    const createOrder = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id: storeId,
                customer_name: "Ali Ahmed",
                customer_phone: "03009876543",
                customer_address: "House 123, Street 4, Lahore",
                items: [{ product_id: productId || "sample-id", name: "Chocolate Fudge Cake", quantity: 1, price: 1500 }],
                total_amount: 1500,
                is_whatsapp_order: false
            })
        });
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    const getPayments = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch(`/api/stores/payments?store_id=${storeId}`);
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    // Store Settings
    const saveSettings = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch('/api/stores/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                store_id: storeId,
                theme_color: "#1d7555",
                banner_text: "Special Discount on All Cakes!",
                font_style: "inter",
                logo_url: "https://example.com/logo.png"
            })
        });
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    const getSettings = async () => {
        if (!storeId) { alert('Pehle Store Create karein!'); return; }
        const res = await fetch(`/api/stores/settings?store_id=${storeId}`);
        const data = await res.json();
        setOutput(JSON.stringify(data, null, 2));
    };

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans bg-gray-50 min-h-screen">
            <h1 className="text-xl font-bold mb-2 text-gray-900">AI Store OS - Full Backend Testing Panel</h1>
            <p className="text-xs text-gray-600 mb-6">Browser mein <code className="bg-white px-2 py-1 rounded border">http://localhost:3000/test-v2</code> khol kar test karein.</p>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-3 mb-6">
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">Store ID:</label>
                        <input type="text" value={storeId} onChange={(e) => setStoreId(e.target.value)} className="w-full p-2 border rounded text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">Category ID:</label>
                        <input type="text" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full p-2 border rounded text-xs" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1">Product ID:</label>
                        <input type="text" value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full p-2 border rounded text-xs" />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    <button onClick={createStore} className="px-3 py-2 bg-[#1d7555] text-white rounded text-xs font-medium">1. Create Store</button>
                    <button onClick={createCategory} className="px-3 py-2 bg-green-600 text-white rounded text-xs font-medium">2. Create Category</button>
                    <button onClick={addProduct} className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium">3. Add Product</button>
                    <button onClick={saveDelivery} className="px-3 py-2 bg-amber-600 text-white rounded text-xs font-medium">4. Save Delivery</button>
                    <button onClick={getDelivery} className="px-3 py-2 bg-gray-700 text-white rounded text-xs font-medium">5. Get Delivery</button>
                    <button onClick={addPayment} className="px-3 py-2 bg-purple-600 text-white rounded text-xs font-medium">6. Add Payment</button>
                    <button onClick={getPayments} className="px-3 py-2 bg-gray-700 text-white rounded text-xs font-medium">7. Get Payments</button>
                    <button onClick={saveSettings} className="px-3 py-2 bg-indigo-600 text-white rounded text-xs font-medium">8. Save Settings</button>
                    <button onClick={getSettings} className="px-3 py-2 bg-gray-700 text-white rounded text-xs font-medium">9. Get Settings</button>
                    <button onClick={createOrder} className="px-3 py-2 bg-pink-600 text-white rounded text-xs font-medium">10. Create Order</button>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-xs text-gray-700 mb-2">Live Response Output:</h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-auto max-h-80">
                    {output}
                </pre>
            </div>
        </div>
    );
}