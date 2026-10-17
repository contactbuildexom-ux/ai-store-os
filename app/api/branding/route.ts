import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_TITLE = "Buildexom AI";
const DEFAULT_DESCRIPTION = "Commerce, in clear view.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function safeHttpUrl(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export async function GET() {
  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Branding database is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("platform_settings")
    .select("site_title, site_description, contact_email, contact_phone, whatsapp, social_links, branding")
    .eq("id", "platform")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Unable to load platform branding." }, { status: 500 });
  }

  const branding = isRecord(data?.branding) ? data.branding : {};
  const social = isRecord(data?.social_links) ? data.social_links : {};
  return NextResponse.json({
    settings: {
      title: typeof data?.site_title === "string" && data.site_title ? data.site_title : DEFAULT_TITLE,
      description: typeof data?.site_description === "string" ? data.site_description : DEFAULT_DESCRIPTION,
      email: typeof data?.contact_email === "string" ? data.contact_email : "",
      phone: typeof data?.contact_phone === "string" ? data.contact_phone : "",
      whatsapp: typeof data?.whatsapp === "string" ? data.whatsapp : "",
      website: safeHttpUrl(social.website),
      instagram: safeHttpUrl(social.instagram),
      facebook: safeHttpUrl(social.facebook),
      logoName: typeof branding.logoName === "string" ? branding.logoName : "",
      logoUrl: safeHttpUrl(branding.logoUrl),
    },
  }, { headers: { "Cache-Control": "no-store" } });
}
