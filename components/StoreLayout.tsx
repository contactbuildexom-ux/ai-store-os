import React from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface StoreLayoutProps {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  products: Product[];
  themeColor?: string;
}

export default function StoreLayout({
  storeName,
  tagline,
  whatsappNumber,
  products,
  themeColor = 'bg-slate-900' // Classy professional dark/neutral tone
}: StoreLayoutProps) {
  
  const handleWhatsAppOrder = (productName: string, price: number) => {
    const message = `Hello! I want to order this item:%0A%0A*Product:* ${productName}%0A*Price:* Rs. ${price}%0A%0AKindly confirm my order!`;
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* 1. Professional Header / Hero Section */}
      <header className={`${themeColor} text-white py-16 px-6 text-center shadow-sm`}>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{storeName}</h1>
          <p className="mt-3 text-lg text-stone-300 font-light">{tagline}</p>
        </div>
      </header>

      {/* 2. Main Product Columns Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
          <h2 className="text-2xl font-semibold tracking-tight">Catalog</h2>
          <span className="text-sm text-stone-500">{products.length} items available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products && products.length > 0 ? (
            products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-2xl p-6 shadow-xs hover:shadow-md transition-all duration-300 border border-stone-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-lg font-medium text-stone-900">{product.name}</h3>
                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    {product.description || "Handcrafted with perfection for daily use."}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-lg font-semibold text-stone-900">Rs. {product.price}</span>
                  <button 
                    onClick={() => handleWhatsAppOrder(product.name, product.price)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-xs"
                  >
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-dashed border-stone-300">
              <p className="text-stone-500 font-medium">No products added to this store yet.</p>
            </div>
          )}
        </div>
      </main>

      {/* 3. Professional Footer */}
      <footer className="bg-white border-t border-stone-200 text-center py-8 mt-20 text-xs text-stone-400">
        <p>© {new Date().getFullYear()} {storeName}. Securely powered by AI Store OS.</p>
      </footer>
    </div>
  );
}