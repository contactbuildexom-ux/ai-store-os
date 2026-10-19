'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Store, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Lock, 
  Mail, 
  Palette, 
  Zap, 
  Crown, 
  HelpCircle,
  Loader2,
  Package,
} from 'lucide-react';
import { StoreQRCode } from '@/components/store-qr-code';
import EmailVerifyField from '@/components/auth/EmailVerifyField';

// NEXT_PUBLIC_REQUIRE_EMAIL_OTP=true hone par hi email verification zaroori hogi
const OTP_REQUIRED = process.env.NEXT_PUBLIC_REQUIRE_EMAIL_OTP === 'true';

type GeneratedPreview = {
  store_name: string;
  theme_color: string;
  banner_text: string;
  categories: string[];
  products: Array<{ name: string; price: number; description: string; category_name: string }>;
};

type GeneratedStoreResponse = {
  slug: string;
  storefrontUrl: string;
  // Public address of the store. Subdomain URL (https://shoe-store.domain.com) when
  // NEXT_PUBLIC_ROOT_DOMAIN is configured, otherwise the same /store/<slug> path.
  storeUrl: string;
  dashboardUrl: string;
  storeName: string;
  preview: GeneratedPreview;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseGeneratedStoreResponse(value: unknown): GeneratedStoreResponse | null {
  if (!isRecord(value) || value.success !== true || typeof value.slug !== 'string' || !isRecord(value.store)) return null;
  const previewValue = value.preview;
  if (
    !isRecord(previewValue) ||
    typeof previewValue.store_name !== 'string' ||
    typeof previewValue.theme_color !== 'string' ||
    typeof previewValue.banner_text !== 'string' ||
    !Array.isArray(previewValue.categories) ||
    !previewValue.categories.every((category) => typeof category === 'string') ||
    !Array.isArray(previewValue.products) ||
    !/^#[0-9a-f]{6}$/i.test(previewValue.theme_color)
  ) {
    return null;
  }
  const products = previewValue.products.flatMap((product) => {
    if (
      !isRecord(product) ||
      typeof product.name !== 'string' ||
      typeof product.price !== 'number' ||
      !Number.isFinite(product.price) ||
      typeof product.description !== 'string' ||
      typeof product.category_name !== 'string'
    ) {
      return [];
    }
    return [{
      name: product.name,
      price: product.price,
      description: product.description,
      category_name: product.category_name,
    }];
  });
  if (!products.length || products.length !== previewValue.products.length) return null;
  const storefrontUrl = typeof value.storefront_url === 'string' ? value.storefront_url : `/store/${encodeURIComponent(value.slug)}`;
  return {
    slug: value.slug,
    storefrontUrl,
    storeUrl: typeof value.store_url === 'string' ? value.store_url : storefrontUrl,
    dashboardUrl: typeof value.dashboard_url === 'string' ? value.dashboard_url : `/merchant/${encodeURIComponent(value.slug)}/dashboard`,
    storeName: typeof value.store.name === 'string' ? value.store.name : previewValue.store_name,
    preview: {
      store_name: previewValue.store_name,
      theme_color: previewValue.theme_color,
      banner_text: previewValue.banner_text,
      categories: previewValue.categories,
      products,
    },
  };
}

interface MerchantStoreSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialPlan?: 'basic' | 'pro' | 'advanced';
}

