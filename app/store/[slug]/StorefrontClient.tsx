'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';

type Product = {
    id: string;
    name: string;
    description?: string | null;
    price: number | string;
    image_url?: string | null;
};

type CartItem = Product & { quantity: number };
type DeliverySettings = {
    delivery_fee?: number | string | null;
    city_rate?: number | string | null;
    other_city_rate?: number | string | null;
    store_city?: string | null;
    free_delivery_above?: number | string | null;
    estimated_days?: string | null;
};
type Store = { id: string; name: string; slug: string; plan: string; whatsapp_number: string; accepts_cod: boolean; accepts_advance: boolean; advance_percentage: number };
type Props = {
    store: Store;
    settings: { theme_color?: string | null; banner_text?: string | null; logo_url?: string | null } | null;
    products: Product[];
    delivery: DeliverySettings | null;
};

function money(value: number | string) {
    return `PKR ${Number(value || 0).toLocaleString()}`;
}

function whatsappPhone(value: string) {
    let phone = value.replace(/\D/g, '');
    if (phone.startsWith('00')) phone = phone.slice(2);
    if (phone.startsWith('0')) phone = `92${phone.slice(1)}`;
    else if (phone.length === 10) phone = `92${phone}`;
    return phone;
}

export default function StorefrontClient({ store, settings, products, delivery }: Props) {
    const themeColor = settings?.theme_color || '#1d7555';
    const bannerText = settings?.banner_text || `Welcome to ${store.name}`;
    const isPro = ['pro', 'business'].includes(store.plan.toLowerCase());
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerZip, setCustomerZip] = useState('');
    const [city, setCity] = useState(delivery?.store_city || '');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'advance' | ''>(() => store.accepts_cod ? 'cod' : store.accepts_advance ? 'advance' : '');
    const [orderStatus, setOrderStatus] = useState('');
    const [orderError, setOrderError] = useState(false);
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(false);

    const subtotal = useMemo(() => cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0), [cart]);
    const sameCity = Boolean(delivery?.store_city && city.trim().toLowerCase() === delivery.store_city.trim().toLowerCase());
    const baseDeliveryFee = Number(delivery?.delivery_fee ?? (sameCity ? delivery?.city_rate : delivery?.other_city_rate) ?? 0);
    const freeDeliveryAbove = Number(delivery?.free_delivery_above || 0);
    const deliveryFee = freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove ? 0 : (Number.isFinite(baseDeliveryFee) ? baseDeliveryFee : 0);
    const finalAmount = subtotal > 0 ? subtotal + deliveryFee : 0;
    const advanceAmount = Math.round((finalAmount * store.advance_percentage / 100 + Number.EPSILON) * 100) / 100;

    function addToCart(product: Product) {
        setCart((current) => {
            const existing = current.find((item) => item.id === product.id);
            if (existing) return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...current, { ...product, quantity: 1 }];
        });
        setOrderStatus('');
        setWhatsappLink('');
    }

    function changeQuantity(productId: string, amount: number) {
        setCart((current) => current
            .map((item) => item.id === productId ? { ...item, quantity: item.quantity + amount } : item)
            .filter((item) => item.quantity > 0));
    }

    async function handleCheckout(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (cart.length === 0 || loading) return;
        setLoading(true);
        setOrderError(false);
        setOrderStatus('');
        setWhatsappLink('');

        // Open the tab during the user gesture so the browser does not block WhatsApp after the async save.
        const whatsappWindow = isPro ? window.open('about:blank', '_blank') : null;
        if (whatsappWindow) whatsappWindow.opener = null;

        try {
            const response = await fetch(`/api/storefront/${encodeURIComponent(store.slug)}/orders`, {
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
                    is_whatsapp_order: isPro,
                }),
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Unable to place your order.');

            if (isPro) {
                const merchantPhone = whatsappPhone(String(result.whatsapp_number || store.whatsapp_number || ''));
                if (!merchantPhone) throw new Error('This store has not configured a WhatsApp number yet. Please contact the store.');
                const itemLines = (result.items as Array<{ name: string; quantity: number; price: number }>)
                    .map((item) => `• ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`)
                    .join('\n');
                const summary = [
                    `🛍️ *NEW ORDER — ${store.name.toUpperCase()}*`,
                    `----------------------------------------`,
                    `📋 *Order ID:* #${result.order?.id?.slice(0, 8) || 'NEW'}`,
                    ``,
                    `👤 *CUSTOMER DETAILS:*`,
                    `• *Name:* ${customerName}`,
                    `• *Email:* ${customerEmail || 'Not provided'}`,
                    `• *Phone:* ${customerPhone}`,
                    `• *City:* ${city}`,
                    `• *Postal / Zip Code:* ${customerZip || 'N/A'}`,
                    `• *Delivery Address:* ${customerAddress}`,
                    ``,
                    `📦 *ITEMS ORDERED:*`,
                    itemLines,
                    ``,
                    `💵 *Subtotal:* ${money(result.subtotal)}`,
                    `🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'Free' : money(result.delivery_fee)}`,
                    `🏷️ *Grand Total:* ${money(result.total_amount)}`,
                    `💳 *Payment Method:* ${paymentMethod === 'advance' ? `Advance payment (${store.advance_percentage}% · ${money(result.advance_amount)})` : 'Cash on Delivery (COD)'}`,
                    `----------------------------------------`,
                    `Please confirm my order and share delivery details! Thank you!`,
                ].join('\n');
                const destination = `https://wa.me/${merchantPhone}?text=${encodeURIComponent(summary)}`;
                if (whatsappWindow) whatsappWindow.location.href = destination;
                else setWhatsappLink(destination);
                setOrderStatus(`Order saved as pending. ${whatsappWindow ? 'WhatsApp opened in a new tab to send your order details.' : 'Your order is saved. Continue to WhatsApp to send the order details.'}`);
            } else {
                setOrderStatus(paymentMethod === 'advance'
                    ? `Order ${result.order.id} placed successfully. Transfer ${money(result.advance_amount)} (${store.advance_percentage}% advance) using the account details in the store footer.`
                    : `Order ${result.order.id} placed successfully and saved as pending. Pay ${money(result.total_amount)} on delivery.`);
            }

            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            setCustomerZip('');
        } catch (error) {
            whatsappWindow?.close();
            setOrderError(true);
            setOrderStatus(error instanceof Error ? error.message : 'Unable to place your order. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <div className="px-4 py-2 text-center text-xs font-medium text-white" style={{ backgroundColor: themeColor }}>{bannerText}</div>
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
                    <div className="flex min-w-0 items-center gap-3">
                        {settings?.logo_url && <Image src={settings.logo_url} alt={`${store.name} logo`} width={40} height={40} unoptimized className="size-10 rounded-lg object-cover" />}
                        <div className="min-w-0"><h1 className="truncate text-lg font-bold" style={{ color: themeColor }}>{store.name}</h1><p className="text-[11px] text-slate-500">Official online store</p></div>
                    </div>
                    <div className="hidden rounded-lg bg-slate-50 px-3 py-2 text-right text-[11px] text-slate-600 sm:block"><p>Estimated delivery</p><p className="mt-0.5 font-semibold text-slate-800">{delivery?.estimated_days || 'Standard delivery'}</p></div>
                </div>
            </header>

            <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_390px]">
                <section>
                    <div className="mb-5 flex items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: themeColor }}>Shop the collection</p><h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Our products</h2></div><span className="text-xs text-slate-500">{products.length} items</span></div>
                    {products.length === 0 ? <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No products available yet.</div> : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                        {product.image_url ? <Image src={product.image_url} alt={product.name} width={480} height={300} unoptimized className="h-40 w-full bg-slate-100 object-cover" /> : <div className="grid h-40 place-items-center bg-gradient-to-br from-slate-100 to-slate-200 text-3xl font-semibold text-slate-400">{product.name.slice(0, 1).toUpperCase()}</div>}
                        <div className="p-4"><h3 className="text-sm font-semibold text-slate-900">{product.name}</h3><p className="mt-1 min-h-8 line-clamp-2 text-xs leading-5 text-slate-500">{product.description || 'Quality product, ready to order.'}</p><div className="mt-4 flex items-center justify-between gap-2"><span className="text-sm font-bold" style={{ color: themeColor }}>{money(product.price)}</span><button type="button" onClick={() => addToCart(product)} className="rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90" style={{ backgroundColor: themeColor }}>Add to cart</button></div></div>
                    </article>)}</div>}
                </section>

                <aside className="h-fit lg:sticky lg:top-5">
                    <section id="checkout" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 px-5 py-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Your order</p><h2 className="mt-1 text-base font-semibold text-slate-900">Cart & checkout</h2></div><span className="grid size-9 place-items-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: themeColor }}>{cart.reduce((count, item) => count + item.quantity, 0)}</span></div></div>
                        <div className="space-y-4 p-5">
                            {cart.length === 0 ? <div className="rounded-lg bg-slate-50 px-4 py-6 text-center"><p className="text-sm font-medium text-slate-700">Your cart is empty</p><p className="mt-1 text-xs text-slate-500">Add products to get started.</p></div> : <div className="max-h-56 space-y-3 overflow-y-auto">{cart.map((item) => <div key={item.id} className="flex items-center gap-3"><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{item.name}</p><p className="mt-1 text-[10px] text-slate-500">{money(item.price)} each</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`} className="grid size-7 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">−</button><span className="w-4 text-center text-xs font-semibold">{item.quantity}</span><button type="button" onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`} className="grid size-7 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">+</button></div><span className="w-20 text-right text-xs font-semibold text-slate-800">{money(Number(item.price) * item.quantity)}</span></div>)}</div>}

                            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs"><div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between text-slate-500"><span>Delivery fee</span><span>{deliveryFee === 0 ? 'Free' : money(deliveryFee)}</span></div>{freeDeliveryAbove > 0 && <p className="text-[10px] text-emerald-700">Free delivery on orders over {money(freeDeliveryAbove)}.</p>}<div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900"><span>Total</span><span style={{ color: themeColor }}>{money(finalAmount)}</span></div></div>

                            <form onSubmit={handleCheckout} className="space-y-3 border-t border-slate-100 pt-4">
                                <p className="text-xs font-semibold text-slate-800">Customer & delivery details</p>
                                <input type="text" autoComplete="name" placeholder="Full name *" value={customerName} onChange={(event) => setCustomerName(event.target.value)} required maxLength={120} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                <input type="email" autoComplete="email" placeholder="Email address (for receipt & updates)" value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} maxLength={120} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                <input type="tel" autoComplete="tel" placeholder="WhatsApp / Phone number *" value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} required maxLength={40} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                <div className="grid grid-cols-2 gap-2">
                                    <input type="text" autoComplete="address-level2" placeholder="City *" value={city} onChange={(event) => setCity(event.target.value)} required maxLength={120} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    <input type="text" autoComplete="postal-code" placeholder="Zip / Postal code" value={customerZip} onChange={(event) => setCustomerZip(event.target.value)} maxLength={20} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                </div>
                                <textarea autoComplete="street-address" placeholder="Full delivery address *" value={customerAddress} onChange={(event) => setCustomerAddress(event.target.value)} required maxLength={500} rows={3} className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                <fieldset className="space-y-2" disabled={loading}>
                                    <legend className="text-xs font-semibold text-slate-800">Payment method</legend>
                                    {!store.accepts_cod && !store.accepts_advance ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] leading-5 text-amber-800">The store has not enabled a checkout payment method. Please contact the merchant.</p> : <>
                                        {store.accepts_cod && <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"><input type="radio" name="payment_method" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="size-4 accent-emerald-700" /><span className="flex-1"><span className="block font-semibold text-slate-800">Cash on Delivery</span><span className="mt-0.5 block text-[10px] text-slate-500">Pay the full amount when your order arrives.</span></span><span className="font-semibold text-slate-700">{money(finalAmount)}</span></label>}
                                        {store.accepts_advance && <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 text-xs transition has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50"><input type="radio" name="payment_method" value="advance" checked={paymentMethod === 'advance'} onChange={() => setPaymentMethod('advance')} className="size-4 accent-emerald-700" /><span className="flex-1"><span className="block font-semibold text-slate-800">Advance payment</span><span className="mt-0.5 block text-[10px] text-slate-500">Transfer {store.advance_percentage}% now; pay the remainder on delivery.</span></span><span className="text-right"><span className="block font-semibold text-slate-700">{money(advanceAmount)}</span><span className="text-[9px] text-slate-400">due in advance</span></span></label>}
                                    </>}
                                </fieldset>
                                {paymentMethod === 'advance' && store.accepts_advance && <p className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">Transfer the advance to the account shown in the payment details at the bottom of this page.</p>}
                                <button type="submit" disabled={loading || cart.length === 0 || !paymentMethod || (!store.accepts_cod && !store.accepts_advance)} className="w-full rounded-lg px-4 py-3 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: themeColor }}>{loading ? 'Saving order…' : isPro ? 'Place order & continue to WhatsApp' : 'Place order'}</button>
                            </form>
                            {orderStatus && <div role={orderError ? 'alert' : 'status'} className={`rounded-lg border p-3 text-[11px] leading-5 ${orderError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>{orderStatus}{whatsappLink && <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-semibold underline">Open WhatsApp to send order</a>}</div>}
                        </div>
                    </section>
                </aside>
            </main>
        </div>
    );
}