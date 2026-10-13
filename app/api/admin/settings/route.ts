import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { isAdminRequest } from "@/lib/admin-api-auth";
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
};

const defaults: SettingsPayload = {
  title: "Buildexom AI",
  description: "Commerce, in clear view.",
  email: "",
  phone: "",
  whatsapp: "",
  website: "",
  instagram: "",
  facebook: "",
  logoName: "",
  logoUrl: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSettings(value: unknown): SettingsPayload | null {
  if (!isRecord(value)) return null;
  const lengths: Record<keyof SettingsPayload, number> = {
    title: 100, description: 300, email: 254, phone: 30, whatsapp: 30,
    website: 2048, instagram: 2048, facebook: 2048, logoName: 255, logoUrl: 2048,
  };
  const settings = {} as SettingsPayload;
  for (const key of Object.keys(defaults) as (keyof SettingsPayload)[]) {
    const field = value[key];
    if (typeof field !== "string" || field.length > lengths[key]) return null;
    settings[key] = field.trim();
  }
  if (!settings.title) return null;
  if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) return null;
  for (const field of [settings.website, settings.instagram, settings.facebook, settings.logoUrl]) {
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
  const { data, error } = await supabase.from("platform_settings").select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding").eq("id", "platform").maybeSingle();
  if (error) return NextResponse.json({ error: "Unable to load platform settings." }, { status: 500 });
  const social = isRecord(data?.social_links) ? data.social_links : {};
  const branding = isRecord(data?.branding) ? data.branding : {};
  return NextResponse.json({
    settings: data ? {
      title: data.site_title,
      description: data.site_description,
      email: data.contact_email,
      phone: data.contact_phone,
      whatsapp: data.whatsapp,
      website: typeof social.website === "string" ? social.website : "",
      instagram: typeof social.instagram === "string" ? social.instagram : "",
      facebook: typeof social.facebook === "string" ? social.facebook : "",
      logoName: typeof branding.logoName === "string" ? branding.logoName : "",
      logoUrl: typeof branding.logoUrl === "string" ? branding.logoUrl : "",
    } : defaults,
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Settings database is not configured." }, { status: 503 });
  let body: unknown;
  let logoFile: File | null = null;
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
      body = fields;
    } else {
      body = await request.json();
    }
  } catch {
    return NextResponse.json({ error: "Request body is invalid." }, { status: 400 });
  }
  const settings = parseSettings(body);
  if (!settings) return NextResponse.json({ error: "Enter valid platform settings. URLs must use HTTP or HTTPS." }, { status: 400 });
  let uploadedPath: string | null = null;
  if (logoFile) {
    const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
    const extension = extensions[logoFile.type];
    if (!extension || logoFile.size <= 0 || logoFile.size > 2097152) {
      return NextResponse.json({ error: "Upload a JPEG, PNG, or WebP logo smaller than 2 MB." }, { status: 400 });
    }
    uploadedPath = `${randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from("platform-branding").upload(uploadedPath, logoFile, {
      contentType: logoFile.type,
      cacheControl: "3600",
      upsert: false,
    });
    if (error) return NextResponse.json({ error: "Unable to upload the platform logo." }, { status: 500 });
    settings.logoUrl = supabase.storage.from("platform-branding").getPublicUrl(uploadedPath).data.publicUrl;
  }
  const { data, error } = await supabase.from("platform_settings").upsert({
    id: "platform",
    site_title: settings.title,
    site_description: settings.description,
    contact_email: settings.email,
    contact_phone: settings.phone,
    whatsapp: settings.whatsapp,
    social_links: { website: settings.website, instagram: settings.instagram, facebook: settings.facebook },
    branding: { logoName: settings.logoName, logoUrl: settings.logoUrl },
    updated_at: new Date().toISOString(),
  }).select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding").single();
  if (error) {
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage.from("platform-branding").remove([uploadedPath]);
      if (cleanupError) return NextResponse.json({ error: "Unable to save settings or clean up the uploaded logo." }, { status: 500 });
    }
    return NextResponse.json({ error: "Unable to save platform settings." }, { status: 500 });
  }
  return NextResponse.json({ saved: true, settings: {
    title: data.site_title,
    description: data.site_description,
    email: data.contact_email,
    phone: data.contact_phone,
    whatsapp: data.whatsapp,
    website: data.social_links.website,
    instagram: data.social_links.instagram,
    facebook: data.social_links.facebook,
    logoName: data.branding.logoName,
    logoUrl: data.branding.logoUrl,
  } });
}