const THEME_OPTIONS = [
  { id: 'ocean-blue', name: 'Ocean Navy & Electric Blue', color: '#1976d2', desc: 'App-style modern tech & retail' },
  { id: 'emerald', name: 'Emerald Minimal', color: '#1d7555', desc: 'Fresh & organic' },
  { id: 'royal-gold', name: 'Royal Gold & Dark', color: '#0f172a', desc: 'Luxury & prestigious' },
  { id: 'velvet-rose', name: 'Velvet Rose & Blush', color: '#831843', desc: 'Beauty & apparel' },
  { id: 'sunset-amber', name: 'Sunset Amber', color: '#ea580c', desc: 'Warm lifestyle & dining' },
  { id: 'aurora-violet', name: 'Aurora Violet', color: '#7c3aed', desc: 'Creative & boutique' },
  { id: 'mint-fresh', name: 'Mint Fresh', color: '#059669', desc: 'Wellness & healthcare' },
  { id: 'cyber-slate', name: 'Cyber Slate', color: '#1e1b4b', desc: 'Modern electronics' },
  { id: 'artisan-cream', name: 'Artisan Terracotta', color: '#78350f', desc: 'Handcrafted goods' },
  { id: 'midnight-minimal', name: 'Midnight Onyx', color: '#09090b', desc: 'Ultra-minimal aesthetic' },
];

export const STORE_IDEA_PRESETS = [
  {
    category: 'Trending Business Niches',
    options: [
      {
        id: 'shoes',
        name: '👟 Athletic Running Shoes & Streetwear Sneakers',
        sampleName: 'Aura Kicks Atelier',
        theme: 'ocean-blue',
        prompt: 'A modern performance footwear brand featuring cushioned running sneakers, streetwear lifestyle kicks, and everyday comfortable trainers with nationwide delivery and Cash on Delivery.'
      },
      {
        id: 'perfume',
        name: '🌸 Luxury Perfumes, Ouds & Artisanal Attars',
        sampleName: 'Velvet Oud Fragrances',
        theme: 'royal-gold',
        prompt: 'A luxury fragrance atelier offering artisanal concentrated oud oils, French long-lasting EDP perfumes, and curated gift boxes for weddings and celebrations.'
      },
      {
        id: 'women-fashion',
        name: '👗 Women\'s Designer Pret, Lawn & Festive Suits',
        sampleName: 'Zahra Festive Pret',
        theme: 'velvet-rose',
        prompt: 'A contemporary designer clothing boutique specializing in ready-to-wear printed lawn, luxury chiffon festive 3-piece suits, and embroidered organza dupattas.'
      },
      {
        id: 'men-fashion',
        name: '🤵 Men\'s Bespoke Couture, Kurtas & Formal Wear',
        sampleName: 'Apex Heritage Menswear',
        theme: 'midnight-minimal',
        prompt: 'A premium menswear brand offering tailored cotton kurtas, bespoke waistcoats, formal shirts, and luxury accessories with cash on delivery nationwide.'
      },
      {
        id: 'wedding',
        name: '👰 Bridal Boutique, Wedding Favors & Keepsakes',
        sampleName: 'Royal Shadi Boutique',
        theme: 'royal-gold',
        prompt: 'An exquisite wedding boutique featuring handcrafted bridal clutches, laser-cut gold wedding favor boxes, kundan jewelry sets, and festive party accessories.'
      },
      {
        id: 'skincare',
        name: '🧴 Botanical Skincare, Glow Serums & Clean Beauty',
        sampleName: 'Glow Botanica Organics',
        theme: 'mint-fresh',
        prompt: 'A clean skincare brand featuring hyaluronic acid glow serums, barrier repair ceramide creams, gentle green tea cleansers, and broad-spectrum mineral sunscreens.'
      },
      {
        id: 'jewelry',
        name: '💍 18K Gold Plated Jewelry, Rings & Pendants',
        sampleName: 'Celestia Jewels',
        theme: 'royal-gold',
        prompt: 'Handcrafted luxury jewelry brand providing anti-tarnish 18K gold-plated coin necklaces, zirconia solitaire rings, baroque pearl chokers, and bridal earrings.'
      },
      {
        id: 'tech',
        name: '📱 Smart Wearables, ANC Audio & Electronics',
        sampleName: 'Pulse Wave Electronics',
        theme: 'ocean-blue',
        prompt: 'A cutting-edge tech store featuring active noise-cancelling wireless headphones, AMOLED smartwatches, magnetic wireless charging stations, and ergonomic desk accessories.'
      },
      {
        id: 'coffee',
        name: '☕ Artisan Coffee Roasters, Single-Origin Beans',
        sampleName: 'Artisan Roast & Co.',
        theme: 'sunset-amber',
        prompt: 'A specialty coffee roastery featuring single-origin Ethiopian and Colombian beans, dark roast espresso blends, cold brew kits, and precision hand grinders.'
      },
      {
        id: 'bakery',
        name: '🥐 Gourmet Patisserie, Artisan Cakes & Truffles',
        sampleName: 'Sweet Praline Confections',
        theme: 'sunset-amber',
        prompt: 'An artisan bakery offering fresh sourdough, custom buttercream celebration cakes, Belgian chocolate truffles, and delicate French macarons.'
      },
      {
        id: 'fitness',
        name: '🏋️ Activewear, Gym Apparel & Training Gear',
        sampleName: 'Velocity Athletic Gear',
        theme: 'ocean-blue',
        prompt: 'A high-performance activewear store offering moisture-wicking gym tees, seamless compression leggings, water-resistant duffel bags, and fitness accessories.'
      },
      {
        id: 'home',
        name: '🛋️ Modern Interior Decor & Scented Soy Candles',
        sampleName: 'Luxe Living Interiors',
        theme: 'artisan-cream',
        prompt: 'A modern interior boutique featuring artisanal scented soy wax candles, ceramic vases, linen cushion covers, and aesthetic room decor accents.'
      },
      {
        id: 'leather',
        name: '🎒 Handcrafted Leather Bags, Wallets & Belts',
        sampleName: 'Heritage Leather Co.',
        theme: 'midnight-minimal',
        prompt: 'A genuine handcrafted leather goods boutique specializing in vintage laptop messenger bags, full-grain leather bi-fold wallets, and brass-buckle belts.'
      },
      {
        id: 'organic',
        name: '🌿 Pure Sidr Honey, Organic Dry Fruits & Herbs',
        sampleName: 'Natura Harvest Superfoods',
        theme: 'mint-fresh',
        prompt: 'An authentic organic wellness store offering raw wild Sidr honey, premium roasted dry fruits, organic green teas, and cold-pressed pure oils.'
      }
    ]
  }
];

