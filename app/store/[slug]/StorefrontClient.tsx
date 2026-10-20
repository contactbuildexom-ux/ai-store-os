'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { isPublicStorefrontResponse } from '@/lib/storefront-types';
import { resolveStoreHero, detectStoreNiche } from '@/lib/ai/hero-niche-resolver';
import { BUILDEXOM_ICON_DATA_URL } from '@/components/store-qr-code';
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
    ZoomOut,
    PackagePlus,
    RefreshCw
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

function getCategorySymbol(name: string): string {
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    if (!clean || clean.toLowerCase() === 'all') return 'ALL';
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return clean.slice(0, 2).toUpperCase();
}

function parseProductVariants(product: any) {
    let hasSizes = Boolean(product?.has_sizes);
    let hasColors = Boolean(product?.has_colors);
    let sizes: string[] = Array.isArray(product?.sizes) ? product.sizes : [];
    let colors: Array<{ name: string; hex: string }> = Array.isArray(product?.colors) 
        ? product.colors.map((c: any) => typeof c === 'string' ? { name: c, hex: '#0f172a' } : c)
        : [];

    if (typeof product?.description === 'string' && product.description.includes('<!--variants:')) {
        try {
            const match = product.description.match(/<!--variants:(.*?)-->/);
            if (match && match[1]) {
                const meta = JSON.parse(match[1]);
                if (meta.has_sizes !== undefined) hasSizes = Boolean(meta.has_sizes);
                if (meta.has_colors !== undefined) hasColors = Boolean(meta.has_colors);
                if (Array.isArray(meta.sizes) && meta.sizes.length > 0) sizes = meta.sizes;
                if (Array.isArray(meta.colors) && meta.colors.length > 0) {
                    colors = meta.colors.map((c: any) => typeof c === 'string' ? { name: c, hex: '#0f172a' } : c);
                }
            }
        } catch {}
    }

    if (hasSizes && sizes.length === 0) {
        sizes = ['Standard', 'Small (S)', 'Medium (M)', 'Large (L)', 'XL'];
    }
    if (hasColors && colors.length === 0) {
        colors = [
            { name: 'Default', hex: '#0f172a' },
            { name: 'Emerald', hex: '#059669' },
            { name: 'Navy', hex: '#1d4ed8' },
            { name: 'Maroon', hex: '#9f1239' },
            { name: 'Gold', hex: '#d97706' },
        ];
    }

    return { hasSizes, hasColors, sizes, colors };
}

function cleanDescription(desc?: string | null): string {
    if (!desc) return '';
    return desc.replace(/<!--variants:.*?-->/g, '').trim();
}

function isFoodOrEdible(storeName: string, category?: string | null, productName?: string): boolean {
    const text = `${storeName} ${category || ''} ${productName || ''}`.toLowerCase();
    return /\b(food|coffee|tea|brew|roast|bean|beans|bakery|cake|cakes|bread|snack|cookie|cookies|mithai|sweet|sweets|honey|oil|spice|spices|herb|herbs|dry fruit|organic food|cafe|dining|edible)\b/i.test(text);
}

