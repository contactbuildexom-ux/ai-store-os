import type { SupabaseClient } from '@supabase/supabase-js';

export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Checks if a string is formatted as a valid UUID.
 */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value.trim());
}

/**
 * Safely fetches a store row by ID (UUID) or Slug.
 * Prevents PostgreSQL 22P02 "invalid input syntax for type uuid" error
 * which happens when querying UUID columns with non-UUID slug strings.
 */
export async function fetchStoreByIdOrSlug<T = any>(
  supabase: SupabaseClient,
  idOrSlug: string,
  columns: string = '*'
): Promise<{ data: T | null; error: any }> {
  if (!idOrSlug || typeof idOrSlug !== 'string') {
    return { data: null, error: null };
  }
  const clean = idOrSlug.trim();

  if (isUuid(clean)) {
    // 1. Try finding by UUID id
    const byId = await supabase.from('stores').select(columns).eq('id', clean).maybeSingle();
    if (byId.data) {
      return byId as { data: T | null; error: any };
    }
    // 2. Fallback: check if slug happens to match this UUID string
    const bySlug = await supabase.from('stores').select(columns).eq('slug', clean).maybeSingle();
    return bySlug as { data: T | null; error: any };
  }

  // 3. Not a UUID (e.g. "velvet-aura") - query ONLY the slug column
  const bySlug = await supabase.from('stores').select(columns).eq('slug', clean).maybeSingle();
  return bySlug as { data: T | null; error: any };
}

/**
 * Safely updates a store row by ID (UUID) or Slug.
 */
export async function updateStoreByIdOrSlug(
  supabase: SupabaseClient,
  idOrSlug: string,
  updates: Record<string, any>
): Promise<{ data: any; error: any }> {
  if (!idOrSlug || typeof idOrSlug !== 'string') {
    return { data: null, error: new Error('Invalid store identifier') };
  }
  const clean = idOrSlug.trim();

  if (isUuid(clean)) {
    const res = await supabase.from('stores').update(updates).eq('id', clean);
    return res;
  }

  return await supabase.from('stores').update(updates).eq('slug', clean);
}