/* Shared light-theme classes */
const INPUT =
  'w-full rounded-xl border border-[#bfdcff] bg-[#f3f8ff] px-3.5 py-2.5 text-sm text-[#0b2545] placeholder:text-[#7c93b3] transition focus:border-[#1976d2] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1976d2]/20';
const LABEL =
  'flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0b2545]';

export default function MerchantStoreSetupModal({
  isOpen,
  onClose,
  initialPrompt = '',
  initialPlan = 'pro',
}: MerchantStoreSetupModalProps) {
  const router = useRouter();

  // Form states
  const [selectedIdeaId, setSelectedIdeaId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [prompt, setPrompt] = useState(initialPrompt);
  const [plan, setPlan] = useState<'basic' | 'pro' | 'advanced'>(initialPlan);
  const [selectedTheme, setSelectedTheme] = useState('royal-gold');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState('');

  const handleSelectIdea = (id: string) => {
    setSelectedIdeaId(id);
    if (!id) return;
    for (const group of STORE_IDEA_PRESETS) {
      const found = group.options.find(o => o.id === id);
      if (found) {
        if (!storeName || STORE_IDEA_PRESETS.some(g => g.options.some(opt => opt.sampleName === storeName))) {
          setStoreName(found.sampleName);
        }
        setSelectedTheme(found.theme);
        setPrompt(found.prompt);
        break;
      }
    }
  };

  // Social media links (All plans get footer social icons)
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTktok] = useState('');
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepText, setStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState<GeneratedStoreResponse | null>(null);

  useEffect(() => {
    if (initialPrompt && !prompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!prompt.trim() || prompt.trim().length < 8) {
      setErrorMessage('Please provide a store description or prompt with at least 8 characters.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid merchant email address for store administration.');
      return;
    }

    if (OTP_REQUIRED && !verificationToken) {
      setErrorMessage('Please verify your email address with the code we send you.');
      return;
    }

    if ((plan === 'pro' || plan === 'advanced') && !whatsappNumber.trim()) {
      setErrorMessage('Pro & Advance plans require a dedicated WhatsApp number for automated order routing.');
      return;
    }

    setIsSubmitting(true);
    setStepText('1/4 Analyzing store concept & business niche...');

    const timer1 = setTimeout(() => setStepText('2/4 Curating catalog, products & pricing structure...'), 800);
    const timer2 = setTimeout(() => setStepText('3/4 Configuring brand theme, footer social channels & layout...'), 1600);
    const timer3 = setTimeout(() => setStepText('4/4 Linking automated WhatsApp checkout mechanism...'), 2400);

    try {
      const socialLinks: Record<string, string> = {};
      if (instagram.trim()) socialLinks.instagram = instagram.trim();
      if (facebook.trim()) socialLinks.facebook = facebook.trim();
      if (tiktok.trim()) socialLinks.tiktok = tiktok.trim();
      if (youtube.trim()) socialLinks.youtube = youtube.trim();
      if (twitter.trim()) socialLinks.x = twitter.trim();

      const selectedThemeObj = THEME_OPTIONS.find((t) => t.id === selectedTheme);
      const themeColor = selectedThemeObj?.color || '#1976d2';

      const response = await fetch('/api/ai/generate-store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration: 'merchant',
          store_name: storeName.trim() || undefined,
          name: storeName.trim() || undefined,
          prompt: prompt.trim(),
          plan,
          theme: selectedTheme,
          theme_color: themeColor,
          selected_theme: selectedTheme,
          whatsapp_number: whatsappNumber.trim() || undefined,
          owner_email: email.trim().toLowerCase(),
          password,
          owner_phone: contactPhone.trim() || undefined,
          verification_token: verificationToken || undefined,
          social_links: socialLinks,
        }),
      });

      let result: unknown;
      try {
        result = await response.json();
      } catch {
        throw new Error('The store generator returned an invalid response. Please try again.');
      }
      if (!response.ok) {
        throw new Error(isRecord(result) && typeof result.error === 'string' ? result.error : 'Failed to generate store. Please try again.');
      }
      const generatedStore = parseGeneratedStoreResponse(result);
      if (!generatedStore) throw new Error('The store generator returned incomplete preview data. Please try again.');
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setSuccessData(generatedStore);
      setIsSubmitting(false);

    } catch (err: unknown) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while creating your store.');
      setIsSubmitting(false);
    }
  };

  const isAbsoluteUrl = (url: string) => /^https?:\/\//i.test(url);

  // Opens the store on its own subdomain (full page load). If no root domain is
  // configured, store_url is just /store/<slug>, so the normal router is used.
  const openStorefront = () => {
    if (!successData) return;
    const target = successData.storeUrl;
    onClose();
    if (isAbsoluteUrl(target)) {
      window.location.assign(target);
    } else {
      router.push(target);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-[#0b2545]/60 p-3 backdrop-blur-sm sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="relative my-auto flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[#cfe2fa] bg-white text-[#0b2545] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-br from-[#0b2545] to-[#1976d2] px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/15 text-white">
              <Store size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">
                Set up your online store
              </h2>
              <p className="text-xs text-blue-100/90">
                Tell us about your business and we will build it for you
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="grid size-9 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {successData ? (
            <div className="space-y-5 py-4 text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-[#0b2545]">Store Successfully Created!</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#2c4a73]">
                  <span className="font-semibold text-emerald-600">{successData.storeName}</span> is live with automated WhatsApp checkout and integrated social media footer.
                </p>
                {isAbsoluteUrl(successData.storeUrl) && (
                  <p className="mx-auto mt-2 max-w-md break-all text-xs font-semibold text-[#1976d2]">
                    {successData.storeUrl.replace(/^https?:\/\//i, '')}
                  </p>
                )}
                {plan !== 'basic' && (
                  <p className="mx-auto mt-3 max-w-md rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    Your {plan === 'advanced' ? 'Advanced' : 'Pro'} plan selection is pending payment approval; the store starts with Basic limits until it is approved.
                  </p>
                )}
              </div>

              <section className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-[#cfe2fa] bg-[#f3f8ff] text-left">
                <div className="px-5 py-5 text-white" style={{ backgroundColor: successData.preview.theme_color }}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">Store preview</p>
                  <h4 className="mt-2 text-xl font-bold">{successData.preview.store_name}</h4>
                  <p className="mt-1 text-xs text-white/85">{successData.preview.banner_text}</p>
                </div>
                <div className="space-y-4 p-4">
                  <div className="flex flex-wrap gap-2">
                    {successData.preview.categories.map((category) => (
                      <span key={category} className="rounded-full border border-[#bfdcff] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#1976d2]">{category}</span>
                    ))}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {successData.preview.products.slice(0, 6).map((product) => (
                      <article key={`${product.category_name}-${product.name}`} className="rounded-xl border border-[#cfe2fa] bg-white p-3">
                        <div className="flex items-start gap-2">
                          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#e6f4ff] text-[#1976d2]"><Package size={15} /></span>
                          <div className="min-w-0 flex-1">
                            <h5 className="truncate text-xs font-semibold text-[#0b2545]">{product.name}</h5>
                            <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#5b7aa3]">{product.description}</p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className="truncate text-[10px] text-[#5b7aa3]">{product.category_name}</span>
                          <span className="shrink-0 text-xs font-bold text-emerald-600">
                            {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(product.price)}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              {/* Generated Store QR Code with 'B' in Center (Matching Screenshot) */}
              <div className="mx-auto max-w-sm pt-2">
                <StoreQRCode
                  storeSlug={successData.slug}
                  storePath={successData.storeUrl}
                  title="Your store QR"
                  badge="Live Store"
                />
              </div>

              <div className="mx-auto grid max-w-md gap-3 pt-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={openStorefront}
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-emerald-600/25 transition hover:bg-emerald-500"
                >
                  <Store size={16} /> View Live Storefront
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(successData.dashboardUrl);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#1976d2] px-5 py-3.5 text-xs font-bold text-white shadow-md shadow-blue-500/25 transition hover:bg-[#1565c0]"
                >
                  Merchant Dashboard <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                  <span className="font-bold">Error:</span> {errorMessage}
                </div>
              )}

              {/* 1. Store Vision & Name */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={LABEL}>
                    <Store size={14} className="text-[#1976d2]" /> Store Concept & Prompt
                  </label>
                  <span className="text-[11px] font-semibold text-[#5b7aa3]">Required</span>
                </div>

                {/* Curated Global Business Ideas Dropdown */}
                <div className="rounded-xl border border-[#cfe2fa] bg-[#f3f8ff] p-3">
                  <label className="mb-1.5 block text-xs font-semibold text-[#0b2545]">
                    Explore Trending Global Business Ideas (Auto-populates concept & theme):
                  </label>
                  <select
                    value={selectedIdeaId}
                    onChange={(e) => handleSelectIdea(e.target.value)}
                    className={`${INPUT} font-medium`}
                  >
                    <option value="">✨ Select a Curated Store Idea / Niche (or write your own)</option>
                    {STORE_IDEA_PRESETS.map((grp) => (
                      <optgroup key={grp.category} label={grp.category}>
                        {grp.options.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Store Name (e.g. Noor Velvet Couture)"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className={INPUT}
                    />
                  </div>
                  <div>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value)}
                      className={INPUT}
                    >
                      {THEME_OPTIONS.map((t) => (
                        <option key={t.id} value={t.id}>
                          Theme: {t.name} ({t.desc})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="Describe your brand's unique style, target audience, signature products, and pricing (e.g. 'A premium organic lifestyle brand offering cold-pressed herbal oils, wild honey, and natural detox teas with nationwide cash on delivery...')..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  className={`${INPUT} resize-none`}
                />
              </div>

              {/* 2. Plan Selection */}
              <div className="space-y-2.5">
                <label className={LABEL}>
                  <Zap size={14} className="text-[#1976d2]" /> Choose Subscription Plan
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {[
                    { id: 'basic', name: 'Free Starter', desc: 'Up to 20 Products', icon: Store },
                    { id: 'pro', name: 'Pro Merchant', desc: 'WhatsApp Orders & 75 Prods', icon: MessageCircle },
                    { id: 'advanced', name: 'Advance VIP', desc: 'Full AI & Priority', icon: Crown },
                  ].map((p) => {
                    const isSelected = plan === p.id;
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlan(p.id as any)}
                        className={`relative rounded-2xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-[#1976d2] bg-[#e6f4ff] ring-2 ring-[#1976d2]/25'
                            : 'border-[#cfe2fa] bg-white hover:border-[#1976d2]/60 hover:bg-[#f3f8ff]'
                        }`}
                      >
                        <div className="mb-1.5 flex items-center justify-between">
                          <Icon size={16} className={isSelected ? 'text-[#1976d2]' : 'text-[#5b7aa3]'} />
                          {isSelected && <CheckCircle2 size={14} className="text-[#1976d2]" />}
                        </div>
                        <p className="text-xs font-bold text-[#0b2545]">{p.name}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-[#5b7aa3]">{p.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. WhatsApp Integration (Auto-Linked for Pro & Advance) */}
              <div className="space-y-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <MessageCircle size={15} className="text-emerald-600" /> Dedicated WhatsApp Number
                  </label>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    plan !== 'basic' ? 'border border-emerald-300 bg-white text-emerald-700' : 'text-[#5b7aa3]'
                  }`}>
                    {plan !== 'basic' ? 'Direct Order Routing' : 'Optional'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#2c4a73]">
                  When customers checkout on your storefront, their complete order details (Customer Name, Email, Phone, Address, Zip & Items) will be dispatched directly to this WhatsApp number.
                </p>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="e.g. 923001234567 or +92 300 1234567"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    required={plan !== 'basic'}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-[#0b2545] placeholder:text-[#7c93b3] transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* 4. Social Media Links (All Plans Footer) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className={LABEL}>
                    <Share2 size={14} className="text-[#1976d2]" /> Footer Social Media Links
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-600">Included in All Plans</span>
                </div>
                <p className="text-[11px] text-[#5b7aa3]">
                  Every store footer will automatically render your official clickable social media icons.
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <input
                    type="url"
                    placeholder="Instagram URL (https://instagram.com/...)"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="Facebook URL (https://facebook.com/...)"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="TikTok URL (https://tiktok.com/@...)"
                    value={tiktok}
                    onChange={(e) => setTktok(e.target.value)}
                    className={INPUT}
                  />
                  <input
                    type="url"
                    placeholder="YouTube or X URL (https://...)"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className={INPUT}
                  />
                </div>
              </div>

              {/* 5. Merchant Login Details */}
              <div className="space-y-2.5 border-t border-[#cfe2fa] pt-4">
                <label className={LABEL}>
                  <Lock size={14} className="text-[#1976d2]" /> Merchant Account Credentials
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="email"
                    placeholder="Merchant Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={INPUT}
                  />
                  <input
                    type="password"
                    placeholder="Password (minimum 8 characters) *"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    maxLength={128}
                    className={INPUT}
                  />
                </div>
                {OTP_REQUIRED && (
                  <>
                    <input
                      type="tel"
                      placeholder="Contact number (e.g. 923001234567) *"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      className={INPUT}
                    />
                    <EmailVerifyField
                      email={email}
                      phone={contactPhone}
                      onVerified={setVerificationToken}
                    />
                  </>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0b2545] to-[#1976d2] py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{stepText || 'Building your store...'}</span>
                    </>
                  ) : (
                    <>
                      <Store size={17} />
                      <span>Create My Online Store</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-center text-[10px] text-[#5b7aa3]">
                  Instant catalog generation · Dedicated WhatsApp order routing · Ready to accept customer orders
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}