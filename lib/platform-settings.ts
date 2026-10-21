import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PlatformBrandingSettings } from "@/components/platform-branding";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings-defaults";

export const PLATFORM_SETTINGS_CACHE_TAG = "platform-settings";
let legacySchemaWarningLogged = false;

const defaults: PlatformBrandingSettings = DEFAULT_PLATFORM_SETTINGS;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

export const getPlatformSettings = unstable_cache(
  async (): Promise<PlatformBrandingSettings> => {
    const supabase = createAdminClient();
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) return defaults;

    const result = await supabase
      .from("platform_settings")
      .select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding, seo_settings")
      .eq("id", "platform")
      .maybeSingle();

    let data = result.data;
    if (result.error) {
      const missingSeoColumn = result.error.message.includes("seo_settings")
        && (result.error.code === "42703" || result.error.code === "PGRST204" || result.error.message.toLowerCase().includes("column"));
      if (!missingSeoColumn) {
        console.warn(`Unable to load platform settings from database (${result.error.message}); using defaults.`);
        return defaults;
      }

      if (!legacySchemaWarningLogged) {
        console.warn("The platform SEO migration is not applied; using legacy settings until it is installed.");
        legacySchemaWarningLogged = true;
      }
      const legacyResult = await supabase
        .from("platform_settings")
        .select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding")
        .eq("id", "platform")
        .maybeSingle();
      if (legacyResult.error) {
        console.warn(`Unable to load legacy platform settings (${legacyResult.error.message}); using defaults.`);
        return defaults;
      }
      data = legacyResult.data ? { ...legacyResult.data, seo_settings: {} } : null;
    }

    const social = isRecord(data?.social_links) ? data.social_links : {};
    const branding = isRecord(data?.branding) ? data.branding : {};
    const seo = isRecord(data?.seo_settings) ? data.seo_settings : {};

    return {
      title: stringValue(data?.site_title) || defaults.title,
      description: stringValue(data?.site_description) || defaults.description,
      email: stringValue(data?.contact_email) || defaults.email,
      phone: stringValue(data?.contact_phone) || defaults.phone,
      whatsapp: stringValue(data?.whatsapp) || defaults.whatsapp,
      website: stringValue(social.website) || defaults.website,
      instagram: stringValue(social.instagram),
      facebook: stringValue(social.facebook),
      logoName: stringValue(branding.logoName),
      logoUrl: stringValue(branding.logoUrl),
      faviconName: stringValue(branding.faviconName),
      faviconUrl: stringValue(branding.faviconUrl),
      seoTitle: stringValue(seo.title),
      seoDescription: stringValue(seo.description),
      defaultSocialImage: stringValue(seo.defaultSocialImage),
      keywords: stringValue(seo.keywords),
    };
  },
  ["platform-settings-v1"],
  { tags: [PLATFORM_SETTINGS_CACHE_TAG], revalidate: 300 },
);
