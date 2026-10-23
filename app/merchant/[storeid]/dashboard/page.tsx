'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { uploadProductImage, uploadStoreImage } from '@/lib/supabaseUpload';
import { StoreQRCode } from '@/components/store-qr-code';
import { VoiceStoreAssistant } from '@/components/VoiceStoreAssistant';
import { getStoreNicheColor, THEME_PALETTES, THEME_OPTIONS, darkenColor } from '@/lib/store-theme';
import { hasApprovedSubscriptionPayment, SUBSCRIPTION_PLAN_PRICES } from '@/lib/subscription-plans';
import { Boxes, Check, ChevronRight, CirclePlus, Clock, ExternalLink, Eye, LayoutDashboard, Package, Pencil, Search, ShoppingBag, Sparkles, Tag, Trash2, Upload, Wallet, MessageCircle, Mail, ChevronDown, ChevronUp, CheckCircle2, Truck, RefreshCw, X, Send, Lock, Plus, Mic, ShieldCheck } from 'lucide-react';

type Plan = 'basic' | 'pro' | 'business';
type Product = { id: string; name: string; price: number | string; description?: string | null; image_url?: string | null; category_id?: string | null; created_at?: string; has_sizes?: boolean; sizes?: string[]; has_colors?: boolean; colors?: string[]; };
type Category = { id: string; name: string };
type OrderItem = { id?: string; product_id?: string; name?: string; price?: number; quantity: number };
type Order = {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string | null;
    shipping_address?: string | null;
    delivery_address?: string | null;
    city?: string | null;
    postal_code?: string | null;
    zip_code?: string | null;
    payment_method?: string | null;
    total_amount: number | string;
    subtotal?: number | string;
    delivery_fee?: number | string;
    status?: string | null;
    created_at?: string;
    items?: OrderItem[] | unknown[];
};
type PaymentDetails = { bank_name: string; account_title: string; account_number: string; iban: string; jazzcash_number: string; easypaisa_number: string; sadapay_number?: string; sadapay_title?: string; jazzcash_title?: string; easypaisa_title?: string; };
type StoreSocialLinks = { instagram: string; facebook: string; youtube: string; tiktok: string; x: string };

