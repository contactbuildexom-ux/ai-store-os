import { storeRepo } from '@/lib/store-repository';
import StoreAdminClient from './store-admin-client';
import { notFound, redirect } from 'next/navigation';
import { hasApprovedSubscriptionPayment } from '@/lib/subscription-plans';
import { canAccessStore } from '@/lib/merchant-api-auth';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function StoreAdminPage({ params }: PageProps) {
  const { slug } = await params;
  const store = await storeRepo.getStore(slug);

  if (!store) {
    notFound();
  }
  if (!(await canAccessStore(store.id))) redirect('/store-admin/login');

  const plan = String(store.plan || 'basic').toLowerCase();
  const entitledStore = ['free', 'basic'].includes(plan) || hasApprovedSubscriptionPayment(store.payment_status)
    ? store
    : { ...store, plan: 'basic' as const };

  const products = await storeRepo.getProducts(entitledStore.id || entitledStore.slug);

  return (
    <StoreAdminClient
      store={entitledStore}
      initialProducts={products}
    />
  );
}
