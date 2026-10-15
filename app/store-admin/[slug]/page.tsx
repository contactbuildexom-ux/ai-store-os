import { storeRepo } from '@/lib/store-repository';
import StoreAdminClient from './store-admin-client';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreAdminPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await storeRepo.getStore(slug);

  if (!store) {
    notFound();
  }

  const products = await storeRepo.getProducts(store.id || store.slug);

  return (
    <StoreAdminClient
      store={store}
      initialProducts={products}
    />
  );
}
