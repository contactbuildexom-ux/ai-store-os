import 'server-only';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const cachePath = path.join(process.cwd(), '.next', 'cache', 'ai-store-repository.json');

export async function readLocalStoreCache(): Promise<unknown | null> {
  if (process.env.NODE_ENV !== 'development') return null;
  try {
    return JSON.parse(await readFile(cachePath, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

export async function writeLocalStoreCache(value: unknown): Promise<void> {
  if (process.env.NODE_ENV !== 'development') return;
  await mkdir(path.dirname(cachePath), { recursive: true });
  await writeFile(cachePath, JSON.stringify(value, null, 2), 'utf8');
}