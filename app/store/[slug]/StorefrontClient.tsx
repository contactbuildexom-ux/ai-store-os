'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { isPublicStorefrontResponse } from '@/lib/storefront-types';
import { resolveStoreHero } from '@/lib/ai/hero-niche-resolver';
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
    Send,
    ShoppingCart,
    ZoomIn,
    ZoomOut
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

export type CartItem = Product & {
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    cartKey?: string;
};

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
    tagline?: string | null;
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

function getCategoryIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('shoe') || n.includes('sneak') || n.includes('footwear') || n.includes('boot') || n.includes('kick') || n.includes('trainer')) return '👟';
    if (n.includes('perfume') || n.includes('fragrance') || n.includes('oud') || n.includes('attar') || n.includes('scent')) return '🌸';
    if (n.includes('cloth') || n.includes('shirt') || n.includes('dress') || n.includes('wear') || n.includes('pret') || n.includes('kurta') || n.includes('hoodie') || n.includes('lawn')) return '👗';
    if (n.includes('men') || n.includes('suit') || n.includes('groom') || n.includes('waistcoat')) return '🤵';
    if (n.includes('watch') || n.includes('smartwatch')) return '⌚';
    if (n.includes('bag') || n.includes('leather') || n.includes('wallet') || n.includes('clutch')) return '🎒';
    if (n.includes('jewel') || n.includes('ring') || n.includes('necklace') || n.includes('gold') || n.includes('kundan')) return '💍';
    if (n.includes('skin') || n.includes('beauty') || n.includes('serum') || n.includes('cosmetic') || n.includes('cleanser')) return '🧴';
    if (n.includes('phone') || n.includes('tech') || n.includes('electronic') || n.includes('gadget')) return '📱';
    if (n.includes('headphone') || n.includes('audio') || n.includes('earbud')) return '🎧';
    if (n.includes('home') || n.includes('decor') || n.includes('candle') || n.includes('furni') || n.includes('vase')) return '🛋️';
    if (n.includes('honey') || n.includes('tea') || n.includes('food') || n.includes('organic') || n.includes('superfood')) return '🌿';
    if (n.includes('gym') || n.includes('sport') || n.includes('fitness')) return '⚡';
    if (n.includes('baby') || n.includes('kid') || n.includes('toy')) return '🧸';
    return '✨';
}

