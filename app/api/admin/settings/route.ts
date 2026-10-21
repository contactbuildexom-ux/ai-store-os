import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { PLATFORM_SETTINGS_CACHE_TAG } from "@/lib/platform-settings";
import { DEFAULT_PLATFORM_SETTINGS } from "@/lib/platform-settings-defaults";
import { createAdminClient } from "@/lib/supabase/admin";

type SettingsPayload = {
  title: string;
  description: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  instagram: string;
  facebook: string;
  logoName: string;
  logoUrl: string;
  faviconName: string;
  faviconUrl: string;
  seoTitle: string;
  seoDescription: string;
  defaultSocialImage: string;
  keywords: string;
};

const defaults: SettingsPayload = DEFAULT_PLATFORM_SETTINGS;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSettings(value: unknown): SettingsPayload | null {
  if (!isRecord(value)) return null;
  const lengths: Record<keyof SettingsPayload, number> = {
    title: 100, description: 300, email: 254, phone: 30, whatsapp: 30,
    website: 2048, instagram: 2048, facebook: 2048, logoName: 255, logoUrl: 2048,
    faviconName: 255, faviconUrl: 2048,
    seoTitle: 200, seoDescription: 500, defaultSocialImage: 2048, keywords: 1000,
  };
  const settings = {} as SettingsPayload;
  for (const key of Object.keys(defaults) as (keyof SettingsPayload)[]) {
    const field = value[key];
    if (typeof field !== "string" || field.length > lengths[key]) return null;
    settings[key] = field.trim();
  }
  if (!settings.title) return null;
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) return null;
  for (const field of [settings.website, settings.instagram, settings.facebook, settings.logoUrl, settings.faviconUrl, settings.defaultSocialImage]) {
    if (field) {
      try {
        const url = new URL(field);
        if (url.protocol !== "https:" && url.protocol !== "http:") return null;
      } catch {
        return null;
      }
    }
  }
  return settings;
}

