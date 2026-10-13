import { createClient } from '@/lib/supabase/client';

export async function uploadStoreImage(file: File, storeId: string): Promise<string> {
  const formData = new FormData();
  formData.set('file', file);
  formData.set('store_id', storeId);

  const { data: { session } } = await createClient().auth.getSession();
  const response = await fetch('/api/stores/product-image', {
    method: 'POST',
    headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : undefined,
    body: formData,
  });
  const result = await response.json();

  if (!response.ok || typeof result.image_url !== 'string') {
    throw new Error(result.error || 'Unable to upload image.');
  }

  return result.image_url;
}

export async function uploadProductImage(file: File, storeId: string): Promise<string> {
  return uploadStoreImage(file, storeId);
}