export default function StorefrontClient({ store, settings, products, delivery }: Props) {
    const [liveStore, setLiveStore] = useState(store);
    const [liveProducts, setLiveProducts] = useState(products);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');

    const themeColor = settings?.theme_color || (liveStore as any)?.theme_color || (liveStore as any)?.primary_color || (liveStore as any)?.theme?.primaryColor || '#1976d2';
    const bannerText = settings?.banner_text || '✨ Free delivery nationwide on orders above Rs. 3,000!';
    const isPro = ['pro', 'business', 'advanced'].includes(liveStore.plan.toLowerCase());

    // UI state
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [toastMessage, setToastMessage] = useState('');

    // Product detail modal state (supports multiple images carousel, zoom, sizes & colors)
    const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
    const [modalQty, setModalQty] = useState(1);
    const [modalActiveImgIdx, setModalActiveImgIdx] = useState(0);
    const [modalSelectedSize, setModalSelectedSize] = useState('Standard');
    const [modalSelectedColor, setModalSelectedColor] = useState('Default');
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    const openProductModal = (product: Product) => {
        setSelectedProductForModal(product);
        setModalQty(1);
        setModalActiveImgIdx(0);
        setIsImageZoomed(false);
        setModalSelectedSize('Standard');
        setModalSelectedColor('Default');
    };

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

    // Dynamic Niche & Hero Info
    const heroInfo = useMemo(() => resolveStoreHero(liveStore, liveProducts), [liveStore, liveProducts]);

    // Bexi AI Chat states
    const [aiMessages, setAiMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
        {
            sender: 'ai',
            text: `Assalam-o-Alaikum / Hello! 👋 Main hoon **Bexi AI**, **${liveStore.name}** ka personal shopping assistant.\n\nAap mujh se Roman Urdu ya English mein products, prices, bestsellers, ya delivery ke baray mein pooch saktay hain! 🛍️`
        }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [aiSending, setAiSending] = useState(false);

    // Toast auto-clear
    useEffect(() => {
        if (!toastMessage) return;
        const timer = setTimeout(() => setToastMessage(''), 3000);
        return () => clearTimeout(timer);
    }, [toastMessage]);

    // Derived catalog values (dynamically relatable to store niche, never irrelevant categories)
    const categories = useMemo(() => {
        const set = new Set<string>();
        liveProducts.forEach((p) => {
            const cat = (p as any).category || (p as any).category_name;
            if (cat && cat.trim() && cat !== 'All') set.add(cat.trim());
        });
        if (set.size > 0) return ['All', ...Array.from(set)];
        const name = `${liveStore.name} ${(liveStore as any).tagline || ''}`.toLowerCase();
        if (name.includes('shoe') || name.includes('sneaker') || name.includes('kicks')) return ['All', 'Running Shoes', 'Streetwear Sneakers', 'Casual Kicks', 'Athletic Trainers'];
        if (name.includes('perfume') || name.includes('oud') || name.includes('fragrance') || name.includes('attar')) return ['All', 'Artisanal Ouds', 'French EDP', 'Floral Scents', 'Gift Sets'];
        if (name.includes('pret') || name.includes('lawn') || name.includes('dress') || name.includes('couture') || name.includes('suit')) return ['All', 'Pret Wear', 'Festive Lawn', 'Luxury 3-Piece', 'Dupattas'];
        if (name.includes('mens') || name.includes('men') || name.includes('kurta')) return ['All', 'Tailored Kurtas', 'Waistcoats', 'Formal Shirts', 'Accessories'];
        if (name.includes('skin') || name.includes('glow') || name.includes('serum') || name.includes('beauty')) return ['All', 'Glow Serums', 'Face Cleansers', 'Moisturizers', 'Sun Protection'];
        return ['All', 'Featured Collection', 'Bestsellers', 'New Arrivals'];
    }, [liveProducts, liveStore]);

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

    const defaultFeatured: Product[] = [
        {
            id: 'feat-1',
            name: 'Running Shoes',
            price: 12000,
            image_url: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80',
            description: 'Ultra-cushioned performance running sneakers engineered for endurance, speed, and all-day comfort.'
        },
        {
            id: 'feat-2',
            name: 'Hoodie',
            price: 8200,
            image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
            description: 'Heavyweight premium French terry cotton fleece hoodie with double-lined hood and relaxed fit.'
        },
        {
            id: 'feat-3',
            name: 'Cap',
            price: 2499,
            image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
            description: 'Embroidered 6-panel structured cotton twill cap with adjustable brass buckle strap.'
        },
        {
            id: 'feat-4',
            name: 'Smart Watch',
            price: 14000,
            image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
            description: 'Next-gen fitness tracker with AMOLED touch screen, heart rate sensor, and waterproof casing.'
        }
    ];

    const featuredItems = useMemo(() => {
        if (liveProducts.length >= 4) {
            return liveProducts.slice(0, 4);
        }
        if (liveProducts.length > 0) {
            return [...liveProducts, ...defaultFeatured.slice(liveProducts.length, 4)];
        }
        return defaultFeatured;
    }, [liveProducts]);

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
    function addToCart(product: Product, openDrawer = false, size = 'Standard', color = 'Default') {
        const itemKey = `${product.id}_${size}_${color}`;
        setCart((current) => {
            const existing = current.find((item) => (item.cartKey || `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Default'}`) === itemKey);
            if (existing) {
                return current.map((item) => ((item.cartKey || `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Default'}`) === itemKey) ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...current, { ...product, quantity: 1, selectedSize: size, selectedColor: color, cartKey: itemKey }];
        });
        setToastMessage(`✓ Added "${product.name}"${size && size !== 'Standard' ? ` (${size})` : ''} to cart`);
        if (openDrawer) setIsCartOpen(true);
        setOrderStatus('');
        setWhatsappLink('');
    }

    function changeQuantity(cartKeyOrId: string, amount: number) {
        setCart((current) => current
            .map((item) => {
                const k = item.cartKey || `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Default'}`;
                return (k === cartKeyOrId || item.id === cartKeyOrId) ? { ...item, quantity: item.quantity + amount } : item;
            })
            .filter((item) => item.quantity > 0));
    }

    function removeFromCart(cartKeyOrId: string) {
        setCart((current) => current.filter((item) => {
            const k = item.cartKey || `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Default'}`;
            return k !== cartKeyOrId && item.id !== cartKeyOrId;
        }));
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

        // Prepare order items text
        const itemLines = cart
            .map((item, idx) => {
                const variants = [
                    item.selectedSize && item.selectedSize !== 'Standard' ? `Size: ${item.selectedSize}` : null,
                    item.selectedColor && item.selectedColor !== 'Default' ? `Color: ${item.selectedColor}` : null
                ].filter(Boolean);
                const varTxt = variants.length > 0 ? ` (${variants.join(', ')})` : '';
                return `${idx + 1}. *${item.name}*${varTxt} × ${item.quantity} — ${money(Number(item.price) * item.quantity)}`;
            })
            .join('\n');

        const fallbackSummary = [
            `🛍️ *NEW ORDER — ${liveStore.name.toUpperCase()}*`,
            `----------------------------------------`,
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
            `💵 *Subtotal:* ${money(subtotal)}`,
            `🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : money(deliveryFee)}`,
            `🏷️ *Grand Total:* ${money(finalAmount)}`,
            `💳 *Payment Method:* ${paymentMethod === 'advance' ? `Advance payment (${store.advance_percentage}% · ${money(advanceAmount)})` : 'Cash on Delivery (COD)'}`,
            `----------------------------------------`,
            `Please confirm my order and dispatch timeline. Thank you!`,
        ].join('\n');

        const targetPhoneInitial = whatsappPhone(merchantPhone || '923001234567');
        const fallbackUrl = `https://wa.me/${targetPhoneInitial}?text=${encodeURIComponent(fallbackSummary)}`;
        setWhatsappLink(fallbackUrl);

        // Open window during user gesture
        let whatsappWindow: Window | null = null;
        try {
            whatsappWindow = window.open('about:blank', '_blank');
            if (whatsappWindow) whatsappWindow.opener = null;
        } catch {
            // Popup blocked by browser policy
        }

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
            const confirmedLines = (result.items as Array<{ name: string; quantity: number; price: number }> || cart)
                .map((item: any, idx) => {
                    const variants = [
                        item.selectedSize && item.selectedSize !== 'Standard' ? `Size: ${item.selectedSize}` : null,
                        item.selectedColor && item.selectedColor !== 'Default' ? `Color: ${item.selectedColor}` : null
                    ].filter(Boolean);
                    const varTxt = variants.length > 0 ? ` (${variants.join(', ')})` : '';
                    return `${idx + 1}. *${item.name}*${varTxt} × ${item.quantity} — ${money(Number(item.price) * item.quantity)}`;
                })
                .join('\n');

            const fullSummary = [
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
                confirmedLines,
                ``,
                `💵 *Subtotal:* ${money(result.subtotal || subtotal)}`,
                `🚚 *Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : money(result.delivery_fee || deliveryFee)}`,
                `🏷️ *Grand Total:* ${money(result.total_amount || finalAmount)}`,
                `💳 *Payment Method:* ${paymentMethod === 'advance' ? `Advance payment (${store.advance_percentage}% · ${money(result.advance_amount || advanceAmount)})` : 'Cash on Delivery (COD)'}`,
                `----------------------------------------`,
                `Please confirm my order and dispatch timeline. Thank you!`,
            ].join('\n');

            const destination = `https://wa.me/${targetPhone}?text=${encodeURIComponent(fullSummary)}`;
            setWhatsappLink(destination);

            if (whatsappWindow && !whatsappWindow.closed) {
                whatsappWindow.location.href = destination;
            } else {
                window.open(destination, '_blank');
            }

            setOrderStatus(`✓ Order placed successfully! Order #${result.order?.id?.slice(0, 8) || ''} saved. Opening WhatsApp...`);
            setCart([]);
            setCustomerName('');
            setCustomerEmail('');
            setCustomerPhone('');
            setCustomerAddress('');
            setCustomerZip('');
        } catch {
            // Even if server request encounters any issue, ensure customer order is delivered to WhatsApp
            setWhatsappLink(fallbackUrl);
            if (whatsappWindow && !whatsappWindow.closed) {
                whatsappWindow.location.href = fallbackUrl;
            } else {
                window.open(fallbackUrl, '_blank');
            }
            setOrderStatus('✓ Order generated! Tap below to send details directly to WhatsApp.');
            setCart([]);
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
                { sender: 'ai', text: `Main **${liveStore.name}** par aap ki shopping mein madad ke liye hazir hoon! Aap hamaray catalog items dekh saktay hain ya kisi bhi card par click karke direct WhatsApp par order bhej saktay hain.` }
            ]);
        } finally {
            setAiSending(false);
        }
    }

    return (
        <div
            className="min-h-screen font-sans text-slate-900 pb-28"
            style={{
                backgroundColor: `${themeColor}09`,
                backgroundImage: `radial-gradient(${themeColor}15 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
            }}
        >
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

            {/* Main Header (Matching Laptop Screen in Instagram Post) */}
            <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-shadow">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                    {/* Left: Mobile Menu & Logo / Brand */}
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open mobile navigation menu"
                            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 md:hidden"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="flex items-center gap-2.5">
                            {settings?.logo_url ? (
                                <Image
                                    src={settings.logo_url}
                                    alt={`${liveStore.name} logo`}
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="size-8 rounded-lg object-cover shadow-xs"
                                />
                            ) : (
                                <img
                                    src="/buildexom-icon.png"
                                    alt="Buildexom"
                                    className="size-8 object-contain"
                                />
                            )}
                            <div className="min-w-0 text-left">
                                <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                                    {liveStore.name}
                                </h1>
                                <p className="hidden text-[10px] text-slate-400 sm:block">Buildexom Verified Store</p>
                            </div>
                        </div>
                    </div>

                    {/* Center: Desktop Navigation Links matching post screen (Home, Shop, Categories, About) */}
                    <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-700">
                        <a href="#hero" className="transition hover:text-blue-600">Home</a>
                        <a href="#featured" className="transition hover:text-blue-600">Shop</a>
                        <a href="#categories" className="transition hover:text-blue-600">Categories</a>
                        <a href="#products" className="transition hover:text-blue-600">All Products</a>
                        <a href="#about" className="transition hover:text-blue-600">About</a>
                    </nav>

                    {/* Right: Cart Icon Button with Counter Badge */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setIsCartOpen(true)}
                            aria-label={`Shopping cart with ${totalCartCount} items`}
                            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-100 active:scale-95 shadow-xs"
                        >
                            <ShoppingBag size={18} />
                            {totalCartCount > 0 && (
                                <span
                                    className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-[10px] font-bold text-white shadow-sm animate-bounce"
                                    style={{ backgroundColor: themeColor || '#1976d2' }}
                                >
                                    {totalCartCount}
                                </span>
                            )}
                        </button>
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

            {/* 1. Full-Width Hero Section covering full screen width, styled with chosen store theme */}
            <section
                id="hero"
                className="relative w-full overflow-hidden border-b transition duration-500 shadow-xs"
                style={{
                    background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`,
                    borderColor: `${themeColor}30`,
                }}
            >
                <div
                    className="absolute -right-20 -top-20 size-96 rounded-full blur-3xl opacity-25 pointer-events-none"
                    style={{ backgroundColor: themeColor }}
                />
                <div
                    className="absolute -left-20 -bottom-20 size-96 rounded-full blur-3xl opacity-15 pointer-events-none"
                    style={{ backgroundColor: themeColor }}
                />

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:py-20 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="max-w-xl text-left space-y-4">
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.12]">
                            {heroInfo.headlineMain}{' '}
                            {heroInfo.headlineHighlight && (
                                <span style={{ color: themeColor }}>{heroInfo.headlineHighlight}</span>
                            )}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-700 max-w-lg leading-relaxed font-medium">
                            {liveStore.tagline || heroInfo.subtext}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                            <a
                                href="#featured"
                                className="rounded-full px-7 py-3 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                Shop Collection →
                            </a>
                            <a
                                href={`https://wa.me/${whatsappPhone(liveStore.whatsapp_number || '923001234567')}?text=Hello%20${encodeURIComponent(liveStore.name)}!%20I%20want%20to%20place%20an%20order.`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/90 backdrop-blur-xs px-5 py-3 text-xs font-semibold text-slate-800 shadow-xs transition hover:bg-white hover:border-slate-400"
                            >
                                <MessageCircle size={15} className="text-emerald-600" /> WhatsApp Support
                            </a>
                        </div>
                    </div>

                    {/* Floating Concept-Matched Hero Image */}
                    <div className="w-56 sm:w-72 lg:w-96 shrink-0 relative flex items-center justify-center">
                        <img
                            src={heroInfo.heroImage}
                            alt={heroInfo.altText}
                            className="max-h-72 sm:max-h-84 lg:max-h-96 w-full object-contain rounded-2xl drop-shadow-[0_20px_30px_rgba(0,0,0,0.14)] transition duration-500 hover:scale-105"
                        />
                    </div>
                </div>
            </section>

            {/* Main Page Body */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">

                {/* 2. Featured Products Section (Matching Post Grid) */}
                <section id="featured" className="space-y-4 pt-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                Featured Products
                            </h3>
                            <p className="text-xs text-slate-500">Handpicked essentials curated for you</p>
                        </div>
                        <a
                            href="#products"
                            className="flex items-center gap-1 text-xs font-bold transition hover:opacity-80"
                            style={{ color: themeColor }}
                        >
                            <span>View All</span>
                            <ArrowRight size={13} />
                        </a>
                    </div>

                    {/* 4-Column Grid on Desktop, 2-Column on Mobile matching post */}
                    <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                        {featuredItems.map((item) => (
                            <article
                                key={item.id}
                                onClick={() => openProductModal(item)}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                            >
                                <div className="relative aspect-square w-full overflow-hidden bg-slate-50/60 p-4">
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
                                            {money(item.price)}
                                        </span>
                                        {/* Dynamic circular cart button matching theme */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                addToCart(item, true);
                                            }}
                                            aria-label={`Add ${item.name} to cart`}
                                            className="grid size-8 place-items-center rounded-full text-white shadow-md transition hover:scale-110 active:scale-95"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            <ShoppingCart size={15} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* 3. Category Icons Strip (Relatable to Store's Actual Niche) */}
                <section id="categories" className="pt-1">
                    <div className="flex items-center justify-between pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Explore Categories
                        </h4>
                        {selectedCategory !== 'All' && (
                            <button
                                type="button"
                                onClick={() => setSelectedCategory('All')}
                                className="text-xs font-bold text-blue-600 hover:underline"
                            >
                                Reset to All
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3.5">
                        {categories.filter((c) => c !== 'All').map((cat) => {
                            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(isSelected ? 'All' : cat);
                                        const el = document.getElementById('products');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`flex items-center gap-2.5 rounded-2xl border p-3 text-left transition hover:shadow-xs active:scale-95 ${
                                        isSelected
                                            ? 'shadow-xs font-bold'
                                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                    style={
                                        isSelected
                                            ? {
                                                borderColor: themeColor,
                                                backgroundColor: `${themeColor}15`,
                                                color: themeColor,
                                            }
                                            : {}
                                    }
                                >
                                    <span className="text-2xl shrink-0">{getCategoryIcon(cat)}</span>
                                    <span className="text-xs font-bold truncate leading-tight">{cat}</span>
                                </button>
                            );
                        })}
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
                                    onClick={() => openProductModal(product)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                                >
                                    {/* Image Container with Badges */}
                                    <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url.split(',')[0].trim()}
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

                                        {product.image_url && product.image_url.includes(',') && (
                                            <span className="absolute right-2.5 bottom-2.5 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                +{product.image_url.split(',').length - 1} photos
                                            </span>
                                        )}

                                        {/* Quick WhatsApp Single Order Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDirectWhatsApp(product);
                                            }}
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

                                            {/* Circular Floating Cart Button (Matching Screenshot with Trolley Icon) */}
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(product, true);
                                                }}
                                                aria-label={`Add ${product.name} to cart`}
                                                className="grid size-9 place-items-center rounded-full text-white shadow-md transition hover:scale-110 active:scale-95 sm:size-10"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <ShoppingCart size={16} />
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

                {/* 5. About Store Section (Linked directly from header navigation) */}
                <section id="about" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                    <div className="max-w-3xl space-y-3">
                        <span
                            className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
                        >
                            About {liveStore.name}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                            Crafted for Quality & Seamless Shopping
                        </h3>
                        <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                            {liveStore.tagline ? `${liveStore.name} — ${liveStore.tagline}. ` : ''}
                            Welcome to {liveStore.name}, where we prioritize authentic quality, competitive pricing, and fast nationwide delivery. Every order is handled with care and shipped with Cash on Delivery across Pakistan.
                        </p>
                        <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5"><ShieldCheck size={16} className="text-emerald-600" /> 100% Genuine Items</span>
                            <span className="flex items-center gap-1.5"><Truck size={16} className="text-blue-600" /> Cash on Delivery Nationwide</span>
                            <span className="flex items-center gap-1.5"><MessageCircle size={16} className="text-emerald-600" /> Direct WhatsApp Assistance</span>
                        </div>
                    </div>
                </section>

                {/* 6. Official Buildexom Platform Feature Strip (Matching Instagram Post) */}
                <section className="overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-[#0d2a4a] to-blue-950 p-6 text-white shadow-xl sm:p-8">
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
                                        {cart.map((item, idx) => {
                                            const itemKey = item.cartKey || `${item.id}_${item.selectedSize || 'Standard'}_${item.selectedColor || 'Default'}_${idx}`;
                                            return (
                                                <div key={itemKey} className="flex items-center gap-3 p-2">
                                                    {item.image_url ? (
                                                        <Image
                                                            src={item.image_url.split(',')[0].trim()}
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
                                                        {(item.selectedSize || (item.selectedColor && item.selectedColor !== 'Default')) && (
                                                            <div className="flex flex-wrap gap-1.5 mt-0.5 text-[10px] text-slate-500 font-medium">
                                                                {item.selectedSize && <span className="bg-slate-100 rounded px-1.5 py-0.5">{item.selectedSize}</span>}
                                                                {item.selectedColor && item.selectedColor !== 'Default' && <span className="bg-slate-100 rounded px-1.5 py-0.5">• {item.selectedColor}</span>}
                                                            </div>
                                                        )}
                                                        <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{money(item.price)}</p>

                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => changeQuantity(item.cartKey || item.id, -1)}
                                                                    className="px-2 py-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                                                                >
                                                                    −
                                                                </button>
                                                                <span className="w-5 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => changeQuantity(item.cartKey || item.id, 1)}
                                                                    className="px-2 py-1 text-slate-500 hover:text-slate-900 text-xs font-bold"
                                                                >
                                                                    +
                                                                </button>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeFromCart(item.cartKey || item.id)}
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
                                        );
                                    })}
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
                                            placeholder=""
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
                                            placeholder="0300-1234567"
                                            value={customerPhone}
                                            onChange={(e) => {
                                                const raw = e.target.value.replace(/[^\d\-/]/g, '');
                                                setCustomerPhone(raw);
                                            }}
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
                                <div className={`rounded-2xl border p-4 text-xs space-y-3 ${orderError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm'}`}>
                                    <div className="flex items-start gap-2">
                                        <span className="text-base">{orderError ? '⚠️' : '✅'}</span>
                                        <div className="flex-1 font-semibold leading-relaxed">{orderStatus}</div>
                                    </div>
                                    {whatsappLink && (
                                        <a
                                            href={whatsappLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition"
                                        >
                                            <MessageCircle size={16} />
                                            <span>Open Order in WhatsApp</span>
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* COMPACT CART FLOATING BAR (NO ARROW, APPEARS ONLY WHEN ITEMS IN CART) */}
            {totalCartCount > 0 && (
                <div className="fixed bottom-4 right-4 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-2">
                    <button
                        type="button"
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center gap-2.5 rounded-full bg-slate-950/95 text-white px-4 py-2.5 shadow-2xl backdrop-blur-md border border-slate-800 transition hover:bg-slate-900 active:scale-95"
                    >
                        <span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-slate-950 font-bold">
                            <MessageCircle size={13} />
                        </span>
                        <span className="text-xs font-bold">Checkout on WhatsApp</span>
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-slate-950">
                            {totalCartCount}
                        </span>
                    </button>
                </div>
            )}

            {/* FLOATING BEXI AI ASSISTANT WIDGET */}
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
                                    <p className="font-bold text-xs">Bexi AI Assistant</p>
                                    <p className="text-[10px] text-emerald-400 font-mono">Roman Urdu & English Active</p>
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
                                placeholder="Roman Urdu ya English mein poochain (e.g. delivery kab hogi?)..."
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

            {/* Interactive Product Details Modal (Supports multiple images gallery, quantity, Add to Cart & WhatsApp Order) */}
            {selectedProductForModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="fixed inset-0" onClick={() => setSelectedProductForModal(null)} />
                    <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-2xl text-slate-900 animate-in zoom-in-95 duration-200">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => setSelectedProductForModal(null)}
                            aria-label="Close product modal"
                            className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition z-20"
                        >
                            <X size={16} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Images Gallery */}
                            <div className="space-y-3">
                                {(() => {
                                    const rawImages = (selectedProductForModal.image_url || '').split(',').map((s) => s.trim()).filter(Boolean);
                                    const images = rawImages.length > 0 ? rawImages : [];
                                    const activeImg = images[modalActiveImgIdx] || images[0] || '';

                                    return (
                                        <>
                                            <div 
                                                className={`relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200/80 ${isImageZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                                                onClick={() => setIsImageZoomed((z) => !z)}
                                            >
                                                {activeImg ? (
                                                    <Image
                                                        src={activeImg}
                                                        alt={selectedProductForModal.name}
                                                        width={600}
                                                        height={600}
                                                        unoptimized
                                                        className={`size-full object-cover transition-transform duration-300 ${isImageZoomed ? 'scale-150' : 'scale-100'}`}
                                                    />
                                                ) : (
                                                    <div className="grid size-full place-items-center bg-slate-100 text-4xl font-black text-slate-300">
                                                        {selectedProductForModal.name.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                                    ✓ Verified Stock
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsImageZoomed((z) => !z);
                                                    }}
                                                    aria-label="Toggle zoom"
                                                    className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white transition z-10"
                                                    title={isImageZoomed ? 'Zoom out' : 'Zoom in'}
                                                >
                                                    {isImageZoomed ? <ZoomOut size={15} /> : <ZoomIn size={15} />}
                                                </button>

                                                {images.length > 1 && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalActiveImgIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                                                            }}
                                                            aria-label="Previous image"
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white transition"
                                                        >
                                                            ‹
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setModalActiveImgIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                                                            }}
                                                            aria-label="Next image"
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-white/90 text-slate-800 shadow-md hover:bg-white transition"
                                                        >
                                                            ›
                                                        </button>
                                                    </>
                                                )}
                                            </div>

                                            {/* Thumbnail carousel / scroll */}
                                            {images.length > 1 && (
                                                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                                                    {images.map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => setModalActiveImgIdx(idx)}
                                                            className={`relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                                                                modalActiveImgIdx === idx
                                                                    ? 'ring-2 ring-offset-1'
                                                                    : 'opacity-70 hover:opacity-100 border-slate-200'
                                                            }`}
                                                            style={modalActiveImgIdx === idx ? { borderColor: themeColor } : {}}
                                                        >
                                                            <Image
                                                                src={img}
                                                                alt=""
                                                                width={80}
                                                                height={80}
                                                                unoptimized
                                                                className="size-full object-cover"
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>

                            {/* Product Info & Controls */}
                            <div className="flex flex-col justify-between space-y-4">
                                <div className="space-y-2">
                                    {(selectedProductForModal as any).category && (
                                        <span
                                            className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                                            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                                        >
                                            {(selectedProductForModal as any).category}
                                        </span>
                                    )}
                                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                                        {selectedProductForModal.name}
                                    </h3>
                                    <div className="text-2xl font-extrabold" style={{ color: themeColor }}>
                                        {money(Number(selectedProductForModal.price) * modalQty)}
                                        {modalQty > 1 && (
                                            <span className="text-xs font-normal text-slate-500 ml-2">
                                                ({money(selectedProductForModal.price)} each)
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                                        {selectedProductForModal.description || 'Premium hand-selected store item with verified durability and comfort.'}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    {/* Size Selector */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                            <span>Select Size</span>
                                            <span className="text-[10px] text-slate-500 font-normal">Selected: {modalSelectedSize}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {['Standard', 'Small (S)', 'Medium (M)', 'Large (L)', 'XL'].map((size) => (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => setModalSelectedSize(size)}
                                                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition border ${
                                                        modalSelectedSize === size
                                                            ? 'text-white border-transparent shadow-xs'
                                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                    }`}
                                                    style={modalSelectedSize === size ? { backgroundColor: themeColor } : {}}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color Selector */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                            <span>Select Color</span>
                                            <span className="text-[10px] text-slate-500 font-normal">Selected: {modalSelectedColor}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            {[
                                                { name: 'Default', hex: '#0f172a' },
                                                { name: 'Emerald', hex: '#059669' },
                                                { name: 'Navy', hex: '#1d4ed8' },
                                                { name: 'Maroon', hex: '#9f1239' },
                                                { name: 'Gold', hex: '#d97706' },
                                            ].map((c) => (
                                                <button
                                                    key={c.name}
                                                    type="button"
                                                    onClick={() => setModalSelectedColor(c.name)}
                                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
                                                        modalSelectedColor === c.name
                                                            ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/20 shadow-xs'
                                                            : 'border-slate-200 bg-white hover:border-slate-300'
                                                    }`}
                                                >
                                                    <span className="size-2.5 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                                                    <span>{c.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="flex items-center justify-between pt-1">
                                        <span className="text-xs font-bold text-slate-700">Quantity</span>
                                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                                            <button
                                                type="button"
                                                onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                                                className="grid size-7 place-items-center rounded-lg bg-white font-bold text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95"
                                            >
                                                -
                                            </button>
                                            <span className="w-10 text-center text-xs font-bold text-slate-900">
                                                {modalQty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setModalQty((q) => q + 1)}
                                                className="grid size-7 place-items-center rounded-lg bg-white font-bold text-slate-700 shadow-xs hover:bg-slate-100 active:scale-95"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="grid grid-cols-1 gap-2 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                for (let i = 0; i < modalQty; i++) {
                                                    addToCart(selectedProductForModal, false, modalSelectedSize, modalSelectedColor);
                                                }
                                                setIsCartOpen(true);
                                                setSelectedProductForModal(null);
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold text-white shadow-md transition hover:opacity-95 active:scale-95"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            <ShoppingCart size={15} /> Add to Cart ({modalQty})
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                const phone = whatsappPhone(liveStore.whatsapp_number || '923001234567');
                                                const totalPrice = Number(selectedProductForModal.price) * modalQty;
                                                const variantNotes = [
                                                    modalSelectedSize && modalSelectedSize !== 'Standard' ? `Size: ${modalSelectedSize}` : null,
                                                    modalSelectedColor && modalSelectedColor !== 'Default' ? `Color: ${modalSelectedColor}` : null,
                                                ].filter(Boolean).join(', ');
                                                const text =
                                                    `🛍️ *INSTANT ORDER — ${liveStore.name.toUpperCase()}*\n` +
                                                    `----------------------------------------\n` +
                                                    `Hello! I want to order:\n` +
                                                    `• *Product:* ${selectedProductForModal.name}${variantNotes ? ` (${variantNotes})` : ''}\n` +
                                                    `• *Quantity:* ${modalQty}\n` +
                                                    `• *Total Price:* ${money(totalPrice)}\n` +
                                                    `• *Store URL:* https://${liveStore.slug}.buildexom.store\n\n` +
                                                    `Please confirm my order and share delivery details!`;
                                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                                            }}
                                            className="flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 py-3 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                                        >
                                            <MessageCircle size={15} className="text-emerald-600" /> Order on WhatsApp
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-slate-500">
                                        <span>🚚 Fast Nationwide Courier</span>
                                        <span>•</span>
                                        <span>📦 Cash on Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Toast Notification */}
            {toastMessage && (
                <div className="fixed top-20 right-4 z-50 rounded-xl bg-slate-900/90 text-white px-4 py-2.5 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}