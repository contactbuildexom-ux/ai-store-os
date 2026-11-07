const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envFile = path.join(projectRoot, '.env.local');

let env = {};
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        env[key] = val;
      }
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('   Buildexom AI Store OS - Clean All AI Stores');
  console.log('====================================================\n');

  let deletedCount = 0;
  const deletedList = [];

  // 1. Supabase Cleanup (if configured)
  const url = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseValid = Boolean(url && key && !url.includes('placeholder-project') && !url.includes('your-project'));

  if (isSupabaseValid) {
    try {
      const { createClient } = require(path.join(projectRoot, 'node_modules', '@supabase', 'supabase-js'));
      const supabase = createClient(url, key, { auth: { persistSession: false } });

      const { data: stores, error } = await supabase.from('stores').select('id, name, slug');
      if (error) {
        console.warn('Could not query stores from Supabase:', error.message);
      } else if (stores && stores.length > 0) {
        console.log(`Found ${stores.length} store(s) in Supabase database:`);
        for (const store of stores) {
          if (store.id === 'store_demo_velvet_aura' || store.slug === 'velvet-aura') {
            console.log(`- Skipping default demo store: ${store.name} (${store.slug})`);
            continue;
          }

          console.log(`- Deleting store: "${store.name}" (${store.slug}, ID: ${store.id})...`);
          await Promise.allSettled([
            supabase.from('store_products').delete().eq('store_id', store.id),
            supabase.from('store_categories').delete().eq('store_id', store.id),
            supabase.from('store_settings').delete().eq('store_id', store.id),
            supabase.from('store_orders').delete().eq('store_id', store.id),
            supabase.from('subscription_payment_requests').delete().eq('store_id', store.id),
            supabase.from('store_payments').delete().eq('store_id', store.id),
            supabase.from('products').delete().eq('store_id', store.id),
            supabase.from('merchants').delete().eq('store_id', store.id),
            supabase.from('stores').delete().eq('id', store.id),
          ]);

          deletedCount++;
          deletedList.push(`${store.name} (${store.slug})`);
        }
      } else {
        console.log('No stores found in Supabase.');
      }
    } catch (sbErr) {
      console.warn('Supabase cleanup error:', sbErr.message);
    }
  } else {
    console.log('ℹ️ Supabase is using local/in-memory mode (placeholder credentials).');
  }

  // 2. Local Disk Cache Cleanup
  const cachePath = path.join(projectRoot, '.next', 'cache', 'ai-store-repository.json');
  if (fs.existsSync(cachePath)) {
    try {
      const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      if (cache && cache.stores) {
        const cachedStores = Array.isArray(cache.stores) ? cache.stores : Object.values(cache.stores);
        for (const s of cachedStores) {
          if (s.id !== 'store_demo_velvet_aura' && s.slug !== 'velvet-aura') {
            if (!deletedList.some(d => d.includes(s.slug))) {
              deletedCount++;
              deletedList.push(`${s.name} (${s.slug})`);
            }
          }
        }
      }
      fs.unlinkSync(cachePath);
      console.log('✓ Removed local cache file: .next/cache/ai-store-repository.json');
    } catch (cacheErr) {
      console.warn('Could not reset local cache file:', cacheErr.message);
    }
  } else {
    console.log('✓ No persistent disk cache file present.');
  }

  // 3. Clear any .next build artifacts that might retain SSR cached store pages
  const nextServerPages = path.join(projectRoot, '.next', 'server', 'app', 'store');
  if (fs.existsSync(nextServerPages)) {
    try {
      fs.rmSync(nextServerPages, { recursive: true, force: true });
      console.log('✓ Cleared pre-rendered store pages in .next/server/app/store');
    } catch (rmErr) {
      console.warn('Could not clear .next/server pages:', rmErr.message);
    }
  }

  console.log('\n====================================================');
  if (deletedCount > 0) {
    console.log(`✓ Cleaned ${deletedCount} AI-generated store(s):`);
    deletedList.forEach(s => console.log(`   • ${s}`));
  } else {
    console.log('✓ All AI stores are clean. Only default initial demo store (Velvet Aura) remains.');
  }
  console.log('====================================================\n');
}

run().catch(console.error);
