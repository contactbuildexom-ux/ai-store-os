import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkStoreLimits } from "@/lib/planLimits";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getSupabase() {
  const supabase = createAdminClient();
  if (!supabase) throw new Error("Store database is not configured.");
  return supabase;
}

export async function GET(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }

    const { data: categories, error } = await supabase
      .from("store_categories")
      .select("*")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, categories: categories ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load categories.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const storeId = textValue(body?.store_id);
    const name = textValue(body?.name);

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const limitCheck = await checkStoreLimits(storeId, "category");
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: limitCheck.message }, { status: 403 });
    }

    const { data: category, error } = await supabase
      .from("store_categories")
      .insert([{ store_id: storeId, name }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category, message: "Category created successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const id = textValue(body?.id);
    const storeId = textValue(body?.store_id);
    const name = textValue(body?.name);

    if (!id || !storeId) {
      return NextResponse.json({ error: "Category ID and Store ID are required." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: "Category name is required." }, { status: 400 });
    }

    const { data: category, error } = await supabase
      .from("store_categories")
      .update({ name })
      .eq("id", id)
      .eq("store_id", storeId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, category, message: "Category updated successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const id = textValue(searchParams.get("id"));
    const storeId = textValue(searchParams.get("store_id"));

    if (!id || !storeId) {
      return NextResponse.json({ error: "Category ID and Store ID are required." }, { status: 400 });
    }

    const { error } = await supabase
      .from("store_categories")
      .delete()
      .eq("id", id)
      .eq("store_id", storeId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete category.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}