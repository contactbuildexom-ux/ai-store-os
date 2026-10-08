'use client';

import { useState } from 'react';

export default function V2TestPage() {
  const [storeId, setStoreId] = useState('');
  const [output, setOutput] = useState('Results will appear here...');

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

  const addProduct = async () => {
    if (!storeId) {
      alert('Pehle Store Create karein!');
      return;
    }
    const res2 = await fetch('/api/stores/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        name: "Chocolate Fudge Cake", // Yahan 'name' ki jagah 'title' kar diya hai
        description: "Rich chocolate cake with extra fudge",
        price: 1500,
        image_url: "https://example.com/cake.jpg"
      })
    });
    const data = await res2.json();
    setOutput(JSON.stringify(data, null, 2));
  };

  const placeOrder = async () => {
    if (!storeId) {
      alert('Pehle Store Create karein!');
      return;
    }
    const res3 = await fetch('/api/stores/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: storeId,
        customer_name: "Abeera",
        customer_phone: "+923111234567",
        total_amount: 1500,
        items: [{ name: "Chocolate Fudge Cake", qty: 1, price: 1500 }]
      })
    });
    const data = await res3.json();
    setOutput(JSON.stringify(data, null, 2));
  };

  return (
    <div className="p-8 max-w-2xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold mb-2 text-gray-900">AI Store OS - V2 Browser Testing Panel</h1>
      <p className="text-xs text-gray-600 mb-6">Browser URL mein <code className="bg-white px-2 py-1 rounded border">http://localhost:3000/test-v2</code> khol kar in buttons se APIs test karein.</p>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Active Store ID (Auto-filled on Store Creation):</label>
          <input 
            type="text" 
            value={storeId} 
            onChange={(e) => setStoreId(e.target.value)} 
            placeholder="Store ID yahan aayegi" 
            className="w-full p-2 border rounded text-xs outline-none focus:border-green-600"
          />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button onClick={createStore} className="px-4 py-2 bg-[#1d7555] text-white rounded text-xs font-medium hover:bg-[#155d42]">
            1. Create Store (AI/Theme)
          </button>
          <button onClick={addProduct} className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700">
            2. Add Product (Limit Check)
          </button>
          <button onClick={placeOrder} className="px-4 py-2 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700">
            3. Place Order (WhatsApp)
          </button>
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