const PLAN_DETAILS: Record<Plan, { 
    title: string; 
    pricePKR: number;
    priceLabel: string;
    productLimit: number | null; 
    categoryLimit: number | null; 
    perCategoryLimit?: number; 
    checkout: string;
    badge?: string;
    features: string[];
}> = {
    basic: { 
        title: 'BASIC', 
        pricePKR: 0,
        priceLabel: 'Free',
        productLimit: 20, 
        categoryLimit: 0, 
        checkout: 'WhatsApp Ordering',
        badge: 'Free',
        features: [
            'Up to 20 Products',
            'WhatsApp Ordering',
            'Basic Store Customization',
            'Product Management',
            'Product Images & Descriptions',
            'Basic Dashboard',
            'Basic Order Management'
        ]
    },
    pro: { 
        title: 'PRO', 
        pricePKR: SUBSCRIPTION_PLAN_PRICES.pro,
        priceLabel: 'PKR 2,499 / mo',
        productLimit: 75, 
        categoryLimit: 5, 
        perCategoryLimit: 15, 
        checkout: 'WhatsApp Ordering',
        badge: 'Advanced',
        features: [
            'Up to 75 Products',
            'Up to 5 Categories',
            'Up to 15 Products per Category',
            'Advanced Store Customization',
            'WhatsApp Ordering',
            'Order Tracking',
            'Payment Integration',
            'Coupons & Discounts',
            'Basic Analytics'
        ]
    },
    business: { 
        title: 'BUSINESS', 
        pricePKR: SUBSCRIPTION_PLAN_PRICES.business,
        priceLabel: 'PKR 4,999 / mo',
        productLimit: null, 
        categoryLimit: null, 
        checkout: 'WhatsApp Ordering',
        badge: 'Unlimited',
        features: [
            'Unlimited Products',
            'Unlimited Categories',
            'Advanced Store Customization',
            'WhatsApp Ordering',
            'Order Tracking',
            'Payment Integration',
            'AI Customer Chatbot',
            'Advanced Analytics',
            'Priority Support'
        ]
    },
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
    const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
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
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({ bank_name: '', account_title: '', account_number: '', iban: '', sadapay_number: '', sadapay_title: '', jazzcash_number: '', jazzcash_title: '', easypaisa_number: '', easypaisa_title: '' });
    const [socialLinks, setSocialLinks] = useState<StoreSocialLinks>({ instagram: '', facebook: '', youtube: '', tiktok: '', x: '' });

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
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');
    const [prodImageFiles, setProdImageFiles] = useState<File[]>([]);
    const [editingProdId, setEditingProdId] = useState<string | null>(null);
    const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [bulkLoading, setBulkLoading] = useState(false);

    // Product Variant States (Sizes & Colors)
    const [prodHasSizes, setProdHasSizes] = useState(false);
    const [prodSizes, setProdSizes] = useState('Standard, S, M, L, XL');
    const [prodHasColors, setProdHasColors] = useState(false);
    const [prodColors, setProdColors] = useState('Default, Black, Navy, Emerald, Maroon');

    // Upgrade payment proof states
    const [senderName, setSenderName] = useState('');
    const [senderNumber, setSenderNumber] = useState('');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofUrl, setProofUrl] = useState('');
    const [pendingUpgradeStatus, setPendingUpgradeStatus] = useState<string | null>(null);

    // Category Form
    const [catName, setCatName] = useState('');

    // Plan Upgrade & Payment States
    const [upgradeModalPlan, setUpgradeModalPlan] = useState<Plan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'jazzcash' | 'easypaisa' | 'sadapay'>('jazzcash');
    const [upgradeSenderName, setUpgradeSenderName] = useState('');
    const [upgradeSenderNumber, setUpgradeSenderNumber] = useState('');
    const [upgradeTrxId, setUpgradeTrxId] = useState('');
    const [upgradeReceiptFile, setUpgradeReceiptFile] = useState<File | null>(null);
    const [subscriptionPaymentAccounts, setSubscriptionPaymentAccounts] = useState({
        easypaisa: { title: '', number: '' },
        jazzcash: { title: '', number: '' },
        sadapay: { title: '', number: '' },
    });
    const [trxRef, setTrxRef] = useState('');
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [upgradeSuccess, setUpgradeSuccess] = useState('');

    // Trial duration & lock enforcement
    const [isTrialExpired, setIsTrialExpired] = useState(false);
    const [trialDaysLeft, setTrialDaysLeft] = useState(3);
    const [isTrialActive, setIsTrialActive] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('verified');
    const [checkingVerification, setCheckingVerification] = useState(false);
    const [verificationTimerSeconds, setVerificationTimerSeconds] = useState(720); // 12 mins
    const [lastVerifiedCheckTime, setLastVerifiedCheckTime] = useState<string | null>(null);
    const wasVerifiedRef = useRef(false);

    // Active verification countdown timer
    useEffect(() => {
        if (isVerified) return;
        const interval = setInterval(() => {
            setVerificationTimerSeconds(prev => (prev > 1 ? prev - 1 : 600));
        }, 1000);
        return () => clearInterval(interval);
    }, [isVerified]);

    const formatTimer = (secs: number) => {
        const mins = Math.floor(secs / 60);
        const remaining = secs % 60;
        return `${String(mins).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
    };

    // Bexi AI Command Center states
    const [bexiChatHistory, setBexiChatHistory] = useState<Array<{ sender: 'ai' | 'merchant'; text: string; time: string }>>([
        {
            sender: 'ai',
            text: `Assalam-o-Alaikum! 👋 Main hoon **Bexi AI**, aapka dedicated AI Store Growth Manager.\n\nAap mujh se Urdu ya English mein store growth, WhatsApp campaigns, catalog pricing, ya sales strategy ke baray mein kuch bhi pooch saktay hain! 🛍️`,
            time: 'Just now'
        }
    ]);
    const [bexiInputText, setBexiInputText] = useState('');
    const [isBexiThinking, setIsBexiThinking] = useState(false);

    const handleSendBexiPrompt = async (promptText: string) => {
        if (!promptText.trim()) return;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setBexiChatHistory((prev) => [
            ...prev,
            { sender: 'merchant', text: promptText, time: nowTime }
        ]);
        setBexiInputText('');
        setIsBexiThinking(true);

        try {
            const sid = resolvedStoreId || paramId;
            const res = await fetch('/api/merchant/voice-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    command: promptText,
                    storeId: sid,
                    storeSlug: storeSlug || paramId,
                    language: 'en',
                }),
            });
            const data = await res.json();
            const reply = data.reply || data.message || `Here are actionable recommendations for ${storeName}:\n\n1. Run a 48-hour WhatsApp exclusive discount with Free Nationwide Cash on Delivery.\n2. Bundle your top 2 items at a 10% combo discount.\n3. Send automated order dispatch alerts to reduce customer cancellations.\n\nWould you like me to draft promotional messages for your products?`;
            setBexiChatHistory((prev) => [
                ...prev,
                { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ]);
        } catch {
            setBexiChatHistory((prev) => [
                ...prev,
                {
                    sender: 'ai',
                    text: `Great strategy question for **${storeName}**! To maximize revenue right now:\n\n• **Direct WhatsApp Orders**: Share direct product links in your customer groups.\n• **Cash on Delivery**: Ensure fast dispatch within 24 hours to reduce RTO.\n• **High-Impact Visuals**: Make sure each product has at least 3 crisp gallery photos.\n\nLet me know if you would like me to generate specific copy or revise any catalog pricing!`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
            ]);
        } finally {
            setIsBexiThinking(false);
        }
    };

    const handleBexiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendBexiPrompt(bexiInputText);
    };

    async function handleActivatePlan(targetPlan: Plan) {
        if (!resolvedStoreId && !paramId) return;
        setIsUpgrading(true);
        try {
            const sid = resolvedStoreId || paramId;
            if (targetPlan === 'basic') {
                const res = await fetch('/api/stores/plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        store_id: sid,
                        plan: 'basic',
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to switch to Basic plan.');
                setStorePlan('basic');
                setUpgradeSuccess('Switched to Basic plan.');
                setUpgradeModalPlan(null);
                setTimeout(() => setUpgradeSuccess(''), 7000);
                return;
            }

            if (!upgradeTrxId.trim()) throw new Error('Enter the transaction ID (TID) from your payment receipt.');
            const screenshotUrl = upgradeReceiptFile ? await uploadStoreImage(upgradeReceiptFile, sid) : '';

            const res = await fetch('/api/merchant/upgrade-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: sid,
                    plan: targetPlan,
                    payment_method: paymentMethod,
                    sender_name: upgradeSenderName,
                    sender_number: upgradeSenderNumber,
                    transaction_id: upgradeTrxId,
                    screenshot_url: screenshotUrl,
                    amount: PLAN_DETAILS[targetPlan].pricePKR,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit upgrade proof.');

            setPendingUpgradeStatus(targetPlan);
            setUpgradeSuccess(`Payment submitted. Your ${PLAN_DETAILS[targetPlan].title} features will unlock after Super Admin approval.`);
            setUpgradeModalPlan(null);
            setUpgradeTrxId('');
            setUpgradeSenderName('');
            setUpgradeSenderNumber('');
            setUpgradeReceiptFile(null);
            setTimeout(() => setUpgradeSuccess(''), 10000);
        } catch (err: any) {
            alert(err.message || 'Payment activation failed. Please try again.');
        } finally {
            setIsUpgrading(false);
        }
    }

    const planDetails = PLAN_DETAILS[storePlan];
    const canUseWhatsapp = true;
    const canUseBexiAi = storePlan === 'business';
    const canUsePaymentIntegration = storePlan === 'pro' || storePlan === 'business';
    const filteredProducts = useMemo(() => {
        const query = productSearch.trim().toLowerCase();
        if (!query) return products;
        return products.filter((product) => product.name.toLowerCase().includes(query));
    }, [products, productSearch]);
    const totalRevenue = useMemo(() => orders.reduce((total, order) => total + Number(order.total_amount || 0), 0), [orders]);
    const pendingOrders = useMemo(() => orders.filter((order) => (order.status || 'pending').toLowerCase() === 'pending').length, [orders]);

    const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'ready' | 'shipped' | 'delivered' | 'cancelled'>('all');
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length, pending: 0, ready: 0, shipped: 0, delivered: 0, cancelled: 0 };
        orders.forEach(o => {
            const st = (o.status || 'pending').toLowerCase();
            if (st in counts) counts[st] = (counts[st] || 0) + 1;
            else if (st === 'processing') counts.pending += 1;
            else if (st === 'completed') counts.delivered += 1;
            else if (st === 'canceled' || st === 'rejected') counts.cancelled += 1;
        });
        return counts;
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const sorted = [...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        if (orderFilter === 'all') return sorted;
        return sorted.filter(o => {
            const st = (o.status || 'pending').toLowerCase();
            if (orderFilter === 'pending') return st === 'pending' || st === 'processing';
            if (orderFilter === 'delivered') return st === 'delivered' || st === 'completed';
            if (orderFilter === 'cancelled') return st === 'cancelled' || st === 'canceled' || st === 'rejected';
            return st === orderFilter;
        });
    }, [orders, orderFilter]);

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!resolvedStoreId || updatingOrderId) return;
        setUpdatingOrderId(orderId);
        try {
            const res = await fetch('/api/stores/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    store_id: resolvedStoreId,
                    id: orderId,
                    status: newStatus
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update order status');
            setOrders(current => current.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            setMessage(`Order #${orderId.slice(0, 8)} status updated to ${newStatus}.`);
            setMessageError(false);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Error updating order status');
            setMessageError(true);
        } finally {
            setUpdatingOrderId(null);
        }
    };

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

    const resolveStoreAndData = useCallback(async (identifier: string, isSilent = false) => {
        try {
            const supabase = createClient();
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            const queryParam = identifier ? `?store_id=${encodeURIComponent(identifier)}` : '';
            const response = await fetch(`/api/stores/current${queryParam}`, {
                cache: 'no-store',
                headers: session?.access_token
                    ? { Authorization: `Bearer ${session.access_token}` }
                    : {},
            });
            const payload: {
                store?: { 
                    id: string; 
                    name: string | null; 
                    slug: string | null; 
                    plan: string | null; 
                    whatsapp_number: string | null;
                    primary_color?: string | null;
                    selected_theme?: string | null;
                };
                error?: string;
            } = await response.json();
            if (!response.ok) throw new Error(payload.error || 'Unable to load your store.');
            const storeData = payload.store;

            if (!storeData) {
                throw new Error('No store is linked to this account.');
            }
            const normIdentifier = decodeURIComponent(identifier).toLowerCase();
            const normStoreId = (storeData.id || '').toLowerCase();
            const normStoreSlug = (storeData.slug || '').toLowerCase();
            if (normStoreId !== normIdentifier && normStoreSlug !== normIdentifier) {
                throw new Error('You are not authorized to access this store.');
            }

            setResolvedStoreId(storeData.id);
            setStoreName(storeData.name || 'Your store');
            setStoreSlug(storeData.slug || '');
            const rawPlan = normalizePlan(storeData.plan);
            const isPaidVerified = hasApprovedSubscriptionPayment((storeData as any)?.payment_status);
            const normPlan = (!isPaidVerified && rawPlan !== 'basic') ? 'basic' : rawPlan;
            setStorePlan(normPlan);

            const isVer = Boolean((storeData as any).is_verified === true || (storeData as any).verification_status === 'verified');
            setIsVerified(isVer);
            setVerificationStatus(isVer ? 'verified' : ((storeData as any).verification_status || 'pending'));

            if (isVer) {
                if (!wasVerifiedRef.current) {
                    wasVerifiedRef.current = true;
                    if (isSilent) {
                        setMessage('🎉 Store account verified successfully! All dashboard features are now active.');
                        setMessageError(false);
                    }
                }
            } else {
                wasVerifiedRef.current = false;
            }

            // 3-day Free Trial Check & Lock Enforcement
            const isPaid = isPaidVerified;
            const isFreeOrBasic = normPlan === 'basic' || (normPlan as any) === 'free';
            const createdAtStr = (storeData as any).created_at || (storeData as any).createdAt;
            const createdAt = createdAtStr ? new Date(createdAtStr) : new Date();
            const elapsedDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);

            if (isFreeOrBasic && !isPaid) {
                setIsTrialActive(true);
                const remaining = Math.max(0, Math.ceil(3 - elapsedDays));
                setTrialDaysLeft(remaining);
                if (elapsedDays > 3) {
                    setIsTrialExpired(true);
                } else {
                    setIsTrialExpired(false);
                }
            } else {
                setIsTrialActive(false);
                setIsTrialExpired(false);
            }

            // Load settings and dashboard data at the same time to avoid a network waterfall.
            const [settingsData, , paymentInstructions] = await Promise.all([
                fetch(`/api/stores/settings?store_id=${storeData.id}`).then(async (response) => {
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Unable to load storefront settings.');
                    return data;
                }),
                fetchMeshData(storeData.id),
                fetch(`/api/merchant/upgrade-request?store_id=${encodeURIComponent(storeData.id)}`, { cache: 'no-store' })
                    .then(async (response) => {
                        const data = await response.json();
                        if (!response.ok) throw new Error(data.error || 'Unable to load subscription payment instructions.');
                        return data;
                    })
                    .catch((error: unknown) => {
                        console.error('Unable to load subscription payment instructions:', error);
                        setMessage(error instanceof Error ? error.message : 'Unable to load subscription payment instructions.');
                        setMessageError(true);
                        return null;
                    }),
            ]);
            if (paymentInstructions) {
                setSubscriptionPaymentAccounts(paymentInstructions.payment_accounts);
                setPendingUpgradeStatus(paymentInstructions.pending_upgrade?.plan ?? null);
            }

            const nicheColor = getStoreNicheColor(storeData.name, storeData.slug);
            const resolvedColor = settingsData?.settings?.theme_color 
                || storeData.primary_color 
                || (settingsData?.settings?.selected_theme && THEME_PALETTES[settingsData.settings.selected_theme])
                || (storeData.selected_theme && THEME_PALETTES[storeData.selected_theme])
                || nicheColor;
            setThemeColor(resolvedColor);

            if (settingsData.settings) {
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
                const loadedSocialLinks = settingsData.settings.social_links && typeof settingsData.settings.social_links === 'object'
                    ? settingsData.settings.social_links
                    : {};
                setSocialLinks({
                    instagram: loadedSocialLinks.instagram || '',
                    facebook: loadedSocialLinks.facebook || '',
                    youtube: loadedSocialLinks.youtube || '',
                    tiktok: loadedSocialLinks.tiktok || '',
                    x: loadedSocialLinks.x || '',
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

    // Background auto-polling every 8 seconds so merchant never stays stuck when admin verifies
    useEffect(() => {
        if ((isVerified && !pendingUpgradeStatus) || !paramId) return;
        const interval = setInterval(() => {
            void resolveStoreAndData(paramId, true);
        }, 8000);
        return () => clearInterval(interval);
    }, [isVerified, pendingUpgradeStatus, paramId, resolveStoreAndData]);

    const handleCheckVerification = async () => {
        if (checkingVerification || !paramId) return;
        setCheckingVerification(true);
        setLastVerifiedCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        try {
            await resolveStoreAndData(paramId);
        } finally {
            setCheckingVerification(false);
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const tabParam = urlParams.get('tab');
            if (tabParam && ['overview', 'products', 'categories', 'orders', 'branding', 'payments', 'plans', 'ai'].includes(tabParam)) {
                setActiveTab(tabParam);
            }
        }
    }, []);

    // Save Settings & Integrations (Plan Gated)
    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        setMessageError(false);
        if (!isVerified) {
            setMessage('Store verification is in progress. Settings will unlock once verified.');
            setMessageError(true);
            return;
        }
        setSavingSettings(true);
        try {
            if (!resolvedStoreId) throw new Error('Store is still loading. Please try again in a moment.');
            const savedLogoUrl = logoFile ? await uploadStoreImage(logoFile, resolvedStoreId) : logoUrl;
            const settingsPayload: Record<string, unknown> = {
                    store_id: resolvedStoreId,
                    theme_color: themeColor,
                    selected_theme: THEME_OPTIONS.find(t => t.color.toLowerCase() === themeColor.toLowerCase())?.id || 'emerald',
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
            if (activeTab === 'branding') settingsPayload.social_links = socialLinks;
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
            if (data.warning) {
                setMessage(data.warning);
                setMessageError(false);
            } else {
                setMessage('');
                setMessageError(false);
            }
        } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Failed to save settings.');
            setMessageError(true);
        } finally {
            setSavingSettings(false);
        }
    };

    const handleProductFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length > 0) {
            setProdImageFiles((prev) => [...prev, ...files]);
        }
    };

    const populateProductEdit = (product: Product) => {
        setEditingProdId(product.id);
        setProdName(product.name);
        setProdPrice(String(product.price));
        
        let hasSizes = Boolean(product.has_sizes);
        let sizes = Array.isArray(product.sizes) ? product.sizes.join(', ') : 'Standard, S, M, L, XL';
        let hasColors = Boolean(product.has_colors);
        let colors = Array.isArray(product.colors) ? product.colors.join(', ') : 'Default, Black, Navy, Emerald, Maroon';

        if (typeof product.description === 'string' && product.description.includes('<!--variants:')) {
            try {
                const match = product.description.match(/<!--variants:(.*?)-->/);
                if (match && match[1]) {
                    const meta = JSON.parse(match[1]);
                    if (meta.has_sizes !== undefined) hasSizes = Boolean(meta.has_sizes);
                    if (meta.has_colors !== undefined) hasColors = Boolean(meta.has_colors);
                    if (Array.isArray(meta.sizes)) sizes = meta.sizes.join(', ');
                    if (Array.isArray(meta.colors)) colors = meta.colors.map((c: any) => typeof c === 'string' ? c : c.name).join(', ');
                }
            } catch {}
        }

        setProdDesc(product.description ? product.description.replace(/<!--variants:.*?-->/g, '').trim() : '');
        setProdHasSizes(hasSizes);
        setProdSizes(sizes);
        setProdHasColors(hasColors);
        setProdColors(colors);
        setProdCategory(product.category_id || '');
        setProdImageFiles([]);
        setActiveTab('products');
    };

    const handleRemoveProductFile = (index: number) => {
        setProdImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Save Product with Supabase Multiple Images Upload
    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');
        if (!isVerified) {
            setMessage('Store verification is in progress. Product management will unlock once verified.');
            setMessageError(true);
            return;
        }
        if (!editingProdId && planDetails.productLimit !== null && products.length >= planDetails.productLimit) {
            setMessage(`Your ${planDetails.title} plan limit of ${planDetails.productLimit} products has been reached. Please upgrade to add more products.`);
            setMessageError(true);
            return;
        }
        setUploadingImage(true);

        try {
            let imageUrl: string | null = null;
            if (prodImageFiles.length > 0) {
                const uploadedUrls = await Promise.all(
                    prodImageFiles.map((file) => uploadProductImage(file, resolvedStoreId))
                );
                imageUrl = uploadedUrls.filter(Boolean).join(',');
            }

            let finalCategoryId = prodCategory || null;
            if (isAddingNewCategory && newCategoryInput.trim()) {
                const trimmedCat = newCategoryInput.trim();
                const existing = categories.find((c) => c.name.toLowerCase() === trimmedCat.toLowerCase());
                if (existing) {
                    finalCategoryId = existing.id;
                } else {
                    try {
                        const catRes = await fetch('/api/stores/categories', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ store_id: resolvedStoreId, name: trimmedCat }),
                        });
                        const catData = await catRes.json();
                        if (catData.category?.id) {
                            finalCategoryId = catData.category.id;
                            setCategories((prev) => [...prev, catData.category]);
                        }
                    } catch (catErr) {
                        console.warn('Failed to auto-create custom category:', catErr);
                    }
                }
            }

            const method = editingProdId ? 'PUT' : 'POST';
            const bodyData: Record<string, unknown> = {
                store_id: resolvedStoreId,
                name: prodName,
                price: Number(prodPrice),
                description: prodDesc || '',
                category_id: finalCategoryId,
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
                setMessage(editingProdId ? 'Product updated successfully!' : 'Product added! You can add another product below.');
                setMessageError(false);
                setProdName('');
                setProdPrice('');
                setProdDesc('');
                setProdCategory('');
                setNewCategoryInput('');
                setIsAddingNewCategory(false);
                setProdImageFiles([]);
                setEditingProdId(null);
                setActiveTab('products');
                await fetchMeshData(resolvedStoreId);
            } else {
                setMessage(data.error || 'Failed to save product');
                setMessageError(true);
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'An error occurred');
            setMessageError(true);
        } finally {
            setUploadingImage(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!isVerified) {
            setMessage('Store verification is in progress. Catalog editing will unlock once verified.');
            setMessageError(true);
            return;
        }
        if (!confirm('Are you sure you want to delete this product from your store?')) return;
        setProducts((prev) => prev.filter((p) => p.id !== id));
        try {
            const res = await fetch(`/api/stores/products?id=${encodeURIComponent(id)}&store_id=${encodeURIComponent(resolvedStoreId)}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (data.success) {
                setMessage('Product deleted successfully.');
                setMessageError(false);
            } else {
                setMessage(data.error || 'Failed to delete product');
                setMessageError(true);
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Error deleting product');
            setMessageError(true);
        } finally {
            await fetchMeshData(resolvedStoreId);
        }
    };

    const handleDeleteAllAiProducts = async () => {
        if (!confirm(`Are you sure you want to delete all ${products.length} products to clear the starter catalog?`)) return;
        setProducts([]);
        setSelectedProductIds([]);
        try {
            await Promise.all(
                products.map((p) =>
                    fetch(`/api/stores/products?id=${encodeURIComponent(p.id)}&store_id=${encodeURIComponent(resolvedStoreId)}`, { method: 'DELETE' })
                )
            );
            setMessage('All products deleted. You can now add your custom items.');
            setMessageError(false);
        } catch {
            setMessage('Error deleting some products.');
            setMessageError(true);
        } finally {
            await fetchMeshData(resolvedStoreId);
        }
    };

    const handleDeleteSelectedProducts = async () => {
        if (selectedProductIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedProductIds.length} selected product(s)?`)) return;
        const idsToDelete = [...selectedProductIds];
        setProducts(prev => prev.filter(p => !idsToDelete.includes(p.id)));
        setSelectedProductIds([]);
        try {
            const res = await fetch(`/api/stores/products?ids=${encodeURIComponent(idsToDelete.join(','))}&store_id=${encodeURIComponent(resolvedStoreId)}`, { method: 'DELETE' });
            const data = await res.json().catch(() => ({}));
            if (data.success) {
                setMessage(data.message || 'Selected products deleted successfully.');
                setMessageError(false);
            } else {
                setMessage(data.error || 'Failed to delete some products.');
                setMessageError(true);
            }
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Error deleting selected products.');
            setMessageError(true);
        } finally {
            await fetchMeshData(resolvedStoreId);
        }
    };

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkText.trim() || bulkLoading) return;
        if (!isVerified) {
            setMessage('Store verification is in progress. Catalog editing will unlock once verified.');
            setMessageError(true);
            return;
        }
        if (planDetails.productLimit !== null && products.length >= planDetails.productLimit) {
            setMessage(`Your ${planDetails.title} plan limit of ${planDetails.productLimit} products has been reached. Please upgrade to add more products.`);
            setMessageError(true);
            return;
        }
        setBulkLoading(true);
        setMessage('');

        const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
        let successCount = 0;

        for (const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            const name = parts[0];
            const price = Number(parts[1]) || 1000;
            const cat = parts[2] || 'General';

            if (name) {
                try {
                    const res = await fetch('/api/stores/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            store_id: resolvedStoreId,
                            name,
                            price,
                            description: `Handcrafted ${name} with quality verified guarantee.`,
                            category_id: categories.find(c => c.name.toLowerCase() === cat.toLowerCase())?.id || null,
                        }),
                    });
                    const d = await res.json().catch(() => ({}));
                    if (d.success) successCount++;
                } catch {
                    // continue
                }
            }
        }

        setMessage(`Successfully added ${successCount} products!`);
        setMessageError(false);
        setBulkText('');
        setIsBulkAddOpen(false);
        setBulkLoading(false);
        await fetchMeshData(resolvedStoreId);
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isVerified) {
            setMessage('Store verification is in progress. Category management will unlock once verified.');
            setMessageError(true);
            return;
        }
        if (planDetails.categoryLimit === 0) {
            setMessage('Categories are locked on the Free Starter plan. Upgrade to Pro Merchant or Advance VIP to add categories.');
            setMessageError(true);
            return;
        }
        if (planDetails.categoryLimit !== null && categories.length >= planDetails.categoryLimit) {
            setMessage(`Your ${planDetails.title} plan limit of ${planDetails.categoryLimit} categories has been reached. Please upgrade to Business for unlimited categories.`);
            setMessageError(true);
            return;
        }
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
            <aside 
                className="w-full md:w-64 md:min-h-screen text-white flex flex-col shadow-xl md:sticky md:top-0 md:h-screen transition-colors"
                style={{ backgroundColor: darkenColor(themeColor, 75) }}
            >
                <div 
                    className="p-5 border-b flex items-center gap-3 transition-colors"
                    style={{ backgroundColor: darkenColor(themeColor, 65), borderColor: `${themeColor}35` }}
                >
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl text-white shadow-xs" style={{ backgroundColor: themeColor }}>
                        <Boxes size={19} />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold tracking-wide text-white">{storeName}</h2>
                        <span className="mt-1 inline-flex rounded-full bg-white/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            {planDetails.title} plan
                        </span>
                    </div>
                </div>

                <nav className="grid grid-cols-2 gap-1.5 p-3 text-xs sm:grid-cols-4 md:flex md:flex-1 md:flex-col md:space-y-1.5 md:p-4" aria-label="Merchant dashboard">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'products', label: isVerified ? `Products · ${products.length}` : 'Products · 🔒 Locked', icon: Package },
                        { id: 'orders', label: isVerified ? `Orders · ${orders.length}` : 'Orders · 🔒 Locked', icon: ShoppingBag },
                        { id: 'categories', label: !isVerified ? 'Categories · 🔒 Locked' : planDetails.categoryLimit === 0 ? 'Categories · Locked' : `Categories · ${categories.length}`, icon: Tag },
                        { id: 'branding', label: isVerified ? 'Storefront' : 'Storefront · 🔒 Locked', icon: Eye },
                        { id: 'payments', label: isVerified ? 'Payments' : 'Payments · 🔒 Locked', icon: Wallet },
                        ...(canUseBexiAi ? [{ id: 'bexi-ai', label: isVerified ? `${storeName} Bexi AI` : `${storeName} Bexi AI · 🔒 Locked`, icon: Sparkles }] : []),
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex min-h-10 items-center gap-2 rounded-xl px-2.5 text-left font-semibold transition md:w-full md:px-3 ${
                                activeTab === tab.id ? 'text-white shadow-md' : 'text-slate-100 hover:text-white hover:bg-white/10'
                            }`}
                            style={activeTab === tab.id ? { backgroundColor: themeColor } : {}}
                        >
                            <tab.icon size={15} className="shrink-0" />
                            <span className="truncate">{tab.label}</span>
                        </button>
                    ))}

                    {/* Dedicated Voice AI Button - Placed right under [StoreName] Bexi AI, only available on Business plan */}
                    {canUseBexiAi && (
                        <button
                            type="button"
                            onClick={() => setIsVoiceAssistantOpen(true)}
                            className="group relative flex min-h-10 items-center justify-between gap-2 rounded-xl px-2.5 text-left font-semibold transition col-span-2 sm:col-span-4 md:col-span-1 md:w-full md:px-3 bg-linear-to-r from-emerald-600/95 to-teal-600/95 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md active:scale-95 border border-emerald-400/30"
                            title="Speak and manage your store via Voice AI in Urdu and English"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <Mic size={15} className="text-emerald-200 animate-pulse shrink-0" />
                                <span className="text-xs truncate font-bold">Voice AI Assistant</span>
                            </div>
                            <span className="rounded bg-white/20 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-tight shrink-0">ENG • UR</span>
                        </button>
                    )}
                    <div className="hidden flex-1 md:block" />
                    <div className="hidden rounded-xl border border-white/15 bg-white/5 p-3 md:block">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">Account status</p>
                        {isVerified ? (
                            <p className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-400">
                                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Verified Account
                            </p>
                        ) : (
                            <p className="mt-2 flex items-center gap-2 text-xs font-bold text-amber-300">
                                <span className="size-2 rounded-full bg-amber-400 animate-pulse" /> Verification Pending
                            </p>
                        )}
                        <a className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-200 hover:text-white" href={`/store/${storeSlug || paramId}`} target="_blank" rel="noreferrer">
                            Open storefront <ExternalLink size={12} />
                        </a>
                    </div>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="merchant-main min-w-0 flex-1 flex flex-col overflow-y-auto bg-slate-50" data-dashboard-main>
                <div className="h-1 w-full shrink-0" style={{ background: `linear-gradient(90deg, ${themeColor}, ${themeColor}88, transparent)` }} />
                <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 shadow-xs backdrop-blur sm:px-8">
                    <div className="flex items-center gap-3">
                        <h1 className="mt-1 text-lg font-bold capitalize tracking-tight text-slate-900">
                            {activeTab === 'overview' ? 'Store overview' : activeTab === 'bexi-ai' ? 'Bexi AI Command Center' : activeTab}
                        </h1>
                        {isVerified ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300 shadow-2xs">
                                <CheckCircle2 size={13} className="text-emerald-600" /> Verified Account
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300 shadow-2xs">
                                <Clock size={13} className="text-amber-600 animate-pulse" /> Verification Pending
                            </span>
                        )}
                    </div>
                    <a href={`/store/${storeSlug || paramId}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-2xs">
                        <Eye size={14} /> <span className="hidden sm:inline">View storefront</span><ExternalLink size={12} />
                    </a>
                </header>

                <div className="w-full max-w-7xl space-y-6 p-5 sm:p-8">
                    {message && !message.toLowerCase().includes('store setting') && !message.toLowerCase().includes('settings updated') && !message.toLowerCase().includes('settings saved') && (
                        <div role={messageError ? 'alert' : 'status'} className={`rounded-lg border p-3 text-xs font-medium ${messageError ? 'border-red-200 bg-red-50 text-red-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}>
                            {message}
                        </div>
                    )}

                    {/* Pending Plan Upgrade Approval Banner */}
                    {pendingUpgradeStatus && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm text-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="grid size-9 place-items-center rounded-xl bg-amber-500 text-white font-bold shrink-0 shadow-xs">
                                    <Sparkles size={18} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-amber-950">
                                        ⏳ Upgrade to {PLAN_DETAILS[pendingUpgradeStatus as Plan]?.title || 'Pro'} Under Review
                                    </p>
                                    <p className="text-[11px] text-amber-800">
                                        Your payment transaction proof has been submitted for verification. Once approved, your upgraded features (Bexi AI, Voice AI, higher product limits) will activate automatically!
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-amber-200/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 shrink-0">
                                Under Review
                            </span>
                        </div>
                    )}

                    {/* 3-Day Free Trial Active Countdown Banner */}
                    {isTrialActive && !isTrialExpired && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm text-slate-800">
                            <div className="flex items-center gap-3">
                                <span className="grid size-9 place-items-center rounded-xl bg-amber-500 text-white font-bold shrink-0 shadow-xs">
                                    <Sparkles size={18} />
                                </span>
                                <div>
                                    <p className="text-xs font-bold text-amber-950">
                                        ⏳ 3-Day Free Trial Active: {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} remaining
                                    </p>
                                    <p className="text-[11px] text-amber-800">
                                        Your store and dashboard are live! Upgrade to Pro or Business to keep your store active permanently and unlock WhatsApp ordering.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUpgradeModalPlan('pro')}
                                className="shrink-0 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:scale-105 active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                Upgrade Now →
                            </button>
                        </div>
                    )}

                    {/* Verification in Process Timer Banner for Overview */}
                    {!isVerified && (
                        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 sm:p-5 shadow-sm text-slate-800">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start sm:items-center gap-3.5">
                                    <div className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-white shadow-md">
                                        <Clock size={22} className="animate-spin" style={{ animationDuration: '8s' }} />
                                        <span className="absolute -top-1 -right-1 flex size-3">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex size-3 rounded-full bg-amber-600"></span>
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-sm font-bold text-slate-900">
                                                Verification in process
                                            </h4>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-950">
                                                <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" /> Reviewing Store
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-600 max-w-xl">
                                            Super Admin is reviewing your store. As soon as approved, all tabs, WhatsApp orders, and AI features will automatically unlock.
                                        </p>
                                        {lastVerifiedCheckTime && (
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Last checked: {lastVerifiedCheckTime}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                                    <div className="flex items-center justify-center gap-2.5 rounded-xl bg-white/90 border border-amber-200 px-4 py-2 shadow-xs">
                                        <Clock size={16} className="text-amber-600" />
                                        <div className="text-left">
                                            <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Est. Review Time</p>
                                            <p className="text-sm font-black font-mono text-amber-700">{formatTimer(verificationTimerSeconds)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCheckVerification}
                                        disabled={checkingVerification}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <RefreshCw size={14} className={checkingVerification ? "animate-spin" : ""} />
                                        {checkingVerification ? 'Checking Status…' : 'Check Verification Status'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OVERVIEW */}
                    {activeTab === 'overview' && (
                        <>
                            {upgradeSuccess && (
                                <div className="flex items-center justify-between rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-sm animate-in fade-in duration-300">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                                        <span>{upgradeSuccess}</span>
                                    </div>
                                    <button type="button" onClick={() => setUpgradeSuccess('')} className="p-1 text-emerald-700 hover:text-emerald-900">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <section 
                                className="relative overflow-hidden rounded-2xl p-6 text-white shadow-md sm:p-8"
                                style={{
                                    background: `linear-gradient(135deg, ${themeColor} 0%, ${darkenColor(themeColor, 35)} 100%)`,
                                    color: '#ffffff',
                                }}
                            >
                                <div className="absolute -right-12 -top-24 size-72 rounded-full border border-white/15 pointer-events-none" />
                                <div className="absolute -right-2 -top-14 size-52 rounded-full border border-white/10 pointer-events-none" />
                                <div className="relative z-10 flex flex-wrap items-end justify-between gap-5">
                                    <div className="max-w-xl">
                                        <h2 
                                            className="mt-3.5 text-2xl font-black tracking-tight drop-shadow-sm sm:text-3xl text-white"
                                            style={{ color: '#ffffff' }}
                                        >
                                            Welcome back, {storeName}
                                        </h2>
                                        <p 
                                            className="mt-2 max-w-lg text-sm font-medium leading-relaxed drop-shadow-xs"
                                            style={{ color: 'rgba(255, 255, 255, 0.95)' }}
                                        >
                                            Your products, orders, and storefront performance at a glance. Keep your catalog fresh and stay on top of every order.
                                        </p>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => { if (!isVerified) { setMessage('Store verification is in progress. Adding products will unlock once verified.'); setMessageError(true); return; } setEditingProdId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory(''); setProdImageFiles([]); setActiveTab('products'); }} 
                                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-xs font-bold shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl active:scale-95" 
                                        style={{ color: themeColor }}
                                    >
                                        <CirclePlus size={16} /> Add a product
                                    </button>
                                </div>
                            </section>

                            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Store performance">
                                {[
                                    { title: 'Catalog products', value: products.length, note: planDetails.productLimit === null ? 'No cap on this plan' : `${Math.max(0, planDetails.productLimit - products.length)} remaining`, icon: Package, tone: 'bg-blue-50 text-blue-700' },
                                    { title: 'Orders received', value: orders.length, note: `${pendingOrders} awaiting action`, icon: ShoppingBag, tone: 'bg-violet-50 text-violet-700' },
                                    { title: 'Sales recorded', value: formatPKR(totalRevenue), note: 'Total from loaded orders', icon: Wallet, tone: 'bg-emerald-50 text-emerald-700' },
                                    { title: 'Categories', value: planDetails.categoryLimit === 0 ? 'Locked' : categories.length, note: planDetails.categoryLimit === 0 ? 'Available on Pro & VIP' : planDetails.categoryLimit === null ? 'No cap on this plan' : `${Math.max(0, planDetails.categoryLimit - categories.length)} remaining`, icon: Tag, tone: planDetails.categoryLimit === 0 ? 'bg-slate-100 text-slate-400' : 'bg-amber-50 text-amber-700' },
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
                                                    {product.image_url ? <Image src={product.image_url.split(',')[0].trim()} alt="" width={48} height={48} unoptimized className="size-12 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"><Package size={18} /></span>}
                                                    <div className="min-w-0 flex-1"><h4 className="truncate text-xs font-semibold text-slate-800">{product.name}</h4><p className="mt-1 truncate text-[10px] text-slate-500">{product.description || 'No description added'}{product.created_at ? ` · Added ${formatDate(product.created_at)}` : ''}</p></div>
                                                    <p className="whitespace-nowrap text-xs font-semibold text-slate-900">{formatPKR(product.price)}</p>
                                                    <button type="button" aria-label={`Edit ${product.name}`} title="Edit product" onClick={() => populateProductEdit(product)} className="grid size-8 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-700"><Pencil size={14} /></button>
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
                                            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]"><span className="text-slate-500">Categories</span><span className="font-semibold text-slate-700">{planDetails.categoryLimit === 0 ? 'Locked on Free (Upgrade to Pro)' : `${categories.length} / ${planDetails.categoryLimit ?? '∞'}`}</span></div>
                                            <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">Checkout</span><span className="text-right font-medium text-slate-700">{planDetails.checkout}</span></div>
                                            {planDetails.perCategoryLimit && <div className="flex items-center justify-between text-[11px]"><span className="text-slate-500">Products per category</span><span className="font-medium text-slate-700">Up to {planDetails.perCategoryLimit}</span></div>}
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] text-slate-600"><Check size={13} className="shrink-0 text-emerald-600" />Plan features are based on the limits enabled for your store.</div>
                                        {storePlan !== 'business' && (
                                            <button
                                                type="button"
                                                onClick={() => setUpgradeModalPlan(storePlan === 'basic' ? 'pro' : 'business')}
                                                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-90 active:scale-95"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <Sparkles size={14} />
                                                Upgrade to {storePlan === 'basic' ? 'Pro Plan' : 'Business Plan'}
                                            </button>
                                        )}
                                    </section>

                                    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex items-center justify-between"><div><h3 className="text-sm font-semibold text-slate-900">Recent orders</h3><p className="mt-1 text-[10px] text-slate-500">Latest customer activity</p></div><button onClick={() => setActiveTab('orders')} className="text-[11px] font-semibold text-blue-700 hover:text-blue-800">View all</button></div>
                                        {orders.length === 0 ? <div className="mt-5 rounded-lg bg-slate-50 px-3 py-5 text-center text-xs text-slate-500">No orders yet. New orders will show here.</div> : <div className="mt-3 divide-y divide-slate-100">{[...orders].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 4).map((order) => <div key={order.id} className="flex items-center gap-3 py-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700"><ShoppingBag size={14} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{order.customer_name}</p><p className="mt-0.5 text-[10px] text-slate-500">{formatDate(order.created_at)} · {(order.status || 'pending').toLowerCase()}</p></div><span className="text-[11px] font-semibold text-slate-800">{formatPKR(order.total_amount)}</span></div>)}</div>}
                                    </section>
                                </aside>
                            </section>

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-wrap items-end justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Plan guide</p>
                                        <h3 className="mt-1 text-base font-semibold text-slate-900">What your plan includes</h3>
                                        <p className="mt-1 text-xs text-slate-500">Upgrade your plan to unlock WhatsApp ordering, higher catalog caps, and AI features.</p>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">Current: {storePlan}</span>
                                </div>
                                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {(['basic', 'pro', 'business'] as Plan[]).map((plan) => {
                                        const details = PLAN_DETAILS[plan];
                                        const isCurrent = plan === storePlan;
                                        return (
                                            <article 
                                                key={plan} 
                                                className={`relative flex flex-col justify-between rounded-2xl border p-5 transition shadow-xs ${
                                                    isCurrent 
                                                        ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-100' 
                                                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                                                }`}
                                            >
                                                {details.badge && (
                                                    <span 
                                                        className="absolute -top-2.5 right-4 rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs"
                                                        style={{ backgroundColor: plan === 'pro' ? themeColor : '#0f172a' }}
                                                    >
                                                        {details.badge}
                                                    </span>
                                                )}
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-base font-extrabold capitalize text-slate-900">{details.title}</h4>
                                                        {isCurrent && (
                                                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">
                                                                Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-xs font-bold text-slate-700">{details.priceLabel}</p>

                                                    <ul className="mt-4 space-y-2.5 text-[11px] text-slate-600">
                                                        {details.features.map((feat) => (
                                                            <li key={feat} className="flex items-start gap-2">
                                                                <Check size={13} className="mt-0.5 shrink-0 text-emerald-600" />
                                                                <span>{feat}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                <div className="pt-5 mt-4 border-t border-slate-100">
                                                    {isCurrent ? (
                                                        <div className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-xs font-bold text-blue-700">
                                                            <CheckCircle2 size={14} className="text-blue-600" /> Current Active Plan
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => setUpgradeModalPlan(plan)}
                                                            className="flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
                                                            style={{
                                                                backgroundColor: plan === 'business' ? '#0f172a' : themeColor,
                                                            }}
                                                        >
                                                            {plan === 'basic' 
                                                                ? 'Switch to Basic (Free)' 
                                                                : `Upgrade to ${details.title} — ${details.priceLabel}`}
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}

{/* When unverified, non-overview tabs are locked */}
                    {!isVerified && activeTab !== 'overview' ? (
                        <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-b from-white via-amber-50/20 to-white p-8 sm:p-12 text-center shadow-lg space-y-5 max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-200">
                            <div className="relative mx-auto grid size-20 place-items-center rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white shadow-lg shadow-amber-200">
                                <Lock size={36} />
                                <span className="absolute -top-1 -right-1 flex size-4">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex size-4 rounded-full bg-amber-600 border-2 border-white"></span>
                                </span>
                            </div>
                            
                            <div className="space-y-1">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3.5 py-1 text-xs font-bold tracking-wide">
                                    <Clock size={13} className="animate-spin" style={{ animationDuration: '8s' }} /> Verification in Process
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 pt-2">
                                    {activeTab === 'branding' ? 'Storefront Settings' : activeTab === 'bexi-ai' ? 'Bexi AI Assistant' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} is Locked
                                </h3>
                                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto font-normal">
                                    Your store account is currently undergoing verification by the Super Admin. As soon as verification is approved, all features for your <strong>{storePlan.toUpperCase()}</strong> plan will activate automatically without delay.
                                </p>
                            </div>

                            {/* Verification in Process Timer Card */}
                            <div className="rounded-2xl border border-amber-200 bg-white p-4 max-w-md mx-auto shadow-xs flex items-center justify-between gap-4">
                                <div className="text-left">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                                    <p className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-amber-500 animate-pulse" /> Review in Progress
                                    </p>
                                    {lastVerifiedCheckTime && (
                                        <p className="text-[10px] text-slate-400 mt-0.5">Last checked: {lastVerifiedCheckTime}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Est. Review Time</p>
                                    <p className="text-lg font-black font-mono text-slate-900">{formatTimer(verificationTimerSeconds)}</p>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={handleCheckVerification}
                                    disabled={checkingVerification}
                                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    <RefreshCw size={14} className={checkingVerification ? "animate-spin" : ""} />
                                    {checkingVerification ? 'Checking Status…' : 'Check Verification Status'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                                >
                                    Back to Overview
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-900">Store Theme & Accent Color</label>
                                            <p className="text-[11px] text-slate-500">Pick a professional niche preset or select custom brand hex:</p>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1">
                                            <span className="size-3.5 rounded-full" style={{ backgroundColor: themeColor }} />
                                            <span className="font-mono text-xs font-bold uppercase text-slate-800">{themeColor}</span>
                                        </div>
                                    </div>

                                    {/* Quick Preset Chips */}
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 pt-1">
                                        {THEME_OPTIONS.map((opt) => {
                                            const isSelected = themeColor.toLowerCase() === opt.color.toLowerCase();
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setThemeColor(opt.color);
                                                        if (resolvedStoreId) {
                                                            fetch('/api/stores/settings', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({
                                                                    store_id: resolvedStoreId,
                                                                    theme_color: opt.color,
                                                                    selected_theme: opt.id,
                                                                })
                                                            }).catch(console.warn);
                                                        }
                                                    }}
                                                    className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                                                        isSelected
                                                            ? 'border-slate-900 bg-white shadow-xs ring-2 ring-slate-900'
                                                            : 'border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                                >
                                                    <span className="size-4 shrink-0 rounded-full shadow-2xs" style={{ backgroundColor: opt.color }} />
                                                    <span className="truncate text-[11px] font-semibold text-slate-800">{opt.name.split(' ')[0]}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Custom Color Input */}
                                    <div className="flex items-center gap-3 pt-2">
                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                            <input 
                                                type="color" 
                                                value={themeColor} 
                                                onChange={e => {
                                                    const newColor = e.target.value;
                                                    setThemeColor(newColor);
                                                    if (resolvedStoreId && /^#[0-9a-f]{6}$/i.test(newColor)) {
                                                        fetch('/api/stores/settings', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                store_id: resolvedStoreId,
                                                                theme_color: newColor,
                                                            })
                                                        }).catch(console.warn);
                                                    }
                                                }} 
                                                className="size-8 rounded-lg border border-slate-300 cursor-pointer p-0.5" 
                                            />
                                            <span>Custom Color Picker</span>
                                        </label>
                                    </div>
                                </div>
                                <section className="space-y-3 rounded-xl border border-slate-200 p-4">
                                    <div><h4 className="text-xs font-semibold text-slate-900">Social profiles</h4><p className="mt-1 text-[10px] text-slate-500">Valid profile URLs are shown as linked icons in your public storefront footer.</p></div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {(['instagram', 'facebook', 'youtube', 'tiktok', 'x'] as const).map(platform => <label key={platform} className="block text-[10px] font-semibold capitalize text-slate-600">{platform === 'x' ? 'X / Twitter' : platform}<input type="url" value={socialLinks[platform]} onChange={event => setSocialLinks(current => ({ ...current, [platform]: event.target.value }))} placeholder={`https://${platform === 'x' ? 'x.com' : `${platform}.com`}/yourprofile`} maxLength={2048} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>)}
                                    </div>
                                </section>
                                <button type="submit" disabled={savingSettings || !isVerified} className="rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: themeColor }}>{savingSettings ? 'Saving…' : 'Save branding'}</button>
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
                                            ['sadapay_number', 'SadaPay number', '03XX XXXXXXX'],
                                            ['sadapay_title', 'SadaPay title', 'Title on SadaPay'],
                                            ['jazzcash_number', 'JazzCash number', '03XX XXXXXXX'],
                                            ['jazzcash_title', 'JazzCash title', 'Title on JazzCash'],
                                            ['easypaisa_number', 'EasyPaisa number', '03XX XXXXXXX'],
                                            ['easypaisa_title', 'EasyPaisa title', 'Title on EasyPaisa'],
                                        ] as const).map(([key, label, placeholder]) => <label key={key} className="block text-[10px] font-semibold text-slate-600">{label}<input type="text" value={(paymentDetails as any)[key] || ''} onChange={event => setPaymentDetails(current => ({ ...current, [key]: event.target.value }))} placeholder={placeholder} maxLength={120} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-normal text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>)}
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

                                <button type="submit" disabled={savingSettings || !isVerified} className="rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60" style={{ backgroundColor: themeColor }}>{savingSettings ? 'Saving…' : 'Save payment settings'}</button>
                            </form>
                        </div>
                    )}

                    {/* CATEGORIES */}
                    {activeTab === 'categories' && (
                        <div className="max-w-2xl space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Catalog organization</p>
                                    <h3 className="mt-1 text-base font-semibold text-slate-900">Product categories</h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {planDetails.categoryLimit === 0 
                                            ? 'Categories are locked on the Free Starter plan. Upgrade to Pro Merchant or Advance VIP to add and organize categories.'
                                            : planDetails.categoryLimit === null 
                                                ? 'Your Business plan has no category cap configured.' 
                                                : `${categories.length} of ${planDetails.categoryLimit} categories used on your ${planDetails.title} plan.`}
                                    </p>
                                </div>
                                {planDetails.categoryLimit === 0 && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 border border-amber-200">
                                        <Lock size={12} /> Locked on Free
                                    </span>
                                )}
                            </div>

                            {planDetails.categoryLimit === 0 ? (
                                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/70 to-orange-50/40 p-5 text-center">
                                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 mb-3 shadow-xs">
                                        <Lock size={22} />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900">Categories are a Pro & VIP Feature</h4>
                                    <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                                        On the Free Starter plan, all your products are displayed directly in your storefront collection. Upgrade to <strong className="text-slate-800">Pro Merchant</strong> to unlock up to 5 categories, or <strong className="text-slate-800">Advance VIP</strong> for unlimited categories.
                                    </p>
                                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab('subscription')}
                                            className="rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            Upgrade Plan to Unlock
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleAddCategory} className="flex gap-2">
                                    <input type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category name" required disabled={planDetails.categoryLimit !== null && categories.length >= planDetails.categoryLimit} className="min-w-0 flex-1 rounded-lg border border-slate-200 p-2.5 text-xs disabled:bg-slate-100" />
                                    <button type="submit" disabled={!isVerified || (planDetails.categoryLimit !== null && categories.length >= planDetails.categoryLimit)} className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: themeColor }}>Add category</button>
                                </form>
                            )}

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
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-[11px] font-semibold text-slate-700">Category</label>
                                            {planDetails.categoryLimit === 0 ? (
                                                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700">
                                                    <Lock size={10} /> Locked on Free (Pro/VIP feature)
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsAddingNewCategory(!isAddingNewCategory);
                                                        if (!isAddingNewCategory) {
                                                            setProdCategory('');
                                                        }
                                                    }}
                                                    className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 underline"
                                                >
                                                    {isAddingNewCategory ? '← Choose existing category' : '+ Type new category'}
                                                </button>
                                            )}
                                        </div>
                                        {planDetails.categoryLimit === 0 ? (
                                            <input
                                                type="text"
                                                disabled
                                                value="All Products (Categories locked on Free plan)"
                                                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-500 cursor-not-allowed"
                                            />
                                        ) : isAddingNewCategory ? (
                                            <div>
                                                <input
                                                    type="text"
                                                    value={newCategoryInput}
                                                    onChange={(e) => setNewCategoryInput(e.target.value)}
                                                    placeholder="Type new category name (e.g. Footwear, Perfumes)..."
                                                    className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                                />
                                            </div>
                                        ) : (
                                            <select
                                                value={prodCategory}
                                                onChange={(e) => {
                                                    if (e.target.value === '__add_new__') {
                                                        setIsAddingNewCategory(true);
                                                        setProdCategory('');
                                                    } else {
                                                        setProdCategory(e.target.value);
                                                    }
                                                }}
                                                className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                                            >
                                                <option value="">Select an existing category...</option>
                                                {categories.map((c) => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                                <option value="__add_new__">➕ Type / Add New Category...</option>
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                                            Product images (Multiple supported)
                                        </label>
                                        <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 transition-colors hover:border-emerald-400 hover:bg-emerald-50/50">
                                            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                                                <Upload size={16} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-xs font-medium text-slate-700">
                                                    {prodImageFiles.length === 0
                                                        ? 'Select product image(s)'
                                                        : `${prodImageFiles.length} ${prodImageFiles.length === 1 ? 'image' : 'images'} selected`}
                                                </span>
                                                <span className="mt-1 block text-[10px] text-slate-500">
                                                    PNG, JPG, WebP · Select multiple at once · 1st is cover
                                                </span>
                                            </span>
                                            <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors group-hover:border-emerald-300 group-hover:bg-emerald-50 group-hover:text-emerald-700">
                                                Browse
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/png,image/jpeg,image/webp,image/gif"
                                                onChange={handleProductFilesChange}
                                                className="sr-only"
                                            />
                                        </label>

                                        {/* Multi-image thumbnail list */}
                                        {prodImageFiles.length > 0 && (
                                            <div className="mt-2 space-y-1.5">
                                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                                    <span>Selected files ({prodImageFiles.length}):</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProdImageFiles([])}
                                                        className="text-red-500 hover:underline"
                                                    >
                                                        Clear all
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {prodImageFiles.map((file, idx) => (
                                                        <div
                                                            key={`${file.name}-${idx}`}
                                                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] shadow-2xs"
                                                        >
                                                            <span
                                                                className="size-1.5 rounded-full"
                                                                style={{ backgroundColor: idx === 0 ? themeColor : '#94a3b8' }}
                                                            />
                                                            <span className="max-w-[110px] truncate text-slate-700 font-medium">
                                                                {file.name}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveProductFile(idx)}
                                                                className="text-slate-400 hover:text-red-600 ml-0.5"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[11px] font-semibold text-slate-700">Description</label>
                                        <textarea value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 p-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                                    </div>



                                    <button type="submit" disabled={uploadingImage || !isVerified || (!editingProdId && planDetails.productLimit !== null && products.length >= planDetails.productLimit)} className="w-full rounded-lg px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50" style={{ backgroundColor: themeColor }}>
                                        {uploadingImage ? 'Uploading Images & Saving...' : editingProdId ? 'Update Product' : 'Publish Product'}
                                    </button>
                                    {editingProdId && <button type="button" onClick={() => { setEditingProdId(null); setProdName(''); setProdPrice(''); setProdDesc(''); setProdCategory(''); setProdImageFiles([]); }} className="w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">Cancel edit</button>}
                                    {!editingProdId && planDetails.productLimit !== null && products.length >= planDetails.productLimit && <p className="text-[10px] leading-4 text-amber-700">You reached your {planDetails.title} product limit. Upgrade your plan to add more.</p>}
                                </form>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="border-b border-slate-100 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {products.length > 0 && (
                                                <input
                                                    type="checkbox"
                                                    checked={products.length > 0 && selectedProductIds.length === products.length}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setSelectedProductIds(products.map(p => p.id));
                                                        } else {
                                                            setSelectedProductIds([]);
                                                        }
                                                    }}
                                                    title="Select all products"
                                                    aria-label="Select all products"
                                                    className="size-4 rounded accent-emerald-600 cursor-pointer"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900">Product inventory</h3>
                                                <p className="mt-0.5 text-[11px] text-slate-500">All {products.length} products in this store</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {selectedProductIds.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteSelectedProducts}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition shadow-xs animate-in fade-in"
                                                >
                                                    <Trash2 size={13} /> Delete Selected ({selectedProductIds.length})
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                disabled={!isVerified}
                                                onClick={() => { if (!isVerified) { setMessage('Verification is in progress.'); setMessageError(true); return; } setIsBulkAddOpen(true); }}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Plus size={13} /> Bulk Add
                                            </button>
                                            {products.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={handleDeleteAllAiProducts}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50/60 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition shadow-2xs"
                                                >
                                                    <Trash2 size={13} /> Clear All
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    {products.length === 0 ? (
                                        <div className="px-5 py-12 text-center text-xs text-slate-500 space-y-3">
                                            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Package size={24} />
                                            </div>
                                            <p className="font-semibold text-slate-800">Your store has no products yet.</p>
                                            <p className="text-slate-400 text-[11px] max-w-xs mx-auto">
                                                Use the form on the left to add your first product with multiple photos, title, price, and description.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-100">
                                            {products.map((product) => (
                                                <div key={product.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80 transition">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProductIds.includes(product.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedProductIds(prev => [...prev, product.id]);
                                                            } else {
                                                                setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                                            }
                                                        }}
                                                        aria-label={`Select ${product.name}`}
                                                        className="size-4 rounded accent-emerald-600 cursor-pointer shrink-0"
                                                    />
                                                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-slate-100 text-slate-400">
                                                        {product.image_url ? (
                                                            <Image src={product.image_url.split(',')[0].trim()} alt="" width={40} height={40} unoptimized className="size-full object-cover" />
                                                        ) : (
                                                            <Package size={16} />
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-xs font-semibold text-slate-800">{product.name}</p>
                                                        <p className="mt-1 truncate text-[10px] text-slate-500">
                                                            {categories.find((category) => category.id === product.category_id)?.name || 'Uncategorized'}
                                                        </p>
                                                    </div>
                                                    <span className="text-xs font-semibold text-slate-800">{formatPKR(product.price)}</span>
                                                    <button
                                                        aria-label={`Edit ${product.name}`}
                                                        onClick={() => {
                                                            setEditingProdId(product.id);
                                                            setProdName(product.name);
                                                            setProdPrice(String(product.price));
                                                            setProdDesc(product.description || '');
                                                            setProdCategory(product.category_id || '');
                                                            setProdImageFiles([]);
                                                        }}
                                                        className="grid size-8 place-items-center rounded-md text-slate-400 hover:bg-blue-50 hover:text-blue-700 transition"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        aria-label={`Delete ${product.name}`}
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="flex items-center gap-1 rounded-md px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                                                    >
                                                        <Trash2 size={14} />
                                                        <span className="text-[10px] font-semibold hidden sm:inline">Delete</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Add Products Modal */}
                    {isBulkAddOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
                                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Bulk Add Products</h3>
                                        <p className="text-xs text-slate-500">Add multiple products quickly. Format: Name, Price, Category (one per line)</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsBulkAddOpen(false)}
                                        className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <form onSubmit={handleBulkAdd} className="space-y-4">
                                    <textarea
                                        rows={6}
                                        value={bulkText}
                                        onChange={(e) => setBulkText(e.target.value)}
                                        placeholder={`Casual White Sneaker, 3500, Footwear\nOversized Cotton Hoodie, 2800, Clothing\nMinimal Leather Wallet, 1950, Accessories`}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-mono outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    />
                                    <p className="text-[10px] text-slate-400">
                                        Tip: Each line will be added as a separate product in your store catalog.
                                    </p>
                                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => setIsBulkAddOpen(false)}
                                            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={bulkLoading || !bulkText.trim()}
                                            className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 disabled:opacity-50"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            {bulkLoading ? 'Adding Products...' : 'Add All Products'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ORDERS MANAGEMENT */}
                    {activeTab === 'orders' && (
                        <div className="space-y-4">
                            {/* Summary Metrics */}
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Orders</p>
                                    <p className="mt-1 text-xl font-bold text-slate-900">{orders.length}</p>
                                </div>
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">Pending</p>
                                    <p className="mt-1 text-xl font-bold text-amber-800">{statusCounts.pending}</p>
                                </div>
                                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-700">Ready to Ship</p>
                                    <p className="mt-1 text-xl font-bold text-blue-800">{statusCounts.ready}</p>
                                </div>
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Delivered</p>
                                    <p className="mt-1 text-xl font-bold text-emerald-800">{statusCounts.delivered}</p>
                                </div>
                            </div>

                            {/* Status Filter Tabs */}
                            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                                {([
                                    { id: 'all', label: 'All Orders', count: statusCounts.all, color: 'slate' },
                                    { id: 'pending', label: 'Pending', count: statusCounts.pending, color: 'amber' },
                                    { id: 'ready', label: 'Ready to Dispatch', count: statusCounts.ready, color: 'blue' },
                                    { id: 'shipped', label: 'Shipped / In Transit', count: statusCounts.shipped, color: 'purple' },
                                    { id: 'delivered', label: 'Delivered', count: statusCounts.delivered, color: 'emerald' },
                                    { id: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled, color: 'rose' },
                                ] as const).map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setOrderFilter(tab.id)}
                                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                            orderFilter === tab.id
                                                ? 'bg-slate-900 text-white shadow-xs'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>{tab.label}</span>
                                        <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                                            orderFilter === tab.id
                                                ? 'bg-slate-700 text-slate-100'
                                                : 'bg-slate-100 text-slate-600'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Orders List */}
                            <div className="space-y-3">
                                {filteredOrders.length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
                                        <ShoppingBag size={32} className="mx-auto text-slate-300" />
                                        <p className="mt-3 text-sm font-semibold text-slate-700">No {orderFilter === 'all' ? '' : orderFilter} orders found</p>
                                        <p className="mt-1 text-xs text-slate-400">Customer orders placed through your storefront will show up here in real time.</p>
                                    </div>
                                ) : (
                                    filteredOrders.map(order => {
                                        const status = (order.status || 'pending').toLowerCase();
                                        const waNumber = (order.customer_phone || '').replace(/\D/g, '');
                                        const cleanWa = waNumber.startsWith('0') ? `92${waNumber.slice(1)}` : waNumber.length === 10 ? `92${waNumber}` : waNumber;
                                        const isExpanded = expandedOrderId === order.id;

                                        return (
                                            <div key={order.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300">
                                                {/* Header row */}
                                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <span className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700">
                                                            <ShoppingBag size={15} />
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-xs font-bold text-slate-900">#{order.id.slice(0, 8)}</span>
                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                                    status === 'ready'
                                                                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                                                        : status === 'shipped'
                                                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                        : status === 'delivered' || status === 'completed'
                                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                                        : status === 'cancelled' || status === 'canceled'
                                                                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                                }`}>
                                                                    {status === 'ready' && '📦 Ready to Dispatch'}
                                                                    {status === 'shipped' && '🚚 Shipped'}
                                                                    {(status === 'delivered' || status === 'completed') && '✅ Delivered'}
                                                                    {(status === 'cancelled' || status === 'canceled') && '✕ Cancelled'}
                                                                    {(status === 'pending' || status === 'processing') && '⏳ Pending'}
                                                                </span>
                                                            </div>
                                                            <p className="mt-0.5 text-[10px] text-slate-500">{formatDate(order.created_at)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right">
                                                            <p className="text-[10px] text-slate-500">Order Total</p>
                                                            <p className="text-sm font-bold text-slate-900" style={{ color: themeColor }}>{formatPKR(order.total_amount)}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                                                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100"
                                                        >
                                                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Customer and Order Body */}
                                                <div className="p-5">
                                                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                        {/* Customer Contact */}
                                                        <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
                                                            <p className="text-xs font-bold text-slate-900">{order.customer_name}</p>
                                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                                <span className="text-xs font-medium text-slate-700">{order.customer_phone}</span>
                                                                {cleanWa && (
                                                                    <a
                                                                        href={`https://wa.me/${cleanWa}?text=Hi%20${encodeURIComponent(order.customer_name)}%2C%20regarding%20your%20order%20%23${order.id.slice(0, 8)}%20at%20${encodeURIComponent(storeName)}%3A`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-500"
                                                                    >
                                                                        <MessageCircle size={11} /> WhatsApp Chat
                                                                    </a>
                                                                )}
                                                            </div>
                                                            {order.customer_email && (
                                                                <p className="flex items-center gap-1 text-[11px] text-slate-500">
                                                                    <Mail size={11} /> {order.customer_email}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Shipping & Delivery */}
                                                        <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery Address</p>
                                                            <p className="text-xs font-semibold text-slate-800">{order.shipping_address || order.delivery_address || 'Delivery Address Provided'}</p>
                                                            <p className="text-[11px] text-slate-500">
                                                                {order.city ? `City: ${order.city}` : ''} {order.postal_code || order.zip_code ? `· Postal: ${order.postal_code || order.zip_code}` : ''}
                                                            </p>
                                                        </div>

                                                        {/* Payment Method */}
                                                        <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment & Status</p>
                                                            <p className="text-xs font-semibold text-slate-800 capitalize">
                                                                {order.payment_method === 'advance' ? 'Advance Bank Transfer' : 'Cash on Delivery (COD)'}
                                                            </p>
                                                            <p className="text-[11px] text-slate-500">Total payable: {formatPKR(order.total_amount)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Ordered Items (if available or expandable) */}
                                                    {Array.isArray(order.items) && order.items.length > 0 && (
                                                        <div className="mt-4 border-t border-slate-100 pt-3">
                                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Ordered Items ({order.items.length})</p>
                                                            <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-slate-50/30">
                                                                {order.items.map((item: any, idx: number) => (
                                                                    <div key={idx} className="flex items-center justify-between p-2.5 text-xs">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="size-5 grid place-items-center rounded bg-slate-200 text-[10px] font-bold">{item.quantity || 1}x</span>
                                                                            <span className="font-medium text-slate-800">{item.name || item.product_name || `Product #${item.product_id?.slice(0, 6) || idx + 1}`}</span>
                                                                        </div>
                                                                        {item.price && (
                                                                            <span className="font-semibold text-slate-700">{formatPKR(item.price * (item.quantity || 1))}</span>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Status Action Controls */}
                                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-[11px] font-semibold text-slate-600">Quick Actions:</span>
                                                            {status === 'pending' && (
                                                                <button
                                                                    type="button"
                                                                    disabled={updatingOrderId === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'ready')}
                                                                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-500 disabled:opacity-50"
                                                                >
                                                                    <Package size={13} /> Mark as Ready to Dispatch
                                                                </button>
                                                            )}
                                                            {status === 'ready' && (
                                                                <button
                                                                    type="button"
                                                                    disabled={updatingOrderId === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                                                                    className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-purple-500 disabled:opacity-50"
                                                                >
                                                                    <Truck size={13} /> Mark as Shipped
                                                                </button>
                                                            )}
                                                            {(status === 'ready' || status === 'shipped') && (
                                                                <button
                                                                    type="button"
                                                                    disabled={updatingOrderId === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                                                    className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-500 disabled:opacity-50"
                                                                >
                                                                    <CheckCircle2 size={13} /> Mark as Delivered
                                                                </button>
                                                            )}
                                                            {status !== 'cancelled' && status !== 'delivered' && (
                                                                <button
                                                                    type="button"
                                                                    disabled={updatingOrderId === order.id}
                                                                    onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                                                                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                                                                >
                                                                    Cancel Order
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Status Dropdown */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] text-slate-400">Change Status:</span>
                                                            <select
                                                                value={status}
                                                                disabled={updatingOrderId === order.id}
                                                                onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 outline-none focus:border-blue-400"
                                                            >
                                                                <option value="pending">⏳ Pending</option>
                                                                <option value="ready">📦 Ready</option>
                                                                <option value="shipped">🚚 Shipped</option>
                                                                <option value="delivered">✅ Delivered</option>
                                                                <option value="cancelled">✕ Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* BEXI AI COMMAND CENTER (LAST TAB) */}
                    {activeTab === 'bexi-ai' && (
                        <div className="space-y-6">
                            {/* Header Banner */}
                            <div 
                                className="rounded-2xl p-6 text-white shadow-md relative overflow-hidden"
                                style={{
                                    background: `linear-gradient(135deg, ${themeColor} 0%, ${darkenColor(themeColor, 40)} 100%)`
                                }}
                            >
                                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                    <div>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-md">
                                            <Sparkles size={13} /> Bexi AI Command Center
                                        </span>
                                        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                                            AI Store Manager & Growth Strategist
                                        </h2>
                                        <p className="mt-1 text-xs text-white/90 max-w-xl leading-relaxed">
                                            Ask Bexi AI anything in Urdu or English — get marketing copy, analyze orders, optimize your catalog, or launch sales campaigns with 1 click.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsVoiceAssistantOpen(true)}
                                            className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/25 transition shadow-sm active:scale-95"
                                        >
                                            <Mic size={14} className="text-emerald-300 animate-pulse" />
                                            <span>Launch Voice AI</span>
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold backdrop-blur-md border border-white/20 text-white">
                                            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                                            Urdu & English Active
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Strategy Prompts */}
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {[
                                    {
                                        title: '📈 Analyze Store & Sales',
                                        desc: 'Review catalog performance and top opportunities',
                                        prompt: `Analyze ${storeName}'s current catalog with ${products.length} products and suggest the best pricing strategy to maximize sales with Cash on Delivery.`
                                    },
                                    {
                                        title: '💬 WhatsApp Marketing Copy',
                                        desc: 'Ready-to-send promotional message for customers',
                                        prompt: `Generate 3 high-converting WhatsApp promotional messages with emojis in Urdu/Roman Urdu for ${storeName} to announce a limited-time free delivery deal.`
                                    },
                                    {
                                        title: '🔥 High-Converting Instagram Ad',
                                        desc: 'Captivating caption with hashtags and call to action',
                                        prompt: `Write an engaging Instagram reel caption and ad copy for ${storeName} that creates urgency for our bestselling products.`
                                    },
                                    {
                                        title: '⚡ Boost Order Conversions',
                                        desc: 'Proven e-commerce tips for Pakistani buyers',
                                        prompt: `Give me 4 actionable recommendations to reduce return-to-origin (RTO) and increase customer trust for cash on delivery orders at ${storeName}.`
                                    }
                                ].map((card) => (
                                    <button
                                        key={card.title}
                                        type="button"
                                        onClick={() => handleSendBexiPrompt(card.prompt)}
                                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-xs transition hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-900">{card.title}</h4>
                                            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{card.desc}</p>
                                        </div>
                                        <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: themeColor }}>
                                            Ask Bexi AI →
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Interactive Chat Console */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[520px]">
                                {/* Console Header */}
                                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-slate-50/70">
                                    <div className="flex items-center gap-2.5">
                                        <span 
                                            className="grid size-8 place-items-center rounded-lg text-white font-bold"
                                            style={{ backgroundColor: themeColor }}
                                        >
                                            <Sparkles size={15} />
                                        </span>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-900">Bexi AI Copilot Session</h3>
                                            <p className="text-[10px] text-slate-400">Context: {storeName} · {products.length} products · {orders.length} orders</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setBexiChatHistory([{
                                            sender: 'ai',
                                            text: `Assalam-o-Alaikum! 👋 Main hoon **Bexi AI**, **${storeName}** ka dedicated AI store manager.\n\nAap mujh se Urdu ya English mein marketing campaigns, pricing, store growth, ya catalog optimization ke baray mein kuch bhi pooch saktay hain!`,
                                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        }])}
                                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800"
                                    >
                                        Clear chat
                                    </button>
                                </div>

                                {/* Chat Messages Log */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
                                    {bexiChatHistory.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex gap-3 ${msg.sender === 'merchant' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {msg.sender === 'ai' && (
                                                <span 
                                                    className="grid size-8 shrink-0 place-items-center rounded-xl text-white font-bold shadow-xs mt-0.5"
                                                    style={{ backgroundColor: themeColor }}
                                                >
                                                    <Sparkles size={14} />
                                                </span>
                                            )}
                                            <div
                                                className={`max-w-xl rounded-2xl p-4 text-xs shadow-xs leading-relaxed ${
                                                    msg.sender === 'merchant'
                                                        ? 'bg-slate-900 text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                                }`}
                                            >
                                                <div className="whitespace-pre-wrap">{msg.text}</div>
                                                <span className={`block mt-2 text-[9px] ${msg.sender === 'merchant' ? 'text-slate-400' : 'text-slate-400'} text-right`}>
                                                    {msg.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {isBexiThinking && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                            <span 
                                                className="grid size-7 place-items-center rounded-lg text-white animate-spin"
                                                style={{ backgroundColor: themeColor }}
                                            >
                                                <Sparkles size={12} />
                                            </span>
                                            <span>Bexi AI is analyzing and generating response...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Input Form */}
                                <form 
                                    onSubmit={handleBexiSubmit}
                                    className="border-t border-slate-200 bg-white p-3 flex items-center gap-2"
                                >
                                    <input
                                        type="text"
                                        value={bexiInputText}
                                        onChange={(e) => setBexiInputText(e.target.value)}
                                        placeholder="Ask Bexi AI in Urdu or English (e.g. 'Hamari store ki sales kaise barhayein?')..."
                                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!bexiInputText.trim() || isBexiThinking}
                                        className="grid size-10 place-items-center rounded-xl text-white shadow-xs transition hover:opacity-90 active:scale-95 disabled:opacity-40"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        <Send size={15} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                        </>
                    )}
                </div>
            </main>

            {/* Trial Expired Lock Screen Overlay Barrier */}
            {isTrialExpired && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-slate-100 space-y-4">
                        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-100 text-amber-600 shadow-md">
                            <Lock size={32} />
                        </span>
                        <div className="space-y-1.5">
                            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                                3-Day Free Trial Ended
                            </span>
                            <h3 className="text-xl font-extrabold text-slate-900">
                                Upgrade to Keep {storeName} Active
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                                Your free trial period has concluded. Activate a Pro or Business subscription to unlock all features, keep your live storefront accessible, and process orders.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 text-left space-y-2 text-xs">
                            <p className="font-bold text-slate-800">What unlocks immediately after payment:</p>
                            <ul className="space-y-1.5 text-[11px] text-slate-600">
                                <li className="flex items-center gap-2">✓ Instant reactivation of dashboard & live storefront</li>
                                <li className="flex items-center gap-2">✓ Direct 1-Click WhatsApp customer ordering unlocked</li>
                                <li className="flex items-center gap-2">✓ Full catalog access with higher product & category caps</li>
                                <li className="flex items-center gap-2">✓ Bexi AI Store Assistant & marketing automation</li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setUpgradeModalPlan('pro')}
                                className="flex-1 rounded-xl py-3 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
                                style={{ backgroundColor: themeColor }}
                            >
                                Activate Pro (PKR 3,500/mo)
                            </button>
                            <button
                                type="button"
                                onClick={() => setUpgradeModalPlan('business')}
                                className="flex-1 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white shadow-md transition hover:scale-105 active:scale-95"
                            >
                                Activate Business (PKR 7,500/mo)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Plan Upgrade & Payment Modal */}
            {upgradeModalPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                            <div>
                                <span 
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white"
                                    style={{ backgroundColor: upgradeModalPlan === 'business' ? '#0f172a' : themeColor }}
                                >
                                    <Sparkles size={11} /> Upgrade Plan
                                </span>
                                <h3 className="mt-1.5 text-lg sm:text-xl font-extrabold text-slate-900">
                                    {PLAN_DETAILS[upgradeModalPlan].title} Plan Subscription
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {upgradeModalPlan === 'basic' ? 'No payment required for Basic plan.' : `Billed monthly at ${PLAN_DETAILS[upgradeModalPlan].priceLabel}. Cancel or switch anytime.`}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setUpgradeModalPlan(null)}
                                className="grid size-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Plan Features Preview */}
                        <div 
                            className="rounded-2xl p-4 border space-y-2 text-xs"
                            style={{ backgroundColor: `${themeColor}0a`, borderColor: `${themeColor}24` }}
                        >
                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <CheckCircle2 size={15} style={{ color: themeColor }} />
                                Features unlocked on {PLAN_DETAILS[upgradeModalPlan].title}:
                            </p>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                                {PLAN_DETAILS[upgradeModalPlan].features.map((feat) => (
                                    <li key={feat} className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: themeColor }} />
                                        <span>{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Payment Options (Only for paid plans: Pro & Business) */}
                        {upgradeModalPlan !== 'basic' ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                                        Select Payment Method
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'jazzcash' as const, label: 'JazzCash' },
                                            { id: 'easypaisa' as const, label: 'EasyPaisa' },
                                            { id: 'sadapay' as const, label: 'SadaPay' },
                                        ].map((method) => {
                                            const isSelected = paymentMethod === method.id;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition ${
                                                        isSelected
                                                            ? 'border-blue-600 bg-blue-50/70 font-bold text-blue-700 shadow-xs ring-1 ring-blue-600'
                                                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                                    }`}
                                                >
                                                    <Wallet size={18} className={isSelected ? 'text-blue-600' : 'text-slate-500'} />
                                                    <span className="text-[10px] leading-tight">{method.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-blue-950 uppercase text-[10px] tracking-wider">Send PKR {PLAN_DETAILS[upgradeModalPlan].pricePKR} to platform account</span>
                                        <span className="font-mono font-bold text-blue-700 text-[11px]">{paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'SadaPay'}</span>
                                    </div>
                                    {subscriptionPaymentAccounts[paymentMethod].number ? (
                                        <>
                                            <p className="text-slate-800 font-semibold text-xs">{subscriptionPaymentAccounts[paymentMethod].title || (paymentMethod === 'jazzcash' ? 'JazzCash' : paymentMethod === 'easypaisa' ? 'EasyPaisa' : 'SadaPay')}</p>
                                            <p className="font-mono text-xs font-bold text-slate-900 bg-white/80 px-2 py-1 rounded border border-blue-100 inline-block">{subscriptionPaymentAccounts[paymentMethod].number}</p>
                                            <p className="text-[10px] text-slate-500 pt-0.5">Transfer the exact plan amount, then enter the TID below. Your paid features unlock after Super Admin approval.</p>
                                        </>
                                    ) : (
                                        <p role="alert" className="text-[10px] font-medium text-red-700">This payment account is not configured yet. Contact the Super Admin before sending payment.</p>
                                    )}
                                </div>

                                {/* Real-World Payment Verification Form */}
                                <div className="space-y-3 pt-1">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Sender Account Title</label>
                                            <input 
                                                type="text" 
                                                value={upgradeSenderName}
                                                onChange={(e) => setUpgradeSenderName(e.target.value)}
                                                placeholder="Your Name on Account"
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Sender Mobile / Account #</label>
                                            <input 
                                                type="text" 
                                                value={upgradeSenderNumber}
                                                onChange={(e) => setUpgradeSenderNumber(e.target.value)}
                                                placeholder="03XX XXXXXXX"
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Transaction ID (TID / Ref #) *</label>
                                            <input 
                                                type="text" 
                                                value={upgradeTrxId}
                                                onChange={(e) => setUpgradeTrxId(e.target.value)}
                                                required
                                                placeholder="e.g. 1092837465"
                                                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 outline-none focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-600 uppercase">Payment Screenshot Proof (optional)</label>
                                            <input 
                                                type="file" 
                                                accept="image/jpeg,image/png,image/webp,image/gif"
                                                onChange={(e) => {
                                                    const nextFile = e.target.files?.[0] || null;
                                                    if (nextFile && !['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(nextFile.type)) {
                                                        setUpgradeReceiptFile(null);
                                                        e.target.value = '';
                                                        alert('Choose a JPEG, PNG, WebP, or GIF payment screenshot.');
                                                        return;
                                                    }
                                                    if (nextFile && nextFile.size > 5 * 1024 * 1024) {
                                                        setUpgradeReceiptFile(null);
                                                        e.target.value = '';
                                                        alert('Payment screenshot must be 5 MB or smaller.');
                                                        return;
                                                    }
                                                    setUpgradeReceiptFile(nextFile);
                                                }}
                                                className="mt-1 w-full text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-slate-50 p-4 text-center text-xs text-slate-600 border border-slate-200">
                                Switching to the Basic plan is free of charge. Your product limit will be 20 items.
                            </div>
                        )}

                        {/* Total Due & Activation Button */}
                        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-left w-full sm:w-auto">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                                <span className="text-base sm:text-lg font-black text-slate-900">
                                    {PLAN_DETAILS[upgradeModalPlan].priceLabel}
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => setUpgradeModalPlan(null)}
                                    className="flex-1 sm:flex-none rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    disabled={isUpgrading}
                                    onClick={() => handleActivatePlan(upgradeModalPlan)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-95 active:scale-95 disabled:opacity-50"
                                    style={{
                                        backgroundColor: upgradeModalPlan === 'business' ? '#0f172a' : themeColor,
                                    }}
                                >
                                    {isUpgrading ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" />
                                            Activating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles size={14} />
                                            {upgradeModalPlan === 'basic' ? 'Switch to Basic' : `Submit Payment Proof for Approval`}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Voice-Controlled Store Management Assistant (Bilingual: English & Urdu) */}
            {(storePlan === 'pro' || storePlan === 'business') && (
                <VoiceStoreAssistant 
                    storeId={resolvedStoreId}
                    storeSlug={storeSlug}
                    isOpenControlled={isVoiceAssistantOpen}
                    onCloseControlled={() => setIsVoiceAssistantOpen(false)}
                    hideFloatingTrigger={true}
                    onActionExecuted={() => {
                        if (resolvedStoreId) {
                            fetchMeshData(resolvedStoreId);
                        }
                    }}
                />
            )}
        </div>
    );
}