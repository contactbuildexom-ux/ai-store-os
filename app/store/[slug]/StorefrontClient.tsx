'use client';

import { useState } from 'react';

export default function StorefrontClient({ store, settings, products, delivery }: any) {
    const themeColor = settings?.theme_color || '#1d7555';
    const bannerText = settings?.banner_text || `Welcome to ${store.name}`;

    const [cart, setCart] = useState<any[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [orderStatus, setOrderStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = delivery?.delivery_fee || 0;
    const finalAmount = totalAmount > 0 ? totalAmount + deliveryFee : 0;

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) { alert('Cart is empty!'); return; }
        setLoading(true);
        setOrderStatus('');

        try {
            const res = await fetch('/api/stores/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: store.id,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    customer_address: customerAddress,
                    items: cart,
                    total_amount: finalAmount,
                    is_whatsapp_order: false
                })
            });
            const data = await res.json();
            if (data.success) {
                setOrderStatus('Order placed successfully! Thank you for shopping.');
                setCart([]);
                setCustomerName('');
                setCustomerPhone('');
                setCustomerAddress('');
            } else {
                setOrderStatus(data.error || 'Failed to place order.');
            }
        } catch (err: any) {
            setOrderStatus(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Banner / Announcement Bar */}
            <div className="text-white text-xs py-2 px-4 text-center font-medium" style={{ backgroundColor: themeColor }}>
                🎉 {bannerText}
            </div>

            {/* Header */}
            <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
                <h1 className="text-lg font-bold" style={{ color: themeColor }}>{store.name}</h1>
                <div className="text-xs bg-gray-100 px-3 py-1.5 rounded-full border">
                    Delivery: <b>{delivery?.estimated_days || 'Standard'}</b> | Fee: <b>PKR {delivery?.delivery_fee || 0}</b>
                </div>
            </header>

            {/* Main Store Content */}
            <div className="max-w-6xl mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Products List */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Our Products</h2>
                    {products.length === 0 ? (
                        <p className="text-xs text-gray-500 bg-white p-6 rounded-xl border">No products available in this store yet. Add products from your merchant dashboard!</p>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            {products.map((product: any) => (
                                <div key={product.id} className="bg-white p-4 rounded-xl border shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-800">{product.name}</h3>
                                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs font-bold" style={{ color: themeColor }}>PKR {product.price}</span>
                                        <button 
                                            onClick={() => addToCart(product)} 
                                            className="px-3 py-1.5 text-white rounded text-[10px] font-medium hover:opacity-90 transition"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cart & Checkout Sidebar */}
                <div className="bg-white p-6 rounded-xl border shadow-sm h-fit space-y-4">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">Shopping Cart</h2>
                    {cart.length === 0 ? (
                        <p className="text-xs text-gray-500">Your cart is empty.</p>
                    ) : (
                        <div className="space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-xs border-b pb-2">
                                    <div>
                                        <p className="font-bold text-gray-800">{item.name}</p>
                                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold" style={{ color: themeColor }}>PKR {item.price * item.quantity}</p>
                                </div>
                            ))}

                            <div className="pt-2 text-xs space-y-1">
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee:</span>
                                    <span>PKR {deliveryFee}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 text-sm pt-1 border-t">
                                    <span>Total:</span>
                                    <span style={{ color: themeColor }}>PKR {finalAmount}</span>
                                </div>
                            </div>

                            <form onSubmit={handleCheckout} className="space-y-3 pt-4 border-t">
                                <h3 className="text-xs font-bold text-gray-800">Checkout Details</h3>
                                <input 
                                    type="text" 
                                    placeholder="Your Name" 
                                    value={customerName} 
                                    onChange={e => setCustomerName(e.target.value)} 
                                    required 
                                    className="w-full p-2 border rounded text-xs" 
                                />
                                <input 
                                    type="text" 
                                    placeholder="Phone Number (e.g. 03001234567)" 
                                    value={customerPhone} 
                                    onChange={e => setCustomerPhone(e.target.value)} 
                                    required 
                                    className="w-full p-2 border rounded text-xs" 
                                />
                                <textarea 
                                    placeholder="Delivery Address" 
                                    value={customerAddress} 
                                    onChange={e => setCustomerAddress(e.target.value)} 
                                    required 
                                    className="w-full p-2 border rounded text-xs" 
                                    rows={2}
                                ></textarea>
                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="w-full py-2.5 text-white rounded text-xs font-bold hover:opacity-90 disabled:opacity-50 transition"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {loading ? 'Placing Order...' : 'Place Order Now'}
                                </button>
                            </form>
                        </div>
                    )}
                    {orderStatus && (
                        <p className="text-[11px] font-medium p-2 bg-green-50 text-green-700 rounded border border-green-200 mt-2">{orderStatus}</p>
                    )}
                </div>
            </div>
        </div>
    );
}