// Helpers for serving each store on its own subdomain: <slug>.<root-domain>
//
// NEXT_PUBLIC_ROOT_DOMAIN examples:
//   local:      localhost:3000   -> http://shoe-store.localhost:3000
//   production: e4emerald.com    -> https://shoe-store.e4emerald.com
// If the variable is empty, everything falls back to the old /store/<slug> path.

export const RESERVED_SUBDOMAINS = new Set([
  "www",
  "admin",
  "api",
  "app",
  "dashboard",
  "merchant",
  "user",
  "store",
  "stores",
  "mail",
  "smtp",
  "ftp",
  "blog",
  "help",
  "support",
  "docs",
  "status",
  "cdn",
  "static",
  "assets",
  "login",
  "signup",
  "auth",
  "billing",
  "pricing",
  "staging",
  "dev",
  "ns1",
  "ns2",
  "buildexom",
  "e4emerald",
]);

// A DNS label: lowercase letters, digits, hyphens; max 63 chars; no leading/trailing hyphen.
const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function readRootDomain() {
  return (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

export function isReservedSlug(slug: string) {
  return RESERVED_SUBDOMAINS.has(slug.trim().toLowerCase());
}

/** Public URL of a store. Subdomain URL when a root domain is configured, otherwise /store/<slug>. */
export function getStoreUrl(slug: string) {
  const rootDomain = readRootDomain();
  const path = `/store/${encodeURIComponent(slug)}`;
  if (!rootDomain || isReservedSlug(slug) || !SUBDOMAIN_PATTERN.test(slug)) return path;
  const protocol = rootDomain.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${slug}.${rootDomain}`;
}

/** Returns the store slug if the host is <slug>.<root-domain>, otherwise null. */
export function getSubdomainFromHost(host: string): string | null {
  const rootHost = readRootDomain().split(":")[0];
  if (!rootHost) return null;

  const hostname = host.split(":")[0].trim().toLowerCase();
  const suffix = `.${rootHost}`;
  if (!hostname.endsWith(suffix)) return null;

  const sub = hostname.slice(0, -suffix.length);
  if (!sub || sub.includes(".") || !SUBDOMAIN_PATTERN.test(sub) || isReservedSlug(sub)) return null;
  return sub;
}