import { storeRepo } from '@/lib/store-repository';
import StoreLayout from '@/components/StoreLayout';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StorePage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch store details (by slug or id)
  const store = await storeRepo.getStore(id);

  if (!store) {
    notFound();
  }

  // 2. Fetch products for this store
  const products = await storeRepo.getProducts(store.id || store.slug);

  return (
    <StoreLayout 
      storeId={store.id}
      storeSlug={store.slug}
      storeName={store.name}
      tagline={store.tagline || 'Welcome to our exclusive online collection.'}
      description={store.description}
      whatsappNumber={store.whatsapp_number}
      plan={store.plan}
      theme={store.theme || {
        id: store.selected_theme,
        name: 'Custom Theme',
        primaryColor: store.primary_color || '#1d7555',
        secondaryColor: store.secondary_color || '#0f172a',
        accentColor: '#10b981',
        textColor: '#1e293b',
        bgHero: 'bg-gradient-to-br from-[#0f172a] to-[#1e293b]',
        cardBg: 'bg-white',
        badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200'
      }}
      products={products}
      socialLinks={store.social_links}
    />
  );
}