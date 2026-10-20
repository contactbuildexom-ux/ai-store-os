import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { canAccessStore } from "@/lib/merchant-api-auth";
import { checkStoreLimits } from "@/lib/planLimits";
import { storeRepo } from "@/lib/store-repository";

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(value: unknown) {
  const text = textValue(value);
  return text.length ? text : null;
}

function parsePrice(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const price = typeof value === "number" ? value : Number(value);
  return Number.isFinite(price) && price >= 0 ? price : null;
}

function getSupabase() {
  const supabase = createAdminClient();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !url || url.includes("placeholder-project") || url.includes("your-project")) return null;
  return supabase;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = textValue(searchParams.get("store_id"));

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    let products: any[] = [];
    const supabase = getSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("store_products")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false });
        if (!error && data) products = data;
      } catch {
        // Fallback
      }
    }

    if (products.length === 0) {
      try {
        const repoProducts = await storeRepo.getProducts(storeId);
        products = repoProducts.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          image_url: p.image_url,
          store_id: storeId,
          created_at: p.created_at,
        }));
      } catch {
        // Fallback
      }
    }

    return NextResponse.json({ success: true, products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load products.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const storeId = textValue(body?.store_id);
    const name = textValue(body?.name);
    const price = parsePrice(body?.price);
    const categoryId = optionalText(body?.category_id);

    if (!storeId) {
      return NextResponse.json({ error: "Store ID is required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });
    if (!name) {
      return NextResponse.json({ error: "Product name is required." }, { status: 400 });
    }
    if (price === null) {
      return NextResponse.json({ error: "Enter a valid product price." }, { status: 400 });
    }

    if (supabase) {
      if (categoryId) {
        const { data: category, error: categoryError } = await supabase.from("store_categories")
          .select("id").eq("id", categoryId).eq("store_id", storeId).maybeSingle();
        if (categoryError) throw categoryError;
        if (!category) return NextResponse.json({ error: "The selected category does not belong to this store." }, { status: 400 });
      }

      const limitCheck = await checkStoreLimits(storeId, "product", categoryId ?? undefined);
      if (!limitCheck.allowed) {
        return NextResponse.json({ error: limitCheck.message }, { status: 403 });
      }

      const baseInsert: Record<string, any> = {
        store_id: storeId,
        name,
        price,
        description: optionalText(body?.description),
        image_url: optionalText(body?.image_url),
        category_id: categoryId,
      };

      const advancedInsert: Record<string, any> = { ...baseInsert };
      if (body?.has_sizes !== undefined) advancedInsert.has_sizes = Boolean(body.has_sizes);
      if (body?.has_colors !== undefined) advancedInsert.has_colors = Boolean(body.has_colors);
      if (body?.sizes) advancedInsert.sizes = body.sizes;
      if (body?.colors) advancedInsert.colors = body.colors;

      let res = await supabase.from("store_products").insert([advancedInsert]).select().single();
      if (res.error) {
        // Fallback without dynamic variant columns if database table has not added them yet
        res = await supabase.from("store_products").insert([baseInsert]).select().single();
        if (res.error) throw res.error;
      }

      return NextResponse.json({ success: true, product: res.data, message: "Product added successfully." });
    }

    // Fallback storeRepo
    const repoProd = await storeRepo.addProduct(storeId, {
      name,
      price,
      description: optionalText(body?.description) || '',
      image_url: optionalText(body?.image_url) || '',
      category: categoryId || 'General',
    });

    return NextResponse.json({ success: true, product: repoProd, message: "Product added successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const id = textValue(body?.id);
    const storeId = textValue(body?.store_id);

    if (!id || !storeId) {
      return NextResponse.json({ error: "Product ID and Store ID are required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    const updates: Record<string, unknown> = {};
    if ("name" in body) {
      const name = textValue(body.name);
      if (!name) return NextResponse.json({ error: "Product name cannot be empty." }, { status: 400 });
      updates.name = name;
    }
    if ("price" in body) {
      const price = parsePrice(body.price);
      if (price === null) return NextResponse.json({ error: "Enter a valid product price." }, { status: 400 });
      updates.price = price;
    }
    if ("description" in body) updates.description = optionalText(body.description);
    if ("image_url" in body) updates.image_url = optionalText(body.image_url);
    if ("category_id" in body) {
      const categoryId = optionalText(body.category_id);
      if (categoryId && supabase) {
        const { data: category, error: categoryError } = await supabase.from("store_categories")
          .select("id").eq("id", categoryId).eq("store_id", storeId).maybeSingle();
        if (categoryError) throw categoryError;
        if (!category) return NextResponse.json({ error: "The selected category does not belong to this store." }, { status: 400 });
      }
      updates.category_id = categoryId;
    }
    if ("has_sizes" in body) updates.has_sizes = Boolean(body.has_sizes);
    if ("has_colors" in body) updates.has_colors = Boolean(body.has_colors);
    if ("sizes" in body) updates.sizes = body.sizes;
    if ("colors" in body) updates.colors = body.colors;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No product fields were provided to update." }, { status: 400 });
    }

    if (supabase) {
      let res = await supabase
        .from("store_products")
        .update(updates)
        .eq("id", id)
        .eq("store_id", storeId)
        .select()
        .single();

      if (res.error) {
        // Fallback without dynamic columns
        const safeUpdates = { ...updates };
        delete safeUpdates.has_sizes;
        delete safeUpdates.has_colors;
        delete safeUpdates.sizes;
        delete safeUpdates.colors;
        res = await supabase
          .from("store_products")
          .update(safeUpdates)
          .eq("id", id)
          .eq("store_id", storeId)
          .select()
          .single();
        if (res.error) throw res.error;
      }

      return NextResponse.json({ success: true, product: res.data, message: "Product updated successfully." });
    }

    // Fallback storeRepo
    const updated = await storeRepo.updateProduct(storeId, id, updates as any);
    return NextResponse.json({ success: true, product: updated, message: "Product updated successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const id = textValue(searchParams.get("id"));
    const idsParam = textValue(searchParams.get("ids"));
    const storeId = textValue(searchParams.get("store_id"));

    const idList = idsParam 
      ? idsParam.split(",").map((i) => i.trim()).filter(Boolean) 
      : (id ? [id] : []);

    if (idList.length === 0 || !storeId) {
      return NextResponse.json({ error: "Product ID (or IDs) and Store ID are required." }, { status: 400 });
    }
    if (!(await canAccessStore(storeId))) return NextResponse.json({ error: "You are not authorized to access this store." }, { status: 403 });

    if (supabase) {
      const { error } = await supabase
        .from("store_products")
        .delete()
        .in("id", idList)
        .eq("store_id", storeId);

      if (error) throw error;
      return NextResponse.json({ 
        success: true, 
        message: idList.length > 1 
          ? `${idList.length} products deleted successfully.` 
          : "Product deleted successfully." 
      });
    }

    for (const prodId of idList) {
      await storeRepo.deleteProduct(storeId, prodId);
    }
    return NextResponse.json({ 
      success: true, 
      message: idList.length > 1 
        ? `${idList.length} products deleted successfully.` 
        : "Product deleted successfully." 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete product.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
