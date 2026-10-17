import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { BLOG_POSTS_CACHE_TAG } from "@/lib/blog-posts";
import {
  DATABASE_BACKUP_TABLES,
  MAX_DATABASE_BACKUP_SIZE,
  validateDatabaseBackup,
} from "@/lib/database-backup";
import { PLATFORM_SETTINGS_CACHE_TAG } from "@/lib/platform-settings";
import { isAdminRequest } from "@/lib/admin-api-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 60;

export async function POST(request: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const contentType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (contentType !== "application/json") return NextResponse.json({ error: "Upload a JSON backup file." }, { status: 415 });

  const contentLength = request.headers.get("content-length");
  if (contentLength !== null) {
    const parsedLength = Number(contentLength);
    if (!Number.isSafeInteger(parsedLength) || parsedLength <= 0 || parsedLength > MAX_DATABASE_BACKUP_SIZE) {
      return NextResponse.json({ error: "Backup file must be smaller than 50 MB." }, { status: 413 });
    }
  }

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Backup file is empty." }, { status: 400 });

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_DATABASE_BACKUP_SIZE) {
        await reader.cancel();
        return NextResponse.json({ error: "Backup file must be smaller than 50 MB." }, { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return NextResponse.json({ error: "Unable to read backup upload." }, { status: 400 });
  }

  let source: string;
  try {
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return NextResponse.json({ error: "Backup file must contain valid UTF-8 JSON." }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return NextResponse.json({ error: "Backup file contains invalid JSON." }, { status: 400 });
  }

  const validation = validateDatabaseBackup(parsed);
  if (!validation.valid || !validation.backup) {
    return NextResponse.json({ error: validation.error ?? "Backup structure is invalid." }, { status: 400 });
  }

  let data: unknown;
  try {
    const result = await supabase.rpc("restore_platform_database_backup", { backup: validation.backup });
    if (result.error) {
      const missingFunction = result.error.code === "PGRST202" || result.error.code === "42883";
      const message = missingFunction
        ? "Apply supabase/migrations/13_transactional_database_restore.sql before restoring a backup."
        : `Restore failed. No database changes were committed. ${result.error.message}`;
      return NextResponse.json({ error: message }, { status: 500 });
    }
    data = result.data;
  } catch {
    return NextResponse.json({ error: "The restore request was interrupted. Check the database before retrying; the restore is transactional and cannot partially commit." }, { status: 500 });
  }

  revalidateTag(PLATFORM_SETTINGS_CACHE_TAG, { expire: 0 });
  revalidateTag(BLOG_POSTS_CACHE_TAG, { expire: 0 });

  const counts = typeof data === "object" && data !== null && !Array.isArray(data)
    ? data as Record<string, unknown>
    : {};
  const restored = DATABASE_BACKUP_TABLES.reduce((sum, table) => {
    const count = counts[table];
    return sum + (typeof count === "number" && Number.isSafeInteger(count) ? count : 0);
  }, 0);

  return NextResponse.json({
    restored,
    tables: counts,
    message: "Database backup restored successfully. Existing records not included in the backup were left unchanged.",
  }, { headers: { "Cache-Control": "no-store" } });
}
