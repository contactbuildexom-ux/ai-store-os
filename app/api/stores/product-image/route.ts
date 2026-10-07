import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";
import { MERCHANT_SESSION_COOKIE, verifyMerchantSession } from "@/lib/merchant-session";

const BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type AdminSupabase = NonNullable<ReturnType<typeof createAdminClient>>;

function safeFileName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const base = name
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";

  return `${base}.${extension}`;
}

async function ensurePublicBucket(supabase: AdminSupabase) {
  const { error } = await supabase.storage.getBucket(BUCKET);
  if (!error) return;

  const { error: createError } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    fileSizeLimit: MAX_IMAGE_SIZE,
  });

  if (createError && !createError.message.toLowerCase().includes("already exists")) {
    throw createError;
  }
}

async function userOwnsStore(supabase: AdminSupabase, storeId: string, userId: string) {
  const byOwner = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("owner_id", userId)
    .maybeSingle();

  if (!byOwner.error) return Boolean(byOwner.data);
  if (!byOwner.error.message.toLowerCase().includes("owner_id")) throw byOwner.error;

  const byUser = await supabase
    .from("stores")
    .select("id")
    .eq("id", storeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (byUser.error) throw byUser.error;
  return Boolean(byUser.data);
}

async function canUploadForStore(request: Request, supabase: AdminSupabase, storeId: string) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (token) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (!error && user) {
      if (user.app_metadata?.role === "super_admin") return true;
      if (await userOwnsStore(supabase, storeId, user.id)) return true;
    }
  }

  const cookieStore = await cookies();
  const merchantSession = verifyMerchantSession(cookieStore.get(MERCHANT_SESSION_COOKIE)?.value);
  if (merchantSession?.storeId === storeId) return true;

  const adminSession = verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  return Boolean(adminSession);
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const storeId = String(formData.get("store_id") ?? "").trim();

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canUploadForStore(request, supabase, storeId))) {
      return NextResponse.json({ error: "You are not allowed to upload images for this store." }, { status: 403 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image file to upload." }, { status: 400 });
    }
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed." }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "Image must be 5MB or smaller." }, { status: 400 });
    }

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id")
      .eq("id", storeId)
      .maybeSingle();

    if (storeError) throw storeError;
    if (!store) {
      return NextResponse.json({ error: "Store not found." }, { status: 404 });
    }

    await ensurePublicBucket(supabase);

    const path = `${storeId}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: "31536000", contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ image_url: data.publicUrl, path });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}