export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Settings database is not configured." }, { status: 503 });
  const { data, error } = await supabase.from("platform_settings").select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding, seo_settings").eq("id", "platform").maybeSingle();
  if (error) {
    const migrationMessage = error.message.includes("seo_settings") && (error.code === "42703" || error.code === "PGRST204" || error.message.toLowerCase().includes("column"))
      ? "Apply supabase/migrations/11_blogs_and_seo_settings.sql to enable SEO settings."
      : "Unable to load platform settings.";
    return NextResponse.json({ error: migrationMessage }, { status: 500 });
  }
  const social = isRecord(data?.social_links) ? data.social_links : {};
  const branding = isRecord(data?.branding) ? data.branding : {};
  const seo = isRecord(data?.seo_settings) ? data.seo_settings : {};
  return NextResponse.json({
    settings: data ? {
      title: typeof data.site_title === "string" && data.site_title ? data.site_title : defaults.title,
      description: typeof data.site_description === "string" && data.site_description ? data.site_description : defaults.description,
      email: typeof data.contact_email === "string" && data.contact_email ? data.contact_email : defaults.email,
      phone: typeof data.contact_phone === "string" && data.contact_phone ? data.contact_phone : defaults.phone,
      whatsapp: typeof data.whatsapp === "string" && data.whatsapp ? data.whatsapp : defaults.whatsapp,
      website: typeof social.website === "string" && social.website ? social.website : defaults.website,
      instagram: typeof social.instagram === "string" ? social.instagram : "",
      facebook: typeof social.facebook === "string" ? social.facebook : "",
      logoName: typeof branding.logoName === "string" ? branding.logoName : "",
      logoUrl: typeof branding.logoUrl === "string" ? branding.logoUrl : "",
      faviconName: typeof branding.faviconName === "string" ? branding.faviconName : "",
      faviconUrl: typeof branding.faviconUrl === "string" ? branding.faviconUrl : "",
      seoTitle: typeof seo.title === "string" ? seo.title : "",
      seoDescription: typeof seo.description === "string" ? seo.description : "",
      defaultSocialImage: typeof seo.defaultSocialImage === "string" ? seo.defaultSocialImage : "",
      keywords: typeof seo.keywords === "string" ? seo.keywords : "",
    } : defaults,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Settings database is not configured." }, { status: 503 });
  let body: unknown;
  let logoFile: File | null = null;
  let faviconFile: File | null = null;
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const formData = await request.formData();
      const fields: Record<string, unknown> = {};
      for (const key of Object.keys(defaults)) {
        const value = formData.get(key);
        if (typeof value === "string") fields[key] = value;
      }
      const fileValue = formData.get("logoFile");
      if (fileValue !== null) {
        if (typeof fileValue === "string") return NextResponse.json({ error: "The logo upload is invalid." }, { status: 400 });
        logoFile = fileValue;
      }
      const faviconValue = formData.get("faviconFile");
      if (faviconValue !== null) {
        if (typeof faviconValue === "string") return NextResponse.json({ error: "The favicon upload is invalid." }, { status: 400 });
        faviconFile = faviconValue;
      }
      body = fields;
    } else {
      body = await request.json();
    }
  } catch {
    return NextResponse.json({ error: "Request body is invalid." }, { status: 400 });
  }
  const settings = parseSettings(body);
  if (!settings) return NextResponse.json({ error: "Enter valid platform settings. URLs must use HTTP or HTTPS." }, { status: 400 });
  settings.email ||= defaults.email;
  settings.phone ||= defaults.phone;
  settings.whatsapp ||= defaults.whatsapp;
  settings.website ||= defaults.website;
  const logoExtensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const faviconExtensions: Record<string, string> = {
    "image/png": "png",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/svg+xml": "svg",
  };
  const logoExtension = logoFile ? logoExtensions[logoFile.type] : undefined;
  const faviconExtension = faviconFile ? faviconExtensions[faviconFile.type] : undefined;
  if (logoFile && (!logoExtension || logoFile.size <= 0 || logoFile.size > 2097152)) {
    return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP logo smaller than 2 MB." }, { status: 400 });
  }
  if (faviconFile && (!faviconExtension || faviconFile.size <= 0 || faviconFile.size > 2097152)) {
    return NextResponse.json({ error: "Upload a PNG, ICO, or SVG favicon smaller than 2 MB." }, { status: 400 });
  }

  const uploadedPaths: string[] = [];
  for (const asset of [
    logoFile && logoExtension ? { file: logoFile, extension: logoExtension, setting: "logo" as const } : null,
    faviconFile && faviconExtension ? { file: faviconFile, extension: faviconExtension, setting: "favicon" as const } : null,
  ]) {
    if (!asset) continue;
    const path = `${randomUUID()}.${asset.extension}`;
    const { error } = await supabase.storage.from("platform-branding").upload(path, asset.file, {
      contentType: asset.file.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) {
      if (uploadedPaths.length) {
        const { error: cleanupError } = await supabase.storage.from("platform-branding").remove(uploadedPaths);
        if (cleanupError) return NextResponse.json({ error: "Unable to upload the platform asset or clean up a previous upload." }, { status: 500 });
      }
      return NextResponse.json({ error: `Unable to upload the platform ${asset.setting}.` }, { status: 500 });
    }
    uploadedPaths.push(path);
    const publicUrl = supabase.storage.from("platform-branding").getPublicUrl(path).data.publicUrl;
    if (asset.setting === "logo") settings.logoUrl = publicUrl;
    else settings.faviconUrl = publicUrl;
  }
  const { data, error } = await supabase.from("platform_settings").upsert({
    id: "platform",
    site_title: settings.title,
    site_description: settings.description,
    contact_email: settings.email,
    contact_phone: settings.phone,
    whatsapp: settings.whatsapp,
    social_links: { website: settings.website, instagram: settings.instagram, facebook: settings.facebook },
    branding: {
      logoName: settings.logoName,
      logoUrl: settings.logoUrl,
      faviconName: settings.faviconName,
      faviconUrl: settings.faviconUrl,
    },
    seo_settings: {
      title: settings.seoTitle,
      description: settings.seoDescription,
      defaultSocialImage: settings.defaultSocialImage,
      keywords: settings.keywords,
    },
    updated_at: new Date().toISOString(),
  }).select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding, seo_settings").single();
  if (error) {
    if (uploadedPaths.length) {
      const { error: cleanupError } = await supabase.storage.from("platform-branding").remove(uploadedPaths);
      if (cleanupError) return NextResponse.json({ error: "Unable to save settings or clean up the uploaded logo." }, { status: 500 });
    }
    const message = error.message.includes("seo_settings") && (error.code === "42703" || error.code === "PGRST204" || error.message.toLowerCase().includes("column"))
      ? "Apply supabase/migrations/11_blogs_and_seo_settings.sql to enable SEO settings."
      : "Unable to save platform settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
  revalidateTag(PLATFORM_SETTINGS_CACHE_TAG, { expire: 0 });
  return NextResponse.json({ saved: true, settings: {
    title: data.site_title,
    description: data.site_description,
    email: data.contact_email,
    phone: data.contact_phone,
    whatsapp: data.whatsapp,
    website: settings.website,
    instagram: settings.instagram,
    facebook: settings.facebook,
    logoName: settings.logoName,
    logoUrl: settings.logoUrl,
    faviconName: settings.faviconName,
    faviconUrl: settings.faviconUrl,
    seoTitle: settings.seoTitle,
    seoDescription: settings.seoDescription,
    defaultSocialImage: settings.defaultSocialImage,
    keywords: settings.keywords,
  } });
}
