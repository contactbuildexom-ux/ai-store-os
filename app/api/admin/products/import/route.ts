import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseProductCsv, type ProductImportIssue } from "@/lib/product-csv";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_REQUEST_SIZE = MAX_FILE_SIZE + 16 * 1024;
const CSV_MIME_TYPES = new Set(["text/csv", "application/csv", "text/comma-separated-values", "application/vnd.ms-excel", "text/plain", "application/octet-stream"]);

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().startsWith("multipart/form-data;")) {
    return NextResponse.json({ error: "Upload a valid CSV file." }, { status: 400 });
  }
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader === null ? null : Number(contentLengthHeader);
  if (contentLength !== null && (!Number.isSafeInteger(contentLength) || contentLength <= 0 || contentLength > MAX_REQUEST_SIZE)) {
    return NextResponse.json({ error: "Upload a CSV file smaller than 2 MB." }, { status: 413 });
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Product database is not configured." }, { status: 503 });

  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Upload a valid CSV file." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let requestSize = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      requestSize += value.byteLength;
      if (requestSize > MAX_REQUEST_SIZE) {
        await reader.cancel();
        return NextResponse.json({ error: "Upload a CSV file smaller than 2 MB." }, { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return NextResponse.json({ error: "Upload a valid CSV file." }, { status: 400 });
  }

  const body = new Uint8Array(requestSize);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  let formData: FormData;
  try {
    const uploadRequest = new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body,
    });
    formData = await uploadRequest.formData();
  } catch {
    return NextResponse.json({ error: "Upload a valid CSV file." }, { status: 400 });
  }

  const fileValue = formData.get("file");
  const storeId = formData.get("store_id");
  if (typeof storeId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(storeId)) {
    return NextResponse.json({ error: "Select a valid store for these products." }, { status: 400 });
  }
  if (typeof fileValue === "string" || !fileValue || typeof fileValue.name !== "string") {
    return NextResponse.json({ error: "Choose a CSV file to upload." }, { status: 400 });
  }
  const mimeType = fileValue.type.toLowerCase();
  if (!fileValue.name.toLowerCase().endsWith(".csv") || (mimeType !== "" && !CSV_MIME_TYPES.has(mimeType))) {
    return NextResponse.json({ error: "Only CSV files are supported." }, { status: 415 });
  }
  if (fileValue.size <= 0 || fileValue.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Upload a CSV file smaller than 2 MB." }, { status: 413 });
  }

  const { data: store, error: storeError } = await supabase.from("stores").select("id").eq("id", storeId).maybeSingle();
  if (storeError) return NextResponse.json({ error: "Unable to validate the selected store." }, { status: 500 });
  if (!store) return NextResponse.json({ error: "The selected store does not exist." }, { status: 404 });

  let csv: string;
  try {
    csv = new TextDecoder("utf-8", { fatal: true }).decode(await fileValue.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "CSV must be valid UTF-8 text." }, { status: 400 });
  }
  if (csv.includes("\0")) return NextResponse.json({ error: "CSV contains invalid binary data." }, { status: 400 });

  let result: ReturnType<typeof parseProductCsv>;
  try {
    result = parseProductCsv(csv);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to parse CSV.";
    return NextResponse.json({ error: message, errors: [] satisfies ProductImportIssue[] }, { status: 400 });
  }

  if (result.errors.length > 0) {
    return NextResponse.json({ error: "Correct the CSV validation errors and try again.", errors: result.errors }, { status: 422 });
  }
  if (result.rows.length === 0) {
    return NextResponse.json({ error: "CSV does not contain any valid product rows.", errors: [] satisfies ProductImportIssue[] }, { status: 422 });
  }

  const categoryIds = [...new Set(result.rows.map(({ product }) => product.category_id).filter((id): id is string => id !== null))];
  if (categoryIds.length > 0) {
    const { data: categories, error: categoryError } = await supabase
      .from("store_categories")
      .select("id")
      .eq("store_id", storeId)
      .in("id", categoryIds);
    if (categoryError) return NextResponse.json({ error: "Unable to validate product categories." }, { status: 500 });
    const validCategories = new Set((categories ?? []).map((category) => String(category.id)));
    const errors = result.rows
      .filter(({ product }) => product.category_id && !validCategories.has(product.category_id))
      .map(({ row, product }) => ({ row, field: "category_id", message: "Category does not belong to the selected store." }));
    if (errors.length > 0) return NextResponse.json({ error: "Correct the CSV validation errors and try again.", errors }, { status: 422 });
  }

  const products = result.rows.map(({ product }) => ({ ...product, store_id: storeId }));
  const { data, error } = await supabase
    .from("store_products")
    .insert(products)
    .select("id, name, price, category_id, description, sku, stock, created_at");
  if (error) {
    const missingColumns = ["sku", "stock"].filter((column) => error.message.includes(column));
    if (missingColumns.length > 0 && (error.code === "42703" || error.code === "PGRST204")) {
      return NextResponse.json({ error: "Apply supabase/migrations/12_product_csv_import.sql before importing SKU or stock values." }, { status: 503 });
    }
    if (error.code === "23505") {
      return NextResponse.json({ error: "A product with one of these SKUs already exists in the selected store. Remove duplicate SKUs and retry." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to import products. No products were added." }, { status: 500 });
  }

  return NextResponse.json({ imported: data?.length ?? products.length, products: data ?? [] }, { status: 201 });
}

export const maxDuration = 30;