export default function StorefrontClient({ store, settings, products, delivery }: Props) {
    const [liveStore, setLiveStore] = useState(store);
    const [liveProducts, setLiveProducts] = useState(products);
    const [catalogLoading, setCatalogLoading] = useState(true);
    const [catalogError, setCatalogError] = useState('');

    const themeColor = settings?.theme_color || (liveStore as any)?.theme_color || (liveStore as any)?.primary_color || (liveStore as any)?.theme?.primaryColor || '#1976d2';
    const bannerText = settings?.banner_text || 'Free delivery nationwide on orders above Rs. 3,000!';
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
    const [showAllProducts, setShowAllProducts] = useState(false);
    const INITIAL_PRODUCT_LIMIT = 12;

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

    // Derived catalog values: strictly exactly 4 working categories
    const categories = useMemo(() => {
        const catMap = new Map<string, number>();
        liveProducts.forEach((p) => {
            const cat = ((p as any).category || (p as any).category_name || '').trim();
            if (cat && cat.toLowerCase() !== 'all') {
                catMap.set(cat, (catMap.get(cat) || 0) + 1);
            }
        });

        let activeCats = Array.from(catMap.entries())
            .filter(([_, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])
            .map(([name]) => name);

        if (activeCats.length < 4) {
            const niche = detectStoreNiche(liveStore, liveProducts);
            const fallbackNicheCats: Record<string, string[]> = {
                nature: ['Indoor Plants', 'Succulents', 'Planters', 'Herbal Greens'],
                handbags: ['Velvet Clutches', 'Shoulder Bags', 'Tote Bags', 'Evening Purses'],
                jewelry: ['Rings', 'Necklaces', 'Earrings', 'Bracelets'],
                perfume: ['Luxury Oud', 'Eau De Parfum', 'Attars & Oils', 'Gift Discovery Sets'],
                footwear: ['Running Shoes', 'Sneakers', 'Casual Kicks', 'Athletic Trainers'],
                clothing: ['Pret Wear', 'Festive Lawn', 'Luxury 3-Piece', 'Casual Tunics'],
                skincare: ['Glow Serums', 'Face Cleansers', 'Moisturizers', 'Sun Protection'],
                tech: ['Headphones', 'Smart Wearables', 'Wireless Audio', 'Accessories'],
                food: ['Artisan Roast', 'Espresso Blends', 'Cold Brew Kits', 'Gourmet Treats'],
                wedding: ['Bridal Accessories', 'Royal Boxes', 'Mehndi Keepsakes', 'Traditional Sets'],
                general: ['Best Sellers', 'New Arrivals', 'Featured Items', 'Trending Now']
            };
            const suggestions = fallbackNicheCats[niche] || fallbackNicheCats.general;
            for (const s of suggestions) {
                if (activeCats.length >= 4) break;
                if (!activeCats.some(c => c.toLowerCase() === s.toLowerCase())) {
                    activeCats.push(s);
                }
            }
        }

        activeCats = activeCats.slice(0, 4);
        if (activeCats.length === 0) activeCats.push('Featured');
        return ['All', ...activeCats];
    }, [liveProducts, liveStore]);

    // Guarantees every product belongs to one of the 4 active categories so clicking any category shows products
    const catalogProducts = useMemo(() => {
        const activeCats = categories.filter((c) => c !== 'All');
        if (activeCats.length === 0) return liveProducts;

        return liveProducts.map((p, idx) => {
            const rawCat = ((p as any).category || (p as any).category_name || '').trim();
            const matched = activeCats.find((c) => c.toLowerCase() === rawCat.toLowerCase());
            if (matched) {
                return { ...p, category: matched };
            }
            const fallbackCat = activeCats[idx % activeCats.length];
            return { ...p, category: fallbackCat };
        });
    }, [liveProducts, categories]);

    const filteredProducts = useMemo(() => {
        return catalogProducts.filter((p) => {
            const cat = ((p as any).category || '').toLowerCase();
            const selected = selectedCategory.toLowerCase();
            const matchesCat = selectedCategory === 'All' || cat === selected;
            const matchesSearch = !searchQuery.trim() ||
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesSearch;
        });
    }, [catalogProducts, selectedCategory, searchQuery]);

    const displayedProducts = useMemo(() => {
        if (showAllProducts || selectedCategory !== 'All' || searchQuery.trim() !== '') {
            return filteredProducts;
        }
        return filteredProducts.slice(0, INITIAL_PRODUCT_LIMIT);
    }, [filteredProducts, showAllProducts, selectedCategory, searchQuery]);

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
            return liveProducts;
        }
        return [];
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
            className="min-h-screen font-sans text-slate-900 pb-1.5 relative"
            style={{
                background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`,
                backgroundColor: `${themeColor}10`,
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

            {/* Top Announcement Bar - Full width edge coverage */}
            <div className="w-full border-b px-4 sm:px-6 lg:px-8 py-2 text-xs font-semibold text-white shadow-xs transition" style={{ backgroundColor: themeColor, borderColor: `${themeColor}35` }}>
                <div className="w-full flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="hidden sm:inline-flex items-center gap-1.5 opacity-95">
                        <Truck size={13} /> Fast Delivery Nationwide
                    </span>
                    <span className="w-full sm:w-auto text-center font-bold tracking-wide">
                        {bannerText}
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 opacity-95">
                        <MessageCircle size={13} /> WhatsApp Ordering Active
                    </span>
                </div>
            </div>

            {/* Main Header (Matching Laptop Screen in Instagram Post) */}
            <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-shadow">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
                    {/* Left: Mobile Menu & Logo / Brand */}
                    <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open mobile navigation menu"
                            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 md:hidden"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="flex items-center gap-2.5">
                            <div className="grid size-9 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200 overflow-hidden shrink-0">
                                <img
                                    src={settings?.logo_url || BUILDEXOM_ICON_DATA_URL}
                                    alt={`${liveStore.name} logo`}
                                    className="size-full object-contain"
                                />
                            </div>
                            <div className="min-w-0 text-left">
                                <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 sm:text-lg">
                                    {liveStore.name}
                                </h1>
                                {liveStore.tagline ? (
                                    <p className="hidden text-[10px] text-slate-400 sm:block truncate max-w-[200px]">{liveStore.tagline}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {/* Center: Desktop Navigation Links with animated underlines */}
                    <nav className="hidden md:flex shrink-0 items-center justify-center gap-6 lg:gap-8 text-xs font-semibold text-slate-700">
                        {[
                            { name: 'Home', href: '#hero' },
                            { name: 'Shop', href: '#featured' },
                            { name: 'Categories', href: '#categories' },
                            { name: 'All Products', href: '#products' },
                            { name: 'About', href: '#about' },
                        ].map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="group relative py-1 text-slate-600 transition-colors duration-200 hover:text-slate-950 font-medium"
                            >
                                <span>{link.name}</span>
                                <span 
                                    className="absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-x-100"
                                    style={{ backgroundColor: themeColor || '#1976d2' }}
                                />
                            </a>
                        ))}

                    </nav>

                    {/* Right: Cart Icon Button */}
                    <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">

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
                                <div className="grid size-9 place-items-center rounded-xl bg-white p-1 shadow-xs ring-1 ring-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={settings?.logo_url || BUILDEXOM_ICON_DATA_URL}
                                        alt=""
                                        className="size-full object-contain"
                                    />
                                </div>
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


                        </div>
                    </div>
                </div>
            )}

            {/* 1. Full-Width Edge-to-Edge Hero Banner with Crisp Top and Bottom Borders */}
            <section
                id="hero"
                className="relative w-full overflow-hidden border-t border-b transition duration-500 shadow-xs"
                style={{
                    background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`,
                    borderColor: `${themeColor}28`,
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

                <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12 relative z-10">
                    {/* Left Column: Polished, Balanced Text & CTAs */}
                    <div className="w-full lg:max-w-xl text-center lg:text-left flex flex-col items-center lg:items-start space-y-4">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-[1.14]">
                            {heroInfo.headlineMain}{' '}
                            {heroInfo.headlineHighlight && (
                                <span style={{ color: themeColor }}>{heroInfo.headlineHighlight}</span>
                            )}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-700 max-w-lg leading-relaxed font-medium">
                            {liveStore.tagline || heroInfo.subtext}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3.5">
                            <a
                                href="#products"
                                className="rounded-full px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:scale-105 active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                Shop Collection →
                            </a>
                            <a
                                href={`https://wa.me/${whatsappPhone(liveStore.whatsapp_number || '923001234567')}?text=Hello%20${encodeURIComponent(liveStore.name)}!%20I%20want%20to%20place%20an%20order.`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-full border border-slate-300 bg-white/95 px-5 py-3 text-xs sm:text-sm font-bold text-slate-800 shadow-xs transition hover:bg-white hover:border-slate-400"
                            >
                                <MessageCircle size={15} className="text-emerald-600" /> WhatsApp Support
                            </a>
                        </div>
                    </div>

                    {/* Right Column: Triple Merged Studio Showcase Images (3 Images) */}
                    <div className="relative w-full lg:w-auto flex items-center justify-center lg:justify-end shrink-0 pt-2 pb-2">
                        {/* Background Theme Ambient Glow */}
                        <div
                            className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 pointer-events-none"
                            style={{ backgroundColor: themeColor }}
                        />

                        {/* 3-Image Merging Container */}
                        <div className="relative flex items-center justify-center">
                            {/* Card 1: Primary Featured Showcase Card (Center / Main) */}
                            <div
                                className="relative w-36 sm:w-44 md:w-52 lg:w-56 h-48 sm:h-58 md:h-66 lg:h-74 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border bg-white/70 backdrop-blur-xs z-10 transition duration-500 hover:scale-[1.02]"
                                style={{ borderColor: `${themeColor}35` }}
                            >
                                <img
                                    src={heroInfo.heroImage}
                                    alt={heroInfo.altText}
                                    className="size-full object-cover transition duration-500 hover:scale-105"
                                    loading="eager"
                                />
                            </div>

                            {/* Card 2: Secondary Overlapping Showcase Card (Front / Left towards text, bridging gap seamlessly) */}
                            <div
                                className="relative -ml-12 sm:-ml-16 md:-ml-18 mt-8 sm:mt-12 w-28 sm:w-34 md:w-38 lg:w-42 h-36 sm:h-44 md:h-48 lg:h-52 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/90 bg-white/90 backdrop-blur-md z-20 transition duration-500 hover:scale-105 hover:z-30"
                                style={{ boxShadow: `0 20px 35px -10px ${themeColor}40` }}
                            >
                                <img
                                    src={heroInfo.secondaryHeroImage || heroInfo.heroImage}
                                    alt={heroInfo.altText}
                                    className="size-full object-cover transition duration-500 hover:scale-105"
                                    loading="eager"
                                />
                            </div>

                            {/* Card 3: Tertiary Overlapping Showcase Card (Top / Right Accent) */}
                            <div
                                className="relative -ml-7 sm:-ml-9 md:-ml-11 -mt-8 sm:-mt-12 w-24 sm:w-30 md:w-34 lg:w-38 h-32 sm:h-40 md:h-44 lg:h-48 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-2 border-white/90 bg-white/90 backdrop-blur-md z-15 transition duration-500 hover:scale-105 hover:z-30"
                                style={{ boxShadow: `0 15px 30px -10px ${themeColor}30` }}
                            >
                                <img
                                    src={heroInfo.tertiaryHeroImage || heroInfo.secondaryHeroImage || heroInfo.heroImage}
                                    alt={heroInfo.altText}
                                    className="size-full object-cover transition duration-500 hover:scale-105"
                                    loading="eager"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Page Body - Edge-to-edge with zero bottom gap before footer */}
            <main className="w-full px-2 sm:px-4 lg:px-6 pt-5 pb-0 space-y-5 sm:space-y-6">

                {/* 2. Featured Products Section (Only rendered when real products exist) */}
                {featuredItems.length > 0 && (
                    <section 
                        id="featured" 
                        className="w-full rounded-2xl sm:rounded-3xl border p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 shadow-xs transition"
                        style={{
                            background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`,
                            borderColor: `${themeColor}28`,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-extrabold tracking-tight text-slate-900 sm:text-xl">
                                    Featured Products
                                </h3>
                                <p className="text-xs text-slate-500">Handpicked essentials for you</p>
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

                        {/* 4-Column Grid on Desktop, 2-Column on Mobile - flush card boxes */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
                            {featuredItems.map((item) => (
                                <article
                                    key={item.id}
                                    onClick={() => openProductModal(item)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer w-full"
                                    style={{
                                        backgroundColor: `${themeColor}10`,
                                        borderColor: `${themeColor}24`,
                                    }}
                                >
                                    <div 
                                        className="relative aspect-square w-full overflow-hidden"
                                        style={{ backgroundColor: `${themeColor}0d` }}
                                    >
                                        <img
                                            src={item.image_url || 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=800&q=80'}
                                            alt={item.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    <div className="p-3 sm:p-3.5">
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
                )}

                {/* 3. Category Icons Strip (Relatable to Store's Actual Niche) */}
                <section id="categories" className="w-full pt-1 space-y-3">
                    <div className="flex items-center justify-between pb-1">
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
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4 w-full">
                        {categories.filter((c) => c !== 'All').map((cat) => {
                            const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
                            const productCount = catalogProducts.filter(p => ((p as any).category || '').toLowerCase() === cat.toLowerCase()).length;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(isSelected ? 'All' : cat);
                                        const el = document.getElementById('products');
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`flex items-center gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-left transition hover:shadow-md active:scale-95 w-full ${
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
                                            : {
                                                backgroundColor: `${themeColor}05`,
                                                borderColor: `${themeColor}20`
                                            }
                                    }
                                >
                                    <span 
                                        className="grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl text-xs font-black tracking-wider transition shadow-2xs"
                                        style={{
                                            backgroundColor: isSelected ? themeColor : `${themeColor}18`,
                                            color: isSelected ? '#ffffff' : themeColor
                                        }}
                                    >
                                        {getCategorySymbol(cat)}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs sm:text-sm font-bold truncate leading-tight">{cat}</p>
                                        <p className="text-[10px] text-slate-500 font-medium pt-0.5">{productCount} {productCount === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 2. Search & Category Bar */}
                <section className="w-full space-y-3">
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
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
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
                                    {cat === 'All' ? 'All Products' : cat}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* 3. Product Catalog Grid - Our Collection (Matching Hero Section Background) */}
                <section 
                    id="products" 
                    className="w-full rounded-2xl sm:rounded-3xl border p-3.5 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 shadow-xs transition"
                    style={{
                        background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`,
                        borderColor: `${themeColor}28`,
                    }}
                >
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

                    {/* Products Grid - flush card boxes */}
                    {liveProducts.length === 0 ? (
                        <div className="space-y-4 w-full">
                            <div 
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl px-4 py-3.5 border shadow-2xs backdrop-blur-sm"
                                style={{
                                    backgroundColor: `${themeColor}12`,
                                    borderColor: `${themeColor}32`,
                                }}
                            >
                                <div className="flex flex-1 items-center justify-start gap-3 min-w-0">
                                    <span 
                                        className="grid size-9 place-items-center rounded-xl text-white shrink-0 shadow-xs"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <PackagePlus size={18} />
                                    </span>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-black text-slate-900">Product Catalog Slots Ready</h4>
                                        <p className="text-[11px] text-slate-600">
                                            Store is live with zero dead space. Upload products from your Merchant Dashboard to fill these containers instantly.
                                        </p>
                                    </div>
                                </div>
                                <Link
                                    href="/merchant/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-3.5 py-2 rounded-xl shadow-xs transition hover:opacity-90 active:scale-95 shrink-0"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    <span>Manage Products</span>
                                    <ArrowRight size={13} />
                                </Link>
                            </div>

                            {/* Full-width flush product container boxes with zero side waste */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
                                {[1, 2, 3, 4, 5, 6].map((slot) => (
                                    <div
                                        key={`empty-slot-${slot}`}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition duration-300 hover:shadow-md w-full bg-white/80"
                                        style={{
                                            borderColor: `${themeColor}28`,
                                        }}
                                    >
                                        <div 
                                            className="relative aspect-square w-full overflow-hidden flex flex-col items-center justify-center p-4 text-center border-b"
                                            style={{ 
                                                backgroundColor: `${themeColor}0a`,
                                                borderColor: `${themeColor}18` 
                                            }}
                                        >
                                            <div 
                                                className="grid size-12 place-items-center rounded-2xl mb-2.5 transition-transform duration-300 group-hover:scale-110 shadow-2xs"
                                                style={{ backgroundColor: `${themeColor}16`, color: themeColor }}
                                            >
                                                <PackagePlus size={22} />
                                            </div>
                                            <span 
                                                className="text-xs font-bold tracking-tight text-slate-800"
                                            >
                                                Product #{slot}
                                            </span>
                                            <span 
                                                className="text-[10px] font-semibold mt-0.5"
                                                style={{ color: themeColor }}
                                            >
                                                Slot Available
                                            </span>
                                        </div>

                                        <div className="p-3 sm:p-3.5 bg-white">
                                            <p className="line-clamp-1 text-xs font-bold text-slate-800">
                                                Awaiting Product
                                            </p>
                                            <div className="mt-2.5 flex items-center justify-between">
                                                <span className="text-xs font-extrabold text-slate-500">
                                                    --
                                                </span>
                                                <div 
                                                    className="grid size-8 place-items-center rounded-full text-white/70 shadow-xs"
                                                    style={{ backgroundColor: themeColor }}
                                                    title="Product slot ready"
                                                >
                                                    <ShoppingCart size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
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
                        <>
                            <div className="grid grid-cols-2 gap-2 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 w-full">
                                {displayedProducts.map((product) => (
                                <article
                                    key={product.id}
                                    onClick={() => openProductModal(product)}
                                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer w-full"
                                    style={{
                                        backgroundColor: `${themeColor}10`,
                                        borderColor: `${themeColor}24`,
                                    }}
                                >
                                    {/* Image Container with Badges */}
                                    <div 
                                        className="relative aspect-square w-full overflow-hidden"
                                        style={{ backgroundColor: `${themeColor}0d` }}
                                    >
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

                                        {product.image_url && product.image_url.includes(',') && (
                                            <span className="absolute right-2.5 bottom-2.5 rounded-md bg-slate-900/80 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                +{product.image_url.split(',').length - 1} photos
                                            </span>
                                        )}


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
                                                {product.description || 'Quality verified store item.'}
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

                        {filteredProducts.length > INITIAL_PRODUCT_LIMIT && selectedCategory === 'All' && !searchQuery.trim() && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowAllProducts((prev) => !prev)}
                                    className="flex items-center gap-2 rounded-2xl px-8 py-3.5 text-xs font-bold text-white shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    {showAllProducts ? (
                                        <>Show Fewer Products</>
                                    ) : (
                                        <>
                                            View All {filteredProducts.length} Products
                                            <ArrowRight size={15} />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                        </>
                    )}
                </section>

                {/* 4. About Store Section (Clean & Focused) */}
                <section id="about" className="rounded-3xl border p-6 sm:p-8 shadow-xs" style={{ background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}10 100%)`, borderColor: `${themeColor}28` }}>
                    <div className="w-full space-y-3">
                        <div>
                            <span
                                className="inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                                style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
                            >
                                About {liveStore.name}
                            </span>
                            <h3 className="mt-1 text-xl sm:text-2xl font-black text-slate-900">
                                Crafted for Quality & Seamless Shopping
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                            {(() => {
                                const raw = (liveStore.tagline || '').trim();
                                if (!raw || raw.toLowerCase().includes('aura kicks') || raw.toLowerCase().startsWith('welcome to')) {
                                    return '';
                                }
                                return `${liveStore.name} — ${raw}. `;
                            })()}
                            Welcome to {liveStore.name}, where we prioritize authentic quality, competitive pricing, and fast nationwide delivery. Every order is handled with care and shipped with Cash on Delivery across Pakistan.
                        </p>
                    </div>
                </section>

                {/* 5. Animated Ask Bexi AI Button (Only Button Directly Below About, Screen-matching Background) */}
                <div className="!mt-2 flex items-center justify-center sm:justify-end pb-0">
                    <button
                        type="button"
                        onClick={() => setIsAiOpen(true)}
                        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-2xl px-5 py-2.5 text-xs font-black text-slate-900 shadow-md backdrop-blur-xs transition-all duration-300 hover:scale-105 active:scale-95 border"
                        style={{
                            background: `linear-gradient(135deg, ${themeColor}18 0%, ${themeColor}2e 50%, ${themeColor}12 100%)`,
                            borderColor: `${themeColor}45`,
                        }}
                        aria-label="Open Bexi AI Store Assistant"
                    >
                        {/* Animated Glowing Pulse Halo */}
                        <span 
                            className="absolute -inset-1 rounded-2xl opacity-60 blur-xs transition group-hover:opacity-100 animate-pulse duration-1000" 
                            style={{
                                background: `linear-gradient(90deg, ${themeColor}40, #10b98150, ${themeColor}50)`,
                            }}
                        />

                        <span 
                            className="relative grid size-6 place-items-center rounded-xl text-white shadow-2xs"
                            style={{ backgroundColor: themeColor }}
                        >
                            <Sparkles size={13} className="animate-spin duration-1000 text-white" />
                        </span>

                        <span className="relative font-black text-xs tracking-wide text-slate-900">
                            Ask Bexi AI
                        </span>

                        <span 
                            className="relative rounded-full px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider"
                            style={{
                                backgroundColor: `${themeColor}22`,
                                color: themeColor,
                            }}
                        >
                            Shopping Assistant
                        </span>
                    </button>
                </div>


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

            {/* BEXI AI ASSISTANT CHAT CONSOLE MODAL */}
            {isAiOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="fixed inset-0"
                        onClick={() => setIsAiOpen(false)}
                    />
                    <div className="relative z-10 flex h-[520px] w-full max-w-md flex-col rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden text-xs animate-in zoom-in-95 duration-200">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="grid size-7 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-bold">
                                    <Sparkles size={14} />
                                </span>
                                <div>
                                    <p className="font-bold text-xs">{liveStore.name} Bexi AI</p>
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
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                                            msg.sender === "user"
                                                ? "bg-emerald-600 text-white font-medium"
                                                : "bg-slate-900 border border-slate-800 text-slate-200"
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

                        {/* Quick Suggestion Questions */}
                        <div className="flex items-center gap-1.5 overflow-x-auto px-3 py-1.5 scrollbar-none border-t border-slate-800 bg-slate-900/50 shrink-0">
                            {[
                                "Delivery timeline?",
                                "Payment methods?",
                                "Bestseller items?",
                                "Order on WhatsApp?"
                            ].map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => {
                                        setAiInput(q);
                                    }}
                                    className="shrink-0 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[10px] text-slate-300 hover:border-emerald-500 hover:text-white transition"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleSendAiChat} className="border-t border-slate-800 bg-slate-900/60 p-3 flex gap-2 shrink-0">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="Poochiye (e.g. deliver kitne din me hogi?)..."
                                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                disabled={!aiInput.trim() || aiSending}
                                className="grid size-8 place-items-center rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-500 transition disabled:opacity-50"
                            >
                                <Send size={13} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
                                        {cleanDescription(selectedProductForModal.description) || 'Quality store item with verified durability and comfort.'}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2 border-t border-slate-100">
                                    {isFoodOrEdible(liveStore.name, (selectedProductForModal as any).category, selectedProductForModal.name) ? (
                                        /* For Food, Coffee, Edibles, Bakery: Show Pack / Weight Selection */
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                                <span>Select Pack / Weight</span>
                                                <span className="text-[10px] text-slate-500 font-normal">Selected: {modalSelectedSize}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Standard Pack', '250g', '500g', '1 kg', 'Pack of 2', 'Family Pack'].map((pack) => (
                                                    <button
                                                        key={pack}
                                                        type="button"
                                                        onClick={() => setModalSelectedSize(pack)}
                                                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition border ${
                                                            modalSelectedSize === pack
                                                                ? 'text-white border-transparent shadow-xs'
                                                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                                        }`}
                                                        style={modalSelectedSize === pack ? { backgroundColor: themeColor } : {}}
                                                    >
                                                        {pack}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        /* For Apparel, Shoes, Handbags, Accessories: Show Size & Color */
                                        <>
                                            {/* Size Selector */}
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                                    <span>Select Size</span>
                                                    <span className="text-[10px] text-slate-500 font-normal">Selected: {modalSelectedSize}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(() => {
                                                        const isFootwear = /\b(shoe|shoes|sneaker|sneakers|kicks|boot|boots|jogger|joggers|footwear)\b/i.test(
                                                            `${liveStore.name} ${(selectedProductForModal as any).category || ''} ${selectedProductForModal.name}`
                                                        );
                                                        const sizes = isFootwear
                                                            ? ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44']
                                                            : ['Standard', 'Small (S)', 'Medium (M)', 'Large (L)', 'XL'];
                                                        return sizes.map((size) => (
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
                                                        ));
                                                    })()}
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
                                        </>
                                    )}

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